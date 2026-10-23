import crypto from "node:crypto";
import { json } from "./_shared.mts";
const b64=s=>Buffer.from(s).toString("base64url");const unb64=s=>Buffer.from(s,"base64url").toString();
async function hmac(value,secret){return crypto.createHmac("sha256",secret).update(value).digest("base64url");}
export async function makeSession(secret){const exp=Math.floor(Date.now()/1000)+8*60*60;const body=b64(JSON.stringify({exp}));return body+"."+await hmac(body,secret);}
export async function validSession(token,secret){try{const [body,sig]=String(token||"").split(".");if(!body||!sig)return false;const expected=await hmac(body,secret);if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return false;return JSON.parse(unb64(body)).exp>Date.now()/1000;}catch{return false;}}
export function cookieToken(request){const c=request.headers.get("cookie")||"";const m=c.match(/(?:^|;\s*)skdot_admin=([^;]+)/);return m?decodeURIComponent(m[1]):"";}
export async function requireAdmin(request){const secret=Netlify.env.get("ADMIN_SESSION_SECRET");if(!secret)return {ok:false,response:json({error:"ADMIN_SESSION_SECRET is not configured."},500)};const ok=await validSession(cookieToken(request),secret);if(!ok)return {ok:false,response:json({error:"Admin login required."},401)};return {ok:true};}
