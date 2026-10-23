import { getStore } from "@netlify/blobs";

export const PRODUCT_CATALOG = [
  {id:"t9-trimmer",name:"T9 Rechargeable Hair Trimmer",price:9577},
  {id:"press-on-nails",name:"48pc Short Square Press-On Nails",price:3395},
  {id:"clipper",name:"Professional Electric Hair Clipper",price:14699},
];

export const CARRIERS = {
  "GIG Logistics": {trackUrl:"https://giglogistics.com/track-shipment/",shipUrl:"https://giglogistics.com/"},
  "DHL Express": {trackUrl:"https://www.dhl.com/ng-en/home/tracking.html",shipUrl:"https://www.dhl.com/ng-en/home/express.html"},
  "FedEx": {trackUrl:"https://www.fedex.com/en-ng/home.html",shipUrl:"https://www.fedex.com/en-ng/home.html"},
  "UPS": {trackUrl:"https://www.ups.com/ng/en/home",shipUrl:"https://www.ups.com/ng/en/home"},
};
export function trackingUrl(carrier, tracking, customUrl=""){
  const c=String(carrier||"").trim(); const t=encodeURIComponent(String(tracking||"").trim());
  if(!t) return "";
  if(c==="DHL Express") return `https://www.dhl.com/ng-en/home/tracking.html?tracking-id=${t}`;
  if(c==="UPS") return `https://www.ups.com/track?tracknum=${t}`;
  if(c==="FedEx") return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
  if(c==="GIG Logistics") return "https://giglogistics.com/track-shipment/";
  if(c==="Other / custom") return /^https:\/\//i.test(String(customUrl||"")) ? String(customUrl).trim().slice(0,1000) : "";
  return "";
}

export const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), { status, headers:{"Content-Type":"application/json; charset=utf-8", ...extra} });
export const getStoreSafe = () => getStore({name:"skdot-orders", consistency:"strong"});
export function normalizeOrder(input){
  const customer=input?.customer||{}; const items=Array.isArray(input?.items)?input.items:[]; const safeItems=[];
  for(const item of items){ const p=PRODUCT_CATALOG.find(x=>x.id===item.id); const qty=Math.max(1,Math.min(99,Number(item.qty||0))); if(p && Number.isInteger(qty)) safeItems.push({id:p.id,name:p.name,price:p.price,qty}); }
  const total=safeItems.reduce((sum,x)=>sum+x.price*x.qty,0);
  return {customer:{customer_name:String(customer.customer_name||'').trim().slice(0,120),customer_phone:String(customer.customer_phone||'').trim().slice(0,40),customer_email:String(customer.customer_email||'').trim().slice(0,160),delivery_method:String(customer.delivery_method||'Delivery').slice(0,40),address:String(customer.address||'').trim().slice(0,500),note:String(customer.note||'').trim().slice(0,500),shipping_note:String(customer.shipping_note||'').trim().slice(0,300)},items:safeItems,total};
}
export async function getOrder(id){ if(!id)return null; return getStoreSafe().get(`orders/${id}`,{type:"json",consistency:"strong"}); }
export async function getOrderByPaymentReference(reference){
  const ref=String(reference||"").trim();
  if(!ref) return null;
  // Current references embed the immutable order ID: SKDOT-SKD-12345678-xxxxxxxx.
  const match=ref.match(/^SKDOT-(SKD-\d+)-[A-Za-z0-9.-]+$/);
  if(match){
    const order=await getOrder(match[1]);
    if(order && order.paymentReference===ref) return order;
  }
  // Safe fallback for older orders whose Paystack metadata did not include order_id.
  const store=getStoreSafe();
  const {blobs}=await store.list({prefix:"orders/"});
  for(const blob of blobs){
    const order=await store.get(blob.key,{type:"json",consistency:"strong"});
    if(order && order.paymentReference===ref) return order;
  }
  return null;
}
export async function saveOrder(order){ await getStoreSafe().setJSON(`orders/${order.id}`,order); return order; }
