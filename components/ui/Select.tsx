import { forwardRef, type SelectHTMLAttributes } from 'react';
export const Select=forwardRef<HTMLSelectElement,SelectHTMLAttributes<HTMLSelectElement>>(({className='',children,...props},ref)=><select ref={ref} className={`input ${className}`} {...props}>{children}</select>);Select.displayName='Select';
