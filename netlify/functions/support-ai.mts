import { json, getOrder } from './_shared.mts';
import { notifyAdmin } from './_notifications.mts';

const SUPPORT_SYSTEM = `You are SKDOT UNISEX SALON's customer-care AI assistant. You are a real customer-support assistant, not a scripted FAQ. Understand natural language, spelling mistakes, short messages, follow-up questions and context from the conversation. Be concise, warm, practical and honest.

Help with salon services, prices, booking, home service, shop products, how to place an order, cart/checkout, Paystack/payment questions, order tracking, website problems and complaints.

IMPORTANT:
- If a customer asks how to PLACE an order, explain: Shop -> choose product -> Add to cart -> Cart -> Checkout -> enter delivery details -> Paystack.
- If a customer asks where an EXISTING order is, ask for/order-reference and direct them to Track Order.
- If a customer asks about booking, explain the Book Appointment flow and that the appointment remains a request until SKDOT confirms availability.
- If a customer asks about home service, explain the Home Service/booking flow and that location/travel charges and availability must be confirmed by SKDOT.
- Never invent prices, stock, appointment availability, delivery dates, tracking numbers, refunds, policies, addresses or promises.
- Never claim a payment succeeded unless verified order context says it is paid.
- For complaints, payment disputes, refunds or sensitive account issues, recommend human escalation.
- Never request card PIN, CVV/CVC, full card number, password, admin PIN, API key or secret.
- Business WhatsApp/phone: +2349064653935.
- Website pages: /support.html, /booking.html, /home-service.html, /shop.html, /cart.html, /checkout.html, /track.html.
- If the customer is confused, guide them step-by-step instead of repeating a generic response.
- Do not claim to be human.`;

function fallback(message:string){
  const q=message.toLowerCase().replace(/[^a-z0-9\s]/g,' ');
  const has=(...terms:string[])=>terms.some(t=>q.includes(t));
  if(has('place order','make an order','make order','how do i order','how can i order','buy product','purchase')) return {reply:'Absolutely. To place an order, open Shop, choose the product you want and tap Add to cart. Then open Cart, review your items, continue to Checkout, enter your delivery details and continue to Paystack to pay. If you want, tell me the product you want and I can explain the steps.',escalate:false};
  if(has('track order','where is my order','order status','delivery status','tracking')) return {reply:'If you already placed an order, open Track Order and enter your SKDOT order reference. If you have the reference, send it to SKDOT customer care if you need the team to check the order.',escalate:false};
  if(has('book','booking','appointment','schedule','reserve')) return {reply:'To request an appointment, open Book Appointment, enter your name and phone/WhatsApp number, choose the booking type and service, select your preferred date and time, then add any style or service details. The request is not confirmed until SKDOT confirms availability.',escalate:false};
  if(has('home service','home visit','come to my house','at home')) return {reply:'For home service, open Home Service or Book Appointment, choose the home-service option, provide your area/neighbourhood and describe the service you need. SKDOT must confirm availability and any applicable travel charge before the appointment is accepted.',escalate:false};
  if(has('pay','payment','paystack','charged','receipt','refund')) return {reply:'For a payment issue, keep your Paystack transaction reference or receipt and contact SKDOT customer care by WhatsApp or phone. I cannot confirm a payment or refund unless the transaction is verified. Never send your card PIN, CVV/CVC or full card details.',escalate:true};
  if(has('complaint','problem','wrong','bad','issue','angry','refund')) return {reply:'I’m sorry you’re having a problem. Please describe what happened and include your booking or order reference if you have one. A SKDOT customer-care representative should review complaints, refunds and payment disputes.',escalate:true};
  if(has('price','cost','how much','service')) return {reply:'For published prices, open the relevant SKDOT service or Shop page. If a price is not published, please contact SKDOT customer care for the current price rather than relying on an estimate.',escalate:false};
  return {reply:'I can help you with booking, placing an order, products, payments, home service, order tracking, services or website problems. Tell me what you are trying to do and I’ll guide you step by step.',escalate:false};
}

function cleanHistory(input:any){
  if(!Array.isArray(input)) return [];
  return input.slice(-12).map((m:any)=>({role:m?.role==='assistant'?'assistant':'user',content:String(m?.content||'').slice(0,1200)})).filter((m:any)=>m.content);
}

export default async (req:Request)=>{
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  let body:any={}; try{body=await req.json()}catch{}
  const message=String(body?.message||'').trim().slice(0,1200);
  if(!message) return json({error:'Message required'},400);
  const history=cleanHistory(body?.history);
  const sessionId=String(body?.session_id||'').trim().slice(0,100);
  await notifyAdmin('support_ai_attempt',{message:message.slice(0,1000),order_id:String(body?.order_id||'').slice(0,80),session_id:sessionId},req);

  const apiKey=Netlify.env.get('OPENAI_API_KEY')||process.env.OPENAI_API_KEY;
  const model=Netlify.env.get('OPENAI_MODEL')||process.env.OPENAI_MODEL||'gpt-6-luna';
  if(!apiKey) return json({...fallback(message),ai_enabled:false});

  try{
    const orderId=String(body?.order_id||'').trim().slice(0,80);
    let orderContext='';
    if(orderId){
      const order=await getOrder(orderId);
      if(order) orderContext=`Verified order context: id=${order.id}, status=${order.status||'unknown'}, paymentStatus=${order.paymentStatus||'unknown'}, total=${order.total||'unknown'}, carrier=${order.shippingCarrier||'not assigned'}, tracking=${order.tracking||'not assigned'}.`;
    }
    const input=[...history,{role:'user',content:message}].slice(-12);
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,instructions:SUPPORT_SYSTEM+(orderContext?'\n\n'+orderContext:''),input,temperature:.2,max_output_tokens:450,store:false})});
    if(!response.ok) throw new Error('AI request failed');
    const data:any=await response.json();
    const reply=String(data?.output_text||'').trim();
    if(!reply) throw new Error('Empty AI response');
    return json({reply,escalate:/complaint|refund|payment|charged|dispute/i.test(message),ai_enabled:true,model});
  }catch{
    return json({...fallback(message),ai_enabled:false});
  }
};
