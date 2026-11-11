(() => {
'use strict';
const I=window.MUSUBU_I18N,X=window.MUSUBU_EXPLORE,C=window.MUSUBU_COMMUNITY,A=window.MUSUBU_SHOP_APP,$=id=>document.getElementById(id),t=(k,v)=>I.t(k,v);
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const region=()=>window.MUSUBU_REGION.current;
const M=window.MUSUBU_PHASE_THREE_MODEL;
let mapMode=false,source='places',recommendation='popular';
let filter='all',reviewStats=new Map(),shopSaved=new Set(),shopRows=new Set(),saving=false,shopLoaded=false;
const visitorHash=crypto.subtle.digest('SHA-256',new TextEncoder().encode(X.visitor)).then(b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''));
// Preserve the original controls and their event handlers; only move their parent.
const top=document.querySelector('.hero-top'),controls=el('div','discovery-controls');
controls.append(document.querySelector('.region-switch'),top.querySelector('.language-switch'));top.append(controls);
const shortcut=el('button','discovery-shortcut');shortcut.type='button';document.querySelector('.qrbtn').after(shortcut);
const section=el('section','discovery');section.id='discovery';const head=el('div','discovery-heading'),title=el('h2'),mapButton=el('button','text-button');mapButton.type='button';head.append(title,mapButton);
const note=el('p','notice'),filters=el('div','discovery-filters'),cards=el('div','discovery-cards'),message=el('p','notice');message.setAttribute('role','status');const tabs=el('div','discovery-filters p3-tabs');section.append(head,note,tabs,filters,cards,message);
document.querySelector('.explore-tabs').after(section);
const mapPane=el('section','discovery-map-pane');mapPane.hidden=true;mapPane.id='discoveryMapPane';section.before(mapPane);[...$('explorer').children].filter(n=>n!==mapPane&&n!==section&&!n.matches('.explore-heading,.explore-tabs')).forEach(n=>mapPane.append(n));
const mapBack=el('button','community-button');mapBack.type='button';mapBack.id='mapBrowseBack';mapPane.prepend(mapBack);
function setMapMode(on){mapMode=on;mapPane.hidden=!on;section.hidden=on;if(on)requestAnimationFrame(()=>X.map?.invalidateSize());document.dispatchEvent(new CustomEvent('musubu:map-mode',{detail:{on}}));}
mapBack.onclick=()=>{$('browsePlaces').click();setMapMode(false);section.scrollIntoView({block:'start'});};
const mapFilters=el('div','discovery-filters map-category-filters');$('storyMap').parentElement.before(mapFilters);
const placeCategories=[['all','discoverAll'],['history','phaseHistory'],['nature','phaseNature'],['walk','phaseWalk'],['local','phaseExperience']];
const shopCategories=[['all','discoverAll'],['meal','phaseMeal'],['dessert','phaseDessert'],['gift','phaseGift'],['stay','phaseStay']];
const listCategories=()=>source==='shops'?shopCategories:placeCategories;
const categories=[['all','discoverAll'],['history','discoverHistory'],['nature','discoverNature'],['walk','discoverWalk'],['local','mapCategory_local'],['meal','category_meal'],['dessert','category_dessert'],['gift','category_gift'],['stay','category_stay'],['saved','discoverSaved']];
function group(p){if(M.business(p))return p.category;if(p.story_key==='donam')return 'history';if(['walk','photo'].includes(p.category))return 'walk';return ['scenery','rest'].includes(p.category)?'nature':'local';}
function matches(p){if(source!=='shops'&&M.business(p))return false;if(source==='new'&&!M.userPlace(p))return false;if(source==='shops'&&!M.business(p))return false;if(source==='shops'&&recommendation==='business'&&!M.business(p))return false;if(source==='shops'&&recommendation==='new'&&!M.userPlace(p))return false;return filter==='all'||(filter==='saved'?(p.shop_id?shopSaved.has(p.shop_id):C.isFavorite(p.id)):group(p)===filter);}
function distance(p){if(window.MUSUBU_LOCATION)return window.MUSUBU_LOCATION.label(p);const r=window.MUSUBU_MAP_CONFIG.regions[region()],rad=x=>x*Math.PI/180;const a=Math.sin(rad(p.latitude-r.latitude)/2)**2+Math.cos(rad(r.latitude))*Math.cos(rad(p.latitude))*Math.sin(rad(p.longitude-r.longitude)/2)**2;return t(p.shop_id?'discoverDemoDistance':'discoverOrigin',{km:(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1)});}
function image(p){return p.shop_id?p.image_url:p.image_url||document.querySelector('#story-'+p.story_key+' .story-photo')?.getAttribute('src') || null;}
function open(p){if(p.shop_id)A.openShop(p);else {X.choose(p);X.openDetail();}}
function favorite(p){return p.shop_id?shopSaved.has(p.shop_id):C.isFavorite(p.id);}
async function toggle(p,b){if(saving)return;saving=true;b.disabled=true;message.textContent='';try{
 if(p.shop_id){const id=p.shop_id,h=await visitorHash,next=!shopSaved.has(id);const {error}=shopRows.has(id)?await X.db.from('shop_likes').update({liked:next}).eq('shop_id',id).eq('visitor_hash',h):await X.db.from('shop_likes').insert({shop_id:id,liked:true});if(error)throw error;await loadShopFavorites();}
 else if(!await C.toggleFavorite(p.id))throw Error('save');
 }catch{message.textContent=t('mapSaveError');}finally{saving=false;renderCards();X.setFilter(matches);}}
async function loadShopFavorites(){try{const {data,error}=await X.db.from('shop_likes').select('shop_id,liked').eq('visitor_hash',await visitorHash);if(error)throw error;shopRows=new Set(data.map(r=>r.shop_id));shopSaved=new Set(data.filter(r=>r.liked).map(r=>r.shop_id));shopLoaded=true;renderCards();if(filter==='saved')X.setFilter(matches);}catch{message.textContent=t('discoverError');}}
function summary(p){if(p.shop_id)return A.summary(p.shop_id);const rows=reviewStats.get(p.id);return rows?.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):t(reviewStats.loaded?'noStats':'statsLoading');}
function metrics(p){if(p.shop_id){const nums=A.summary(p.shop_id).match(/\d+(?:\.\d+)?/g);return {count:nums?.length>=2?Number(nums[1]):0,rating:nums?.length>=2?Number(nums[0]):0};}const rows=reviewStats.get(p.id)||[];return {count:rows.length,rating:rows.length?rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length:0};}
function allPlaces(){return [...X.places.filter(M.publicPlace),...window.MUSUBU_SHOPS];}
function ranked(shops=false){return M.recommendations(allPlaces(),region(),shops,metrics);}
function createCard(p,showNew=source==='new',options={}){
const v=p.shop_id?I.shopView(p):X.view(p),card=el('article','discovery-card'),button=el('button','discovery-open');button.type='button';button.onclick=()=>open(p);
 const src=image(p);if(src){const img=el('img');img.src=src;img.alt=v.name;img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src=p.image_fallback||'assets/shop-placeholder.svg';};button.append(img);}else button.append(el('span','discovery-no-photo',t('discoverNoPhoto')));
 const U=window.MUSUBU_PHASE_ONE;

 const text=el('span','discovery-copy'),cat=el('small','phase-card-category');cat.append(el('span','phase-category-chip',t([...placeCategories,...shopCategories].find(([id])=>id===group(p))?.[1]||'mapCategory_local')));
 if(p.shop_id||M.business(p)||M.userPlace(p))cat.append(el('span','phase-origin',t(M.origin(p))));
 if(p.is_demo||p.is_example)cat.append(el('span','phase-demo',t(p.is_demo?'phaseDemoShop':'phaseDemo')));
 const meta=el('span','phase-card-meta'),rawDistance=distance(p),dist=el('small','phase-distance');dist.title=rawDistance;dist.setAttribute('aria-label',rawDistance);dist.append(U.icon('pin'),document.createTextNode(U.distance(rawDistance)));
 const stat=el('span','discovery-summary',U.stats(summary(p)));stat.title=summary(p);meta.append(stat,dist);text.append(el('strong','',v.name),cat,meta);
 if(showNew&&M.userPlace(p)){if(M.isNew(p))cat.prepend(el('span','ux-new-badge',t('uxNewBadge')));const ms=M.publicDate(p);if(ms!==null){const date=new Date(ms),time=el('time','ux-date',date.toLocaleDateString(I.locale));time.dateTime=date.toISOString();text.append(time);}else text.append(el('small','ux-date',t('uxDateUnknown')));}button.append(text);
 const heart=el('button','discovery-heart ux-bookmark');heart.append(U.icon('bookmark'));heart.type='button';heart.setAttribute('aria-label',v.name+' · '+t(favorite(p)?'favoriteSaved':'favoriteAdd'));heart.setAttribute('aria-pressed',String(favorite(p)));heart.disabled=saving||(!!p.shop_id&&!shopLoaded);heart.onclick=()=>toggle(p,heart);card.append(button);if(options.favorite!==false)card.append(heart);return card;
}
function renderCards(){cards.replaceChildren();let list;
 if(source==='new'){list=M.newest(X.places.filter(p=>p.region===region()&&!M.business(p)&&!M.testPlace(p)));}
 else if(source==='places')list=X.places.filter(p=>M.publicPlace(p)&&p.region===region()).sort((a,b)=>X.count(b.id)-X.count(a.id));
 else if(recommendation==='popular')list=ranked();
 else if(recommendation==='new')list=M.newest(X.places.filter(p=>p.region===region()));
 else list=allPlaces().filter(p=>p.region===region()&&M.business(p));
 list=list.filter(matches);list.forEach(p=>cards.append(createCard(p)));
 if(!list.length)cards.append(el('p','notice',t('discoverEmpty')));
 document.dispatchEvent(new Event('musubu:discovery-rendered'));
}
let shopMarkers=X.map&&L.layerGroup().addTo(X.map);
function renderMapShops(){document.querySelector('.map-list').hidden=true;if(!shopMarkers)return;shopMarkers.clearLayers();if(window.MUSUBU_MAP_EXPLORER)return;if($('registerPlaces').getAttribute('aria-pressed')==='true')return;
 window.MUSUBU_SHOPS.filter(p=>p.region===region()&&matches(p)).forEach(p=>{const v=I.shopView(p),icon=L.divIcon({className:'map-pin nearby-map-pin',html:'<span><b>'+({meal:'🍚',dessert:'☕',gift:'🎁',stay:'🛏️'}[p.category])+'</b></span>',iconSize:[36,36],iconAnchor:[18,36]});const m=L.marker([p.latitude,p.longitude],{icon,title:v.name+' · '+t('demo'),alt:v.name});
 const content=el('div','discovery-popup');content.append(el('strong','',v.name),el('p','',summary(p)),el('small','',t('demo')));const b=el('button','community-button',t('mapDetails'));b.type='button';b.onclick=()=>{X.map.closePopup();open(p);};content.append(b);m.bindPopup(content).addTo(shopMarkers);});
}
function drawFilters(){tabs.hidden=true;tabs.replaceChildren();filters.hidden=source==='new';for(const root of [filters,mapFilters]){root.replaceChildren();root.setAttribute('role','group');root.setAttribute('aria-label',t('mapCategory'));for(const [id,key]of (root===filters?listCategories():[...listCategories(),['saved','discoverSaved']])){const b=el('button','',t(key));b.type='button';b.setAttribute('aria-pressed',String(filter===id));if(id==='saved'){b.textContent=b.textContent.replace(/[♡♥]/g,'').trim();b.prepend(window.MUSUBU_PHASE_ONE.icon('bookmark'));}b.onclick=()=>{filter=id;drawFilters();X.setFilter(matches);renderCards();$('mapPreview').hidden=true;};root.append(b);}}}
function labels(){const titleKey=source==='new'?'uxNew':source==='places'?'phaseStoryTitle':'uxShops';title.textContent=t(titleKey);shortcut.textContent=t('discoverNav');mapButton.textContent=t('phaseMapView');mapBack.textContent='‹ '+t(titleKey);note.textContent=t(source==='places'?'phaseStoryNote':recommendation==='popular'?'p3PopularNote':recommendation==='new'?'p3NewNote':'p3BusinessNote');$('browsePlaces').dataset.i18n=source==='places'?'phaseStoryBrowse':'discoverTitle';$('browsePlaces').textContent=t($('browsePlaces').dataset.i18n);drawFilters();renderCards();renderMapShops();}
shortcut.onclick=()=>{selectSource('shops');$('browsePlaces').click();window.MUSUBU_SCREENS.go('story');requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));};
mapButton.onclick=()=>{setMapMode(true);mapPane.scrollIntoView({block:'start'});};
document.addEventListener('musubu:place-list-rendered',()=>{renderMapShops();if(!document.querySelector('#placeList button')){const p=$('placeList').querySelector('p');if(p)p.textContent=t('discoverEmpty');}});
document.addEventListener('musubu:places-loaded',()=>{renderCards();renderMapShops();});
document.addEventListener('musubu:favorites',()=>{renderCards();if(filter==='saved')X.setFilter(matches);});
document.addEventListener('musubu:preview-stats',e=>{reviewStats=new Map();for(const r of e.detail.rows){if(!reviewStats.has(r.place_id))reviewStats.set(r.place_id,[]);reviewStats.get(r.place_id).push(r);}reviewStats.loaded=true;renderCards();});
document.addEventListener('musubu:shop-stats',()=>{renderCards();renderMapShops();});
document.addEventListener('musubu:languagechange',labels);
document.addEventListener('musubu:regionchange',()=>{filter='all';X.setFilter(matches);labels();});
document.addEventListener('musubu:picking',e=>{setMapMode(e.detail.picking);mapFilters.hidden=e.detail.picking;renderMapShops();});
document.addEventListener('musubu:locationchange',()=>{renderCards();renderMapShops();});
$('shopDialog').addEventListener('close',loadShopFavorites);
function selectSource(next){recommendation=next==='new'?'latest':'business';source=['shops','new'].includes(next)?next:'places';filter='all';$('browsePlaces').click();setMapMode(source==='places');X.setFilter(matches);labels();document.dispatchEvent(new CustomEvent('musubu:discovery-source',{detail:{source}}));}
window.MUSUBU_DISCOVERY={favorite,toggle,setMapMode,matches,listCategories,get filter(){return filter;},get mapMode(){return mapMode;},selectSource,createCard,allPlaces,ranked,metrics,group,open,get source(){return source;}};
X.setFilter(matches);labels();loadShopFavorites();
})();
