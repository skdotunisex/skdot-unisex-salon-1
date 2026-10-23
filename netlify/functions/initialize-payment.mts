import crypto from "node:crypto";
import { json, normalizeOrder, saveOrder } from "./_shared.mts";
import { notifyAdmin } from "./_notifications.mts";
export default async request=>{
  if(request.method!=="POST") return json({error:"Method not allowed"},405);
  const secret=Netlify.env.get("PAYSTACK_SECRET_KEY"); if(!secret)return json({error:"PAYSTACK_SECRET_KEY is not configured on the server."},500);
  let body; try{body=await request.json()}catch{return json({error:"Invalid JSON body."},400)}
  const clean=normalizeOrder(body);
  await notifyAdmin('checkout_attempt',{customer_name:clean.customer.customer_name,customer_phone:clean.customer.customer_phone,customer_email:clean.customer.customer_email,item_count:clean.items.length,total:clean.total});
  if(!clean.customer.customer_name||!clean.customer.customer_phone||!clean.customer.customer_email)return json({error:"Name, phone and email are required."},400);
  if(!clean.items.length||clean.total<=0)return json({error:"Your cart is empty or contains invalid products."},400);
  const id=`SKD-${crypto.randomInt(10000000,100000000)}`;
  const reference=`SKDOT-${id}-${crypto.randomBytes(4).toString("hex")}`;
  const order={id,created:new Date().toISOString(),status:"Awaiting payment",paymentStatus:"Awaiting payment",paymentReference:reference,tracking:"Not assigned",...clean};
  await saveOrder(order);
  const siteUrl=new URL(request.url).origin; const callbackUrl=`${siteUrl}/payment-callback.html?reference=${encodeURIComponent(reference)}`;
  const response=await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/json"},body:JSON.stringify({email:clean.customer.customer_email,amount:String(clean.total*100),currency:"NGN",reference,callback_url:callbackUrl,metadata:{order_id:id,cancel_action:`${siteUrl}/checkout.html`,customer_name:clean.customer.customer_name}})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.status){await notifyAdmin('payment_initialization_failed',{customer_email:clean.customer.customer_email,message:data.message||'Paystack could not initialize the payment.'});return json({error:data.message||"Paystack could not initialize the payment."},502);}
  order.authorizationUrl=data.data.authorization_url; await saveOrder(order); await notifyAdmin('payment_attempt_created',{order_id:id,reference,amount:clean.total,customer_email:clean.customer.customer_email}); return json({ok:true,orderId:id,reference,authorizationUrl:data.data.authorization_url});
};
