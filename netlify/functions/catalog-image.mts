import { getStore } from '@netlify/blobs';
export default async (req:Request)=>{
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const key=new URL(req.url).searchParams.get('key')||'';if(!/^img-[a-f0-9-]+$/i.test(key))return new Response('Not found',{status:404});
 try{const store=getStore({name:'skdot-catalog-images',consistency:'strong'});const result=await store.getWithMetadata(key,{type:'arrayBuffer',consistency:'strong'});if(!result||!result.data)return new Response('Not found',{status:404});const type=String(result.metadata?.contentType||'image/jpeg');if(!['image/jpeg','image/png','image/webp','image/avif'].includes(type))return new Response('Unsupported image type',{status:415});return new Response(result.data,{status:200,headers:{'Content-Type':type,'Cache-Control':'public, max-age=60, stale-while-revalidate=300','X-Content-Type-Options':'nosniff'}})}catch(e){console.error('catalog image read failed',e);return new Response('Image temporarily unavailable',{status:503})}
};
