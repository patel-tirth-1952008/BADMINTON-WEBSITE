import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
type Props=ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'outline'|'ghost'|'danger';size?:'sm'|'md'|'lg'};
export const Button=forwardRef<HTMLButtonElement,Props>(({className,variant='primary',size='md',...props},ref)=><button ref={ref} className={clsx('inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',{'bg-brand text-ink hover:bg-brand-hover':'primary'===variant,'border border-ink bg-transparent text-ink hover:bg-brand-light':'outline'===variant,'text-ink hover:bg-stone-100':'ghost'===variant,'bg-danger text-white hover:bg-red-600':'danger'===variant},{'px-3 py-2 text-sm':'sm'===size,'px-4 py-2.5 text-sm':'md'===size,'px-5 py-3 text-base':'lg'===size},className)} {...props}/>);
Button.displayName='Button';
