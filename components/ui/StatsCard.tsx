import { Card } from './Card';
export function StatsCard({label,value,detail}:{label:string;value:string|number;detail?:string}){return <Card className="p-5"><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p>{detail&&<p className="mt-1 text-xs text-muted">{detail}</p>}</Card>}
