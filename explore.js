(() => {
'use strict';
const I=window.MUSUBU_I18N, t=(k,v)=>I.t(k,v), $=id=>document.getElementById(id), C=window.MUSUBU_MAP_CONFIG;
const text=(id,key,vars)=>I.message($(id),key,vars);
let visitor, liked=new Set();
try { visitor=localStorage.getItem('musubu.visitor'); if(!/^[0-9a-f-]{36}$/i.test(visitor||'')) {visitor=crypto.randomUUID();localStorage.setItem('musubu.visitor',visitor);} liked=new Set(JSON.parse(localStorage.getItem('musubu.likes')||'[]')); } catch {visitor=crypto.randomUUID();}
const db=window.supabase?.createClient('https://fzynbjgkictmlmuxfldl.supabase.co','sb_publishable_x08dJFDQ_zuP0IKJ83jFYg_1so-HCCN',{
 auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'musubu-map'},global:{headers:{'x-musubu-visitor':visitor}}
});
let places=[], counts=new Map(),selected=null,map=null,markers=null,picking=false,point=null,formRegion=null,sending=false,liking=false,loadVersion=0,submissionId=null,draftMarker=null,pointAddress='',deleting=false;
const region=()=>window.MUSUBU_REGION.current;
const currentRegion=()=>C.regions[region()];
const view=p=>({...p,...(p.translations?.[I.lang]||{})});
const explorer=document.createElement('div');explorer.id='explorer';
explorer.innerHTML=`<div class="explore-heading"><span class="tag">MUSUBU · LOCAL STORIES</span><h2 data-i18n="mapTitle"></h2><p data-i18n="mapIntro"></p></div>
<div class="map-legend"><span data-i18n="mapOfficial"></span><span data-i18n="mapResident"></span><span data-i18n="mapWalk"></span></div>
<div class="map-toolbar"><button type="button" class="recommend" id="recommendPlace" data-i18n="mapRecommend"></button><button type="button" id="mapHome" data-i18n="mapFit"></button></div>
<div class="map-pick" id="mapPick" hidden><p data-i18n="mapPick"></p><div class="map-pick-actions"><button type="button" id="pickCenter" data-i18n="mapChooseCenter"></button><button type="button" id="continuePick" disabled data-i18n="mapContinue"></button><button type="button" id="cancelPick" data-i18n="mapCancel"></button></div><p id="selectedAddress" role="status"></p></div>
<div class="map-wrap"><div id="storyMap" class="map-canvas" role="region" tabindex="0" data-i18n-aria="mapStory"><span class="map-center" aria-hidden="true">＋</span></div></div>
<p id="mapTileStatus" class="map-status" role="status"></p><p id="mapStatus" class="map-status" role="status"></p>
<section class="map-preview" id="mapPreview" tabindex="-1" aria-labelledby="previewTitle" hidden><button type="button" class="preview-close" id="closePreview" data-i18n-aria="mapClose">✕</button><span class="tag" id="previewKind"></span><h3 id="previewTitle"></h3><p id="previewReason"></p><p id="previewLikes"></p><div class="preview-actions"><button type="button" id="listenPlace" data-i18n="mapListen"></button><button type="button" id="openPlace" data-i18n="mapDetails"></button></div><small class="preview-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors</small></section>
<details class="map-list" open><summary data-i18n="mapList"></summary><div class="map-list-items" id="placeList"></div></details><button type="button" class="text-button" id="refreshPlaces" data-i18n="mapRefresh"></button>`;
function mount(){ $(region()==='nonsan'?'story':'fukuoka-story').append(explorer); }
mount();I.apply(explorer);
function rememberLike(id){liked.add(id);try{localStorage.setItem('musubu.likes',JSON.stringify([...liked]));}catch{}}
function kindLabel(p){return p.is_example?t('mapExample'):t(p.kind==='official'?'mapOfficial':p.kind==='walk'?'mapWalk':'mapResident');}
function shownPlaces(){return places.filter(p=>p.region===region()).sort((a,b)=>(a.kind==='official'?0:1)-(b.kind==='official'?0:1)||a.name.localeCompare(b.name));}
function pin(p){return L.divIcon({className:'map-pin '+p.kind,html:'<span><b>'+(p.kind==='official'?'♪':p.kind==='walk'?'↝':'♥')+'</b></span>',iconSize:[36,36],iconAnchor:[18,36]});}
function draw(){
 document.querySelectorAll('.leaflet-control-zoom-in,.leaflet-control-zoom-out').forEach(el=>{const label=t(el.classList.contains('leaflet-control-zoom-in')?'mapZoomIn':'mapZoomOut');el.title=label;el.setAttribute('aria-label',label);});
 if(markers)markers.clearLayers(); $('placeList').replaceChildren();
 shownPlaces().forEach(p=>{
  const v=view(p), b=document.createElement('button');b.type='button';
  const label=document.createElement('span'), title=document.createElement('strong'), sub=document.createElement('small');title.textContent=v.name;sub.textContent=kindLabel(p);label.append(title,sub);b.append(label);
  const heart=document.createElement('span');heart.textContent='♡ '+(counts.get(p.id)??'—');b.append(heart);b.onclick=()=>choose(p,true);$('placeList').append(b);
  if(map){const marker=L.marker([p.latitude,p.longitude],{icon:pin(p),title:v.name,alt:v.name});marker.on('click',()=>{if(picking)pick({lat:p.latitude,lng:p.longitude});else choose(p);});marker.addTo(markers);}
 });
 if(!shownPlaces().length){const p=document.createElement('p');p.textContent=t('mapNoPlaces');$('placeList').append(p);}
}
function preview(){
 if(!selected)return; const v=view(selected);
 $('previewKind').textContent=kindLabel(selected);$('previewTitle').textContent=v.name;$('previewReason').textContent=v.reason;
 $('previewLikes').textContent=counts.has(selected.id)?t('mapLikes',{count:counts.get(selected.id)}):t('mapLikesLoading');
 $('listenPlace').hidden=!selected.story_key;
}
function choose(p,pan=false){
 selected=p;I.clear($('likeStatus'));preview();$('mapPreview').hidden=false;
 if(pan&&map)map.setView([p.latitude,p.longitude],Math.max(map.getZoom(),14));
 $('mapPreview').focus({preventScroll:true});
}
function likeButton(){if(!selected)return;const count=counts.get(selected.id)??'—';text('detailLike',liked.has(selected.id)?'mapLiked':'mapLike',{count});$('detailLike').disabled=liking||!db||liked.has(selected.id);}
function detail(){
 if(!selected)return;const p=selected,v=view(p);$('placeDetailTitle').textContent=v.name;$('placeDetailMeta').textContent=kindLabel(p)+' · '+t('mapCategory_'+p.category)+' · '+(v.address||t('mapAddressUnknown'));
 document.querySelectorAll('#officialStories .destination-story').forEach(a=>a.hidden=a.id!=='story-'+p.story_key);
 $('officialStories').hidden=!p.story_key;$('communityStory').hidden=!!p.story_key;
 $('communityReason').textContent=v.reason;$('communityReason').lang=p.language;
 $('communityTip').textContent=v.tip||t('mapNoTip');$('placeExample').hidden=!p.is_example;likeButton();
}
function openDetail(){if(!selected)return;$('deletePlaceForm').reset();I.clear($('deleteStatus'));$('sendDelete').disabled=false;document.querySelector('.delete-request').open=false;detail();$('mapPreview').hidden=true;$('placeDialog').showModal();document.body.classList.add('modal-open');$('placeDialog').querySelector('.place-scroll').scrollTop=0;}
function closeDetail(){document.querySelectorAll('#placeDialog audio').forEach(a=>a.pause());document.body.classList.remove('modal-open');}
$('placeDialog').addEventListener('close',closeDetail);
document.querySelector('[data-close-place]').onclick=()=>$('placeDialog').close();
$('openPlace').onclick=openDetail;$('listenPlace').onclick=openDetail;
$('closePreview').onclick=()=>{$('mapPreview').hidden=true;};
$('placeToShops').onclick=()=>{
 $('placeDialog').close();const target=$(region()==='nonsan'?'shops':'fukuoka-shops');
 if(selected){const heading=target.querySelector(':scope > h2');if(heading){I.message(heading,'mapNearby',{name:view(selected).name});delete heading.dataset.regionText;}}
 window.MUSUBU_SCREENS.go('shops');
};
async function loadCounts(){if(!db)return;const {data,error}=await db.rpc('place_like_counts');if(error)throw error;counts=new Map(places.map(p=>[p.id,0]));(data||[]).forEach(r=>counts.set(r.place_id,Number(r.like_count)));draw();preview();likeButton();}
async function load(){
 const version=++loadVersion;text('mapStatus','mapLoading');$('refreshPlaces').disabled=true;
 try{
  if(!db)throw Error('client');
  const [a,b]=await Promise.all([
   db.from('places').select('id,region,latitude,longitude,name,kind,category,reason,tip,language,story_key,translations,is_example,address').order('created_at').limit(1000),
   db.from('tour_regions').select('*')]);
  if(a.error||b.error)throw a.error||b.error;if(version!==loadVersion)return;
  places=a.data;for(const r of b.data)C.regions[r.id]=r;
  if(selected){selected=places.find(p=>p.id===selected.id)||null;if(!selected){$('mapPreview').hidden=true;if($('placeDialog').open)$('placeDialog').close();}}
  draw();text('mapStatus','mapCount',{count:shownPlaces().length});await loadCounts();
 }catch{if(version===loadVersion)text('mapStatus','mapLoadError');}
 finally{if(version===loadVersion)$('refreshPlaces').disabled=false;}
}
$('detailLike').onclick=async()=>{
 if(!selected||liking||!db||liked.has(selected.id))return;const p=selected;liking=true;likeButton();
 try{const {error}=await db.from('place_likes').insert({place_id:p.id});if(error&&error.code!=='23505')throw error;rememberLike(p.id);await loadCounts();}
 catch{text('likeStatus','mapSaveError');}finally{liking=false;likeButton();}
};
function setPicking(value){picking=value;$('mapPick').hidden=!value;$('storyMap').classList.toggle('picking',value);$('mapPreview').hidden=true;$('recommendPlace').disabled=value||!map;}
$('recommendPlace').onclick=()=>{setPicking(true);$('mapPick').scrollIntoView({behavior:'smooth',block:'center'});};
$('cancelPick').onclick=()=>{clearDraft();setPicking(false);};
$('pickCenter').onclick=()=>{if(map)pick(map.getCenter());};
function clearDraft(){if(draftMarker){draftMarker.remove();draftMarker=null;}point=null;pointAddress='';$('continuePick').disabled=true;I.clear($('selectedAddress'));}
function showAddress(){
 const el=$('selectedAddress');I.clear(el);el.textContent=pointAddress||t('mapAddressFallback');
 $('chosenPoint').textContent=t('mapSelected')+' · '+C.regions[formRegion]['name_'+I.lang];
}
function pick(latlng){
 const r=currentRegion(),b=r.bounds;
 if(latlng.lat<b[0][0]||latlng.lat>b[1][0]||latlng.lng<b[0][1]||latlng.lng>b[1][1]){text('mapStatus','mapOutside');return;}
 point={lat:Number(latlng.lat.toFixed(6)),lng:Number(latlng.lng.toFixed(6))};formRegion=r.id;pointAddress='';
 if(draftMarker)draftMarker.remove();
 draftMarker=L.marker([point.lat,point.lng],{icon:pin({kind:'resident'}),title:t('mapSelected'),alt:t('mapSelected'),zIndexOffset:2000,interactive:false}).addTo(map);
 $('continuePick').disabled=false;text('mapStatus','mapPinSelected');text('selectedAddress','mapAddressLoading');
 showAddress();
}
$('continuePick').onclick=()=>{
 if(!point)return;
 $('recommendForm').reset();submissionId=crypto.randomUUID();I.clear($('placeSubmitStatus'));$('sendPlace').disabled=false;
 showAddress();$('placeAddress').value=pointAddress;
 $('recommendDialog').showModal();document.body.classList.add('modal-open');
};
$('deletePlaceForm').onsubmit=async e=>{
 e.preventDefault();if(deleting||!selected)return;
 const reason=new FormData(e.currentTarget).get('reason').trim();if(reason.length<5)return;
 deleting=true;$('sendDelete').disabled=true;
 try{const {error}=await db.from('place_deletion_requests').insert({place_id:selected.id,reason});
 if(error&&error.code!=='23505')throw error;text('deleteStatus',error?'mapDeleteDuplicate':'mapDeleteSent');}
 catch{text('deleteStatus','mapSaveError');$('sendDelete').disabled=false;}finally{deleting=false;}
};
$('closeRecommend').onclick=()=>{if(!sending)$('recommendDialog').close();};
$('recommendDialog').addEventListener('cancel',e=>{if(sending)e.preventDefault();});
$('recommendDialog').addEventListener('close',()=>document.body.classList.remove('modal-open'));
$('recommendForm').onsubmit=async e=>{
 e.preventDefault();if(sending||!db||!point)return;
 if(!$('placeAddress').value.trim()){$('placeAddress').focus();return;}
 const data=new FormData(e.currentTarget),name=data.get('name').trim(),reason=data.get('reason').trim(),tip=data.get('tip').trim();
 if([...name].length<2||[...name].length>80||[...reason].length<10||[...reason].length>1200||[...tip].length>300){text('placeSubmitStatus','mapValidation');return;}
 sending=true;$('sendPlace').disabled=true;$('closeRecommend').disabled=true;text('placeSubmitStatus','mapSending');
 try{
  const {error}=await db.from('places').insert({id:submissionId,region:formRegion,latitude:point.lat,longitude:point.lng,name,category:data.get('category'),reason,tip,language:I.lang,address:data.get('address').trim()});
  // The UUID is retained on retry. An identical accepted request cannot create duplicates.
  if(error&&error.code!=='23505')throw error;text('placeSubmitStatus','mapSubmitted');$('recommendForm').reset();clearDraft();setPicking(false);await load();
 }catch{text('placeSubmitStatus','mapSaveError');$('sendPlace').disabled=false;}
 finally{sending=false;$('closeRecommend').disabled=false;}
};
function resetRegion(){
 if(sending)return;
 $('placeDialog').close();$('recommendDialog').close();selected=null;clearDraft();setPicking(false);mount();
 if(map){map.invalidateSize();const r=currentRegion();map.setView([r.latitude,r.longitude],r.zoom);}
 draw();text('mapStatus','mapCount',{count:shownPlaces().length});
}
$('refreshPlaces').onclick=load;
$('mapHome').onclick=()=>{if(map){const r=currentRegion();map.setView([r.latitude,r.longitude],r.zoom);}};
if(window.L){
 const r=currentRegion();map=L.map('storyMap',{scrollWheelZoom:false,zoomControl:true}).setView([r.latitude,r.longitude],r.zoom);
 markers=L.layerGroup().addTo(map);let failed=0;
 L.tileLayer(C.tileUrl,{maxZoom:C.maxZoom,attribution:C.attribution}).on('tileerror',()=>{if(++failed>=2)text('mapTileStatus','mapTileError');}).on('tileload',()=>{failed=0;I.clear($('mapTileStatus'));}).addTo(map);
 map.on('click',e=>{if(picking)pick(e.latlng);});
}else{text('mapTileStatus','mapTileError');$('recommendPlace').disabled=true;$('mapHome').disabled=true;}
document.addEventListener('musubu:regionchange',resetRegion);
document.addEventListener('musubu:languagechange',()=>{I.apply(explorer);draw();preview();if(selected){detail();const h=$(region()==='nonsan'?'shops':'fukuoka-shops').querySelector(':scope > h2');if(h?.dataset.i18n==='mapNearby')I.message(h,'mapNearby',{name:view(selected).name});}if(point){const r=C.regions[formRegion];showAddress();}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load();});
window.addEventListener('online',load);
document.addEventListener('musubu:screenchange',e=>{if(e.detail.screen==='story'){requestAnimationFrame(()=>map?.invalidateSize());}else{$('mapPreview').hidden=true;document.querySelectorAll('audio').forEach(a=>a.pause());}});
// Keep the nearby-shop promise honest until partner coordinates are available.
const note=document.createElement('p');note.className='notice';note.dataset.i18n='mapShopNote';$('shops').append(note);I.apply();load();
})();
