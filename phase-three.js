(() => {
'use strict';
const I=window.MUSUBU_I18N,D=window.MUSUBU_DISCOVERY,X=window.MUSUBU_EXPLORE,M=window.MUSUBU_PHASE_THREE_MODEL,R=window.MUSUBU_REGION,t=(k,v)=>I.t(k,v),$=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text!==undefined)e.textContent=text;return e;};
const button=(key,fn)=>{const b=el('button','p3-button',t(key));b.type='button';b.dataset.i18n=key;b.onclick=fn;return b;};
const localized=(obj,key)=>obj.translations?.[I.lang]?.[key]||obj[key]||'';
const safeUrl=value=>{try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const today=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
const festivalPreview=new URL(location.href).searchParams.get('festival_preview')==='1';
const festivals=()=>M.activeFestivals(window.MUSUBU_FESTIVALS,R.current,today(),festivalPreview);
const banners=()=>{const active=festivals();return active.length?active:[window.MUSUBU_REGION_PROMOS[R.current]];};
class Carousel {
 constructor(root,draw){this.root=root;this.draw=draw;this.pageSize=()=>root.classList.contains('p3-preview')?(matchMedia('(min-width:900px)').matches?3:2):1;this.items=[];this.index=0;this.pauses=new Set();this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.body=el('div','p3-slide');this.controls=el('div','p3-carousel-controls');this.prev=button('p3Previous',()=>this.move(-1));this.next=button('p3Next',()=>this.move(1));this.pause=button('p3Pause',()=>{this.manual=!this.manual;this.update();});this.counter=el('span','p3-counter');this.controls.append(this.prev,this.counter,this.next,this.pause);root.append(this.body,this.controls);
 root.addEventListener('focusin',()=>this.hold('focus',true));root.addEventListener('focusout',()=>queueMicrotask(()=>this.hold('focus',root.contains(document.activeElement))));root.addEventListener('mouseenter',()=>this.hold('hover',true));root.addEventListener('mouseleave',()=>this.hold('hover',false));
 this.body.addEventListener('pointerdown',e=>{this.start={x:e.clientX,y:e.clientY};this.hold('touch',true);});this.body.addEventListener('pointerup',e=>{if(this.start){const dx=e.clientX-this.start.x,dy=e.clientY-this.start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){this.swiped=true;this.move(dx<0?1:-1);}}this.start=null;this.hold('touch',false);});this.body.addEventListener('click',e=>{if(this.swiped){e.preventDefault();e.stopPropagation();this.swiped=false;}},true);['pointercancel','pointerleave'].forEach(k=>this.body.addEventListener(k,()=>{this.start=null;this.hold('touch',false);}));
 new IntersectionObserver(entries=>this.hold('offscreen',!entries[0].isIntersecting)).observe(root);document.addEventListener('visibilitychange',()=>this.update());this.motion.addEventListener('change',()=>this.update());new MutationObserver(()=>this.hold('dialog',!!document.querySelector('dialog[open]'))).observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true});
 }
 hold(key,on){on?this.pauses.add(key):this.pauses.delete(key);this.update();}
 set(items){const id=this.items[this.index]?.id||this.items[this.index]?.shop_id;this.items=items;this.index=Math.max(0,items.findIndex(p=>(p.id||p.shop_id)===id));this.root.hidden=!items.length;this.paint();}
 paint(){this.body.replaceChildren();for(let n=0;n<Math.min(this.pageSize(),this.items.length);n++)this.body.append(this.draw(this.items[(this.index+n)%this.items.length]));this.update();}
 update(){clearTimeout(this.timer);this.controls.hidden=this.items.length<2;this.counter.textContent=t('p3Slide',{current:this.index+1,total:this.items.length});I.apply(this.controls);this.pause.textContent=this.manual?'▶':'Ⅱ';this.pause.setAttribute('aria-label',t(this.manual?'p3Play':'p3Pause'));this.pause.removeAttribute('data-i18n');this.pause.setAttribute('aria-pressed',String(!!this.manual));if(this.items.length>1&&!this.manual&&!this.motion.matches&&!document.hidden&&!this.root.hidden&&!this.pauses.size)this.timer=setTimeout(()=>this.move(1),3000);}
 move(delta){if(this.items.length<2)return;this.index=(this.index+delta+this.items.length)%this.items.length;this.paint();if(!this.motion.matches){this.body.classList.remove('p3-enter');void this.body.offsetWidth;this.body.classList.add('p3-enter');this.body.animate([{transform:'translateX('+ (delta>0?'8%':'-8%') +')',opacity:.4},{transform:'translateX(0)',opacity:1}],{duration:240,easing:'ease-out'});}}
}
class RecommendationCarousel extends Carousel {
 constructor(root,draw){
  super(root,draw);
  this.viewport=el('div','ux-recommend-viewport');this.body.before(this.viewport);this.viewport.append(this.body);
  this.dots=el('div','ux-slide-dots');this.controls.insertBefore(this.dots,this.prev);
  const header=el('div','ux-recommend-heading');root.prepend(header);header.append(root.querySelector('h2'),this.controls);
 }
 paint(){
  this.body.replaceChildren(...this.items.map(this.draw));
  if(this.items.length>1)for(const item of this.items.slice(0,3)){const clone=this.draw(item);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('button,a').forEach(b=>b.tabIndex=-1);this.body.append(clone);}
  this.position(false);this.update();
 }
 position(animate){
  if(!this.viewport)return;
  const cards=[...this.body.children],first=cards[0];if(!first)return;
  const step=first.getBoundingClientRect().width+12;
  const max=Math.max(0,this.body.scrollWidth-this.viewport.clientWidth);
  this.body.style.transition=animate&&!this.motion.matches?'transform 360ms ease':'none';
  this.body.style.transform='translateX(-'+Math.min(this.index*step,max)+'px)';
 }
 update(){
  super.update();if(!this.dots)return;
  this.counter.hidden=true;
  this.prev.removeAttribute('data-i18n');this.next.removeAttribute('data-i18n');this.prev.textContent='‹';this.next.textContent='›';
  this.prev.setAttribute('aria-label',t('p3Previous'));this.next.setAttribute('aria-label',t('p3Next'));
  this.dots.replaceChildren();
  this.items.forEach((item,i)=>{const dot=el('button','ux-slide-dot');dot.type='button';dot.setAttribute('aria-label',t('p3Slide',{current:i+1,total:this.items.length}));dot.setAttribute('aria-current',String(i===this.index));dot.onclick=()=>this.move(i-this.index);this.dots.append(dot);});
 }
 move(delta){if(this.items.length<2)return;this.index=(this.index+delta+this.items.length)%this.items.length;this.position(true);this.update();}
}
let festivalDialog,openedFestival;
function closeFestival(){festivalDialog?.close();openedFestival=null;}
function openFestival(f){
 if(!festivalDialog){festivalDialog=el('dialog','festival-dialog');festivalDialog.setAttribute('aria-labelledby','festivalDialogTitle');document.body.append(festivalDialog);festivalDialog.addEventListener('click',e=>{if(e.target===festivalDialog)closeFestival();});festivalDialog.addEventListener('close',()=>openedFestival=null);}
 openedFestival=f;festivalDialog.replaceChildren();const close=button('festivalClose',closeFestival);close.classList.add('festival-close');const h=el('h2','',localized(f,'name'));h.id='festivalDialogTitle';festivalDialog.append(close,h);
 if(f.demo||festivalPreview)festivalDialog.append(el('p','festival-test-note',t(f.demo?'festivalDemoNote':'festivalPreviewNote')));
 festivalDialog.append(el('p','',festivalDates(f)),el('p','',localized(f,'schedule')),el('p','',localized(f,'location')),el('p','',localized(f,'description')),el('small','',t('festivalOperatorNote')));
 if(!festivalDialog.open)festivalDialog.showModal();
}
function festivalDates(f){return f.start_date&&f.end_date?f.start_date+' ~ '+f.end_date:t('festivalDatePending');}
function festivalCard(f){
 if(f.promo){const card=el('article','ux-promo');const img=el('img');img.src=f.image_url;img.alt='';img.onerror=()=>img.hidden=true;const copy=el('div');copy.append(el('small','',t('uxTravelIntro')),el('h3','',localized(f,'name')),el('p','',localized(f,'description')),button('uxExplore',()=>window.MUSUBU_UI.go('story')));card.append(img,copy);return card;}
 const card=el('article','p3-festival-card');card.dataset.festivalId=f.id;
 const surface=el('div','festival-surface');
 if(f.image_url&&safeUrl(f.image_url)){const im=el('img','festival-art');im.src=f.image_url;im.alt='';im.onerror=()=>im.hidden=true;surface.append(im);}
 const copy=el('div','festival-copy');copy.append(el('small','festival-kicker',t(f.demo?'festivalDemoLabel':festivalPreview?'festivalPreviewLabel':'p3Festival')),el('h3','',localized(f,'name')),el('p','festival-dates',festivalDates(f)));
 if(f.schedule)copy.append(el('p','festival-schedule',localized(f,'schedule')));
 copy.append(el('p','festival-description',localized(f,'description')));
 const url=f.url?safeUrl(f.url):null,cta=el(url?'a':'button','festival-cta',(localized(f,'button_text')||t('p3FestivalDetail'))+' ›');
 if(url){cta.href=url;cta.target='_blank';cta.rel='noopener noreferrer';}else{cta.type='button';cta.onclick=()=>openFestival(f);}
 if(f.start_date>today()&&!f.demo)copy.prepend(el('small','ux-upcoming',t('uxUpcoming')));copy.append(cta);if(f.image_reference)copy.append(el('small','festival-image-note',t('festivalImageNote')));surface.append(copy);card.append(surface);return card;
}
document.addEventListener('musubu:languagechange',()=>{if(openedFestival)openFestival(openedFestival);});
document.addEventListener('musubu:regionchange',closeFestival);
let search,searchRegion,resultBox,resultTitle,resultCards,preview,festival,searchRoot,previewRoot,festivalRoot;
function textFor(p){const v=p.shop_id?I.shopView(p):X.view(p),key=({history:'phaseHistory',nature:'phaseNature',walk:'phaseWalk',local:'phaseExperience',meal:'phaseMeal',dessert:'phaseDessert',gift:'phaseGift',stay:'phaseStay'})[D.group(p)];const categoryWords=['ko','ja','en'].flatMap(l=>[window.MUSUBU_LOCALES[l]?.[key],window.MUSUBU_LOCALES[l]?.['mapCategory_'+p.category]]);return [p.name,v.name,window.MUSUBU_SHOP_NAMES_JA?.[p.shop_id],...Object.values(p.translations||{}).map(v=>v.name),...Object.values(window.MUSUBU_CONTENT_LOCALES?.[p.name]||{}).map(v=>v.name),p.region,window.MUSUBU_MAP_CONFIG.regions[p.region]?.name_ko,window.MUSUBU_MAP_CONFIG.regions[p.region]?.name_ja,...categoryWords].join(' ');}
function openResult(p){if(p.region!==R.current)R.setRegion(p.region);D.open(p);}
function searchRender(){if(!search)return;document.querySelector('.p3-search-clear').hidden=!search.value;resultBox.hidden=!search.value.trim();if(resultBox.hidden)return;const list=D.allPlaces().filter(p=>p.region===R.current),found=M.search(list,search.value,textFor);resultCards.replaceChildren();for(const p of found){const card=D.createCard(p);card.querySelector('.discovery-open').onclick=()=>openResult(p);resultCards.append(card);}const fs=festivals();const matches=M.search(fs,search.value,f=>[f.name,localized(f,'name'),f.region,...Object.values(f.translations||{}).map(v=>v.name),window.MUSUBU_MAP_CONFIG.regions[f.region]?.name_ko,window.MUSUBU_MAP_CONFIG.regions[f.region]?.name_ja].join(' '));matches.forEach(f=>resultCards.append(festivalCard(f)));resultTitle.textContent=t('p3Results',{count:found.length+matches.length});if(!found.length&&!matches.length)resultCards.append(el('p','notice',t('discoverEmpty')));}
function update(){if(!search)return;I.apply(searchRoot);search.placeholder=t('p3SearchHint');search.setAttribute('aria-label',t('p3Search'));searchRegion.setAttribute('aria-label',t('p3SearchRegion'));[...searchRegion.options].forEach(o=>o.textContent=o.value==='all'?t('p3AllRegions'):(I.lang==='ja'?window.MUSUBU_MAP_CONFIG.regions[o.value].name_ja:window.MUSUBU_MAP_CONFIG.regions[o.value].name_ko));const view=document.body.dataset.browseView||'home';previewRoot.querySelector('h2').textContent=t(view==='discover'?'uxRecommendShops':'uxRecommend');preview.set(D.ranked(view==='discover').slice(0,6));if(view==='home')document.querySelector('.phase-navigation').after(previewRoot);else document.querySelector('footer').before(previewRoot);previewRoot.hidden=['coupon','review'].includes(view)||X.picking;previewRoot.querySelector('.ux-recommend-empty').hidden=preview.items.length>0;previewRoot.querySelector('.ux-recommend-empty').textContent=t('uxRecommendEmpty');festival.set(banners());searchRender();}
document.addEventListener('DOMContentLoaded',()=>{
 const nav=document.querySelector('.phase-navigation');searchRoot=el('section','p3-search');searchRoot.setAttribute('role','search');const row=el('div','p3-search-row');search=el('input');search.type='search';search.maxLength=120;searchRegion=el('select');for(const value of [R.current,...Object.keys(window.MUSUBU_MAP_CONFIG.regions).filter(k=>k!==R.current),'all']){const option=el('option');option.value=value;searchRegion.append(option);}const clear=button('p3Clear',()=>{search.value='';searchRender();search.focus();});clear.classList.add('p3-search-clear');clear.hidden=true;row.append(search,clear);resultBox=el('section','p3-results');resultBox.hidden=true;resultTitle=el('h2');resultTitle.setAttribute('role','status');resultCards=el('div','discovery-cards');resultBox.append(resultTitle,resultCards);searchRoot.append(row,resultBox);nav.before(searchRoot);
 festivalRoot=el('section','p3-festival');festivalRoot.hidden=true;searchRoot.after(festivalRoot);festival=new Carousel(festivalRoot,festivalCard);
 previewRoot=el('section','p3-preview');previewRoot.append(el('h2'));nav.after(previewRoot);preview=new RecommendationCarousel(previewRoot,p=>{const card=D.createCard(p,false,{favorite:false});card.classList.add('ux-recommend-card');return card;});const empty=el('p','notice ux-recommend-empty');empty.dataset.i18n='uxRecommendEmpty';previewRoot.append(empty);
 search.addEventListener('input',searchRender);searchRegion.onchange=searchRender;window.addEventListener('resize',()=>preview.paint());
 const suggest=button('p3Suggest',()=>{$('registerPlaces').click();$('storyMap').scrollIntoView({block:'center'});});suggest.id='p3Suggest';$('discovery').append(suggest);
 for(const category of M.businessCategories){const option=el('option');option.value=category;option.dataset.i18n='mapCategory_'+category;$('placeCategory').append(option);}const help=el('p','notice');help.dataset.i18n='p3SuggestNote';$('placeCategory').after(help);I.apply($('recommendForm'));
 const sourceUpdate=()=>{suggest.hidden=D.source!=='shops';};document.addEventListener('musubu:discovery-source',sourceUpdate);sourceUpdate();update();
});
for(const event of ['musubu:discovery-rendered','musubu:languagechange','musubu:locationchange','musubu:browse-view'])document.addEventListener(event,update);
document.addEventListener('musubu:regionchange',()=>{if(searchRegion)searchRegion.value=R.current;update();});
document.addEventListener('musubu:picking',e=>{if(previewRoot)previewRoot.hidden=e.detail.picking||!preview.items.length;});
// Course map is scoped to an existing attraction detail; no invented geometry.
let routeMap,routeSection;
function renderRoute(p){routeMap?.remove();routeMap=null;routeSection?.remove();routeSection=null;const config=window.MUSUBU_ROUTES[p.id]||window.MUSUBU_ROUTES[p.story_key]||{},points=M.routePoints(p.route_points||config.points);if(!points||M.business(p))return;
 routeSection=el('section','p3-route');const heading=el('h3','',localized(config,'name')||t('p3Route')),canvas=el('div','p3-route-map');canvas.setAttribute('role','region');canvas.setAttribute('aria-label',heading.textContent);routeSection.append(heading,canvas);const info=el('dl','p3-route-info');for(const [key,value] of [['p3Distance',p.distance_m||config.distance_m],['p3Duration',p.duration_minutes||config.duration_minutes],['p3Difficulty',config.difficulty]]){if(!value)continue;const group=el('div');group.append(el('dt','',t(key)),el('dd','',key==='p3Distance'?(Number(value)/1000).toFixed(1)+' km':key==='p3Duration'?t('p3Minutes',{minutes:value}):t({easy:'p3Easy',moderate:'p3Moderate',hard:'p3Hard'}[value]||'p3Difficulty')));info.append(group);}routeSection.append(info);if(config.source_url&&safeUrl(config.source_url)){const a=el('a','',t('p3Source'));a.href=safeUrl(config.source_url);a.target='_blank';a.rel='noopener noreferrer';routeSection.append(a);}$('placeDialog').querySelector('.p2-detail').append(routeSection);
 requestAnimationFrame(()=>{if(!routeSection?.isConnected||!window.L)return;routeMap=L.map(canvas,{scrollWheelZoom:false});const C=window.MUSUBU_MAP_CONFIG;L.tileLayer(C.tileUrl,{attribution:C.attribution,maxZoom:C.maxZoom}).addTo(routeMap);const line=L.polyline(points,{color:'#1c7155',weight:5}).addTo(routeMap);for(const [i,point] of points.entries()){if(i!==0&&i!==points.length-1)continue;L.circleMarker(point,{radius:7,color:i===0?'#1c7155':'#b87925',fillOpacity:1}).bindTooltip(t(i===0?'p3Start':'p3End')).addTo(routeMap);}for(const [i,w] of (config.waypoints||[]).entries()){if(M.routePoints([w.point,w.point]))L.circleMarker(w.point,{radius:5,color:'#527cba'}).bindTooltip(localized(w,'name')||t('p3Waypoint',{number:i+1})).addTo(routeMap);}routeMap.fitBounds(line.getBounds(),{padding:[18,18]});});
}
document.addEventListener('musubu:place-detail',e=>queueMicrotask(()=>renderRoute(e.detail.place)));
$('placeDialog').addEventListener('close',()=>{routeMap?.remove();routeMap=null;routeSection?.remove();routeSection=null;});
})();
