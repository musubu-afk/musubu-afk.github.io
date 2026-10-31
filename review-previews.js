(() => {
'use strict';
const I=window.MUSUBU_I18N, X=window.MUSUBU_EXPLORE, C=window.MUSUBU_COMMUNITY;
const $=id=>document.getElementById(id),t=(key,vars)=>I.t(key,vars);
const node=(tag,cls)=>{const n=document.createElement(tag);n.className=cls||'';return n;};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
class ReviewPreview {
 constructor(dialog,before,all){
  this.dialog=dialog;this.rows=[];this.index=0;this.timer=null;this.transition=null;this.pauses=new Set();this.userPaused=false;
  this.root=node('section','review-preview');this.root.hidden=true;
  this.heading=node('h4');this.stats=node('p','review-preview-stats');this.card=node('article','review-preview-card');this.card.tabIndex=0;
  this.rating=node('strong');this.text=node('p','review-preview-text');this.date=node('time');this.card.append(this.rating,this.text,this.date);
  this.controls=node('div','review-preview-controls');this.prev=node('button');this.next=node('button');this.pause=node('button');this.dots=node('div','review-preview-dots');
  this.prev.textContent='‹';this.next.textContent='›';[this.prev,this.next,this.pause].forEach(b=>b.type='button');
  this.controls.append(this.prev,this.dots,this.next,this.pause);this.all=node('button','text-button');this.all.type='button';this.all.onclick=all;
  this.root.append(this.heading,this.stats,this.card,this.controls,this.all);before.before(this.root);
  this.prev.onclick=()=>this.move(-1);this.next.onclick=()=>this.move(1);this.pause.onclick=()=>{this.userPaused=!this.userPaused;this.labels();this.schedule();};
  this.root.addEventListener('mouseenter',()=>this.hold('hover',true));this.root.addEventListener('mouseleave',()=>this.hold('hover',false));
  this.root.addEventListener('focusin',()=>this.hold('focus',true));this.root.addEventListener('focusout',e=>{if(!this.root.contains(e.relatedTarget))this.hold('focus',false);});
  this.card.addEventListener('pointerdown',e=>{this.start={x:e.clientX,y:e.clientY};this.hold('touch',true);});
  this.card.addEventListener('pointerup',e=>{if(this.start){const dx=e.clientX-this.start.x,dy=e.clientY-this.start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)this.move(dx<0?1:-1);}this.start=null;this.hold('touch',false);});
  this.card.addEventListener('pointercancel',()=>{this.start=null;this.hold('touch',false);});
  this.card.addEventListener('pointerleave',()=>this.hold('touch',false));
  this.observer=new MutationObserver(()=>{if(!dialog.open){this.stop();this.pauses.clear();}else this.schedule();});this.observer.observe(dialog,{attributes:true,attributeFilter:['open']});
  this.intersection=new IntersectionObserver(entries=>this.hold('offscreen',!entries[0].isIntersecting));this.intersection.observe(this.root);
  dialog.addEventListener('close',()=>{this.stop();this.pauses.clear();});this.labels();
 }
 labels(){this.heading.textContent=t('recentReviews');this.all.textContent=t('allReviews')+' ›';this.prev.setAttribute('aria-label',t('reviewPrevious'));this.next.setAttribute('aria-label',t('reviewNext'));this.pause.textContent=this.userPaused?'▶':'Ⅱ';this.pause.setAttribute('aria-label',t(this.userPaused?'reviewResume':'reviewPause'));this.paint();}
 set(rows){const old=this.rows[this.index]?.id;this.stop();this.rows=rows.slice(0,5);this.index=Math.max(0,this.rows.findIndex(r=>r.id===old));this.root.hidden=!rows.length;this.stats.textContent=rows.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):'';this.paint();this.schedule();}
 paint(){const r=this.rows[this.index];this.controls.hidden=this.rows.length<2;if(!r)return;this.rating.textContent='★'.repeat(Number(r.rating))+' · '+Number(r.rating).toFixed(1);this.text.textContent=r.review_text;this.text.lang=r.language||'';this.date.dateTime=r.created_at;this.date.textContent=new Date(r.created_at).toLocaleDateString(I.locale,{month:'short',day:'numeric'});this.dots.replaceChildren();this.rows.forEach((row,i)=>{const d=node('button','review-preview-dot');d.type='button';d.textContent=i===this.index?'●':'○';d.setAttribute('aria-label',t('reviewPosition',{current:i+1,total:this.rows.length}));d.setAttribute('aria-current',String(i===this.index));d.onclick=()=>this.move(i-this.index);this.dots.append(d);});}
 stop(){clearTimeout(this.timer);clearTimeout(this.transition);this.timer=this.transition=null;this.card.classList.remove('review-leaving','review-entering');}
 hold(reason,on){on?this.pauses.add(reason):this.pauses.delete(reason);this.schedule();}
 schedule(){clearTimeout(this.timer);this.timer=null;if(this.rows.length>1&&this.dialog.open&&!this.root.hidden&&!document.hidden&&!motion.matches&&!this.userPaused&&!this.pauses.size)this.timer=setTimeout(()=>this.move(1),3000);}
 move(delta){this.stop();if(this.rows.length<2)return;const next=(this.index+delta+this.rows.length)%this.rows.length;if(motion.matches){this.index=next;this.paint();this.schedule();return;}this.card.classList.add('review-leaving');this.transition=setTimeout(()=>{this.index=next;this.paint();this.card.classList.remove('review-leaving');this.card.classList.add('review-entering');this.transition=setTimeout(()=>{this.card.classList.remove('review-entering');this.transition=null;this.schedule();},160);},160);}
}
const shop=new ReviewPreview($('shopDialog'),$('reviewList'),()=>{$('reviewList').scrollIntoView({block:'start',behavior:motion.matches?'auto':'smooth'});});
const fullHeading=node('h4');fullHeading.dataset.i18n='allReviews';fullHeading.textContent=t('allReviews');$('reviewList').before(fullHeading);
const place=new ReviewPreview($('placeDialog'),$('placeToShops'),()=>{$('communityActions').querySelector('button:last-child').click();});
let placeId=null,version=0,channel=null,statsRows=[],statsVersion=0;
function showPlaceStats(){const groups=new Map();for(const r of statsRows){if(!groups.has(r.place_id))groups.set(r.place_id,[]);groups.get(r.place_id).push(r);}document.querySelectorAll('#placeList [data-place-id]').forEach(b=>{let s=b.querySelector('.place-review-summary');if(!s){s=node('small','place-review-summary');b.firstElementChild.append(s);}const rows=groups.get(b.dataset.placeId)||[];s.textContent=rows.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):t('noStats');});}
async function refreshStats(){const v=++statsVersion;try{const rows=await C.previewReviews(null);if(v!==statsVersion)return;statsRows=rows;showPlaceStats();document.dispatchEvent(new CustomEvent('musubu:preview-stats',{detail:{rows}}));}catch{/* Existing lists stay usable if the stats request fails. */}}
async function refreshPlace(){const id=placeId,v=++version;if(!id)return;try{const rows=await C.previewReviews(id);if(v!==version||id!==placeId)return;place.set(rows);}catch{if(v===version)place.set([]);}}
function stopPlace(){++version;placeId=null;place.stop();if(channel)X.db.removeChannel(channel);channel=null;}
function openPlace(p){if(placeId===p.id){place.labels();return;}stopPlace();place.set([]);placeId=p.id;refreshPlace();if(X.db)channel=X.db.channel('preview-'+p.id+'-'+crypto.randomUUID()).on('postgres_changes',{event:'*',schema:'public',table:'place_reviews',filter:'place_id=eq.'+p.id},()=>{refreshPlace();refreshStats();}).on('postgres_changes',{event:'*',schema:'public',table:'place_review_edits'},()=>{refreshPlace();refreshStats();}).subscribe(s=>{if(s==='SUBSCRIBED')refreshPlace();});}
document.addEventListener('musubu:shop-reviews',e=>{shop.set(e.detail.rows);shop.stats.hidden=true;});
document.addEventListener('musubu:place-detail',e=>queueMicrotask(()=>{if($('placeDialog').open)openPlace(e.detail.place);}));
$('placeDialog').addEventListener('close',stopPlace);
document.addEventListener('musubu:place-reviews-updated',()=>{refreshPlace();refreshStats();});
document.addEventListener('musubu:places-loaded',refreshStats);
document.addEventListener('musubu:place-list-rendered',showPlaceStats);
document.addEventListener('musubu:languagechange',()=>{shop.labels();place.labels();fullHeading.textContent=t('allReviews');showPlaceStats();if(placeId)refreshPlace();});
document.addEventListener('musubu:regionchange',()=>{stopPlace();shop.set([]);place.set([]);refreshStats();});
document.addEventListener('musubu:screenchange',()=>{for(const c of [shop,place]){c.stop();if(c.dialog.open)c.dialog.close();}});
document.addEventListener('visibilitychange',()=>{for(const c of [shop,place])document.hidden?c.stop():c.schedule();if(!document.hidden){refreshPlace();refreshStats();}});
motion.addEventListener('change',()=>{shop.stop();place.stop();shop.schedule();place.schedule();});
refreshStats();
})();
