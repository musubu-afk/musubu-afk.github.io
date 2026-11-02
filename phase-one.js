(() => {
'use strict';
const I=window.MUSUBU_I18N,t=(key,vars)=>I.t(key,vars);
const paths={pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z',story:'M12 20V6C8 3 5 3 2 4v14c4-1 7 0 10 2Zm0 0V6c4-3 7-3 10-2v14c-4-1-7 0-10 2Z',review:'M3 3h18v14H9l-6 4V3Z M7 9h1m4 0h1m4 0h1',coupon:'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Z M15 5v14'};
function icon(name){const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 24 24');n.setAttribute('class','musubu-outline-icon');n.setAttribute('aria-hidden','true');const p=document.createElementNS(n.namespaceURI,'path');p.setAttribute('d',paths[name]||paths.pin);n.append(p);return n;}
function stats(raw){const nums=String(raw).match(/\d+(?:\.\d+)?/g);return nums?.length>=2?t('phaseStats',{rating:nums[0],count:nums[1]}):t('phaseNoRating');}
function distance(raw){return String(raw).match(/\d+(?:\.\d+)?\s*km/i)?.[0].replace(/\s/g,'')||t('phaseDistancePending');}
window.MUSUBU_PHASE_ONE={icon,stats,distance};
document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),nav=document.createElement('nav');nav.className='phase-navigation';nav.setAttribute('aria-label',t('phaseMenu'));
 const entries=[['story','phaseStory','story'],['discover','phaseDiscover','pin'],['review','phaseReview','review'],['coupon','phaseCoupon','coupon']];let active='story';
 for(const [key,label,shape] of entries){const b=document.createElement('button');b.type='button';b.dataset.phaseMenu=key;const span=document.createElement('span');span.dataset.i18n=label;b.append(icon(shape),span);b.onclick=()=>{
   active=key;
   if(key==='story'||key==='discover'){window.MUSUBU_DISCOVERY.selectSource(key==='story'?'places':'shops');window.MUSUBU_SCREENS.go('story');}
   else window.MUSUBU_SCREENS.go(key==='coupon'?'shops':'review');
   active=key;paint();
 };nav.append(b);}
 document.querySelector('.hero').after(nav);
 function paint(){I.apply(nav);nav.setAttribute('aria-label',t('phaseMenu'));nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.phaseMenu===active?'page':'false'));document.querySelector('.brand').textContent='むすぶ · '+(window.MUSUBU_REGION.current==='fukuoka'?'FUKUOKA':'NONSAN')+' STORY TOUR';}
 // Only replace the top-level globe artwork; its existing language-dialog handler stays attached.
 const globe=document.querySelector('.hero-top .globe-button');if(globe)globe.replaceChildren(icon('globe'));
 document.addEventListener('musubu:languagechange',paint);document.addEventListener('musubu:regionchange',()=>{active=window.MUSUBU_DISCOVERY.source==='shops'?'discover':'story';paint();});
 document.addEventListener('musubu:screenchange',e=>{active=e.detail.screen==='shops'?'coupon':e.detail.screen==='review'?'review':window.MUSUBU_DISCOVERY.source==='shops'?'discover':'story';paint();});
 document.addEventListener('musubu:picking',e=>{active=e.detail.picking?'story':window.MUSUBU_DISCOVERY.source==='shops'?'discover':'story';paint();});
 document.addEventListener('musubu:discovery-source',e=>{active=e.detail.source==='shops'?'discover':'story';paint();});
 paint();
});
})();
