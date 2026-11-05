(() => {
'use strict';
const X=window.MUSUBU_EXPLORE,I=window.MUSUBU_I18N,R=X?.registration,map=X?.map;if(!map||!R)return;
const $=id=>document.getElementById(id),t=(k,v)=>I.t(k,v),el=(tag,cls)=>{const e=document.createElement(tag);e.className=cls||'';return e;};
const pane=$('discoveryMapPane'),wrap=$('storyMap').parentElement,form=$('recommendForm'),dialog=$('recommendDialog'),pick=$('mapPick');
let full=false,oldFocus=null,searchVersion=0,searchRequest=null,addressRequest=null,locationVersion=0,pointKey='',active=false;
const anchor=document.createComment('registration map position');wrap.before(anchor);
const heading=el('header','r42-heading'),title=el('h2'),intro=el('p');heading.append(title,intro);pane.prepend(heading);
const searchBox=el('form','r42-searchbox'),input=el('input'),find=el('button');input.type='search';input.maxLength=180;input.autocomplete='off';find.type='submit';searchBox.append(input,find);
const results=el('div','r42-results'),status=el('p','r42-status');results.hidden=true;status.setAttribute('role','status');searchBox.append(results,status);wrap.append(searchBox);
const help=el('p','r42-help');wrap.append(help);
const controls=el('div','r42-controls');function button(fn){const b=el('button');b.type='button';b.onclick=fn;return b;}
const expand=button(()=>setFull(!full)),locate=button(locateMe);expand.textContent='⛶';locate.textContent='◎';controls.append(expand,locate);wrap.append(controls);
wrap.append(pick);pick.classList.add('r42-selection');
const selectedTitle=el('strong');pick.prepend(selectedTitle);const selectedHelp=pick.querySelector('p');
$('pickCenter').hidden=true;
const originalContinue=$('continuePick').onclick;$('continuePick').onclick=e=>{setFull(false);originalContinue(e);};
const summary=el('section','r42-summary'),summaryTitle=el('strong'),summaryText=el('p'),edit=button(()=>{if(R.sending)return;dialog.close();map.invalidateSize({pan:false});if(R.point)map.panTo(R.point);wrap.scrollIntoView({block:'center'});});summary.append(summaryTitle,summaryText,edit);form.prepend(summary);
L.DomEvent.disableClickPropagation(searchBox);L.DomEvent.disableScrollPropagation(searchBox);L.DomEvent.disableClickPropagation(controls);L.DomEvent.disableClickPropagation(pick);L.DomEvent.disableScrollPropagation(pick);
function labels(){title.textContent=t('r42Title');intro.textContent=t('r42Intro');input.placeholder=t('r42Search');input.setAttribute('aria-label',t('r42Search'));find.textContent=t('r42Find');help.textContent=t('r42Help');selectedTitle.textContent=t('r42Selected');summaryTitle.textContent=t('r42Selected');edit.textContent=t('r42Edit');expand.title=t(full?'r42Exit':'r42Full');expand.setAttribute('aria-label',expand.title);expand.setAttribute('aria-pressed',String(full));locate.title=t('r42Locate');locate.setAttribute('aria-label',locate.title);$('continuePick').textContent=t('r42Confirm');selectedHelp.textContent=t(R.point?'r42Manual':'r42Intro');photoLabel.textContent=t('r42Photo');photoNote.textContent=t('r42PhotoNote');removePhoto.textContent=t('r42PhotoRemove');refreshSummary();}
function refreshSummary(){const p=R.point;summaryText.textContent=p?$('selectedAddress').textContent:'';selectedHelp.textContent=t(p?'r42Manual':'r42Intro');pick.classList.toggle('r42-has-point',!!p);}
function cancelSearch(){searchVersion++;searchRequest?.abort();searchRequest=null;find.disabled=false;}
input.oninput=()=>{cancelSearch();results.replaceChildren();results.hidden=true;status.textContent='';};
searchBox.onsubmit=async e=>{
 e.preventDefault();cancelSearch();const q=input.value.trim();if(!q)return;
 const version=searchVersion,region=window.MUSUBU_REGION.current,controller=new AbortController();searchRequest=controller;find.disabled=true;results.hidden=true;status.textContent=t('r42Searching');
 const local=window.MUSUBU_PHASE_THREE_MODEL.search(X.places.filter(p=>p.region===region),q,p=>[X.view(p).name,p.name,p.address].join(' ')).map(p=>({lat:p.latitude,lng:p.longitude,name:X.view(p).name,address:X.view(p).address||''}));
 let rows=local,failed=false;const timer=setTimeout(()=>controller.abort(),10000);
 try{rows=[...local,...await window.MUSUBU_GEOCODE_SEARCH(q,region,I.lang,controller.signal)];}catch{failed=true;}finally{clearTimeout(timer);}
 if(version!==searchVersion||!X.picking)return;
 find.disabled=false;const unique=new Map();for(const row of rows){const key=Number(row.lat).toFixed(5)+','+Number(row.lng).toFixed(5);if(!unique.has(key))unique.set(key,row);}
 rows=[...unique.values()].slice(0,8);results.replaceChildren();results.hidden=!rows.length;status.textContent=rows.length?'':t(failed?'r42SearchError':'r42Empty');
 for(const row of rows){const b=button(()=>{R.pick({lat:Number(row.lat),lng:Number(row.lng)});const p=R.point;if(!p||Math.abs(p.lat-row.lat)>.00001||Math.abs(p.lng-row.lng)>.00001)return;addressRequest?.abort();if(row.address)R.setAddress(p,row.address);map.setView(p,16);results.hidden=true;status.textContent=t('r42Manual');input.value=row.name;});b.textContent=row.name+(row.address&&row.address!==row.name?' · '+row.address:'');results.append(b);}
};
input.onkeydown=e=>{if(e.key==='Escape'){results.hidden=true;e.stopPropagation();}if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus();}};
function setFull(on){
 if(full===on)return;full=on;
 if(on){oldFocus=document.activeElement;document.body.append(wrap);}else anchor.after(wrap);
 wrap.classList.toggle('r42-full',on);document.body.classList.toggle('r42-lock',on);labels();
 requestAnimationFrame(()=>{map.invalidateSize({pan:false});if(on)expand.focus();else if(oldFocus?.isConnected)oldFocus.focus({preventScroll:true});});
}
wrap.addEventListener('keydown',e=>{if(e.key==='Escape'&&full){e.preventDefault();setFull(false);}if(e.key==='Tab'&&full){const nodes=[...wrap.querySelectorAll('button,input,a[href],[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}}});
async function updateAddress(){
 refreshSummary();const p=R.point,key=p&&p.lat+','+p.lng;if(!p||key===pointKey)return;pointKey=key;addressRequest?.abort();const controller=new AbortController();addressRequest=controller;const timer=setTimeout(()=>controller.abort(),10000);
 try{const a=await window.MUSUBU_GEOCODE(p,I.lang,controller.signal);if(!controller.signal.aborted&&X.picking)R.setAddress(p,a.address);}catch{/* Coordinates remain usable when address lookup fails. */}finally{clearTimeout(timer);}
}
function locateMe(){
 const version=++locationVersion;if(!navigator.geolocation){status.textContent=t('locationUnavailable');return;}
 locate.disabled=true;status.textContent=t('locationWorking');
 navigator.geolocation.getCurrentPosition(p=>{if(version!==locationVersion)return;locate.disabled=false;map.setView([p.coords.latitude,p.coords.longitude],16);status.textContent=t('r42Intro');},e=>{if(version!==locationVersion)return;locate.disabled=false;status.textContent=t(e.code===1?'locationDenied':'locationUnavailable');},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
}
function mode(){
 const on=X.picking;active=on;wrap.classList.toggle('r42-map',on);pane.classList.toggle('r42-pane',on);$('explorer').classList.toggle('r42-registering',on);heading.hidden=!on;
 for(const n of [searchBox,help,controls])n.hidden=!on;
 if(on){map.scrollWheelZoom.enable();map.touchZoom.enable();map.doubleClickZoom.enable();map.dragging.enable();map.zoomControl.setPosition('topright');}else{setFull(false);map.scrollWheelZoom.disable();cancelSearch();addressRequest?.abort();locationVersion++;locate.disabled=false;status.textContent='';results.hidden=true;}
 requestAnimationFrame(()=>map.invalidateSize({pan:false}));
}
// Keep optional images in the existing JPEG-only bucket; the database schema is unchanged.
const photoLabel=el('label'),photoNote=el('p','notice'),photoInput=el('input'),photoPreview=el('img','r42-photo'),photoStatus=el('p'),removePhoto=button(resetPhoto);
photoInput.type='file';photoInput.id='registrationPhoto';photoInput.accept='image/jpeg,image/png,image/webp';photoLabel.htmlFor=photoInput.id;photoStatus.setAttribute('role','status');photoPreview.hidden=true;removePhoto.hidden=true;
form.querySelector('[data-i18n="mapPhotoLater"]').replaceWith(photoLabel,photoInput,photoNote,photoPreview,removePhoto,photoStatus);
let photoBlob=null,photoPromise=Promise.resolve(),photoVersion=0,photoURL='',uploadedURL='',photoPath='';
function resetPhoto(){if(R.sending)return;photoVersion++;photoBlob=null;uploadedURL='';photoPath='';photoInput.value='';photoInput.setCustomValidity('');photoPreview.hidden=true;removePhoto.hidden=true;photoStatus.textContent='';if(photoURL)URL.revokeObjectURL(photoURL);photoURL='';}
photoInput.onchange=()=>{
 const file=photoInput.files[0],version=++photoVersion;photoBlob=null;uploadedURL='';photoPath='';photoInput.setCustomValidity('');if(photoURL)URL.revokeObjectURL(photoURL);photoPreview.hidden=true;removePhoto.hidden=!file;if(!file)return;
 photoPromise=(async()=>{try{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('photo');
 const bitmap=await createImageBitmap(file),scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 let blob;for(const quality of [.82,.65,.45]){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<1048576)break;}
 if(!blob||blob.size>=1048576)throw Error('photo');if(version!==photoVersion)return;photoBlob=blob;photoURL=URL.createObjectURL(blob);photoPreview.src=photoURL;photoPreview.hidden=false;photoStatus.textContent=t('r42PhotoReady');
 }catch{if(version===photoVersion){photoInput.setCustomValidity(t('r42PhotoError'));photoStatus.textContent=t('r42PhotoError');}}})();
};
window.MUSUBU_REGISTRATION={async preparePhoto(){await photoPromise;if(!photoInput.files.length)return null;if(!photoBlob)throw Error('r42PhotoError');if(uploadedURL)return uploadedURL;photoInput.disabled=true;removePhoto.disabled=true;try{photoPath=photoPath||X.visitor+'/'+crypto.randomUUID()+'.jpg';const {error}=await X.db.storage.from('place-photos').upload(photoPath,photoBlob,{contentType:'image/jpeg',upsert:false});if(error&&String(error.statusCode)!=='409')throw Error('r42PhotoError');uploadedURL=X.db.storage.from('place-photos').getPublicUrl(photoPath).data.publicUrl;return uploadedURL;}finally{photoInput.disabled=false;removePhoto.disabled=false;}}};
form.addEventListener('reset',()=>{photoVersion++;photoBlob=null;uploadedURL='';photoPath='';photoInput.setCustomValidity('');photoPreview.hidden=true;removePhoto.hidden=true;photoStatus.textContent='';if(photoURL)URL.revokeObjectURL(photoURL);photoURL='';});
document.addEventListener('musubu:picking',()=>{mode();labels();});
document.addEventListener('musubu:draft-location',updateAddress);
document.addEventListener('musubu:draft-outside',()=>{status.textContent=t('mapOutside');});
document.addEventListener('musubu:draft-cleared',()=>{pointKey='';addressRequest?.abort();input.value='';refreshSummary();});
document.addEventListener('musubu:languagechange',()=>{cancelSearch();results.hidden=true;labels();});
document.addEventListener('musubu:regionchange',()=>{setFull(false);cancelSearch();input.value='';pointKey='';mode();});
document.addEventListener('musubu:screenchange',e=>{if(e.detail.screen!=='story'&&active){setFull(false);$('cancelPick').click();}});
document.addEventListener('musubu:browse-view',e=>{if(e.detail.view!=='story'&&active){setFull(false);$('cancelPick').click();}});
labels();mode();
})();
