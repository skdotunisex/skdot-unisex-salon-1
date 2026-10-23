import { json, getOrderByPaymentReference, saveOrder } from "./_shared.mts";
import { notifyAdmin } from "./_notifications.mts";
export default async request=>{
  const secret=Netlify.env.get("PAYSTACK_SECRET_KEY"); if(!secret)return json({error:"PAYSTACK_SECRET_KEY is not configured on the server."},500);
  const reference=new URL(request.url).searchParams.get("reference"); if(!reference)return json({error:"Missing payment reference."},400);
  const r=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`}});
  const data=await r.json().catch(()=>({})); if(!r.ok||!data.status)return json({error:data.message||"Unable to verify payment."},502);
  const tx=data.data; const order=await getOrderByPaymentReference(reference);
  if(!order||tx?.reference!==reference)return json({error:"Order could not be matched to this payment."},404);
  const requestedAmount=Number(tx.requested_amount??tx.amount); const successful=tx.status==="success"&&requestedAmount===Math.round(Number(order.total)*100)&&String(tx.currency||"NGN").toUpperCase()==="NGN";
  if(successful){order.paymentStatus="Paid";order.status=order.status==="Awaiting payment"?"Order confirmed":order.status;order.paidAt=order.paidAt||new Date().toISOString();order.paystackTransactionId=tx.id;await saveOrder(order);}
  await notifyAdmin(successful?'payment_verified':'payment_verification_failed',{order_id:order.id,reference,amount:order.total,status:tx?.status||'unknown',customer_email:order.customer?.customer_email||''});
  return json({ok:true,paid:successful,order:{id:order.id,status:order.status,paymentStatus:order.paymentStatus,tracking:order.tracking,total:order.total}});
};
