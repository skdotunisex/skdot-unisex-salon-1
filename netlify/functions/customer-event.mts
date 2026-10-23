import { json } from './_shared.mts';
import { notifyAdmin } from './_notifications.mts';

const clean=(v:any,n:number)=>String(v??'').trim().slice(0,n);
const allowed=new Set(['page_view','click','form_attempt','booking_attempt','checkout_attempt','cart_add','product_view','track_attempt','whatsapp_click','support_open','support_ai_attempt','contact_attempt']);

export default async (request:Request)=>{
  if(request.method!=='POST') return json({error:'Method not allowed'},405);
  let b:any={}; try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const event=clean(b.event,60); if(!allowed.has(event)) return json({error:'Unsupported event'},400);
  const details={page:clean(b.page,200),title:clean(b.title,200),target:clean(b.target,300),label:clean(b.label,200),category:clean(b.category,100),order_id:clean(b.order_id,100),product_id:clean(b.product_id,100),product_name:clean(b.product_name,200),quantity:clean(b.quantity,20),method:clean(b.method,80),result:clean(b.result,120),name:clean(b.name,120),phone:clean(b.phone,40),booking_type:clean(b.booking_type,80),service:clean(b.service,200),date:clean(b.date,40),time:clean(b.time,40),location:clean(b.location,300),details:clean(b.details,700),session_id:clean(b.session_id,100)};
  const r=await notifyAdmin(event,details,request);
  return json({ok:true,notification_id:r.id});
};
