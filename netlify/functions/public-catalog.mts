import { getStore } from '@netlify/blobs';
import { json } from './_shared.mts';
export default async (req:Request)=>{
 if(req.method!=='GET')return json({error:'Method not allowed.'},405);
 try{const s=getStore({name:'skdot-catalog',consistency:'strong'});const [overrides,hidden,gallery]=await Promise.all([s.get('product-overrides',{type:'json',consistency:'strong'}),s.get('hidden-product-ids',{type:'json',consistency:'strong'}),s.get('gallery-items',{type:'json',consistency:'strong'})]);return json({ok:true,overrides:overrides||{},hidden:Array.isArray(hidden)?hidden:[],gallery:Array.isArray(gallery)?gallery.map((x:any)=>({...x,imageUrl:`/.netlify/functions/catalog-image?key=${encodeURIComponent(x.key)}`})):[]},200,{'Cache-Control':'no-store'})}catch(e){console.error('public catalogue read failed',e);return json({ok:false,error:'Catalogue updates are temporarily unavailable.'},503,{'Cache-Control':'no-store'})}
};
