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
function photos(p){if(p.region==='nonsan'&&p.kind==='official'&&Array.isArray(p.photos)&&p.photos.length&&p.photos.every(x=>Object.hasOwn(licensedPhotoCredits,x)))return [...new Set(p.photos)];const story=p.story_key&&$('story-'+p.story_key);return [...new Set([p.image_url,p.photo_url,...(Array.isArray(p.photos)?p.photos.filter(x=>typeof x==='string'):[]),...(story?[...story.querySelectorAll('img')].map(x=>x.getAttribute('src')):[])].filter(x=>typeof x==='string'&&/^(https?:\/\/|assets\/)/.test(x)))];}
/* Individual photo attribution for KOGL type 1 public works. */
const placePhotoCredits=new Map([["https://devin.aks.ac.kr/image/90948966-f1fd-477a-9633-0cba2c6b29d0?preset=orig",{"title":"논산 관촉사 석등 후측면","source":"https://encykorea.aks.ac.kr/Article/E0005025"}],["https://devin.aks.ac.kr/image/f0630c16-4390-41df-9057-81cd46c51f8c?preset=orig",{"title":"논산 개태사 전경","source":"https://encykorea.aks.ac.kr/Article/E0001741"}],["https://devin.aks.ac.kr/image/41d7931f-93fb-41a3-8c56-272ec8f92713?preset=orig",{"title":"논산 쌍계사 대웅전 정측면","source":"https://encykorea.aks.ac.kr/Article/E0034081"}]]);
const licensedPhotoCredits={"assets/donam-seowon.jpg":{"title":"Donam Seowon","author":"Ryuch","license":"CC BY-SA 3.0","source":"https://commons.wikimedia.org/wiki/File:Donam_Seowon.jpg","licenseLinks":[["CC BY-SA 3.0","https://creativecommons.org/licenses/by-sa/3.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/0/05/Donam_Seowon.jpg","original_sha256":"02ecfdd4c265582d4fffcbee73202a1862594020773c66dfdf0981f6d8cbb928","published_sha256":"91e13f20651e776eee753984886a082da7c96d3286986c925c6e0018c34e4161","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/map-thumbs/donam-seowon.webp":{"title":"Donam Seowon","author":"Ryuch","license":"CC BY-SA 3.0","source":"https://commons.wikimedia.org/wiki/File:Donam_Seowon.jpg","licenseLinks":[["CC BY-SA 3.0","https://creativecommons.org/licenses/by-sa/3.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/0/05/Donam_Seowon.jpg","original_sha256":"02ecfdd4c265582d4fffcbee73202a1862594020773c66dfdf0981f6d8cbb928","published_sha256":"e934162617a04bda91cd10846ff9c7102a1e5860881a5c8842b64e400faa2abe","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/tapjeongho.jpg":{"title":"탑정호 출렁다리 (1)","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/kor/html/sub03/030106.html?mode=V&no=7f45afe4be1f1c0567a369ebaa079146","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/kor/html/sub03/030106.html?mode=D&no=7f45afe4be1f1c0567a369ebaa079146&file_id=187983&dlgt=N","original_sha256":"e9ff40b5a6f4acd43fdd7a44788508dd1d05564f04098ef934020bfe2446d14e","published_sha256":"a6ac29a298835396f316fee527e2f4a3ce394a19e9c266c2d116557423b0eb05","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/map-thumbs/tapjeongho.webp":{"title":"탑정호 출렁다리 (1)","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/kor/html/sub03/030106.html?mode=V&no=7f45afe4be1f1c0567a369ebaa079146","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/kor/html/sub03/030106.html?mode=D&no=7f45afe4be1f1c0567a369ebaa079146&file_id=187983&dlgt=N","original_sha256":"e9ff40b5a6f4acd43fdd7a44788508dd1d05564f04098ef934020bfe2446d14e","published_sha256":"76987ca8b9ca85094b4a4584a7e2162107ad51b03f5e5ba3968075bacc9d099e","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/gaetaesa-1.jpg":{"title":"철확","author":"Trainholic","license":"CC BY-SA 4.0","source":"https://commons.wikimedia.org/wiki/File:Iron_Pot_of_Gaetaesa_Temple.jpg","licenseLinks":[["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/c/c6/Iron_Pot_of_Gaetaesa_Temple.jpg","original_sha256":"c5904bf78adf1e7905152a65a4b7549aaf31e9f88a9bdac7e2cca3810904fd4e","published_sha256":"0002d891ee6965e470aaa6b5876eb0ce9a234b98976408ec99b8b02a8d9d0c28","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/gwanchoksa-1.jpg":{"title":"미륵보살입상과 석등","author":"G41rn8","license":"CC BY-SA 4.0","source":"https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Maitreya_IMG_20160928_034411.jpg","licenseLinks":[["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/e/ec/Gwanchoksa_-_Maitreya_IMG_20160928_034411.jpg","original_sha256":"a4c5826513829a5ec38829a6b67c870090b3f8b79758a04af4a60641838345ac","published_sha256":"9f495d2a69b510eeceb80bd620e5714dec5b08cef2cfb32c04d14715ce6f362f","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/gwanchoksa-2.jpg":{"title":"대웅전","author":"G41rn8","license":"CC BY-SA 4.0","source":"https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Main_Hall_IMG_20160928_033251.jpg","licenseLinks":[["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/d/d5/Gwanchoksa_-_Main_Hall_IMG_20160928_033251.jpg","original_sha256":"2256a0b0fdb81d9f5cfe89fafb6dd34fe02b4493bcd02f2bc9fca2b9be0e1406","published_sha256":"7c010cc951940d85e7a89596b0976c2f891a7f1c38e2c83f21ddf4709a2bedd9","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/gwanchoksa-3.jpg":{"title":"사찰 마당","author":"G41rn8","license":"CC BY-SA 4.0","source":"https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Courtyard_IMG_20160928_035626.jpg","licenseLinks":[["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/4/48/Gwanchoksa_-_Courtyard_IMG_20160928_035626.jpg","original_sha256":"ce38ac0861f33937184e95ec47d340b35624aba1cd059f6ea1e9fe2e46c68d47","published_sha256":"4e1ab6c13d2d7ebf6d579e9029a00558fe37d7df186333084f7792226b6d25c8","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/onbit-forest-1.jpg":{"title":"온빛 자연 휴양림 전경 1","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&group_at=media_sub0301","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&file_id=127275&dlgt=N","original_sha256":"b75a042a24b046c775bef9bcfd676b1029e78b77af9a7b1b1d5e1b6ffa4535de","published_sha256":"27c4420dc7b9dab4a87c750356465af6a7941fd394a1b2d1a2907cca4b0623a3","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/onbit-forest-2.jpg":{"title":"온빛 자연 휴양림 전경 2","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&group_at=media_sub0301","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&file_id=127276&dlgt=N","original_sha256":"5ba0a2f74607959940f2e5fae49acf5889eb113b3f93e5a541c3f7eaa328fb99","published_sha256":"e4ff121a1f6c6a8e3ac52e512eedaecc6eb1422b9c436835409b40e7bd2b4230","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/onbit-forest-3.jpg":{"title":"온빛 자연 휴양림 전경 3","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&group_at=media_sub0301","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&file_id=127277&dlgt=N","original_sha256":"c9f4ff132a49828d906cc361398ed8f0b6f6a7cb834b7b90ad9b47c48fe16c7c","published_sha256":"b00c7dae6274d0f4298a8368a918ff5d827b94ac2ab2eb49adddb415026b1044","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/ssanggyesa-1.jpg":{"title":"대웅전 측면","author":"문화재청","license":"공공누리 제1유형 / CC BY-SA 4.0","source":"https://commons.wikimedia.org/wiki/File:%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_01.jpg","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"],["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/2/22/%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_01.jpg","original_sha256":"c8bd72297a459deca2dc9a89629fd9b16e9e0c33b97f5ae9702edb84c1e479df","published_sha256":"33d4d5353c8548dd64f34a02fa34b906ef0ab8379c7b788aafadda3b2be756a0","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/ssanggyesa-2.jpg":{"title":"대웅전 내부 목조 장식","author":"문화재청","license":"공공누리 제1유형 / CC BY-SA 4.0","source":"https://commons.wikimedia.org/wiki/File:%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_02.jpg","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"],["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"]],"original":"https://upload.wikimedia.org/wikipedia/commons/d/d5/%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_02.jpg","original_sha256":"c5cc97c94f5f61c0a2c9279236b48792ece3cf90de63de9e6e7bd3bae3917639","published_sha256":"3d41ff154b6eed84a250dbbae6f591717b1840d2c7f03df4d6298ba247228230","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/ssanggyesa-3.jpg":{"title":"대웅전 꽃무늬 문살","author":"국가유산청 국가유산포털","license":"공공누리 제1유형","source":"https://www.heritage.go.kr/heri/cul/imgHeritage.do?ccimId=1617755&ccbaKdcd=12&ccbaAsno=0004080000000&ccbaCtcd=34","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.heritage.go.kr/unisearch/images/treasure/1617755.jpg","original_sha256":"46a9ec5ab6d4e921757ee7eabdd8dd3645fff340a4a0d21ffeb4a113cd688b26","published_sha256":"7d9d0103dad1c6513ba5fb858f152373538733aee56e21b2f6e85f39345d26f6","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/sunshine-land-1.jpg":{"title":"선샤인 랜드 풍경 2","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&group_at=media_sub0301","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&file_id=132996&dlgt=N","original_sha256":"f58deffe2a35fa072201b72c253d13721ffd57ad6b824336b3f66a9039a013c4","published_sha256":"929a00ed70ef2e0421638f24963e4ee480aaae70d5b2abfd3b2d639c4ec31a6f","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/sunshine-land-2.jpg":{"title":"선샤인 랜드 풍경 1","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&group_at=media_sub0301","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&file_id=132995&dlgt=N","original_sha256":"73686e132ca77e19949bd828d6fe8136b70a4c36e4c0b3234a48f15d5889a1d4","published_sha256":"24a286ba87c2449550a7743ef4ccab26e5de8e7b7b99ec7eadead782765e9143","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/sunshine-land-3.jpg":{"title":"선샤인 랜드 풍경 3","author":"논산시청","license":"공공누리 제1유형","source":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&group_at=media_sub0301","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&file_id=132997&dlgt=N","original_sha256":"b8a575882892c6396b315804a2c63deae10454e169517d11f21284d209f7ad20","published_sha256":"883f0330e6a1cb99eae82dfc47cb05009f87ce990778df5e56a08e4b2ddaad76","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."},"assets/nonsan-photos/gyeonhwon-tomb-1.jpg":{"title":"전 견훤묘","author":"한국학중앙연구원·김연삼","license":"공공누리 제1유형","source":"https://commons.wikimedia.org/wiki/File:%EC%A0%84_%EA%B2%AC%ED%9B%A4%EB%AC%98.jpg","licenseLinks":[["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"]],"original":"https://upload.wikimedia.org/wikipedia/commons/0/0c/%EC%A0%84_%EA%B2%AC%ED%9B%A4%EB%AC%98.jpg","original_sha256":"a979ee510024c1ef59b92802078ee317a8a1cfc195f2464411ddaae5d152a3e2","published_sha256":"96edd1dc6e553b21046f48c3e555690811c10d0fc382fd95e77580298f02a56a","changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."}};
function creditLink(url,label){const a=make('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;a.style.color='inherit';return a;}
function creditLine(src){const c=licensedPhotoCredits[src];if(!c)return null;const line=make('div');line.append(document.createTextNode(c.title+' — '+c.author+' · '),creditLink(c.source,I.lang==='ja'?'原典':'원본 출처'));for(const [label,url] of c.licenseLinks){line.append(document.createTextNode(' · '),creditLink(url,label));}line.append(document.createTextNode(I.lang==='ja'?' · サイズ・形式調整／表示時のトリミング':' · 크기·형식 최적화 / 화면 표시 시 크롭'));return line;}
function setPlacePhotoCredit(node,pics,toggle){
 const list=Array.isArray(pics)?pics:[pics];
 const key=list.join('|'),wasOpen=node.dataset.creditKey===key&&!node.hidden;
 node.dataset.creditKey=key;
 node.replaceChildren();
 const lines=list.map(creditLine).filter(Boolean);
 if(!lines.length){const c=placePhotoCredits.get(list[0]);if(c)lines.push(creditLink(c.source,'['+c.title+'] 한국민족문화대백과사전 (한국학중앙연구원 · 공공누리 제1유형)'));}
 const label=I.lang==='ja'?'写真の出典・ライセンス':I.lang==='en'?'Photo credits & license':'사진 출처 및 이용조건';
 toggle.querySelector('.p2-credit-label').textContent=label;toggle.setAttribute('aria-label',label);
 toggle.hidden=!lines.length;
 node.hidden=!lines.length||!wasOpen;
 toggle.setAttribute('aria-expanded',String(!node.hidden));
 if(lines.length)node.append(...lines);
}
// The newly added Nonsan photo package uses one hero and two separate gallery thumbnails.
function galleryPhotos(p,pics){
 const packaged=p.region==='nonsan'&&p.kind==='official'&&Array.isArray(p.photos)&&p.photos.length===3&&/^assets\/nonsan-photos\/[^/]+-1\.jpg$/.test(p.image_url||'')&&p.photos[0]===p.image_url;
 return packaged?pics.filter(src=>src!==p.image_url):pics;
}
function category(p){return (p.shop_id||window.MUSUBU_PHASE_THREE_MODEL.business(p))?'phase'+({meal:'Meal',dessert:'Dessert',gift:'Gift',stay:'Stay'}[p.category]||'Discover'):p.story_key==='donam'?'phaseHistory':['walk','photo'].includes(p.category)?'phaseWalk':['scenery','rest'].includes(p.category)?'phaseNature':'phaseExperience';}
const viewer=make('dialog','p2-viewer');const viewerHead=make('div','p2-viewer-head');const close=make('button','p2-viewer-close');close.type='button';close.setAttribute('aria-label',t('mapClose'));close.title=t('mapClose');close.append(U.icon('close'));close.onclick=()=>viewer.close();viewerHead.append(close);viewer.append(viewerHead);document.body.append(viewer);
function viewPhotos(pics,name){
 viewer.querySelectorAll('.p2-viewer-photo').forEach(n=>n.remove());
 for(const src of pics){
  const frame=make('figure','p2-viewer-photo');
  const im=make('img');im.alt=name;
  const fit=()=>{if(im.naturalWidth>0&&im.naturalHeight>0)frame.style.setProperty('--photo-ratio',String(im.naturalWidth/im.naturalHeight));};
  im.addEventListener('load',fit);
  frame.append(im);
  const line=creditLine(src);
  if(line){const caption=make('figcaption','licensed-photo-viewer-credit');caption.append(...line.childNodes);frame.append(caption);}
  viewer.append(frame);im.src=src;if(im.complete)fit();
 }
 viewer.showModal();viewer.scrollTop=0;
}
function viewPhoto(src,name){viewPhotos([src],name);}
class Detail {
 constructor(shop){this.shop=shop;this.dialog=$(shop?'shopDialog':'placeDialog');this.scroll=this.dialog.querySelector(shop?'.sheet-scroll':'.place-scroll');this.nativeHeart=$(shop?'shopHeart':'detailLike');this.title=$(shop?'detailName':'placeDetailTitle');this.dialog.classList.add('p2-dialog');
 const old=[...this.scroll.children];this.more=make('details','p2-more');this.moreTitle=make('summary');this.more.append(this.moreTitle);old.forEach(n=>this.more.append(n));
 this.root=make('section','p2-detail');this.hero=make('img','p2-hero');if(!shop){this.hero.setAttribute('role','button');this.hero.tabIndex=0;this.hero.onclick=()=>{const src=this.hero.getAttribute('src');if(!this.hero.hidden&&src&&this.hero.complete&&this.hero.naturalWidth>0)viewPhoto(src,this.name);};this.hero.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.hero.click();}};}this.noPhoto=make('div','p2-no-photo');this.heading=make('div','p2-title');this.topHeart=button('favoriteAdd',()=>this.nativeHeart.click());this.heading.append(this.title,this.topHeart);this.chips=make('div','p2-chips');this.meta=make('div','p2-meta');this.rating=make('span');this.dist=make('span','p2-distance');this.meta.append(this.rating,this.dist);this.intro=make('p','p2-intro');this.expand=button('p2More',()=>{this.more.open=true;this.more.scrollIntoView({block:'start',behavior:'smooth'});});
 this.actions=make('div','p2-actions');this.map=button('p2Map',()=>this.showMap(),'pin');this.directions=make('a','p2-button');this.directions.target='_blank';this.directions.rel='noopener noreferrer';this.directions.append(icon('route'),make('span'));this.share=button('p2Share',()=>this.sharePlace(),'share');this.actions.append(this.map,this.directions,this.share);this.status=make('p','p2-status');this.status.setAttribute('role','status');
 this.gallery=make('section','p2-gallery');this.galleryHeading=make('h3');this.thumbs=make('div','p2-thumbs');this.galleryAll=button('p2AllPhotos',()=>viewPhotos(photos(this.p),this.name));const galleryHead=make('div','p2-gallery-head');galleryHead.append(this.galleryHeading,this.galleryAll);this.gallery.append(galleryHead,this.thumbs);
 this.reviews=make('section','p2-recent');this.preview=this.more.querySelector('.review-preview');this.empty=make('p','notice');this.emptyTitle=make('h3');this.all=button('allReviews',()=>this.showReviews());this.reviews.append(this.emptyTitle,this.empty,this.preview,this.all);
 this.bottom=make('div','p2-bottom');this.bottomHeart=button('favoriteAdd',()=>this.nativeHeart.click());this.bottom.append(this.bottomHeart,button('p2Reviews',()=>this.showReviews()));
 this.root.append(this.hero,this.noPhoto,this.heading,this.chips,this.meta,this.intro,this.expand,this.actions,this.status,this.gallery,this.reviews,this.bottom);this.scroll.append(this.root,this.more);
 if(!shop){
  this.photoCredit=make('div','place-photo-credit');this.photoCredit.id='placePhotoCreditPanel';this.photoCredit.hidden=true;
  this.photoCreditToggle=make('button','p2-button p2-credit-toggle');this.photoCreditToggle.type='button';this.photoCreditToggle.hidden=true;this.photoCreditToggle.setAttribute('aria-controls',this.photoCredit.id);this.photoCreditToggle.setAttribute('aria-expanded','false');
  this.photoCreditToggle.onclick=()=>{this.photoCredit.hidden=!this.photoCredit.hidden;this.photoCreditToggle.setAttribute('aria-expanded',String(!this.photoCredit.hidden));};
  const creditIcon=document.createElementNS('http://www.w3.org/2000/svg','svg');creditIcon.setAttribute('viewBox','0 0 24 24');creditIcon.setAttribute('aria-hidden','true');creditIcon.setAttribute('focusable','false');
  const creditCircle=document.createElementNS(creditIcon.namespaceURI,'circle');creditCircle.setAttribute('cx','12');creditCircle.setAttribute('cy','12');creditCircle.setAttribute('r','9');
  const creditPath=document.createElementNS(creditIcon.namespaceURI,'path');creditPath.setAttribute('d','M12 11v5 M12 8h.01');creditIcon.append(creditCircle,creditPath);
  this.photoCreditToggle.append(creditIcon,make('span','p2-credit-label'));
  const galleryTitle=make('div','p2-gallery-title');galleryTitle.append(this.galleryHeading,this.photoCreditToggle);galleryHead.prepend(galleryTitle);
  this.gallery.insertBefore(this.photoCredit,this.thumbs);
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
 this.setupShopManagement();
 this.selectShopTab('info');
 I.apply(this.root);
 }
 setupShopManagement(){
  const bar=make('section','place-management p2-shop-management');
  for(const [kind,key] of [['edit','p2ManageEdit'],['delete','p2ManageDelete']]){
   const b=button(key,()=>this.openShopChange(kind));b.prepend(managementIcon(kind));bar.append(b);
  }
  this.root.append(bar);
 }
 openShopChange(kind){
  const p=this.p;if(!p?.shop_id)return;
  if(!this.changeDialog){
   this.changeDialog=make('dialog','p2-shop-change-dialog');this.changeDialog.setAttribute('aria-labelledby','p2-shop-change-title');document.body.append(this.changeDialog);
  }
  const dialog=this.changeDialog,v=I.shopView(p),lang=I.lang,editing=kind==='edit';
  dialog.replaceChildren();
  const head=make('div','p2-change-head'),title=make('h2','',t(editing?'p2ManageEdit':'p2ManageDelete'));title.id='p2-shop-change-title';
  const closeBtn=make('button','p2-change-close');closeBtn.type='button';closeBtn.setAttribute('aria-label',t('mapClose'));closeBtn.append(U.icon('close'));closeBtn.onclick=()=>dialog.close();head.append(title,closeBtn);
  const form=make('form','p2-change-form');form.append(make('strong','p2-change-target',v.name),make('p','notice',t('p2ManageNotice')));
  const fields=new Map(),original=new Map();
  const addField=(key,label,value,max,multi=false)=>{
   const wrap=make('label'),input=make(multi?'textarea':'input');input.name=key;input.maxLength=max;input.value=String(value??'');if(multi)input.rows=3;
   wrap.append(make('span','',t(label)),input);form.append(wrap);fields.set(key,input);original.set(key,input.value);
  };
  if(editing){
   addField('name','p2ManageName',v.name,80);
   addField('description','p2ManageDescription',v.description,1200,true);
   addField('address','address',v.address,300);
   addField('business_hours','hours',v.business_hours,300);
   addField('phone','phone',v.phone,100);
  }
  const reasonLabel=make('label'),reason=make('textarea');reason.required=true;reason.minLength=5;reason.maxLength=1000;reason.rows=4;reasonLabel.append(make('span','',t(editing?'p2ManageReason':'mapDeleteReason')),reason);form.append(reasonLabel);
  const submit=make('button','p2-change-submit',t('p2ManageSend'));submit.type='submit';
  const status=make('p','p2-change-status');status.setAttribute('role','status');form.append(submit,status);dialog.append(head,form);
  let pending=false,sent=false;
  form.onsubmit=async e=>{
   e.preventDefault();if(pending||sent)return;const changes={};
   for(const [key,input] of fields){const value=input.value.trim();if(value!==original.get(key).trim())changes[key]=value;}
   if(editing&&!Object.keys(changes).length){status.textContent=t('p2ManageNoChange');return;}
   if(editing&&Object.hasOwn(changes,'name')&&changes.name.length<2){status.textContent=t('p2ManageNameInvalid');return;}
   if(reason.value.trim().length<5){status.textContent=t('p2ManageReasonInvalid');return;}
   pending=true;submit.disabled=true;closeBtn.disabled=true;status.textContent='';
   try{
    const {error}=await X.db.from('shop_change_requests').insert({shop_id:p.shop_id,request_type:kind,proposed_changes:changes,reason:reason.value.trim(),language:lang});
    if(error)throw error;sent=true;status.textContent=t('p2ManageSent');form.querySelectorAll('input,textarea').forEach(n=>n.disabled=true);
   }catch{status.textContent=t('mapSaveError');}
   finally{pending=false;submit.disabled=sent;closeBtn.disabled=false;}
  };
  dialog.oncancel=e=>{if(pending)e.preventDefault();};
  dialog.showModal();
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
  const player=this.players.get('story-'+p.story_key)||window.MUSUBU_STORY_AUDIO?.get(p);
  if(this.audioSlot.firstChild!==player){this.audioSlot.querySelector('audio')?.pause();this.audioSlot.replaceChildren(...(player?[player]:[]));}
  this.audioSlot.hidden=!player;
  const editLabel=I.lang==='ja'?'スポット情報を編集':'장소 정보 수정';
  this.edit.querySelector('span').textContent=editLabel;
  this.edit.setAttribute('aria-label',editLabel);
 }
 const pics=photos(p),galleryPics=this.shop?pics:galleryPhotos(p,pics);if(this.photoCredit)setPlacePhotoCredit(this.photoCredit,pics,this.photoCreditToggle);this.galleryAll.hidden=!galleryPics.length;this.hero.hidden=!pics.length;this.noPhoto.hidden=!!pics.length;this.noPhoto.textContent=t('discoverNoPhoto');if(pics.length){this.hero.src=pics[0];this.hero.alt=v.name;if(!this.shop){this.hero.setAttribute('aria-label',v.name+' — '+t('p2PhotoOpen'));this.hero.title=t('p2PhotoOpen');}this.hero.onerror=()=>{this.hero.hidden=true;this.noPhoto.hidden=false;};}
 this.chips.replaceChildren(make('span','',t(category(p))));if(this.shop||window.MUSUBU_PHASE_THREE_MODEL.business(p))this.chips.append(make('span','',t(window.MUSUBU_PHASE_THREE_MODEL.origin(p))));if(p.is_demo)this.chips.append(make('span','',t('phaseDemoShop')));else if(p.is_example)this.chips.append(make('span','',t('phaseDemo')));
 const raw=window.MUSUBU_LOCATION.label(p);this.dist.replaceChildren(U.icon('pin'),document.createTextNode(U.distance(raw)));this.dist.title=raw;this.dist.setAttribute('aria-label',raw);
 const story=p.story_key&&$('story-'+p.story_key);this.intro.textContent=this.shop?v.description:(story?.querySelector('p')?.textContent||v.reason||'');this.galleryHeading.textContent=t('p2Photos')+' ('+galleryPics.length+')';this.thumbs.replaceChildren();for(const src of galleryPics){const b=button('p2PhotoOpen',()=>viewPhoto(src,v.name));b.replaceChildren();const im=make('img');im.src=src;im.alt=v.name;im.loading='lazy';b.append(im);this.thumbs.append(b);}if(!galleryPics.length)this.thumbs.append(make('p','notice',t('discoverNoPhoto')));
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
function refresh(){if(place.p)place.render(place.p);if(shop.p)shop.render(shop.p);close.setAttribute('aria-label',t('mapClose'));close.title=t('mapClose');}
document.addEventListener('musubu:place-detail',e=>queueMicrotask(()=>place.render(e.detail.place)));
document.addEventListener('musubu:shop-detail',e=>queueMicrotask(()=>shop.render(e.detail.shop)));
document.addEventListener('musubu:preview-stats',e=>{stats=e.detail.rows;place.updateStats();});
document.addEventListener('musubu:shop-stats',()=>shop.updateStats());
document.addEventListener('musubu:languagechange',()=>queueMicrotask(refresh));document.addEventListener('musubu:locationchange',refresh);
let sharedOpened=false;function openShared(){if(sharedOpened)return;const q=new URLSearchParams(location.search),sid=q.get('shop'),pid=q.get('place');const s=sid&&window.MUSUBU_SHOPS.find(p=>p.shop_id===sid&&p.region===window.MUSUBU_REGION.current),p=pid&&X.places.find(p=>p.id===pid&&p.region===window.MUSUBU_REGION.current);if(s||p){sharedOpened=true;if(s)A.openShop(s);else {X.choose(p,false);X.openDetail();}}}document.addEventListener('musubu:places-loaded',openShared);document.addEventListener('DOMContentLoaded',openShared);
})();
