'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { SiteShell } from '@/components/layout/SiteShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema } from '@/lib/utils/validators';
import { api } from '@/lib/utils/helpers';
type Values=z.infer<typeof loginSchema>;
function LoginContent(){const router=useRouter();const params=useSearchParams();const{register,handleSubmit,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(loginSchema),defaultValues:{email:'',password:''}});const submit=async(data:Values)=>{try{const result=await api<{profile:{role:string}}>('/api/auth/login',{method:'POST',body:JSON.stringify(data)});toast.success('Welcome back.');const next=params.get('next');router.push(next?.startsWith('/')?next:result.profile.role==='admin'?'/admin':'/progress');router.refresh();}catch(error){toast.error(error instanceof Error?error.message:'Unable to sign in.');}};return <SiteShell><div className="container-page grid min-h-[600px] place-items-center py-12"><Card className="w-full max-w-md p-7"><p className="text-sm font-bold uppercase tracking-[.14em] text-amber-700">Welcome back</p><h1 className="mt-2 text-3xl font-extrabold">Sign in</h1>{params.get('error')==='admin'&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Please sign in with an active administrator account.</p>}<form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4"><label><span className="label">Email</span><Input type="email" autoComplete="email" {...register('email')}/>{errors.email&&<small className="text-danger">{errors.email.message}</small>}</label><label><span className="label">Password</span><Input type="password" autoComplete="current-password" {...register('password')}/>{errors.password&&<small className="text-danger">{errors.password.message}</small>}</label><Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting?'Signing in…':'Login'}</Button></form><p className="mt-5 text-center text-sm text-muted">New to RallyPoint? <Link href="/register" className="font-bold text-amber-800 underline">Create your account</Link></p></Card></div></SiteShell>}
export default function LoginPage(){return <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted">Loading sign in…</div>}><LoginContent/></Suspense>}
