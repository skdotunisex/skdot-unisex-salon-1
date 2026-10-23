(()=>{
const chat=document.querySelector('#support-chat');
const messages=document.querySelector('[data-support-messages]');
const form=document.querySelector('[data-support-chat-form]');
const openers=document.querySelectorAll('[data-open-support-chat]');
const closers=document.querySelectorAll('[data-close-support-chat]');
const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const add=(role,title,text)=>{const el=document.createElement('div');el.className='support-msg '+role;el.innerHTML='<strong>'+esc(title)+'</strong><p>'+esc(text).replace(/\n/g,'<br>')+'</p>';messages?.appendChild(el);messages?.scrollTo({top:messages.scrollHeight,behavior:'smooth'});};
const open=()=>{if(!chat)return;chat.classList.add('open');chat.setAttribute('aria-hidden','false');window.SKDOT_NOTIFY?.('support_open');setTimeout(()=>form?.querySelector('input')?.focus(),50)};
const close=()=>{if(!chat)return;chat.classList.remove('open');chat.setAttribute('aria-hidden','true')};
openers.forEach(x=>x.addEventListener('click',open));closers.forEach(x=>x.addEventListener('click',close));
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
const topicText={booking:'I need help with booking an appointment.',services:'I need help understanding SKDOT services and prices.',orders:'I need help placing a shop order or understanding an existing order.',payment:'I need help with a payment or Paystack transaction.',homeservice:'I need help with SKDOT home service.',complaint:'I have a problem or complaint that needs customer care.',product:'I need help choosing or checking a product.',other:'I need help with something else.'};
document.querySelectorAll('[data-support-topic]').forEach(btn=>btn.addEventListener('click',()=>{const t=topicText[btn.dataset.supportTopic]||'I need customer support.';open();if(form){form.message.value=t;form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))}}));
let history=[];try{history=JSON.parse(sessionStorage.getItem('skdot_support_history')||'[]')}catch{}
function remember(role,content){history=[...history,{role,content:String(content).slice(0,1200)}].slice(-12);try{sessionStorage.setItem('skdot_support_history',JSON.stringify(history))}catch{}}
async function ask(text){add('user','You',text);remember('user',text);const typing=document.createElement('div');typing.className='support-msg assistant typing';typing.innerHTML='<strong>SKDOT AI Support</strong><p>Thinking…</p>';messages?.appendChild(typing);messages?.scrollTo({top:messages.scrollHeight,behavior:'smooth'});try{const r=await fetch('/.netlify/functions/support-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history,session_id:sessionStorage.getItem('skdot_support_session')||''})});const d=await r.json();typing.remove();const reply=d.reply||'I can help route this to the SKDOT team.';add('assistant','SKDOT AI Support',reply);remember('assistant',reply);if(d.escalate)add('assistant','Customer Care','For this issue, please use WhatsApp or phone support so a representative can assist you directly.');}catch(e){typing.remove();const reply='I’m unable to reach the AI service right now. Please use WhatsApp or phone support and a customer-care representative can help you.';add('assistant','SKDOT AI Support',reply);remember('assistant',reply);}}
if(!sessionStorage.getItem('skdot_support_session')){try{sessionStorage.setItem('skdot_support_session','sk-'+crypto.randomUUID())}catch{sessionStorage.setItem('skdot_support_session','sk-'+Date.now())}}
if(form)form.addEventListener('submit',e=>{e.preventDefault();const input=form.message;const text=input.value.trim();if(!text)return;input.value='';ask(text)});
window.SKDOT_NOTIFY?.('support_chat_ready');

// Persistent, ticket-based human support conversation.
const ticketForm=document.querySelector('#support-ticket-form');
const lookupForm=document.querySelector('#support-ticket-lookup');
const live=document.querySelector('#support-live-conversation');
const liveMessages=document.querySelector('[data-live-messages]');
let activeTicket=null, liveBusy=false;
const fmtTime=v=>{try{return new Date(v).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}catch{return String(v||'')}};
const statusLabel=v=>({'open':'Open','in_progress':'In progress','waiting_customer':'Waiting for you','resolved':'Resolved'}[v]||v||'Open');
function renderTicket(data){
 const t=data.ticket; activeTicket={ticket_id:t.id,phone:activeTicket?.phone||lookupForm?.phone?.value||''};
 live.hidden=false;
 document.querySelector('[data-live-title]').textContent='Conversation with SKDOT';
 document.querySelector('[data-live-meta]').textContent=`Ticket ${t.id} · Opened ${fmtTime(t.created_at)}`;
 document.querySelector('[data-live-category]').textContent=t.category||'General support';
 const st=document.querySelector('[data-live-status]');st.textContent=statusLabel(t.status);st.className='ticket-status status-'+(t.status||'open');
 const last=t.admin_last_active_at;
 const typingNow=t.admin_typing_until&&new Date(t.admin_typing_until).getTime()>Date.now();document.querySelector('[data-live-presence]').textContent=typingNow?'SKDOT is typing…':last?((Date.now()-new Date(last).getTime()<5*60*1000)?'Recently active':'Last active '+fmtTime(last)):'Awaiting SKDOT response';
 liveMessages.innerHTML=(data.messages||[]).map(m=>`<article class="live-message ${m.sender==='SKDOT'?'from-admin':'from-customer'}"><div class="live-message-meta"><strong>${m.sender==='SKDOT'?'SKDOT Support':'You'}</strong><time>${esc(fmtTime(m.created_at))}</time></div><p>${esc(m.text).replace(/\n/g,'<br>')}</p>${m.sender==='Customer'?`<small class="message-receipt">${m.read_at?'Read by SKDOT':m.delivered_at?'Delivered':'Sent'} ${m.read_at?'✓✓':m.delivered_at?'✓✓':'✓'}</small>`:''}</article>`).join('')||'<p class="small-note">No messages yet. Send a message to begin.</p>';
 liveMessages.scrollTop=liveMessages.scrollHeight;
 if(t.status==='resolved')document.querySelector('#support-live-input').placeholder='This case is resolved. Send a message to reopen it…';
}
async function loadLive(){if(!activeTicket)return;const q=new URLSearchParams({ticket_id:activeTicket.ticket_id,phone:activeTicket.phone});const r=await fetch('/.netlify/functions/support-chat?'+q,{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load conversation');renderTicket(d)}
if(ticketForm){ticketForm.addEventListener('submit',async e=>{e.preventDefault();window.SKDOT_NOTIFY?.('form_attempt',{target:'support-ticket-form'});const result=ticketForm.querySelector('[data-ticket-result]');const data=Object.fromEntries(new FormData(ticketForm).entries());result.hidden=false;result.textContent='Creating your support case…';try{const r=await fetch('/.netlify/functions/support-ticket',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok||!d.ticket_id)throw new Error(d.error||'Could not create the ticket');activeTicket={ticket_id:d.ticket_id,phone:data.phone};lookupForm.ticket_id.value=d.ticket_id;lookupForm.phone.value=data.phone;try{sessionStorage.setItem('skdot_support_ticket',JSON.stringify(activeTicket))}catch{}result.textContent=`Your support case ${d.ticket_id} has been created. Keep this reference and continue the conversation below.`;await loadLive();live.scrollIntoView({behavior:'smooth',block:'start'});ticketForm.reset()}catch(err){result.textContent=String(err.message||err)}})}
if(lookupForm){lookupForm.addEventListener('submit',async e=>{e.preventDefault();const result=lookupForm.querySelector('[data-chat-lookup-result]');result.hidden=false;result.textContent='Opening your conversation…';activeTicket={ticket_id:lookupForm.ticket_id.value.trim().toUpperCase(),phone:lookupForm.phone.value.trim()};try{await loadLive();result.textContent='Conversation opened.';try{sessionStorage.setItem('skdot_support_ticket',JSON.stringify(activeTicket))}catch{}live.scrollIntoView({behavior:'smooth',block:'start'})}catch(err){result.textContent=String(err.message||err);live.hidden=true}})}
const liveInput=document.querySelector('#support-live-input');let typingTimer=null,lastTypingSent=0;
if(liveInput)liveInput.addEventListener('input',()=>{if(!activeTicket)return;const now=Date.now();if(now-lastTypingSent>1500){lastTypingSent=now;fetch('/.netlify/functions/support-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...activeTicket,action:'typing',typing:true})}).catch(()=>{})}clearTimeout(typingTimer);typingTimer=setTimeout(()=>fetch('/.netlify/functions/support-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...activeTicket,action:'typing',typing:false})}).catch(()=>{}),2200)});
const liveForm=document.querySelector('#support-live-form');
if(liveForm)liveForm.addEventListener('submit',async e=>{e.preventDefault();if(!activeTicket||liveBusy)return;const input=liveForm.message;const message=input.value.trim();if(!message)return;const button=liveForm.querySelector('button');liveBusy=true;button.disabled=true;button.textContent='Sending…';try{const r=await fetch('/.netlify/functions/support-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...activeTicket,message})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Message could not be sent');input.value='';await loadLive()}catch(err){alert(String(err.message||err))}finally{liveBusy=false;button.disabled=false;button.textContent='Send message'}});
document.querySelector('[data-live-refresh]')?.addEventListener('click',()=>loadLive().catch(e=>alert(String(e.message||e))));
try{const saved=JSON.parse(sessionStorage.getItem('skdot_support_ticket')||'null');if(saved?.ticket_id&&saved?.phone&&lookupForm){lookupForm.ticket_id.value=saved.ticket_id;lookupForm.phone.value=saved.phone;activeTicket=saved;loadLive().catch(()=>{})}}catch{}
setInterval(()=>{if(activeTicket&&live&&!live.hidden)loadLive().catch(()=>{})},4000);

})();
