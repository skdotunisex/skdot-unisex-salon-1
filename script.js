
(()=>{const m=document.querySelector('.menu'),n=document.querySelector('.navlinks');if(m&&n){const close=()=>{n.classList.remove('open');m.setAttribute('aria-expanded','false');m.textContent='Menu'};m.setAttribute('aria-expanded','false');m.onclick=()=>{const open=n.classList.toggle('open');m.setAttribute('aria-expanded',String(open));m.textContent=open?'Close':'Menu'};n.querySelectorAll('a').forEach(a=>a.onclick=close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('click',e=>{if(n.classList.contains('open')&&!n.contains(e.target)&&e.target!==m)close()})}
document.querySelectorAll('.navlinks').forEach(n=>{const cart=n.querySelector('.cart-link');if(!n.querySelector('a[href="support.html"]')){const a=document.createElement('a');a.href='support.html';a.textContent='Customer Support';n.insertBefore(a,cart||null)}if(!n.querySelector('a[href="request-chat.html"]')){const a=document.createElement('a');a.href='request-chat.html';a.textContent='My Request / Chat';n.insertBefore(a,cart||null)}});
const f=document.querySelector('[data-booking]');if(f){const dateInput=f.querySelector('[name=date]'),timeInput=f.querySelector('[name=time]');if(dateInput){const now=new Date();dateInput.min=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}if(timeInput){timeInput.min='08:00';timeInput.max='20:00';timeInput.step='900'}f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f),time=String(d.get('time')||'');if(!time||time<'08:00'||time>'20:00'){alert('Please choose an appointment time between 08:00 and 20:00.');timeInput?.focus();return}if(String(d.get('date')||'')<(dateInput?.min||'')){alert('Please choose today or a future date.');dateInput?.focus();return}const button=f.querySelector('button[type=submit]'),old=button.textContent;button.disabled=true;button.textContent='Saving appointment request…';try{const payload=Object.fromEntries(d.entries());const r=await fetch('/.netlify/functions/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||'Unable to save the appointment request. Please try again.');const a=data.appointment;const msg=['SKDOT UNISEX SALON APPOINTMENT REQUEST','Request code: '+a.id,'Status: '+a.status,'Name: '+d.get('name'),'Phone: '+d.get('phone'),'Booking type: '+d.get('booking_type'),'Service: '+d.get('service'),'Preferred date: '+d.get('date'),'Preferred time: '+d.get('time'),'Home-service location: '+(d.get('location')||'N/A'),'Details: '+(d.get('note')||'N/A'),'Track status or chat with SKDOT: '+location.origin+'/request-chat.html'].join('\n');localStorage.setItem('skdot_last_booking',msg);localStorage.setItem('skdot_last_appointment_id',a.id);document.querySelector('[data-message]').value=msg;const result=document.querySelector('[data-result]');result.hidden=false;result.innerHTML='<strong>Request saved successfully.</strong><p>Your request code is <strong>'+a.id+'</strong>. It is pending SKDOT review, not yet confirmed.</p><p><a class=\"btn btn-outline\" href=\"request-chat.html\">View request status / chat with SKDOT</a></p>';let w=document.querySelector('[data-whatsapp]');if(w)w.href='https://wa.me/2349064653935?text='+encodeURIComponent(msg);button.textContent='Request saved ✓';}catch(err){alert(String(err.message||err));button.textContent=old;button.disabled=false}};}
const c=document.querySelector('[data-copy]');if(c)c.onclick=async()=>{let b=document.querySelector('[data-message]');try{await navigator.clipboard.writeText(b.value)}catch(e){b.select();document.execCommand('copy')}c.textContent='Copied';setTimeout(()=>c.textContent='Copy message',1400)}})();

/* SKDOT V9: consistent bold mobile navigation on every page */
(()=> {
  const bar=document.querySelector('.mobile-action-bar');
  if(!bar) return;
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const icons={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    services:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 14.8 4.8 19.2a2 2 0 0 1-2.8-2.8l4.4-4.4m6.4-2.8 4.4-4.4a2 2 0 0 1 2.8 2.8l-4.4 4.4M8 6.5l9.5 9.5M15.8 4.2 19.8 8.2M4.2 15.8 8.2 19.8"/></svg>',
    shop:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v12H4zM7 8V6a5 5 0 0 1 10 0v2M8 12h8"/></svg>',
    gallery:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
    contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h3m-3 3h3"/></svg>'
  };
  const links=[
    ['index.html',icons.home,'Home'],
    ['services.html',icons.services,'Services'],
    ['gallery.html',icons.gallery,'Gallery'],
    ['shop.html',icons.shop,'Shop'],
    ['booking.html',icons.book,'Book'],
    ['contact.html',icons.contact,'Contact']
  ];
  bar.innerHTML=links.map(([href,icon,label])=>{
    const active=(href===path)||((path===''||path==='index.html')&&href==='index.html');
    return `<a href="${href}" class="${active?'active':''}" ${href.startsWith('https://')?'target="_blank" rel="noopener"':''}><span class="nav-icon">${icon}</span><span>${label}</span></a>`;
  }).join('');
})();


/* SKDOT production customer-attempt notifications. Never send passwords, PINs, card data or secret values. */
(()=>{
  const endpoint='/.netlify/functions/customer-event';
  const send=(event,details={})=>{try{let session_id='';try{session_id=sessionStorage.getItem('skdot_support_session')||''}catch{};const body=JSON.stringify({event,page:location.pathname,title:document.title,session_id,...details});if(navigator.sendBeacon){const blob=new Blob([body],{type:'application/json'});navigator.sendBeacon(endpoint,blob)}else{fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{})}}catch{}};
  send('page_view');
  document.addEventListener('click',e=>{const a=e.target?.closest?.('a,button');if(!a)return;const label=(a.innerText||a.getAttribute('aria-label')||a.getAttribute('title')||'').trim().slice(0,200);const href=(a.getAttribute('href')||'').slice(0,300);const isWa=/wa\.me|whatsapp/i.test(href);send(isWa?'whatsapp_click':'click',{label,target:href})});
  document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',()=>{
    const id=f.id||f.getAttribute('data-form')||'form';
    if(f.matches('[data-booking]')||id==='checkout-form'||id==='track-form'||f.matches('#support-ticket-form')) return;
    send('form_attempt',{target:id});
  },{capture:true}));
  const booking=document.querySelector('[data-booking]');
  if(booking) booking.addEventListener('submit',()=>{
    const d=new FormData(booking);
    send('booking_attempt',{name:String(d.get('name')||'').slice(0,120),phone:String(d.get('phone')||'').slice(0,40),booking_type:String(d.get('booking_type')||'').slice(0,80),service:String(d.get('service')||'').slice(0,200),date:String(d.get('date')||'').slice(0,40),time:String(d.get('time')||'').slice(0,40),location:String(d.get('location')||'').slice(0,300),details:String(d.get('note')||'').slice(0,700)});
  },{capture:true});
  const checkout=document.querySelector('#checkout-form');
  if(checkout) checkout.addEventListener('submit',()=>send('checkout_attempt',{method:String(new FormData(checkout).get('payment_method')||'').slice(0,80),customer_email:String(new FormData(checkout).get('customer_email')||'').slice(0,160)}),{capture:true});
  const track=document.querySelector('#track-form');
  if(track) track.addEventListener('submit',()=>send('track_attempt',{order_id:String(document.querySelector('#order-id')?.value||'').trim().slice(0,80)}),{capture:true});
  window.SKDOT_NOTIFY=send;
})();
