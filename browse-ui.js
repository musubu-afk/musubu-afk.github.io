/* Navigation presentation only. Existing screens, detail and data owners remain intact. */
(() => {
'use strict';
const I=window.MUSUBU_I18N,D=window.MUSUBU_DISCOVERY;
let view='home',navigating=false,back,title,registrationCategory=null, registrationOrigin=null,reviewParent='story';
const valid=v=>['home','story','new','discover','coupon','review','bookmarks'].includes(v);
function read(){const v=new URL(location.href).searchParams.get('view');return valid(v)?v:location.hash.includes('shops')||location.hash.includes('voucher')?'coupon':location.hash.includes('review')?'review':'home';}
function readReviewParent(){const p=new URL(location.href).searchParams.get('reviewFrom');return ['story','new','discover'].includes(p)?p:'story';}
function menuView(){return document.querySelector('#shopDialog[open] #shop-panel-reviews:not([hidden])')?'discover':view==='review'?reviewParent:view;}
function setReviewParent(){reviewParent=view==='new'||D.source==='new'?'new':'story';}
function paint(){document.body.dataset.browseView=view;if(!back)return;back.hidden=view==='home';back.setAttribute('aria-label',I.t('uiHome'));title.textContent=I.t(view==='bookmarks'?'uxBookmarks':view==='new'?'uxNew':view==='discover'?'uxShops':view==='coupon'?'phaseCoupon':view==='review'?'phaseReview':I.lang==='ko'?'uxNewAttractions':'phaseStory');document.querySelectorAll('[data-phase-menu]').forEach(b=>b.setAttribute('aria-current',b.dataset.phaseMenu===menuView()?'page':'false'));document.querySelector('.brand').textContent='MUSUBU';const reg=document.getElementById('browseRegister');if(reg){reg.hidden=!!window.MUSUBU_EXPLORE.picking||!['story','new','discover'].includes(view);reg.textContent=I.t(view==='discover'?'p3Suggest':'uxRegister');}document.dispatchEvent(new CustomEvent('musubu:browse-view',{detail:{view}}));}
function go(next,restore=false){if(!valid(next))return false;if(view==='review'&&next!=='review'&&!restore){const P=window.MUSUBU_REVIEW_PHOTOS;if(P&&!P.canLeave('placeReviewForm'))return false;P?.discard('placeReviewForm');}if(next==='review'&&view!=='review'&&!restore)setReviewParent();if(!restore)registrationOrigin=null;navigating=true;view=next;if(['story','discover','new','bookmarks'].includes(next))D.selectSource(next==='story'?'places':next==='new'?'new':next==='bookmarks'?'bookmarks':'shops');if(!restore)window.MUSUBU_SCREENS.go(next==='coupon'?'shops':next==='review'?'review':'story');const url=new URL(location.href);url.searchParams.set('view',view);if(view==='review')url.searchParams.set('reviewFrom',reviewParent);else url.searchParams.delete('reviewFrom');history.replaceState(history.state,'',url);navigating=false;paint();requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));}
window.MUSUBU_UI={go,menuView};
function leaveRegistration(){
 if(registrationOrigin && !window.MUSUBU_EXPLORE.registration.sending)history.back();
}
document.addEventListener('click',e=>{
 if(!registrationOrigin||!e.target.closest('#cancelPick,#closeRecommend'))return;
 e.preventDefault();e.stopPropagation();leaveRegistration();
},true);
window.addEventListener('popstate',()=>{
 if(!registrationOrigin)return;
 const origin=registrationOrigin;registrationOrigin=null;
 const dialog=document.getElementById('recommendDialog');
 if(dialog.open)dialog.close();
 document.getElementById('cancelPick').click();
 go(origin,true);
},true);
document.addEventListener('DOMContentLoaded',()=>{const bar=document.createElement('div');bar.className='browse-title';back=document.createElement('button');back.type='button';back.append(window.MUSUBU_PHASE_ONE.icon('back'));back.onclick=()=>registrationOrigin?leaveRegistration():go(view==='review'?reviewParent:'home');title=document.createElement('h1');bar.append(back,title);document.querySelector('.p3-search').before(bar);const brand=document.querySelector('.brand'),home=document.createElement('button');home.className='brand-home';home.type='button';brand.before(home);home.append(brand);home.onclick=()=>go('home');const qr=document.querySelector('.qrbtn');const qrArea=document.createElement('div');qrArea.className='browse-qr';qrArea.append(qr);document.querySelector('footer').before(qrArea);const reg=document.createElement('button');reg.id='browseRegister';reg.className='p3-button';reg.type='button';reg.onclick=()=>{const shop=view==='discover';registrationOrigin=view;history.pushState({registration:true},'');go('story',true);document.getElementById('registerPlaces').click();registrationCategory=shop?'meal':null;};document.getElementById('recommendForm').addEventListener('reset',()=>{if(!registrationCategory)return;const category=registrationCategory;registrationCategory=null;queueMicrotask(()=>{document.getElementById('placeCategory').value=category;});});document.addEventListener('musubu:draft-cleared',()=>registrationCategory=null);bar.append(reg);view=read();reviewParent=readReviewParent();go(view,true);});
document.addEventListener('musubu:navigate',e=>{if(!navigating){if(e.detail.screen==='review'&&view!=='review')setReviewParent();view=e.detail.screen==='shops'?'coupon':e.detail.screen==='review'?'review':D.source==='bookmarks'?'bookmarks':D.source==='new'?'new':D.source==='shops'?'discover':'story';const u=new URL(location.href);u.searchParams.set('view',view);if(view==='review')u.searchParams.set('reviewFrom',reviewParent);else u.searchParams.delete('reviewFrom');history.replaceState(history.state,'',u);paint();}});
document.addEventListener('musubu:screenchange',e=>{if(navigating||!back)return;const wanted=e.detail.screen==='shops'?'coupon':e.detail.screen==='review'?'review':D.source==='bookmarks'?'bookmarks':D.source==='new'?'new':D.source==='shops'?'discover':'story';if(e.detail.screen!== 'story'||view!=='home')view=wanted;paint();});
window.addEventListener('popstate',()=>{view=read();reviewParent=readReviewParent();if(['story','discover','new','bookmarks'].includes(view)){navigating=true;D.selectSource(view==='story'?'places':view==='new'?'new':view==='bookmarks'?'bookmarks':'shops');navigating=false;}paint();});
document.addEventListener('musubu:languagechange',paint);
document.addEventListener('musubu:regionchange',()=>{view=read();reviewParent=readReviewParent();paint();});
document.addEventListener('musubu:picking',e=>{if(!e.detail.picking && !history.state?.registration)registrationOrigin=null;paint();});
document.addEventListener('musubu:reward-earned',()=>{if(registrationOrigin && history.state?.registration)history.back();});
})();

