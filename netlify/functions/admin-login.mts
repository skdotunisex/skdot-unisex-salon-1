import { json } from "./_shared.mts";
import { makeSession } from "./_admin-shared.mts";

export default async request => {
  if (request.method !== "POST") return json({error:"Method not allowed"},405);
  const pin=Netlify.env.get("ADMIN_PIN"), secret=Netlify.env.get("ADMIN_SESSION_SECRET");
  if (!pin || !secret) return json({error:"Admin PIN security variables are not configured."},500);
  if (!/^\d{5}$/.test(pin)) return json({error:"ADMIN_PIN must be exactly 5 digits."},500);
  let b; try { b=await request.json(); } catch { return json({error:"Invalid JSON"},400); }
  const supplied=String(b.pin||"").trim();
  if (!/^\d{5}$/.test(supplied) || supplied!==pin) return json({error:"Incorrect admin PIN."},401);
  const token=await makeSession(secret);
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","Set-Cookie":`skdot_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}});
};
