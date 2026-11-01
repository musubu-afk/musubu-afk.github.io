(() => {
'use strict';
const I=window.MUSUBU_I18N,X=window.MUSUBU_EXPLORE,t=(k,v)=>I.t(k,v),$=id=>document.getElementById(id);
const header=document.querySelector('.hero'),top=document.querySelector('.hero-top'),scene=document.createElement('div');scene.className='hero-scene';[...header.children].filter(n=>n!==top).forEach(n=>scene.append(n));header.append(scene);
const photo=document.createElement('img');photo.className='region-hero-photo';photo.id='regionHeroPhoto';photo.decoding='async';scene.prepend(photo);
const mark=document.createElement('img');mark.src='assets/musubu-sakura.svg';mark.alt='';mark.className='musubu-sakura';const identity=document.createElement('div');identity.className='musubu-identity';identity.append(mark,document.querySelector('.brand'));top.prepend(identity);
function hero(){const japan=window.MUSUBU_REGION.current==='fukuoka';photo.src=japan?'assets/ohori.png':'assets/tapjeongho.jpg';photo.alt=t(japan?'heroPhotoFukuoka':'heroPhotoNonsan');}
const reviewRoot=document.querySelector('.community-reviews'),heading=reviewRoot.querySelector('h2'),bar=document.createElement('div');bar.className='review-page-heading';heading.before(bar);bar.append(heading);
const write=document.createElement('button');write.type='button';write.className='community-button write-review';write.id='writePlaceReview';bar.append(write);
const form=$('placeReviewForm');form.hidden=true;
function revealForm(){form.hidden=false;if(!$('reviewPlace').value){$('reviewPlace').focus();return;}form.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('placeReviewText').focus({preventScroll:true});}
write.onclick=revealForm;
const detailWrite=document.createElement('button');detailWrite.type='button';detailWrite.className='community-button write-review';detailWrite.id='writeDetailReview';document.querySelector('#placeDialog .place-head').insertBefore(detailWrite,document.querySelector('[data-close-place]'));
detailWrite.onclick=()=>{$('communityActions').querySelector('button:last-child').click();revealForm();};
const shopWrite=document.createElement('button');shopWrite.type='button';shopWrite.className='community-button write-review';shopWrite.id='writeShopReview';$('closeDetail').before(shopWrite);shopWrite.onclick=()=>{$('reviewForm').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('reviewText').focus({preventScroll:true});};
const detailDistance=document.createElement('p');detailDistance.className='notice location-detail';$('placeDetailMeta').after(detailDistance);
const refImage=document.createElement('img'),refCaption=document.createElement('small');refImage.className='community-reference';refCaption.className='discovery-photo-note';$('communityStory').prepend(refImage,refCaption);
function updateDistance(){if(X.selected){const p=X.selected;detailDistance.textContent=window.MUSUBU_LOCATION.label(p);refImage.src=p.region==='fukuoka'?'assets/ohori.png':'assets/tapjeongho.jpg';refImage.alt=I.lang==='ja'?'地域の参考写真':I.lang==='en'?'Regional reference photo':'지역 참고 사진';refCaption.textContent=I.lang==='ja'?'地域の参考写真（この地点の実写ではありません）':I.lang==='en'?'Regional reference photo · not this exact spot':'지역 참고 사진 · 해당 지점의 실사진이 아닙니다';}}
function labels(){for(const b of [write,detailWrite,shopWrite])b.textContent='✎ '+t('writeReview');hero();updateDistance();}
document.addEventListener('musubu:place-detail',updateDistance);document.addEventListener('musubu:locationchange',updateDistance);document.addEventListener('musubu:languagechange',labels);document.addEventListener('musubu:regionchange',()=>{hero();form.hidden=true;});labels();
})();
