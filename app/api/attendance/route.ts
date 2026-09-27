import { NextRequest } from 'next/server';
import { adminDb, badRequest, json, parseBody, requireAdmin } from '@/lib/api';
import { z } from 'zod';
const attendanceSchema=z.object({student_id:z.string().uuid(),program_id:z.string().uuid().nullable().optional(),date:z.string().date(),status:z.enum(['present','absent','late','excused']),check_in_time:z.string().datetime().nullable().optional(),check_out_time:z.string().datetime().nullable().optional()});
export async function POST(request:NextRequest){try{const auth=await requireAdmin(request);if(auth.failure)return auth.failure;const input=attendanceSchema.parse(await parseBody(request));const{data,error}=await adminDb().from('attendance').upsert({...input,program_id:input.program_id||null},{onConflict:'student_id,date,program_id'}).select('*,programs(*)').single();if(error)throw error;return json({attendance:data});}catch(error){return badRequest(error instanceof Error?error.message:'Unable to save attendance.');}}
