(function(root){
'use strict';
const businessCategories=['meal','dessert','gift','stay'];
const business=p=>Boolean(p.shop_id)||businessCategories.includes(p.category);
const publicPlace=p=>p.status==='approved';
const userPlace=p=>!p.shop_id&&p.kind==='resident'&&!p.is_example&&publicPlace(p);
const origin=p=>p.shop_id?(p.registration_source==='user'?'p3UserBusiness':'p3Operator'):p.kind==='official'?'p3Official':business(p)?'p3UserBusiness':'p3User';
const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
function search(list,query,text){const terms=normalize(query).split(' ').filter(Boolean);return terms.length?list.filter(p=>terms.every(q=>normalize(text(p)).includes(q))):[];}
function popular(list,metrics){return list.filter(p=>!p.is_example).slice().sort((a,b)=>{const x=metrics(a),y=metrics(b);return y.count-x.count||y.rating-x.rating||String(a.name).localeCompare(String(b.name));});}
function newest(list){return list.filter(userPlace).slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||String(a.id).localeCompare(String(b.id)));}
function activeFestivals(list,region,today,preview=false){return list.filter(f=>{
 const enabled=f.enabled===undefined?f.published===true:f.enabled===true;
 if(f.region!==region||!enabled)return false;
 if(preview)return true;
 if(f.demo)return false;
 const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
 return valid(f.start_date)&&valid(f.end_date)&&f.start_date<=today&&today<=f.end_date;
});}
function routePoints(raw){if(!Array.isArray(raw)||raw.length<2)return null;return raw.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=85&&Math.abs(p[1])<=180)?raw:null;}
const api={businessCategories,business,publicPlace,userPlace,origin,normalize,search,popular,newest,activeFestivals,routePoints};root.MUSUBU_PHASE_THREE_MODEL=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
