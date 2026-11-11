/* Presentation only. The existing region, language and QR owners retain behavior. */
(() => {
 'use strict';
 document.addEventListener('DOMContentLoaded',()=>{
  const D=window.MUSUBU_DISCOVERY,X=window.MUSUBU_EXPLORE;
  const toggle=document.createElement('div');toggle.className='ux-map-toggle';
  for(const [key,on]of [['uxMap',true],['uxList',false]]){const b=document.createElement('button');b.type='button';b.dataset.i18n=key;b.onclick=()=>D.setMapMode(on);toggle.append(b);}
  const pane=document.getElementById('discoveryMapPane');
  const anchor=pane.previousSibling;
  if(anchor?.nodeType===8)anchor.before(toggle);else pane.before(toggle);
  const intro=document.createElement('p');intro.className='ux-new-intro';intro.dataset.i18n='uxNewIntro';document.querySelector('#discovery .p3-tabs').before(intro);
  function layout(){
   const view=document.body.dataset.browseView;
   toggle.hidden=view!=='story'||X.picking;intro.hidden=view!=='new';
   [...toggle.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(D.mapMode===(i===0))));
   window.MUSUBU_I18N.apply(toggle);intro.textContent=window.MUSUBU_I18N.t('uxNewIntro');
  }
  ['musubu:browse-view','musubu:map-mode','musubu:picking','musubu:languagechange'].forEach(event=>document.addEventListener(event,layout));layout();
  const I=window.MUSUBU_I18N,R=window.MUSUBU_REGION,top=document.querySelector('.hero-top');
  const controls=document.querySelector('.discovery-controls');
  const region=document.querySelector('.region-switch');
  const oldLanguage=controls.querySelector('.language-switch');
  const dialog=document.createElement('dialog');dialog.className='ux-settings';dialog.setAttribute('aria-labelledby','uxSettingsTitle');
  dialog.innerHTML='<div class="place-head"><h2 id="uxSettingsTitle" data-i18n="uxSettings"></h2><button type="button" data-i18n="mapClose"></button></div><h3 data-i18n="uxRegion"></h3><div class="ux-regions"></div><h3 data-i18n="uxLanguage"></h3><div class="ux-languages"></div>';
  dialog.querySelector('.ux-regions').append(region);
  for(const [code,label] of [['ko','한국어'],['ja','日本語']]){
   const b=document.createElement('button');b.type='button';b.dataset.language=code;b.lang=code;b.textContent=label;dialog.querySelector('.ux-languages').append(b);
  }
  oldLanguage.remove();document.body.append(dialog);
  const trigger=document.createElement('button');trigger.type='button';trigger.className='ux-settings-trigger';trigger.setAttribute('aria-haspopup','dialog');trigger.onclick=()=>dialog.showModal();
  dialog.querySelector('.place-head button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  const qr=document.querySelector('.qrbtn');qr.removeAttribute('data-i18n');qr.replaceChildren();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 13v4h-3v4h4M6 6h1v1H6zM17 6h1v1h-1zM6 17h1v1H6zM13 20h1"/>';qr.append(svg);controls.replaceChildren(qr,trigger);top.append(controls);
  function labels(){
   const name=window.MUSUBU_MAP_CONFIG.regions[R.current][I.lang==='ja'?'name_ja':'name_ko'];
   trigger.replaceChildren(window.MUSUBU_PHASE_ONE.icon('globe'));
   const text=document.createElement('span');text.textContent=name+' · '+(I.lang==='ja'?'日本語':I.lang==='ko'?'한국어':'English')+' ▾';trigger.append(text);trigger.setAttribute('aria-label',I.t('uxSettings'));qr.setAttribute('aria-label',I.t('qrButton'));I.apply(dialog);
  }
  ['musubu:languagechange','musubu:regionchange'].forEach(event=>document.addEventListener(event,labels));labels();
 });
})();
