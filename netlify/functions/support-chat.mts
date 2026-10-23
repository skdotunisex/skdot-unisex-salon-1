import { randomUUID } from 'node:crypto';
import { getStoreSafe, json } from './_shared.mts';
import { cookieToken, validSession } from './_admin-shared.mts';
import { notifyAdmin } from './_notifications.mts';
const clean=(v:any,n:number)=>String(v??'').trim().slice(0,n);
const digits=(v:any)=>String(v??'').replace(/\D/g,'');
async function getMessages(store:any,id:string){
 const {blobs}=await store.list({prefix:`support-messages/${id}/`}); const out:any[]=[];
 for(const b of blobs){const m=await store.get(b.key,{type:'json',consistency:'strong'});if(m)out.push(m)}
 return out.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
}
async function updateMessagesRead(store:any,id:string,reader:'Customer'|'SKDOT'){
 const msgs=await getMessages(store,id); const now=new Date().toISOString(); let changed=false;
 for(const m of msgs){if(m.sender!==reader && !m.read_at){m.delivered_at=m.delivered_at||now;m.read_at=now;await store.setJSON(`support-messages/${id}/${m.id}`,m);changed=true}}
 return changed;
}
export default async (req:Request)=>{
 const store=getStoreSafe(); const secret=Netlify.env.get('ADMIN_SESSION_SECRET'); const isAdmin=!!secret && await validSession(cookieToken(req),secret);
 const url=new URL(req.url);
 if(req.method==='GET'){
  if(url.searchParams.get('inbox')==='1'){
   if(!isAdmin)return json({error:'Admin login required.'},401);
   const {blobs}=await store.list({prefix:'support/'}); const tickets:any[]=[];
   for(const b of blobs){const t=await store.get(b.key,{type:'json',consistency:'strong'});if(t)tickets.push(t)}
   tickets.sort((a,b)=>String(b.updated_at||b.created_at).localeCompare(String(a.updated_at||a.created_at)));
   const result=[];
   for(const t of tickets.slice(0,150)){const ms=await getMessages(store,t.id);result.push({...t,last_message:ms[ms.length-1]||null,unread_count:ms.filter(m=>m.sender==='Customer'&&!m.read_at).length})}
   return json({ok:true,tickets:result});
  }
  const id=clean(url.searchParams.get('ticket_id'),80); if(!id)return json({error:'Support ticket reference is required.'},400);
  const ticket=await store.get(`support/${id}`,{type:'json',consistency:'strong'});if(!ticket)return json({error:'Support ticket not found.'},404);
  if(!isAdmin && digits(url.searchParams.get('phone'))!==digits(ticket.phone))return json({error:'The ticket reference and phone number do not match.'},403);
  await updateMessagesRead(store,id,isAdmin?'SKDOT':'Customer');
  ticket.last_active_at=new Date().toISOString(); if(isAdmin)ticket.admin_last_active_at=ticket.last_active_at;else ticket.customer_last_active_at=ticket.last_active_at;
  await store.setJSON(`support/${id}`,ticket);
  const messages=await getMessages(store,id);
  let notes:any[]=[];if(isAdmin){const {blobs}=await store.list({prefix:`support-notes/${id}/`});for(const blob of blobs){const note=await store.get(blob.key,{type:'json',consistency:'strong'});if(note)notes.push(note)}notes.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));}
  return json({ok:true,ticket,messages,notes,admin:isAdmin});
 }
 if(req.method==='POST'){
  let b:any={};try{b=await req.json()}catch{return json({error:'Invalid request.'},400)}
  const id=clean(b.ticket_id,80);if(!id)return json({error:'Support ticket reference is required.'},400);
  const ticket=await store.get(`support/${id}`,{type:'json',consistency:'strong'});if(!ticket)return json({error:'Support ticket not found.'},404);
  if(!isAdmin && digits(b.phone)!==digits(ticket.phone))return json({error:'The ticket reference and phone number do not match.'},403);
  const now=new Date().toISOString();
  if(b.action==='typing'){
   const until= b.typing===false ? null : new Date(Date.now()+8000).toISOString();
   if(isAdmin)ticket.admin_typing_until=until;else ticket.customer_typing_until=until;
   if(isAdmin)ticket.admin_last_active_at=now;else ticket.customer_last_active_at=now;
   ticket.last_active_at=now;await store.setJSON(`support/${id}`,ticket);return json({ok:true});
  }
  if(b.action==='internal-note'){
   if(!isAdmin)return json({error:'Admin login required.'},401);
   const text=clean(b.note,1200);if(!text)return json({error:'Write an internal note first.'},400);
   const note={id:`NOTE-${randomUUID().slice(0,12)}`,ticket_id:id,text,created_at:now,author:'SKDOT Admin'};
   await store.setJSON(`support-notes/${id}/${note.id}`,note);ticket.updated_at=now;ticket.assigned_to=clean(b.assigned_to||ticket.assigned_to,80)||'SKDOT Admin';await store.setJSON(`support/${id}`,ticket);return json({ok:true,note,ticket});
  }
  if(b.action==='assign'){
   if(!isAdmin)return json({error:'Admin login required.'},401);
   ticket.assigned_to=clean(b.assigned_to,80)||'Unassigned';ticket.updated_at=now;await store.setJSON(`support/${id}`,ticket);return json({ok:true,ticket});
  }
  if(b.action==='status' && !isAdmin)return json({error:'Admin login required.'},401);
  if(isAdmin && b.action==='status'){
   const allowed=['open','in_progress','waiting_customer','resolved']; const status=clean(b.status,40);if(!allowed.includes(status))return json({error:'Invalid ticket status.'},400);
   ticket.status=status;ticket.updated_at=now;ticket.status_updated_at=now;ticket.last_active_at=now;ticket.admin_last_active_at=now;
   await store.setJSON(`support/${id}`,ticket);await notifyAdmin('support_ticket_status_changed',{ticket_id:id,status},req);
   return json({ok:true,ticket});
  }
  const text=clean(b.message,1500);if(!text)return json({error:'Write a message first.'},400);
  if(!isAdmin && ticket.status==='resolved'){ticket.status='open';ticket.reopened_at=now}
  const msg={id:`MSG-${randomUUID().slice(0,12)}`,ticket_id:id,sender:isAdmin?'SKDOT':'Customer',text,created_at:now,delivery_status:'sent',delivered_at:null,read_at:null};
  await store.setJSON(`support-messages/${id}/${msg.id}`,msg);
  ticket.updated_at=now;ticket.last_active_at=now;if(isAdmin){ticket.admin_last_active_at=now;if(ticket.status==='waiting_customer')ticket.status='in_progress'}else{ticket.customer_last_active_at=now;if(!['resolved','in_progress'].includes(ticket.status))ticket.status='open'}
  await store.setJSON(`support/${id}`,ticket);
  if(!isAdmin)await notifyAdmin('support_customer_message',{ticket_id:id,name:ticket.name,phone:ticket.phone,category:ticket.category,message:text},req);
  else await notifyAdmin('support_admin_reply',{ticket_id:id,message:text.slice(0,300)},req);
  return json({ok:true,message:msg,ticket});
 }
 return json({error:'Method not allowed.'},405);
};
