import { format, parseISO } from 'date-fns';

export const money = (value: number | string | null | undefined) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
export const dateLabel = (value: string) => format(parseISO(value), 'dd MMM yyyy');
export const safeError = (error: unknown) => error instanceof Error ? error.message : 'An unexpected error occurred.';
export const initials = (name: string) => name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
export const api = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed.');
  return body as T;
};
export const csvDownload = (filename: string, columns: string[], rows: Array<Array<string | number | null | undefined>>) => {
  const quote = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = [columns, ...rows].map((row) => row.map(quote).join(',')).join('\n');
  const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = href; link.download = filename; link.click(); URL.revokeObjectURL(href);
};
