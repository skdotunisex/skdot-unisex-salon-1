import { json, getOrder } from "./_shared.mts";
export default async request=>{
  const id=new URL(request.url).searchParams.get("order")?.trim().toUpperCase();
  const order=await getOrder(id);
  if(!order)return json({error:"Order not found."},404);
  return json({ok:true,order:{
    id:order.id,created:order.created,status:order.status,paymentStatus:order.paymentStatus,
    tracking:order.tracking,shippingCarrier:order.shippingCarrier||"",trackingUrl:order.trackingUrl||"",
    shippedAt:order.shippedAt||"",deliveredAt:order.deliveredAt||"",total:order.total,items:order.items,
    customer:{customer_name:order.customer.customer_name,delivery_method:order.customer.delivery_method}
  }});
};
