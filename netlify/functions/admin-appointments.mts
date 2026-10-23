import { randomUUID } from 'node:crypto';
import { json, getStoreSafe } from './_shared.mts';
import { requireAdmin } from './_admin-shared.mts';
import { notifyAdmin } from './_notifications.mts';
const clean=(v:any,n:number)=>String(v??'').trim().slice(0,n);
export default async (request:Request)=>{
  const auth=await requireAdmin(request); if(!auth.ok)return auth.response;
  const store=getStoreSafe();
  if(request.method==='GET'){
    const {blobs}=await store.list({prefix:'appointments/'}); const appointments:any[]=[];
    for(const b of blobs){const a=await store.get(b.key,{type:'json',consistency:'strong'});if(a)appointments.push(a)}
    appointments.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    const recent=appointments.slice(0,100);
    for(const a of recent){const listed=await store.list({prefix:`appointment-messages/${a.id}/`});const messages:any[]=[];for(const item of listed.blobs){const m=await store.get(item.key,{type:'json',consistency:'strong'});if(m)messages.push(m)}messages.sort((x,y)=>String(x.created_at).localeCompare(String(y.created_at)));a.messages=messages.slice(-20)}
    return json({ok:true,appointments:recent});
  }
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  let b:any;try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
  const id=clean(b.id,80); const a=await store.get(`appointments/${id}`,{type:'json',consistency:'strong'});if(!a)return json({error:'Appointment request not found.'},404);
  const statuses=['Pending review','Approved','Declined','Reschedule requested','Completed'];
  const status=clean(b.status,40);if(status&&!statuses.includes(status))return json({error:'Invalid appointment status.'},400);
  const reply=clean(b.reply,1500); const now=new Date().toISOString();
  if(status)a.status=status;
  if(reply){a.admin_reply=reply;const msg={id:`MSG-${randomUUID().slice(0,10)}`,appointment_id:id,sender:'SKDOT',text:reply,created_at:now};await store.setJSON(`appointment-messages/${id}/${msg.id}`,msg)}
  a.updated_at=now; await store.setJSON(`appointments/${id}`,a);
  await notifyAdmin('appointment_updated_by_admin',{appointment_id:id,status:a.status,reply:reply?reply.slice(0,300):''},request);
  return json({ok:true,appointment:a});
};
