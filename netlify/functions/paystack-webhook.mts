import crypto from "node:crypto";
import { getOrderByPaymentReference, saveOrder } from "./_shared.mts";
import { notifyAdmin } from "./_notifications.mts";
export default async request=>{
  if(request.method!=="POST")return new Response("Method not allowed",{status:405});
  const secret=Netlify.env.get("PAYSTACK_SECRET_KEY");if(!secret)return new Response("Webhook secret is not configured",{status:500});
  const raw=await request.text();const signature=request.headers.get("x-paystack-signature")||"";const expected=crypto.createHmac("sha512",secret).update(raw).digest("hex");
  if(!signature||signature.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return new Response("Invalid signature",{status:401});
  let event;try{event=JSON.parse(raw)}catch{return new Response("Invalid JSON",{status:400})}
  if(event.event==="charge.success"){const tx=event.data||{};const order=await getOrderByPaymentReference(tx.reference);if(order&&order.paymentReference===tx.reference&&Number(tx.requested_amount??tx.amount)===Math.round(Number(order.total)*100)&&String(tx.currency||"NGN").toUpperCase()==="NGN"){order.paymentStatus="Paid";order.status=order.status==="Awaiting payment"?"Order confirmed":order.status;order.paidAt=order.paidAt||new Date().toISOString();order.paystackTransactionId=tx.id;await saveOrder(order);await notifyAdmin('payment_webhook_success',{order_id:order.id,reference:tx.reference,transaction_id:tx.id,amount:order.total,customer_email:order.customer?.customer_email||''},request);}}
  return new Response("OK",{status:200});
};
