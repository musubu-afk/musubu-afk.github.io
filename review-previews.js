(() => {
'use strict';
const I=window.MUSUBU_I18N, X=window.MUSUBU_EXPLORE, C=window.MUSUBU_COMMUNITY;
const $=id=>document.getElementById(id),t=(key,vars)=>I.t(key,vars);
const node=(tag,cls)=>{const n=document.createElement(tag);n.className=cls||'';return n;};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
class ReviewPreview {
 constructor(dialog,before,all){
  this.rows=[];this.dialog=dialog;this.root=node('section','review-preview');
  this.heading=node('h4');this.stats=node('p','review-preview-stats');this.cards=node('div');this.all=node('button','text-button');this.all.type='button';this.all.onclick=all;
  this.root.append(this.heading,this.stats,this.cards,this.all);before.before(this.root);this.labels();
 }
 labels(){this.heading.textContent=t('recentReviews');this.all.textContent=t('allReviews')+' ›';this.set(this.rows);}
 set(rows){this.rows=rows;this.root.hidden=!rows.length;this.stats.textContent=rows.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):'';
  window.MUSUBU_REVIEW_CARDS.list(this.cards,rows.slice(0,5),this.dialog.id==='shopDialog'?'reviews':'place_reviews');
 }
}
const shop=new ReviewPreview($('shopDialog'),$('reviewList'),()=>{$('reviewList').scrollIntoView({block:'start',behavior:motion.matches?'auto':'smooth'});});
const fullHeading=node('h4');fullHeading.dataset.i18n='allReviews';fullHeading.textContent=t('allReviews');$('reviewList').before(fullHeading);
const place=new ReviewPreview($('placeDialog'),$('placeToShops'),()=>{$('communityActions').querySelector('button:last-child').click();});
let placeId=null,version=0,channel=null,statsRows=[],statsVersion=0;
function showPlaceStats(){const groups=new Map();for(const r of statsRows){if(!groups.has(r.place_id))groups.set(r.place_id,[]);groups.get(r.place_id).push(r);}document.querySelectorAll('#placeList [data-place-id]').forEach(b=>{let s=b.querySelector('.place-review-summary');if(!s){s=node('small','place-review-summary');b.firstElementChild.append(s);}const rows=groups.get(b.dataset.placeId)||[];s.textContent=rows.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):t('noStats');});}
async function refreshStats(){const v=++statsVersion;try{const rows=await C.previewReviews(null);if(v!==statsVersion)return;statsRows=rows;showPlaceStats();document.dispatchEvent(new CustomEvent('musubu:preview-stats',{detail:{rows}}));}catch{/* Existing lists stay usable if the stats request fails. */}}
async function refreshPlace(){const id=placeId,v=++version;if(!id)return;try{const rows=await C.previewReviews(id);if(v!==version||id!==placeId)return;place.set(rows);}catch{if(v===version)place.set([]);}}
function stopPlace(){++version;placeId=null;if(channel)X.db.removeChannel(channel);channel=null;}
function openPlace(p){if(placeId===p.id){place.labels();return;}stopPlace();place.set([]);placeId=p.id;refreshPlace();if(X.db)channel=X.db.channel('preview-'+p.id+'-'+crypto.randomUUID()).on('postgres_changes',{event:'*',schema:'public',table:'place_reviews',filter:'place_id=eq.'+p.id},()=>{refreshPlace();refreshStats();}).on('postgres_changes',{event:'*',schema:'public',table:'place_review_edits'},()=>{refreshPlace();refreshStats();}).subscribe(s=>{if(s==='SUBSCRIBED')refreshPlace();});}
document.addEventListener('musubu:shop-reviews',e=>{shop.set(e.detail.rows);shop.stats.hidden=true;});
document.addEventListener('musubu:place-detail',e=>queueMicrotask(()=>{if($('placeDialog').open)openPlace(e.detail.place);}));
$('placeDialog').addEventListener('close',stopPlace);
document.addEventListener('musubu:place-reviews-updated',()=>{refreshPlace();refreshStats();});
document.addEventListener('musubu:places-loaded',refreshStats);
document.addEventListener('musubu:place-list-rendered',showPlaceStats);
document.addEventListener('musubu:languagechange',()=>{shop.labels();place.labels();fullHeading.textContent=t('allReviews');showPlaceStats();if(placeId)refreshPlace();});
document.addEventListener('musubu:regionchange',()=>{stopPlace();shop.set([]);place.set([]);refreshStats();});
document.addEventListener('musubu:screenchange',()=>{for(const c of [shop,place]){if(c.dialog.open)c.dialog.close();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshPlace();refreshStats();}});
refreshStats();
})();
