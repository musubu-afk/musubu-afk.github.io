(() => {
'use strict';
const I=window.MUSUBU_I18N,X=window.MUSUBU_EXPLORE,C=window.MUSUBU_COMMUNITY,A=window.MUSUBU_SHOP_APP,$=id=>document.getElementById(id),t=(k,v)=>I.t(k,v);
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const region=()=>window.MUSUBU_REGION.current;
let filter='all',reviewStats=new Map(),shopSaved=new Set(),shopRows=new Set(),saving=false,shopLoaded=false;
const visitorHash=crypto.subtle.digest('SHA-256',new TextEncoder().encode(X.visitor)).then(b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''));
// Preserve the original controls and their event handlers; only move their parent.
const top=document.querySelector('.hero-top'),controls=el('div','discovery-controls');
controls.append(document.querySelector('.region-switch'),top.querySelector('.language-switch'));top.append(controls);
const shortcut=el('button','discovery-shortcut');shortcut.type='button';document.querySelector('.qrbtn').after(shortcut);
const section=el('section','discovery');section.id='discovery';const head=el('div','discovery-heading'),title=el('h2'),mapButton=el('button','text-button');mapButton.type='button';head.append(title,mapButton);
const note=el('p','notice'),filters=el('div','discovery-filters'),cards=el('div','discovery-cards'),message=el('p','notice');message.setAttribute('role','status');section.append(head,note,filters,cards,message);
document.querySelector('.explore-tabs').after(section);
const mapFilters=el('div','discovery-filters map-category-filters');$('storyMap').parentElement.before(mapFilters);
const categories=[['all','discoverAll'],['history','discoverHistory'],['nature','discoverNature'],['walk','discoverWalk'],['local','mapCategory_local'],['meal','category_meal'],['dessert','category_dessert'],['gift','category_gift'],['stay','category_stay'],['saved','discoverSaved']];
function group(p){if(p.shop_id)return p.category;if(p.story_key==='donam')return 'history';if(['walk','photo'].includes(p.category))return 'walk';return ['scenery','rest'].includes(p.category)?'nature':'local';}
function matches(p){return filter==='all'||(filter==='saved'?(p.shop_id?shopSaved.has(p.shop_id):C.isFavorite(p.id)):group(p)===filter);}
function distance(p){const r=window.MUSUBU_MAP_CONFIG.regions[region()],rad=x=>x*Math.PI/180;const a=Math.sin(rad(p.latitude-r.latitude)/2)**2+Math.cos(rad(r.latitude))*Math.cos(rad(p.latitude))*Math.sin(rad(p.longitude-r.longitude)/2)**2;return t(p.shop_id?'discoverDemoDistance':'discoverOrigin',{km:(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1)});}
function image(p){return p.shop_id?p.image_url:document.querySelector('#story-'+p.story_key+' .story-photo')?.getAttribute('src');}
function open(p){if(p.shop_id)A.openShop(p);else {X.choose(p);X.openDetail();}}
function favorite(p){return p.shop_id?shopSaved.has(p.shop_id):C.isFavorite(p.id);}
async function toggle(p,b){if(saving)return;saving=true;b.disabled=true;message.textContent='';try{
 if(p.shop_id){const id=p.shop_id,h=await visitorHash,next=!shopSaved.has(id);const {error}=shopRows.has(id)?await X.db.from('shop_likes').update({liked:next}).eq('shop_id',id).eq('visitor_hash',h):await X.db.from('shop_likes').insert({shop_id:id,liked:true});if(error)throw error;await loadShopFavorites();}
 else if(!await C.toggleFavorite(p.id))throw Error('save');
 }catch{message.textContent=t('mapSaveError');}finally{saving=false;renderCards();X.setFilter(matches);}}
async function loadShopFavorites(){try{const {data,error}=await X.db.from('shop_likes').select('shop_id,liked').eq('visitor_hash',await visitorHash);if(error)throw error;shopRows=new Set(data.map(r=>r.shop_id));shopSaved=new Set(data.filter(r=>r.liked).map(r=>r.shop_id));shopLoaded=true;renderCards();if(filter==='saved')X.setFilter(matches);}catch{message.textContent=t('discoverError');}}
function summary(p){if(p.shop_id)return A.summary(p.shop_id);const rows=reviewStats.get(p.id);return rows?.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):t(reviewStats.loaded?'noStats':'statsLoading');}
function renderCards(){cards.replaceChildren();const places=X.places.filter(p=>p.region===region()).sort((a,b)=>X.count(b.id)-X.count(a.id));const list=[...places,...window.MUSUBU_SHOPS.filter(p=>p.region===region())].filter(matches);
 for(const p of list){const v=p.shop_id?I.shopView(p):X.view(p),card=el('article','discovery-card'),button=el('button','discovery-open');button.type='button';button.onclick=()=>open(p);
 const src=image(p);if(src){const img=el('img');img.src=src;img.alt=v.name;img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src=p.image_fallback||'assets/shop-placeholder.svg';};button.append(img);}else button.append(el('span','discovery-no-photo',t('discoverNoPhoto')));
 const text=el('span','discovery-copy');text.append(el('strong','',v.name),el('small','',p.shop_id?t('demo'):t(p.is_example?'mapExample':p.kind==='official'?'mapOfficial':'mapResident')),el('span','discovery-summary',summary(p)),el('small','',distance(p)));button.append(text);
 const heart=el('button','discovery-heart',favorite(p)?'♥':'♡');heart.type='button';heart.setAttribute('aria-label',v.name+' · '+t(favorite(p)?'favoriteSaved':'favoriteAdd'));heart.setAttribute('aria-pressed',String(favorite(p)));heart.disabled=saving||(!!p.shop_id&&!shopLoaded);heart.onclick=()=>toggle(p,heart);card.append(button,heart);cards.append(card);
 }if(!list.length)cards.append(el('p','notice',t('discoverEmpty')));
}
let shopMarkers=X.map&&L.layerGroup().addTo(X.map);
function renderMapShops(){document.querySelector('.map-list').hidden=$('registerPlaces').getAttribute('aria-pressed')==='true'||['meal','dessert','gift','stay'].includes(filter);if(!shopMarkers)return;shopMarkers.clearLayers();if($('registerPlaces').getAttribute('aria-pressed')==='true')return;
 window.MUSUBU_SHOPS.filter(p=>p.region===region()&&matches(p)).forEach(p=>{const v=I.shopView(p),icon=L.divIcon({className:'map-pin nearby-map-pin',html:'<span><b>'+({meal:'🍚',dessert:'☕',gift:'🎁',stay:'🛏️'}[p.category])+'</b></span>',iconSize:[36,36],iconAnchor:[18,36]});const m=L.marker([p.latitude,p.longitude],{icon,title:v.name+' · '+t('demo'),alt:v.name});
 const content=el('div','discovery-popup');content.append(el('strong','',v.name),el('p','',summary(p)),el('small','',t('demo')));const b=el('button','community-button',t('mapDetails'));b.type='button';b.onclick=()=>{X.map.closePopup();open(p);};content.append(b);m.bindPopup(content).addTo(shopMarkers);});
}
function drawFilters(){for(const root of [filters,mapFilters]){root.replaceChildren();root.setAttribute('role','group');root.setAttribute('aria-label',t('mapCategory'));for(const [id,key]of categories){const b=el('button','',t(key));b.type='button';b.setAttribute('aria-pressed',String(filter===id));b.onclick=()=>{filter=id;drawFilters();X.setFilter(matches);renderCards();$('mapPreview').hidden=true;};root.append(b);}}}
function labels(){title.textContent=t('discoverTitle');shortcut.textContent=t('discoverNav');mapButton.textContent=t('discoverMap')+' ↓';note.textContent=t('favoriteNote');drawFilters();renderCards();renderMapShops();}
shortcut.onclick=()=>{window.MUSUBU_SCREENS.go('story');requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));};
mapButton.onclick=()=>$('storyMap').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
document.addEventListener('musubu:place-list-rendered',()=>{renderMapShops();if(!document.querySelector('#placeList button')){const p=$('placeList').querySelector('p');if(p)p.textContent=t('discoverEmpty');}});
document.addEventListener('musubu:places-loaded',()=>{renderCards();renderMapShops();});
document.addEventListener('musubu:favorites',()=>{renderCards();if(filter==='saved')X.setFilter(matches);});
document.addEventListener('musubu:preview-stats',e=>{reviewStats=new Map();for(const r of e.detail.rows){if(!reviewStats.has(r.place_id))reviewStats.set(r.place_id,[]);reviewStats.get(r.place_id).push(r);}reviewStats.loaded=true;renderCards();});
document.addEventListener('musubu:shop-stats',()=>{renderCards();renderMapShops();});
document.addEventListener('musubu:languagechange',labels);
document.addEventListener('musubu:regionchange',()=>{filter='all';X.setFilter(matches);labels();});
document.addEventListener('musubu:picking',e=>{section.hidden=e.detail.picking;mapFilters.hidden=e.detail.picking;renderMapShops();});
$('shopDialog').addEventListener('close',loadShopFavorites);
labels();loadShopFavorites();
})();
