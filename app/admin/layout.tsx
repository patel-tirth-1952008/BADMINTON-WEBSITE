'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
export default function AdminLayout({children}:{children:React.ReactNode}){const[open,setOpen]=useState(false);return <div className="min-h-screen bg-[#FAFAFA] lg:flex"><AdminSidebar open={open} onClose={()=>setOpen(false)}/>{open&&<button className="fixed inset-0 z-40 bg-black/30 lg:hidden" aria-label="Close menu" onClick={()=>setOpen(false)}/>}<div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-stone-200 bg-white px-4 lg:px-8"><button className="rounded-lg p-2 hover:bg-stone-100 lg:hidden" onClick={()=>setOpen(true)} aria-label="Open admin navigation"><Menu/></button><span className="ml-auto text-sm font-semibold text-muted">Academy control centre</span></header><main className="p-4 lg:p-8">{children}</main></div></div>}
