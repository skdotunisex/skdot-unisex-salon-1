import { json, getOrder, saveOrder, CARRIERS, trackingUrl } from "./_shared.mts";
import { requireAdmin } from "./_admin-shared.mts";
import { notifyAdmin } from "./_notifications.mts";

export default async request => {
  const auth=await requireAdmin(request); if(!auth.ok) return auth.response;
  if(request.method!=="POST") return json({error:"Method not allowed"},405);
  let b; try { b=await request.json(); } catch { return json({error:"Invalid JSON"},400); }
  const o=await getOrder(String(b.id||"").toUpperCase()); if(!o) return json({error:"Order not found."},404);
  const allowed=["Awaiting payment","Order confirmed","Preparing","Shipped","Delivered","Cancelled"];
  if(b.status && !allowed.includes(b.status)) return json({error:"Invalid order status."},400);
  if(b.status) o.status=b.status;
  const carrier=String(b.carrier||"").trim().slice(0,80);
  const tracking=String(b.tracking||"").trim().slice(0,100);
  const customUrl=String(b.customTrackingUrl||"").trim().slice(0,1000);
  if(tracking){
    if(!carrier) return json({error:"Select a shipping carrier before saving a tracking number."},400);
    if(carrier!=="Other / custom" && !CARRIERS[carrier]) return json({error:"Unsupported carrier."},400);
    if(carrier==="Other / custom" && !/^https:\/\//i.test(customUrl)) return json({error:"For a custom carrier, provide its official HTTPS tracking page URL."},400);
    o.shippingCarrier=carrier; o.tracking=tracking; o.trackingUrl=trackingUrl(carrier,tracking,customUrl); o.trackingAssignedAt=o.trackingAssignedAt||new Date().toISOString();
  } else if(b.clearTracking===true){
    o.shippingCarrier=""; o.tracking="Not assigned"; o.trackingUrl=""; o.trackingAssignedAt="";
  }
  if(o.status==="Shipped" || o.status==="Delivered"){
    if(!o.tracking || o.tracking==="Not assigned" || !o.shippingCarrier || !o.trackingUrl) return json({error:"A genuine carrier and tracking number are required before an order can be marked Shipped or Delivered."},400);
    o.shippedAt=o.shippedAt||new Date().toISOString();
  }
  if(o.status==="Delivered") o.deliveredAt=o.deliveredAt||new Date().toISOString();
  await saveOrder(o); await notifyAdmin('order_updated_by_admin',{order_id:o.id,status:o.status,shippingCarrier:o.shippingCarrier||'',tracking:o.tracking||'',paymentStatus:o.paymentStatus||''},request); return json({ok:true,order:o});
};
