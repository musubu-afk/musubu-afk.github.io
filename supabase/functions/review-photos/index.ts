import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
import jpeg from 'npm:jpeg-js@0.4.4';

const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const bucket=db.storage.from('review-photos');
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-musubu-visitor'};
const reply=(status:number,data:unknown)=>Response.json(data,{status,headers:cors});
const limit=1048576;
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 // This public, anonymous site uses Supabase's publishable key, not a user JWT.
 if(req.headers.get('apikey')!=='sb_publishable_x08dJFDQ_zuP0IKJ83jFYg_1so-HCCN')return reply(401,{error:'key'});
 if(req.method!=='POST')return reply(405,{error:'method'});
 try{
  if(new URL(req.url).searchParams.has('cleanup')){
   const batch=await db.rpc('expired_review_photos');
   if(batch.error)throw batch.error;
   const paths=batch.data.map((r:{path:string})=>r.path);
   if(paths.length){
    const removed=await bucket.remove(paths);
    if(removed.error)throw removed.error;
    const result=await db.from('review_photo_uploads').delete().in('path',paths).eq('claimed',true).lte('expires_at',new Date().toISOString());
    if(result.error)throw result.error;
   }
   return reply(200,{removed:paths.length});
  }
  const visitor=req.headers.get('x-musubu-visitor')||'';
  if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(visitor))return reply(400,{error:'visitor'});
  if(req.headers.get('content-type')?.split(';')[0]!=='image/jpeg')return reply(415,{error:'format'});
  const reader=req.body?.getReader();
  if(!reader)return reply(400,{error:'empty'});
  const bytes=new Uint8Array(limit);let length=0;
  for(;;){const {value,done}=await reader.read();if(done)break;if(length+value.length>limit){await reader.cancel();return reply(413,{error:'size'});}bytes.set(value,length);length+=value.length;}
  let clean:Uint8Array;
  try{
   const decoded=jpeg.decode(bytes.subarray(0,length),{useTArray:true,maxResolutionInMP:2.56,maxMemoryUsageInMB:96,tolerantDecoding:false});
   if(Math.max(decoded.width,decoded.height)>1600)return reply(413,{error:'dimensions'});
   clean=jpeg.encode({width:decoded.width,height:decoded.height,data:decoded.data},82).data;
   if(clean.byteLength>limit)return reply(413,{error:'size'});
  }catch{return reply(415,{error:'format'});}
  const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(visitor)));
  const owner=Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
  const path=crypto.randomUUID()+'.jpg';
  const entry=await db.from('review_photo_uploads').insert({path,visitor_hash:owner});
  if(entry.error)throw entry.error;
  const upload=await bucket.upload(path,clean,{contentType:'image/jpeg',upsert:false});
  if(upload.error)throw upload.error;
  return reply(201,{path});
 }catch{return reply(503,{error:'retry'});}
});
