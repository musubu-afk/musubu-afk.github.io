(() => {
'use strict';
const I=window.MUSUBU_I18N,X=window.MUSUBU_EXPLORE,A=window.MUSUBU_SHOP_APP,U=window.MUSUBU_PHASE_ONE,$=id=>document.getElementById(id),t=(k,v)=>I.t(k,v);
const make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text)e.textContent=text;return e;};
let stats=[];
function icon(kind){if(kind==='pin')return U.icon('pin');const s=U.icon('pin');s.querySelector('path').setAttribute('d',kind==='share'?'M12 16V3m-4 4 4-4 4 4M5 11H3v10h18V11h-2':'m21 3-7 18-4-7-7-4 18-7Zm0 0L10 14');return s;}
function managementIcon(kind){
 const svg=U.icon('pin');
 svg.querySelector('path').setAttribute('d',kind==='edit'?'M4 16 16 4l4 4L8 20l-5 1z M14 6l4 4':'M3 6h18 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7');
 return svg;
}
function button(key,fn,shape){const b=make('button','p2-button');b.type='button';b.dataset.p2label=key;if(shape)b.append(icon(shape));b.append(make('span','',t(key)));b.setAttribute('aria-label',t(key));b.onclick=fn;return b;}
function photos(p){const story=p.story_key&&$('story-'+p.story_key);return [...new Set([p.image_url,p.photo_url,...(Array.isArray(p.photos)?p.photos.filter(x=>typeof x==='string'):[]),...(story?[...story.querySelectorAll('img')].map(x=>x.getAttribute('src')):[])].filter(x=>typeof x==='string'&&/^(https?:\/\/|assets\/)/.test(x)))];}
/* Individual photo attribution for KOGL type 1 public works. */
const placePhotoCredits=new Map([["https://devin.aks.ac.kr/image/90948966-f1fd-477a-9633-0cba2c6b29d0?preset=orig",{"title":"논산 관촉사 석등 후측면","source":"https://encykorea.aks.ac.kr/Article/E0005025"}],["https://devin.aks.ac.kr/image/f0630c16-4390-41df-9057-81cd46c51f8c?preset=orig",{"title":"논산 개태사 전경","source":"https://encykorea.aks.ac.kr/Article/E0001741"}],["https://devin.aks.ac.kr/image/41d7931f-93fb-41a3-8c56-272ec8f92713?preset=orig",{"title":"논산 쌍계사 대웅전 정측면","source":"https://encykorea.aks.ac.kr/Article/E0034081"}]]);
function setPlacePhotoCredit(node,src){const credit=placePhotoCredits.get(src);node.hidden=!credit;if(!credit){node.replaceChildren();return;}const link=make('a');link.href=credit.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='['+credit.title+'] 한국민족문화대백과사전 (한국학중앙연구원 · 공공누리 제1유형)';link.style.color='inherit';node.replaceChildren(link);}
function category(p){return (p.shop_id||window.MUSUBU_PHASE_THREE_MODEL.business(p))?'phase'+({meal:'Meal',dessert:'Dessert',gift:'Gift',stay:'Stay'}[p.category]||'Discover'):p.story_key==='donam'?'phaseHistory':['walk','photo'].includes(p.category)?'phaseWalk':['scenery','rest'].includes(p.category)?'phaseNature':'phaseExperience';}
const viewer=make('dialog','p2-viewer');const close=button('mapClose',()=>viewer.close());const full=make('img');viewer.append(close,full);document.body.append(viewer);
function viewPhotos(pics,name){viewer.querySelectorAll('img').forEach(n=>n.remove());for(const src of pics){const im=make('img');im.src=src;im.alt=name;viewer.append(im);}viewer.showModal();}
function viewPhoto(src,name){viewPhotos([src],name);}
class Detail {
 constructor(shop){this.shop=shop;this.dialog=$(shop?'shopDialog':'placeDialog');this.scroll=this.dialog.querySelector(shop?'.sheet-scroll':'.place-scroll');this.nativeHeart=$(shop?'shopHeart':'detailLike');this.title=$(shop?'detailName':'placeDetailTitle');this.dialog.classList.add('p2-dialog');
 const old=[...this.scroll.children];this.more=make('details','p2-more');this.moreTitle=make('summary');this.more.append(this.moreTitle);old.forEach(n=>this.more.append(n));
 this.root=make('section','p2-detail');this.hero=make('img','p2-hero');this.noPhoto=make('div','p2-no-photo');this.heading=make('div','p2-title');this.topHeart=button('favoriteAdd',()=>this.nativeHeart.click());this.heading.append(this.title,this.topHeart);this.chips=make('div','p2-chips');this.meta=make('div','p2-meta');this.rating=make('span');this.dist=make('span','p2-distance');this.meta.append(this.rating,this.dist);this.intro=make('p','p2-intro');this.expand=button('p2More',()=>{this.more.open=true;this.more.scrollIntoView({block:'start',behavior:'smooth'});});
 this.actions=make('div','p2-actions');this.map=button('p2Map',()=>this.showMap(),'pin');this.directions=make('a','p2-button');this.directions.target='_blank';this.directions.rel='noopener noreferrer';this.directions.append(icon('route'),make('span'));this.share=button('p2Share',()=>this.sharePlace(),'share');this.actions.append(this.map,this.directions,this.share);this.status=make('p','p2-status');this.status.setAttribute('role','status');
 this.gallery=make('section','p2-gallery');this.galleryHeading=make('h3');this.thumbs=make('div','p2-thumbs');this.galleryAll=button('p2AllPhotos',()=>viewPhotos(photos(this.p),this.name));const galleryHead=make('div','p2-gallery-head');galleryHead.append(this.galleryHeading,this.galleryAll);this.gallery.append(galleryHead,this.thumbs);
 this.reviews=make('section','p2-recent');this.preview=this.more.querySelector('.review-preview');this.empty=make('p','notice');this.emptyTitle=make('h3');this.all=button('allReviews',()=>this.showReviews());this.reviews.append(this.emptyTitle,this.empty,this.preview,this.all);
 this.bottom=make('div','p2-bottom');this.bottomHeart=button('favoriteAdd',()=>this.nativeHeart.click());this.bottom.append(this.bottomHeart,button('p2Reviews',()=>this.showReviews()));
 this.root.append(this.hero,this.noPhoto,this.heading,this.chips,this.meta,this.intro,this.expand,this.actions,this.status,this.gallery,this.reviews,this.bottom);this.scroll.append(this.root,this.more);
 if(!shop){
  this.photoCredit=make('small','place-photo-credit');this.photoCredit.hidden=true;this.photoCredit.style.cssText='display:block;font-size:11px;line-height:1.5;color:#54675d;margin:5px 0;text-align:right;overflow-wrap:anywhere';this.gallery.append(this.photoCredit);
  this.players=new Map();
  this.audioSlot=make('div','detail-audio');this.intro.after(this.audioSlot);
  for(const article of $('officialStories').querySelectorAll('.destination-story')){
   const player=article.querySelector('.audioBox');
   if(player?.querySelector('audio[src]'))this.players.set(article.id,player);
  }
  this.manage=make('section','place-management');
  const editPlace=$('communityActions').querySelector('button');
  this.edit=button('editPlace',()=>editPlace.click());
  this.edit.prepend(managementIcon('edit'));
  const deletion=this.more.querySelector('.delete-request');
  const summary=deletion.querySelector('summary');
  const label=make('span');
  label.dataset.i18n=summary.dataset.i18n;
  label.textContent=t(label.dataset.i18n);
  delete summary.dataset.i18n;
  summary.replaceChildren(managementIcon('delete'),label);
  this.manage.append(this.edit,deletion);
  this.more.hidden=true;
  this.more.after(this.manage);
 }
 this.topHeart.classList.add('ux-bookmark');this.expand.remove();this.all.remove();this.bottom.remove();
 if(shop)this.setupShopTabs();this.nativeHeart.classList.add('p2-original-heart');
 new MutationObserver(()=>this.syncHeart()).observe(this.nativeHeart,{attributes:true,childList:true,subtree:true});
 new MutationObserver(()=>this.updateStats()).observe(this.preview,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true});
 this.dialog.addEventListener('close',()=>{this.more.open=false;this.audioSlot?.querySelector('audio')?.pause();if(this.shop){this.selectShopTab('info');$('reviewForm').hidden=true;}});
 }
 setupShopTabs(){
 const content=this.more.querySelector('.detail-content'),info=$('detailAddress').parentElement,menu=$('detailProducts'),menuTitle=menu.previousElementSibling,review=$('detailReviews'),demo=content.querySelector('[data-i18n=linksNotice]');
 this.shopDemo=demo;demo.classList.add('p2-business-notice','p2-shop-demo');demo.removeAttribute('data-i18n');this.intro.after(demo);
 this.shopHeartStatus=$('shopHeartStatus');this.heading.after(this.shopHeartStatus);
 this.more.hidden=true;this.gallery.remove();this.reviews.remove();
 this.shopTabs=make('div','p2-shop-tabs');this.shopTabs.setAttribute('role','tablist');
 this.shopPanels={};this.shopTabButtons={};
 for(const [key,label] of [['info','p2ShopTabInfo'],['menu','p2ShopTabMenu'],['reviews','p2ShopTabReviews']]){
  const tab=button(label,()=>this.selectShopTab(key));tab.id='shop-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','shop-panel-'+key);this.shopTabs.append(tab);this.shopTabButtons[key]=tab;
  const panel=make('section','p2-shop-panel');panel.id='shop-panel-'+key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);this.shopPanels[key]=panel;
  tab.addEventListener('keydown',e=>{const keys=Object.keys(this.shopTabButtons),i=keys.indexOf(key);let next;if(e.key==='ArrowRight')next=keys[(i+1)%keys.length];else if(e.key==='ArrowLeft')next=keys[(i+keys.length-1)%keys.length];else if(e.key==='Home')next=keys[0];else if(e.key==='End')next=keys[keys.length-1];else return;e.preventDefault();this.selectShopTab(next);this.shopTabButtons[next].focus();});
 }
 // Mount all tab panels before moving ID-addressable nodes out of the original dialog.
 this.root.append(this.shopTabs,...Object.values(this.shopPanels));
 const infoPaths={address:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',hours:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',phone:'M5 3h4l2 5-3 2c2 4 4 6 8 8l2-3 5 2v4c-1 2-4 2-7 1C8 19 3 13 2 6 2 4 3 3 5 3Z'};
 for(const dt of info.querySelectorAll('dt')){
  const key=dt.dataset.i18n, label=make('span');label.dataset.i18n=key;label.textContent=t(key);delete dt.dataset.i18n;
  const svg=U.icon('pin');svg.querySelector('path').setAttribute('d',infoPaths[key]||infoPaths.address);dt.replaceChildren(svg,label);
 }
 this.copyAddress=button('p2CopyAddress',async()=>{try{await navigator.clipboard.writeText($('detailAddress').textContent);this.copyStatus.textContent=t('p2AddressCopied');}catch{this.copyStatus.textContent=t('p2CopyManual')+' '+$('detailAddress').textContent;}});
 this.copyStatus=make('p','p2-status');this.copyStatus.setAttribute('role','status');
 const official=$('officialLink');official.classList.add('p2-shop-official');
 this.shopPanels.info.append(info,this.copyAddress,this.copyStatus,$('stayInfo'),$('stayDemo'),official,this.gallery);$('closeDetail').replaceChildren(U.icon('close'));
 this.menuEmpty=make('p','notice');this.menuEmpty.dataset.i18n='p2MenuEmpty';this.shopPanels.menu.append(menuTitle,menu,this.menuEmpty);
 this.preview.hidden=true;this.preview.classList.add('p2-shop-obsolete-preview');
 const fullHeading=$('reviewList').previousElementSibling;if(fullHeading?.dataset.i18n==='allReviews')fullHeading.hidden=true;
 this.reviewNotice=review.querySelector('[data-i18n=reviewsNotice]');const notes=make('details','p2-shop-review-note'),noteTitle=make('summary');noteTitle.dataset.i18n='p2ReviewCriteria';notes.append(noteTitle,this.reviewNotice);review.querySelector('.review-heading').after(notes);
 this.shopPanels.reviews.append(review);$('reviewForm').hidden=true;
 this.selectShopTab('info');
 I.apply(this.root);
 }
 selectShopTab(key){if(!this.shopPanels?.[key])return;this.shopActiveTab=key;for(const [id,panel] of Object.entries(this.shopPanels)){const active=id===key;panel.hidden=!active;const tab=this.shopTabButtons[id];tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}}
 openShopReviewForm(){this.selectShopTab('reviews');$('reviewForm').hidden=false;}
 renderShopTabs(p,v){
 this.shopDemo.hidden=!p.is_demo;this.shopDemo.textContent=t('p2DemoInfo');
 const note=$('detailPhotoNote');if(note)this.hero.after(note);
 this.copyAddress.hidden=!v.address||p.is_demo;this.copyStatus.textContent='';
 for(const id of ['detailAddress','detailPhone']){const n=$(id);n.hidden=n.previousElementSibling.hidden=!n.textContent.trim();}
 const hours=$('detailHours');hours.hidden=hours.previousElementSibling.hidden=p.category==='stay'||!hours.textContent.trim();
 const menu=$('detailProducts'),showMenu=p.category!=='stay'&&menu.children.length>0;menu.hidden=menu.previousElementSibling.hidden=!showMenu;this.menuEmpty.hidden=showMenu;this.menuEmpty.textContent=t('p2MenuEmpty');
 this.gallery.hidden=photos(p).length<2;this.shopTabs.setAttribute('aria-label',t('p2ShopTabInfo'));I.apply(this.root);
 }
 syncHeart(){const on=this.nativeHeart.getAttribute('aria-pressed')==='true';for(const b of [this.topHeart,this.bottomHeart]){b.disabled=this.nativeHeart.disabled;b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',t(on?'favoriteSaved':'favoriteAdd'));b.replaceChildren(U.icon('bookmark'));if(b!==this.topHeart)b.append(document.createTextNode(t(on?'favoriteSaved':'favoriteAdd')));}}
 showReviews(){if(this.shop){this.selectShopTab('reviews');$('detailReviews').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('reviewsHeading').focus({preventScroll:true});}else $('communityActions').querySelector('button:last-child').click();}
 updateStats(){if(!this.p)return;const rows=stats.filter(r=>r.place_id===this.p.id);const raw=this.shop?A.summary(this.p.shop_id):rows.length?t('stats',{rating:(rows.reduce((n,r)=>n+Number(r.rating),0)/rows.length).toFixed(1),count:rows.length}):this.preview.querySelector('.review-preview-stats').textContent;this.rating.textContent=U.stats(raw);this.rating.title=raw;if(!this.shop)this.rating.hidden=!rows.length&&(!raw||this.preview.hidden);this.empty.hidden=this.emptyTitle.hidden=!this.preview.hidden;}
 render(p){this.p=p;const v=this.shop?I.shopView(p):X.view(p);this.name=v.name;this.status.textContent='';this.moreTitle.textContent=t(this.shop?'p2ShopInfo':'p2StoryInfo');this.root.querySelectorAll('[data-p2label]').forEach(b=>{const label=t(b.dataset.p2label);const s=b.querySelector('span');if(s)s.textContent=label;b.setAttribute('aria-label',label);});this.directions.querySelector('span').textContent=t('p2Directions');this.directions.setAttribute('aria-label',t('p2Directions'));this.directions.href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.latitude+','+p.longitude);this.directions.title=t(this.shop?'p2DemoRoute':'p2Directions');
 if(!this.shop){
  const player=this.players.get('story-'+p.story_key);
  if(this.audioSlot.firstChild!==player){this.audioSlot.querySelector('audio')?.pause();this.audioSlot.replaceChildren(...(player?[player]:[]));}
  this.audioSlot.hidden=!player;
  const editLabel=I.lang==='ja'?'スポット情報を編集':'장소 정보 수정';
  this.edit.querySelector('span').textContent=editLabel;
  this.edit.setAttribute('aria-label',editLabel);
 }
 const pics=photos(p);if(this.photoCredit)setPlacePhotoCredit(this.photoCredit,pics[0]);this.galleryAll.hidden=!pics.length;this.hero.hidden=!pics.length;this.noPhoto.hidden=!!pics.length;this.noPhoto.textContent=t('discoverNoPhoto');if(pics.length){this.hero.src=pics[0];this.hero.alt=v.name;this.hero.onerror=()=>{this.hero.hidden=true;this.noPhoto.hidden=false;};}
 this.chips.replaceChildren(make('span','',t(category(p))));if(this.shop||window.MUSUBU_PHASE_THREE_MODEL.business(p))this.chips.append(make('span','',t(window.MUSUBU_PHASE_THREE_MODEL.origin(p))));if(p.is_demo)this.chips.append(make('span','',t('phaseDemoShop')));else if(p.is_example)this.chips.append(make('span','',t('phaseDemo')));
 const raw=window.MUSUBU_LOCATION.label(p);this.dist.replaceChildren(U.icon('pin'),document.createTextNode(U.distance(raw)));this.dist.title=raw;this.dist.setAttribute('aria-label',raw);
 const story=p.story_key&&$('story-'+p.story_key);this.intro.textContent=this.shop?v.description:(story?.querySelector('p')?.textContent||v.reason||'');this.galleryHeading.textContent=t('p2Photos')+' ('+pics.length+')';this.thumbs.replaceChildren();for(const src of pics){const b=button('p2PhotoOpen',()=>viewPhoto(src,v.name));b.replaceChildren();const im=make('img');im.src=src;im.alt=v.name;im.loading='lazy';b.append(im);this.thumbs.append(b);}if(!pics.length)this.thumbs.append(make('p','notice',t('discoverNoPhoto')));
 this.emptyTitle.textContent=t('recentReviews');this.empty.textContent=t('p2NoReviews');if(this.shop)this.renderShopTabs(p,v);this.syncHeart();this.updateStats();
 }
 showMap(){const p=this.p;this.dialog.close();window.MUSUBU_DISCOVERY.selectSource(this.shop?'shops':'places');window.MUSUBU_SCREENS.go('story');document.querySelector('#discovery .text-button').click();if(this.shop){X.map?.panTo([p.latitude,p.longitude]);X.map?.eachLayer(layer=>{const ll=layer.getLatLng?.();if(ll&&Math.abs(ll.lat-p.latitude)<1e-7&&Math.abs(ll.lng-p.longitude)<1e-7)layer.openPopup?.();});}else X.choose(p);const back=$('mapBrowseBack'),original=back.onclick;back.textContent='‹ '+t('p2BackDetail');back.onclick=()=>{back.onclick=original;this.shop?A.openShop(p):X.openDetail();};}
 async sharePlace(){const url=new URL(location.href);url.searchParams.set('region',this.p.region);url.searchParams.set('lang',I.lang);url.searchParams.delete('place');url.searchParams.delete('shop');url.searchParams.set(this.shop?'shop':'place',this.shop?this.p.shop_id:this.p.id);url.hash='story';try{if(navigator.share)await navigator.share({title:this.name,text:this.name,url:url.href});else{await navigator.clipboard.writeText(url.href);this.status.textContent=t('p2Copied');}}catch(e){if(e.name==='AbortError')return;this.status.replaceChildren(make('span','',t('p2CopyManual')));const input=make('input');input.value=url.href;input.readOnly=true;input.setAttribute('aria-label',t('p2Share'));this.status.append(input);input.select();}}
}
const place=new Detail(false),shop=new Detail(true);
function shopGlobe(){document.querySelectorAll('#shopDialog .globe-button,#placeDialog .globe-button').forEach(globe=>globe.replaceChildren(U.icon('globe')));document.querySelector('.hero .musubu-sakura')?.remove();}
document.addEventListener('DOMContentLoaded',shopGlobe);shopGlobe();
$('writeShopReview').addEventListener('click',()=>shop.openShopReviewForm(),true);
$('showReviews').addEventListener('click',()=>shop.selectShopTab('reviews'),true);
$('openReview').addEventListener('click',()=>{if($('shopDialog').open)shop.openShopReviewForm();});
function refresh(){if(place.p)place.render(place.p);if(shop.p)shop.render(shop.p);close.querySelector('span').textContent=t('mapClose');close.setAttribute('aria-label',t('mapClose'));}
document.addEventListener('musubu:place-detail',e=>queueMicrotask(()=>place.render(e.detail.place)));
document.addEventListener('musubu:shop-detail',e=>queueMicrotask(()=>shop.render(e.detail.shop)));
document.addEventListener('musubu:preview-stats',e=>{stats=e.detail.rows;place.updateStats();});
document.addEventListener('musubu:shop-stats',()=>shop.updateStats());
document.addEventListener('musubu:languagechange',()=>queueMicrotask(refresh));document.addEventListener('musubu:locationchange',refresh);
let sharedOpened=false;function openShared(){if(sharedOpened)return;const q=new URLSearchParams(location.search),sid=q.get('shop'),pid=q.get('place');const s=sid&&window.MUSUBU_SHOPS.find(p=>p.shop_id===sid&&p.region===window.MUSUBU_REGION.current),p=pid&&X.places.find(p=>p.id===pid&&p.region===window.MUSUBU_REGION.current);if(s||p){sharedOpened=true;if(s)A.openShop(s);else {X.choose(p,false);X.openDetail();}}}document.addEventListener('musubu:places-loaded',openShared);document.addEventListener('DOMContentLoaded',openShared);
})();
