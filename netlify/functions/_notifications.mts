import { getStoreSafe } from './_shared.mts';

const clean=(v:any,n=500)=>String(v??'').trim().slice(0,n);
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));

export async function notifyAdmin(event:string, details:Record<string,any>={}, request?:Request){
  const created_at=new Date().toISOString();
  const safeDetails:any={};
  for(const [k,v] of Object.entries(details||{})){
    if(/password|pin|secret|authorization|token|card|cvv|cvc/i.test(k)) continue;
    safeDetails[k]=typeof v==='string'?clean(v,1000):v;
  }
  const record={id:`EV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,event,created_at,details:safeDetails};
  try{await getStoreSafe().setJSON(`events/${record.id}`,record)}catch{}

  const apiKey=Netlify.env.get('BREVO_API_KEY')||process.env.BREVO_API_KEY;
  const recipientList=(Netlify.env.get('NOTIFICATION_EMAILS')||Netlify.env.get('NOTIFICATION_EMAIL')||Netlify.env.get('SUPPORT_EMAIL')||process.env.NOTIFICATION_EMAILS||process.env.NOTIFICATION_EMAIL||process.env.SUPPORT_EMAIL||'')
    .split(',').map(x=>x.trim()).filter(Boolean).slice(0,20);
  const sender=Netlify.env.get('BREVO_SENDER_EMAIL')||process.env.BREVO_SENDER_EMAIL||recipientList[0]||'';
  if(!apiKey||!recipientList.length||!sender) return {stored:true,emailed:false,id:record.id};
  const subject=`SKDOT website notification — ${event}`;
  const lines=Object.entries(safeDetails).map(([k,v])=>`${k}: ${typeof v==='object'?JSON.stringify(v):String(v)}`);
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>SKDOT website notification</h2><p><strong>Event:</strong> ${esc(event)}</p><p><strong>Time:</strong> ${esc(created_at)}</p><hr>${lines.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;
  try{
    const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':apiKey,'Content-Type':'application/json'},body:JSON.stringify({sender:{email:sender,name:'SKDOT Website'},to:recipientList.map(email=>({email})),subject,textContent:`SKDOT website notification\n\nEvent: ${event}\nTime: ${created_at}\n\n${lines.join('\n')}`,htmlContent:html})});
    return {stored:true,emailed:r.ok,id:record.id};
  }catch{return {stored:true,emailed:false,id:record.id};}
}
