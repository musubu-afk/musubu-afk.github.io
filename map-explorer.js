(() => {
'use strict';
const X=window.MUSUBU_EXPLORE,D=window.MUSUBU_DISCOVERY,I=window.MUSUBU_I18N,M=window.MUSUBU_MAP_UI_MODEL,P=window.MUSUBU_PHASE_THREE_MODEL;
const map=X?.map;if(!map||!D)return;
const $=id=>document.getElementById(id),t=(k,v)=>I.t(k,v),make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
const pane=$('discoveryMapPane'),wrap=pane.querySelector('.map-wrap'),canvas=$('storyMap'),filters=pane.querySelector('.map-category-filters');
let selected=null,position=null,locating=false,locationKey='',full=false,focusBefore=null,frame=0,userDot=null;
const entries=new Map(),layer=L.layerGroup().addTo(map),failedImages=new Set();
const toolbar=make('div','m4-toolbar'),search=make('input','m4-search');search.type='search';search.autocomplete='off';search.maxLength=100;
const results=make('div','m4-results');results.id='mapSearchResults';search.setAttribute('aria-controls',results.id);results.hidden=true;
const resultStatus=make('span','m4-sr');resultStatus.setAttribute('role','status');
toolbar.append(search,results,resultStatus);filters.before(toolbar);
const paneAnchor=document.createComment('browse map');pane.before(paneAnchor);
const mapHeading=make('div','m4-heading');
const back=$('mapBrowseBack');back.before(mapHeading);mapHeading.append(back);
const register=make('button','m4-register');
register.type='button';
register.onclick=()=>{
 const center=map.getCenter(),zoom=map.getZoom();
 setFull(false);
 $('registerPlaces').click();
 requestAnimationFrame(()=>{map.invalidateSize();map.setView(center,zoom,{animate:false});});
};
mapHeading.append(register);
const legend=make('div','m4-legend');filters.after(legend);
const controls=make('div','m4-controls');
function action(shape,fn){const b=make('button','m4-control',shape);b.type='button';b.onclick=fn;return b;}
const fullButton=action('⛶',()=>setFull(!full)),locateButton=action('◎',locate);controls.append(fullButton,locateButton);wrap.append(controls);
const notice=make('p','m4-notice');notice.setAttribute('role','status');wrap.append(notice);
const card=make('section','m4-card');card.hidden=true;card.setAttribute('aria-labelledby','m4Title');
const close=action('×',()=>clearSelection(true));close.className='m4-close';
const cover=make('img','m4-cover');cover.alt='';cover.width=78;cover.height=78;cover.decoding='async';
const copy=make('div','m4-copy'),title=make('h3');title.id='m4Title';
const category=make('p','m4-category'),stats=make('p','m4-stats'),reason=make('p','m4-reason'),actions=make('div','m4-card-actions');
const detail=make('button'),route=make('a');detail.type='button';route.target='_blank';route.rel='noopener noreferrer';actions.append(detail,route);copy.append(title,category,stats,reason);card.append(close,cover,copy,actions);wrap.append(card);
L.DomEvent.disableClickPropagation(card);L.DomEvent.disableScrollPropagation(card);L.DomEvent.disableClickPropagation(controls);
const name=p=>(p.shop_id?I.shopView(p):X.view(p));
const thumbnails={'assets/donam-seowon.jpg':'assets/map-thumbs/donam-seowon.webp','assets/tapjeongho.jpg':'assets/map-thumbs/tapjeongho.webp','assets/ohori.png':'assets/map-thumbs/ohori.webp','assets/yufuin.png':'assets/map-thumbs/yufuin.webp'};
const image=p=>{const src=M.image(p,document.querySelector('#story-'+p.story_key+' .story-photo')?.getAttribute('src'));return thumbnails[src]||src;};
const kind=p=>p.kind==='official'?'m4Official':p.kind==='resident'?'m4Resident':'m4Other';
const colour=p=>({blue:'#2974bb',green:'#18835d',orange:'#d18423',pink:'#cc477b',purple:'#7952b3',red:'#c54848'}[p.wiki?.pin_color||p.pin_color]||(p.kind==='official'?'#2974bb':p.kind==='resident'?'#18835d':'#d18423'));
const glyph=p=>({history:'▥',nature:'♧',walk:'♧',local:'✦',meal:'♨',dessert:'☕',gift:'◇',stay:'⌂'}[D.group(p)]||'•');
function items(){return D.allPlaces().filter(p=>p.region===window.MUSUBU_REGION.current&&M.valid(p)&&D.matches(p));}
function icon(p,small,on){
 const outer=make('div','m4-marker'+(small?' m4-small':'')+(on?' m4-selected':''));outer.style.setProperty('--pin',colour(p));
 const fallback=make('span','m4-fallback',glyph(p));outer.append(fallback);
 const src=image(p);
 if(!small&&src&&!failedImages.has(src)){
  const photo=make('img');photo.src=src;photo.alt='';photo.width=48;photo.height=48;photo.loading='lazy';photo.decoding='async';photo.onerror=()=>{failedImages.add(src);photo.remove();};outer.append(photo);
 }
 if(!small)outer.append(make('span','m4-badge',glyph(p)));
 return L.divIcon({className:'m4-pin',html:outer,iconSize:[small?28:52,small?28:52],iconAnchor:[small?14:26,small?14:26]});
}
function clearSelection(focus){const old=selected;selected=null;card.hidden=true;$('mapPreview').hidden=true;paint();if(focus&&old)entries.get(M.key(old))?.marker.getElement()?.focus();}
function select(p,pan=false){
 if(X.picking)return;
 selected=p;if(!p.shop_id)X.choose(p,pan);
 else if(pan)map.setView([p.latitude,p.longitude],Math.max(14,map.getZoom()));
 showCard();paint();
 requestAnimationFrame(()=>map.panInside([p.latitude,p.longitude],{paddingTopLeft:[40,50],paddingBottomRight:[75,card.offsetHeight+36]}));
}
function showCard(){
 if(!selected)return;
 const p=selected,v=name(p),src=image(p);card.hidden=false;cover.hidden=!src||failedImages.has(src);
 if(!cover.hidden&&cover.getAttribute('src')!==src)cover.src=src;
 cover.onerror=()=>{failedImages.add(src);cover.hidden=true;card.classList.add('m4-no-photo');};
 card.classList.toggle('m4-no-photo',cover.hidden);title.textContent=v.name;
 category.textContent=t(D.listCategories().find(([id])=>id===D.group(p))?.[1]||'phaseExperience')+' · '+t(kind(p))+(p.is_example?' · '+t('mapExample'):p.is_demo?' · '+t('phaseDemoShop'):'');
 const metric=D.metrics(p);stats.textContent=metric.count?'★ '+metric.rating.toFixed(1)+' ('+metric.count+')':t('noStats');
 if(position)stats.textContent+=' · '+t(p.shop_id?'locationDemoDistance':'locationDistance',{km:window.MUSUBU_LOCATION.kilometres(position,p).toFixed(1)});
 reason.textContent=v.description||v.reason||'';reason.hidden=!reason.textContent;
 detail.textContent=t(p.story_key?'m4Story':'mapDetails');route.textContent=t('p2Directions');
 route.href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.latitude+','+p.longitude);
 route.title=p.is_demo?t('p2DemoRoute'):t('p2Directions');
}
detail.onclick=()=>{if(!selected)return;const p=selected;setFull(false);D.open(p);card.hidden=true;};
function paint(){
 if(X.picking){layer.clearLayers();entries.clear();card.hidden=true;return;}
 if(!D.mapMode)return;
 const list=items();
 if(selected&&!list.some(p=>M.key(p)===M.key(selected))){selected=null;card.hidden=true;$('mapPreview').hidden=true;}
 const bounds=map.getBounds().pad(.25),visible=list.filter(p=>bounds.contains([p.latitude,p.longitude]));
 const groups=M.groups(visible,map.getZoom(),p=>map.project([p.latitude,p.longitude],map.getZoom()),selected&&M.key(selected)),keep=new Set();
 for(const group of groups){
  const rows=group.places,p=rows[0],cluster=rows.length>1,on=!!selected&&M.key(p)===M.key(selected);
  const lat=rows.reduce((n,r)=>n+Number(r.latitude),0)/rows.length,lng=rows.reduce((n,r)=>n+Number(r.longitude),0)/rows.length;
  const small=map.getZoom()<13&&!on;
  const label=cluster?t('m4Cluster',{count:rows.length}):name(p).name+' · '+t(kind(p));
  const signature=cluster?'c:'+rows.length:JSON.stringify([small,on,image(p),colour(p),glyph(p)]);
  let entry=entries.get(group.id);
  if(!entry){
   const marker=L.marker([lat,lng],{keyboard:true,title:label,alt:label,riseOnHover:true});
   entry={marker,signature:null,rows};marker.on('click',()=>{const rows=entry.rows;if(rows.length>1){map.fitBounds(rows.map(r=>[r.latitude,r.longitude]),{padding:[70,70],maxZoom:Math.max(14,map.getZoom()+2)});}else select(rows[0]);});
   entries.set(group.id,entry);
  }
  entry.rows=rows;entry.marker.setLatLng([lat,lng]);
  if(entry.signature!==signature){
   const html=cluster?make('span','m4-cluster',String(rows.length)):null;
   entry.marker.setIcon(cluster?L.divIcon({className:'m4-cluster-pin',html,iconSize:[42,42],iconAnchor:[21,21]}):icon(p,small,on));entry.signature=signature;
  }
  if(!layer.hasLayer(entry.marker))entry.marker.addTo(layer);
  const node=entry.marker.getElement();if(node){node.title=label;node.setAttribute('aria-label',label);node.setAttribute('role','button');node.setAttribute('aria-pressed',String(on));}
  entry.marker.setZIndexOffset(on?1000:0);keep.add(group.id);
 }
 for(const [key,entry] of entries)if(!keep.has(key)){layer.removeLayer(entry.marker);entries.delete(key);}
 if(selected)showCard();
 notice.textContent=locationKey?t(locationKey):list.length?'':t('m4Empty');
}
function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;paint();});}
function searchResults(){
 results.replaceChildren();const q=search.value.trim();results.hidden=!q;search.setAttribute('aria-expanded',String(!!q));
 if(!q){resultStatus.textContent='';return;}
 const found=P.search(items(),q,p=>{const v=name(p);return [v.name,p.name,v.address,v.reason,v.description,...Object.values(p.translations||{}).map(x=>x.name)].filter(Boolean).join(' ');}).slice(0,12);
 resultStatus.textContent=t('m4Found',{count:found.length});
 if(!found.length)results.append(make('p','',t('m4Empty')));
 for(const p of found){const b=make('button','',name(p).name);b.type='button';b.onclick=()=>{search.value='';results.hidden=true;search.setAttribute('aria-expanded','false');select(p,true);detail.focus({preventScroll:true});};results.append(b);}
}
search.oninput=searchResults;search.onkeydown=e=>{if(e.key==='Escape'&&search.value){search.value='';searchResults();e.stopPropagation();}if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus();}if(e.key==='Enter'){e.preventDefault();results.querySelector('button')?.click();}};
function setFull(on){
 if(on===full)return;
 const center=map.getCenter(),zoom=map.getZoom();
 full=on;
 if(on){focusBefore=document.activeElement;document.body.append(pane);}
 else paneAnchor.after(pane);
 pane.classList.toggle('m4-fullscreen',on);document.body.classList.toggle('m4-map-open',on);labels();
 requestAnimationFrame(()=>{map.invalidateSize({pan:false});map.setView(center,zoom,{animate:false});schedule();if(on)fullButton.focus();else if(!X.picking&&focusBefore?.isConnected)focusBefore.focus({preventScroll:true});});
}
pane.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&full){e.preventDefault();setFull(false);}
 if(e.key==='Tab'&&full){
  const focusable=[...pane.querySelectorAll('button,a[href],input,[tabindex="0"]')].filter(n=>n.getClientRects().length&&!n.disabled);
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }
});
function locate(){
 if(locating)return;
 if(!navigator.geolocation){locationKey='locationUnavailable';paint();return;}
 locating=true;locateButton.disabled=true;locationKey='locationWorking';paint();
 navigator.geolocation.getCurrentPosition(result=>{
  locating=false;locateButton.disabled=false;
  position={latitude:result.coords.latitude,longitude:result.coords.longitude};
  locationKey=result.coords.accuracy>1000?'locationApproximate':'locationReady';
  if(userDot)userDot.remove();
  userDot=L.circleMarker([position.latitude,position.longitude],{radius:7,color:'#fff',weight:3,fillColor:'#237bd1',fillOpacity:1}).addTo(map).bindTooltip(t('m4Here'));
  if(D.mapMode&&!X.picking)map.setView([position.latitude,position.longitude],14);paint();
 },error=>{locating=false;locateButton.disabled=false;locationKey=error.code===1?'locationDenied':'locationUnavailable';paint();},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
}
function labels(){
 register.textContent='＋ '+t('r42Title');register.setAttribute('aria-label',t('r42Title'));
 search.placeholder=t('m4Search');search.setAttribute('aria-label',t('m4Search'));results.setAttribute('aria-label',t('m4SearchResults'));
 fullButton.title=t(full?'m4Exit':'m4Full');fullButton.setAttribute('aria-label',fullButton.title);fullButton.setAttribute('aria-pressed',String(full));
 locateButton.title=t('m4Locate');locateButton.setAttribute('aria-label',locateButton.title);close.setAttribute('aria-label',t('mapClose'));
 legend.replaceChildren();for(const [key,color]of [['m4Official','#2974bb'],['m4Resident','#18835d'],['m4Other','#d18423']]){const text=make('span','',t(key));text.style.setProperty('--pin',color);legend.append(text);}
 if(userDot)userDot.setTooltipContent(t('m4Here'));if(selected)showCard();searchResults();schedule();
}
function mode(){
 const browsing=!X.picking;pane.classList.toggle('m4-browsing',browsing);
 if(browsing&&D.mapMode)map.scrollWheelZoom.enable();
 mapHeading.hidden=!browsing;
 for(const node of [toolbar,controls,legend,notice])node.hidden=!browsing;
 if(!browsing||!D.mapMode){setFull(false);clearSelection(false);}
 map.zoomControl?.setPosition(browsing?'topright':'topleft');
 if(browsing)requestAnimationFrame(()=>{map.invalidateSize({pan:false});schedule();});
}
window.MUSUBU_MAP_EXPLORER={render:schedule};
map.on('zoomend moveend resize',schedule);
X.setBrowseRenderer(()=>{mode();schedule();});
document.addEventListener('musubu:map-mode',mode);
document.addEventListener('musubu:picking',mode);
document.addEventListener('musubu:place-list-rendered',()=>{schedule();searchResults();});
document.addEventListener('musubu:map-selection',e=>{if(D.mapMode&&!X.picking){selected=e.detail.place;showCard();schedule();}});
document.addEventListener('musubu:regionchange',()=>{setFull(false);selected=null;card.hidden=true;search.value='';locationKey='';labels();});
document.addEventListener('musubu:languagechange',labels);
for(const event of ['musubu:preview-stats','musubu:shop-stats','musubu:places-loaded'])document.addEventListener(event,()=>{schedule();if(selected)showCard();});
document.addEventListener('musubu:screenchange',e=>{if(e.detail.screen!=='story'){setFull(false);clearSelection(false);}});
document.addEventListener('musubu:browse-view',()=>{if(pane.closest('[hidden]'))setFull(false);});
new ResizeObserver(()=>{if(D.mapMode)map.invalidateSize({pan:false});}).observe(wrap);
labels();mode();
})();
