import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { json } from './_shared.mts';
import { requireAdmin } from './_admin-shared.mts';
const catalog = () => getStore({name:'skdot-catalog', consistency:'strong'});
const images = () => getStore({name:'skdot-catalog-images', consistency:'strong'});
const clean=(v:any,n:number)=>String(v??'').trim().slice(0,n);
const categories=['grooming','nails','beauty','wigs','equipment'];
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'item';
const validImage=(file:File)=>['image/jpeg','image/png','image/webp','image/avif'].includes(file.type);
export default async (req:Request)=>{
 if(req.method==='GET'){
  const auth=await requireAdmin(req);if(!auth.ok)return auth.response;
  const store=catalog();const [overrides,hidden,gallery]=await Promise.all([
   store.get('product-overrides',{type:'json',consistency:'strong'}),
   store.get('hidden-product-ids',{type:'json',consistency:'strong'}),
   store.get('gallery-items',{type:'json',consistency:'strong'})
  ]);
  return json({ok:true,overrides:overrides||{},hidden:Array.isArray(hidden)?hidden:[],gallery:Array.isArray(gallery)?gallery:[]});
 }
 if(req.method!=='POST')return json({error:'Method not allowed.'},405);
 const auth=await requireAdmin(req);if(!auth.ok)return auth.response;
 const store=catalog();const imgs=images();
 try{
  const ct=req.headers.get('content-type')||'';
  if(ct.includes('multipart/form-data')){
   const form=await req.formData();const file=form.get('image');const kind=clean(form.get('kind'),20);
   if(!(file instanceof File)||!validImage(file))return json({error:'Choose a JPG, PNG, WebP or AVIF image.'},400);
   if(file.size<1||file.size>4*1024*1024)return json({error:'Images must be 4 MB or smaller. Resize large phone photos before uploading.'},413);
   const key=`img-${randomUUID()}`;await imgs.set(key,file,{metadata:{contentType:file.type,originalName:clean(file.name,120),uploadedAt:new Date().toISOString()}});
   if(kind==='gallery'){
    const items=await store.get('gallery-items',{type:'json',consistency:'strong'})||[];
    const item={id:`gallery-${randomUUID().slice(0,12)}`,key,title:clean(form.get('title'),100)||file.name.replace(/\.[^.]+$/,''),alt:clean(form.get('alt'),180)||'SKDOT salon gallery image',created_at:new Date().toISOString()};
    items.unshift(item);await store.setJSON('gallery-items',items.slice(0,200));
    return json({ok:true,item,imageUrl:`/.netlify/functions/catalog-image?key=${encodeURIComponent(key)}`});
   }
   return json({ok:true,key,imageUrl:`/.netlify/functions/catalog-image?key=${encodeURIComponent(key)}`});
  }
  const b:any=await req.json();const action=clean(b.action,30);
  if(action==='save-product'){
   const id=clean(b.id,90);const name=clean(b.name,120);const cat=clean(b.cat,20);const desc=clean(b.desc,700);const imageUrl=clean(b.img,500);const imageKey=clean(b.imageKey,100);
   if(!/^[a-zA-Z0-9_-]{2,90}$/.test(id)||!name||!categories.includes(cat)||!desc||!imageUrl)return json({error:'Product ID, name, category, description and a matching image are required.'},400);
   if(imageUrl && !imageUrl.startsWith('assets/') && !imageUrl.startsWith('/.netlify/functions/catalog-image?key='))return json({error:'Product image must be a site asset or an uploaded SKDOT image.'},400);
   const overrides=await store.get('product-overrides',{type:'json',consistency:'strong'})||{};
   const previous=overrides[id];
   overrides[id]={id,name,cat,desc,img:imageUrl,imageKey,active:b.active!==false,updated_at:new Date().toISOString(),managed:true};
   await store.setJSON('product-overrides',overrides);
   if(previous?.imageKey && previous.imageKey!==imageKey) await imgs.delete(previous.imageKey);
   const hidden=await store.get('hidden-product-ids',{type:'json',consistency:'strong'})||[];await store.setJSON('hidden-product-ids',hidden.filter((x:string)=>x!==id));
   return json({ok:true,product:overrides[id]});
  }
  if(action==='delete-product'){
   const id=clean(b.id,90);if(!id)return json({error:'Product ID is required.'},400);
   const overrides=await store.get('product-overrides',{type:'json',consistency:'strong'})||{};const old=overrides[id];
   if(old?.imageKey)await imgs.delete(old.imageKey);
   delete overrides[id];await store.setJSON('product-overrides',overrides);
   const hidden=await store.get('hidden-product-ids',{type:'json',consistency:'strong'})||[];if(!hidden.includes(id))hidden.push(id);await store.setJSON('hidden-product-ids',hidden);
   return json({ok:true,deleted:id});
  }
  if(action==='hide-product'){
   const id=clean(b.id,90);if(!id)return json({error:'Product ID is required.'},400);
   const hidden=await store.get('hidden-product-ids',{type:'json',consistency:'strong'})||[];const next=b.hidden===false?hidden.filter((x:string)=>x!==id):[...new Set([...hidden,id])];await store.setJSON('hidden-product-ids',next);return json({ok:true,hidden:next});
  }
  if(action==='delete-gallery'){
   const id=clean(b.id,100);const items=await store.get('gallery-items',{type:'json',consistency:'strong'})||[];const item=items.find((x:any)=>x.id===id);if(!item)return json({error:'Gallery image not found.'},404);if(item.key)await imgs.delete(item.key);await store.setJSON('gallery-items',items.filter((x:any)=>x.id!==id));return json({ok:true,deleted:id});
  }
  if(action==='delete-image'){
   const key=clean(b.key,100);if(!/^img-[a-f0-9-]+$/i.test(key))return json({error:'Invalid image key.'},400);
   await imgs.delete(key);return json({ok:true,deleted:key});
  }
  return json({error:'Unknown catalog action.'},400);
 }catch(e){console.error('SKDOT catalog operation failed',e);return json({error:'The change could not be saved. Please retry; existing catalogue data was preserved.'},500)}
};
