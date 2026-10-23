import { randomUUID } from 'node:crypto';
import { json, getStoreSafe } from './_shared.mts';
import { notifyAdmin } from './_notifications.mts';
import { cookieToken, validSession } from './_admin-shared.mts';
const clean=(v:any,n:number)=>String(v??'').trim().slice(0,n);
const digits=(v:string)=>v.replace(/\D/g,'');
async function isAdmin(request:Request){const secret=Netlify.env.get('ADMIN_SESSION_SECRET');return !!secret&&await validSession(cookieToken(request),secret)}
export default async (request:Request)=>{
  const store=getStoreSafe(); const admin=await isAdmin(request);
  if(request.method==='GET'){
    const u=new URL(request.url);const id=clean(u.searchParams.get('id'),80);const phone=clean(u.searchParams.get('phone'),40);if(!id)return json({error:'Enter your request code.'},400);
    const a=await store.get(`appointments/${id}`,{type:'json',consistency:'strong'});if(!a)return json({error:'Request code not found.'},404);
    if(!admin&&digits(phone)!==String(a.phoneDigits||digits(a.phone)))return json({error:'The request code and phone number do not match.'},403);
    const {blobs}=await store.list({prefix:`appointment-messages/${id}/`});const messages:any[]=[];for(const b of blobs){const m=await store.get(b.key,{type:'json',consistency:'strong'});if(m)messages.push(m)}messages.sort((x,y)=>String(x.created_at).localeCompare(String(y.created_at)));
    return json({ok:true,appointment:{id:a.id,name:a.name,service:a.service,date:a.date,time:a.time,status:a.status,admin_reply:a.admin_reply||''},messages});
  }
  if(request.method==='POST'){
    let b:any;try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
    const id=clean(b.id,80), text=clean(b.message,1500);if(!id||!text)return json({error:'Enter a message.'},400);
    const a=await store.get(`appointments/${id}`,{type:'json',consistency:'strong'});if(!a)return json({error:'Request code not found.'},404);
    let sender='Customer';
    if(!admin){const phone=clean(b.phone,40);if(digits(phone)!==String(a.phoneDigits||digits(a.phone)))return json({error:'The request code and phone number do not match.'},403);if(a.status==='Declined'||a.status==='Completed')return json({error:'This request is closed. Contact SKDOT on WhatsApp if you need help.'},409)}else sender='SKDOT';
    const msg={id:`MSG-${randomUUID().slice(0,10)}`,appointment_id:id,sender,text,created_at:new Date().toISOString()};
    await store.setJSON(`appointment-messages/${id}/${msg.id}`,msg);a.updated_at=msg.created_at;await store.setJSON(`appointments/${id}`,a);
    if(!admin)await notifyAdmin('customer_appointment_message',{appointment_id:id,name:a.name,phone:a.phone,message:text});
    return json({ok:true,message:msg});
  }
  return json({error:'Method not allowed'},405);
};
