import { randomUUID } from 'node:crypto';
import { json, getStoreSafe } from './_shared.mts';
import { notifyAdmin } from './_notifications.mts';
const clean=(v:any,n:number)=>String(v??'').trim().slice(0,n);
const digits=(v:string)=>v.replace(/\D/g,'');
export default async (request:Request)=>{
  if(request.method!=='POST') return json({error:'Method not allowed'},405);
  let b:any; try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
  const name=clean(b.name,120), phone=clean(b.phone,40), bookingType=clean(b.booking_type,80), service=clean(b.service,200), date=clean(b.date,10), time=clean(b.time,5), location=clean(b.location,300), details=clean(b.note,1000);
  if(!name||!phone||!bookingType||!service||!date||!time) return json({error:'Please complete your name, phone, booking type, service, date and time.'},400);
  if(digits(phone).length<7) return json({error:'Please enter a valid phone/WhatsApp number.'},400);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)) return json({error:'Choose a valid date and time.'},400);
  const [y,m,d]=date.split('-').map(Number); const [hh,mm]=time.split(':').map(Number); const calendarDate=new Date(Date.UTC(y,m-1,d));
  if(Number.isNaN(calendarDate.getTime())||calendarDate.getUTCFullYear()!==y||calendarDate.getUTCMonth()!==m-1||calendarDate.getUTCDate()!==d) return json({error:'Choose a valid appointment date.'},400);
  const lagosParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const part=(key:string)=>lagosParts.find(p=>p.type===key)?.value||''; const today=`${part('year')}-${part('month')}-${part('day')}`; const currentTime=`${part('hour')}:${part('minute')}`;
  if(date<today||(date===today&&time<=currentTime)) return json({error:'The preferred date and time must be in the future in Nigeria time.'},400);
  if(hh<8||hh>20||(hh===20&&mm>0)) return json({error:'Please choose a time between 08:00 and 20:00. SKDOT will confirm availability.'},400);
  if(bookingType.toLowerCase().includes('home')&&!location) return json({error:'Enter your area or neighbourhood for home service.'},400);
  const id='SKA-'+date.replace(/-/g,'').slice(2)+'-'+randomUUID().slice(0,5).toUpperCase();
  const now=new Date().toISOString();
  const appointment={id,name,phone,phoneDigits:digits(phone),booking_type:bookingType,service,date,time,location,details,status:'Pending review',created_at:now,updated_at:now,admin_reply:''};
  try{await getStoreSafe().setJSON(`appointments/${id}`,appointment)}catch{return json({error:'We could not save the request right now. Please try again.'},503)}
  await notifyAdmin('appointment_request_received',{appointment_id:id,name,phone,booking_type:bookingType,service,date,time,location,details});
  return json({ok:true,appointment:{id,status:appointment.status,name,service,date,time,booking_type:bookingType}});
};
