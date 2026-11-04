(function(root){
'use strict';
const valid=p=>p.latitude!=null&&p.longitude!=null&&String(p.latitude).trim()!==''&&String(p.longitude).trim()!==''&&Number.isFinite(Number(p.latitude))&&Number.isFinite(Number(p.longitude))&&Math.abs(Number(p.latitude))<=90&&Math.abs(Number(p.longitude))<=180;
const key=p=>(p.shop_id?'shop:':'place:')+(p.shop_id||p.id);
function groups(places,zoom,project,selectedKey){
 const bins=new Map(),out=[];
 for(const p of places.filter(valid)){
  if(zoom>=13||key(p)===selectedKey){out.push({id:key(p),places:[p]});continue;}
  const q=project(p),id=Math.floor(q.x/60)+':'+Math.floor(q.y/60);
  if(!bins.has(id))bins.set(id,[]);bins.get(id).push(p);
 }
 for(const [id,rows] of bins)out.push({id:rows.length===1?key(rows[0]):'cluster:'+id,places:rows});
 return out;
}
function image(p,storyImage){const value=p.image_url||p.photo_url||(p.kind==='official'&&p.story_key?storyImage:'');return typeof value==='string'&&/^(https?:\/\/|assets\/)/.test(value)?value:'';}
const api={valid,key,groups,image};root.MUSUBU_MAP_UI_MODEL=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
