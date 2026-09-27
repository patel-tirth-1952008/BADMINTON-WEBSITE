import { NextRequest } from 'next/server';
import { addHours, format, startOfDay } from 'date-fns';
import { adminDb, badRequest, json, parseBody, requireAdmin } from '@/lib/api';
import { sendBookingEmail } from '@/lib/email';

const fillTemplate=(template:string,values:Record<string,string>)=>template.replace(/\{(player_name|date|time|court|academy)\}/g,(_,key)=>values[key]||'');
const bookingInstant=(date:string,time:string)=>new Date(`${date}T${time.slice(0,5)}:00+05:30`);

export async function GET(request:NextRequest){return runReminderJob(request);}
export async function POST(request:NextRequest){
  try{
    const auth=await requireAdmin(request);if(auth.failure)return auth.failure;
    const body=await parseBody(request);
    if(typeof body.testEmail==='string'&&body.testEmail){
      const {data:settings,error}=await adminDb().from('academy_settings').select('*').limit(1).single();if(error||!settings)throw error||new Error('Settings are unavailable.');
      await sendBookingEmail({to:body.testEmail,subject:`Reminder test · ${settings.academy_name}`,text:fillTemplate(settings.reminder_template,{player_name:'Player',date:format(new Date(),'dd MMM yyyy'),time:'6:00 PM – 7:00 PM',court:'Court A',academy:settings.academy_name})});
      return json({sent:1,test:true});
    }
    return runReminderJob(request,true);
  }catch(error){return badRequest(error instanceof Error?error.message:'Unable to send test reminder.');}
}

async function runReminderJob(request:NextRequest,adminInitiated=false){
  const cronHeader=request.headers.get('authorization');
  if(!adminInitiated&&cronHeader!==`Bearer ${process.env.CRON_SECRET}`)return json({error:'Unauthorized cron request.'},{status:401});
  try{
    const db=adminDb();const{data:settings,error:settingsError}=await db.from('academy_settings').select('*').limit(1).single();if(settingsError||!settings)throw settingsError||new Error('Settings are unavailable.');
    if(!settings.reminder_enabled)return json({sent:0,skipped:true});
    const now=new Date();const cutoff=addHours(now,settings.booking_reminder_hours);const dates=[format(startOfDay(now),'yyyy-MM-dd'),format(startOfDay(cutoff),'yyyy-MM-dd')];
    const{data:bookings,error:bookingError}=await db.from('bookings').select('*,courts(name),time_slots(start_time,slot_label)').in('booking_date',dates).eq('status','confirmed').eq('reminder_sent',false);if(bookingError)throw bookingError;
    const due=(bookings||[]).filter((booking)=>{const instant=bookingInstant(booking.booking_date,booking.time_slots.start_time);return instant>=now&&instant<=cutoff;});
    let sent=0;let failed=0;
    for(const booking of due){
      try{
        const text=fillTemplate(settings.reminder_template,{player_name:booking.player_name,date:format(new Date(`${booking.booking_date}T00:00:00`),'dd MMM yyyy'),time:booking.time_slots.slot_label,court:booking.courts.name,academy:settings.academy_name});
        await sendBookingEmail({to:booking.player_email,subject:`Booking reminder · ${settings.academy_name}`,text});
        const{error:updateError}=await db.from('bookings').update({reminder_sent:true,reminder_sent_at:new Date().toISOString()}).eq('id',booking.id);if(updateError)throw updateError;
        await db.from('reminder_logs').insert({booking_id:booking.id,reminder_type:'booking',status:'sent'});sent++;
      }catch(error){await db.from('reminder_logs').insert({booking_id:booking.id,reminder_type:'booking',status:'failed',error_message:error instanceof Error?error.message:'Delivery failed'});failed++;}
    }
    return json({sent,failed,checked:due.length});
  }catch(error){return json({error:error instanceof Error?error.message:'Unable to send reminders.'},{status:500});}
}
