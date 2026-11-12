(() => {
'use strict';
const radians=x=>x*Math.PI/180;
function kilometres(a,b){const dlat=radians(b.latitude-a.latitude),dlon=radians(b.longitude-a.longitude);const q=Math.sin(dlat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dlon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,q))));}
let position=null,busy=false;
const I=window.MUSUBU_I18N,t=(k,v)=>I.t(k,v),root=document.createElement('div');root.className='location-tools';
const b=document.createElement('button');b.type='button';b.className='community-button';b.id='locateVisitor';const msg=document.createElement('p');msg.className='notice';msg.setAttribute('role','status');root.append(b,msg);document.querySelector('#discovery .discovery-filters').before(root);
let statusKey='locationPrivacy';function labels(){const story=document.body.dataset.browseView==='story';b.textContent=t(busy?'locationWorking':story?'uxCurrentLocation':position?'locationRefresh':'locationEnable');if(story)b.prepend(window.MUSUBU_PHASE_ONE.icon('pin'));msg.textContent=t(statusKey);root.dataset.status=statusKey;}
b.onclick=()=>{if(busy)return;if(!navigator.geolocation){statusKey='locationUnavailable';labels();return;}busy=true;b.disabled=true;statusKey='locationWorking';labels();navigator.geolocation.getCurrentPosition(result=>{position={latitude:result.coords.latitude,longitude:result.coords.longitude};busy=false;b.disabled=false;statusKey=result.coords.accuracy>1000?'locationApproximate':'locationReady';labels();document.dispatchEvent(new Event('musubu:locationchange'));},error=>{busy=false;b.disabled=false;statusKey=error.code===1?'locationDenied':'locationUnavailable';labels();},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});};
window.MUSUBU_LOCATION={kilometres,available(p){return !!position&&p.latitude!=null&&p.longitude!=null&&Number.isFinite(Number(p.latitude))&&Number.isFinite(Number(p.longitude))&&Math.abs(Number(p.latitude))<=90&&Math.abs(Number(p.longitude))<=180;},label(p){if(!position)return t('locationEnableHint');return t(p.shop_id?'locationDemoDistance':'locationDistance',{km:kilometres(position,p).toFixed(1)});}};
document.addEventListener('musubu:languagechange',labels);document.addEventListener('musubu:browse-view',labels);labels();document.dispatchEvent(new Event('musubu:locationchange'));
})();
