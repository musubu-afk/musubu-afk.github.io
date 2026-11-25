(() => {
'use strict';
const I=window.MUSUBU_I18N;
const labels={
 ko:{attach:'사진 첨부 (선택)',add:'사진 추가',remove:'삭제',max:'사진은 최대 3장까지 첨부할 수 있습니다.',bad:'20MB 이하의 JPEG, PNG 또는 WebP 사진을 선택해 주세요.',fail:'사진을 저장하지 못했습니다. 다시 시도해 주세요.',upload:'사진 업로드 중',view:'사진 확대보기',edit:'사진 수정',done:'저장',close:'닫기',text:'방문 후기',processing:'사진 준비 중'},
 ja:{attach:'写真を添付（任意）',add:'写真を追加',remove:'削除',max:'写真は3枚まで添付できます。',bad:'20MB以下のJPEG、PNG、WebP画像を選んでください。',fail:'写真を保存できませんでした。もう一度お試しください。',upload:'写真をアップロード中',view:'写真を拡大',edit:'写真を編集',done:'保存',close:'閉じる',text:'訪問の感想',processing:'写真を準備中'}
};
const tr=k=>(labels[I.lang]||labels.ko)[k];
const node=(tag,cls='')=>{const n=document.createElement(tag);n.className=cls;return n;};
const btn=(label,action)=>{const b=node('button');b.type='button';b.textContent=label;b.onclick=action;return b;};
const X=()=>window.MUSUBU_EXPLORE;
const pickers=new WeakMap(),signed=new Map();
async function url(path){
 const old=signed.get(path);
 if(old && old.until>Date.now())return old.result;
 const result=X().db.storage.from('review-photos').createSignedUrl(path,1800).then(({data,error})=>{if(error)throw error;return data.signedUrl;});
 signed.set(path,{until:Date.now()+1500000,result});
 try{return await result;}catch(e){signed.delete(path);throw e;}
}
async function compress(file){
 const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const sig=String.fromCharCode(...header);
 if(file.size>20*1024*1024 || !(sig.startsWith('\xff\xd8\xff')||sig.startsWith('\x89PNG\r\n\x1a\n')||(sig.startsWith('RIFF')&&sig.slice(8)==='WEBP')))throw Error('bad');
 const src=URL.createObjectURL(file),im=new Image();
 try{
  im.src=src;await im.decode();
  const scale=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight));
  const canvas=node('canvas');canvas.width=Math.max(1,Math.round(im.naturalWidth*scale));canvas.height=Math.max(1,Math.round(im.naturalHeight*scale));
  const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(im,0,0,canvas.width,canvas.height);
  for(const quality of [.85,.75,.62,.48]){const b=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(b && (b.size<=500000 || quality===.48&&b.size<=1048576))return b;}
  throw Error('bad');
 }finally{URL.revokeObjectURL(src);}
}
function picker(host,initial=[]){
 const area=node('section','review-photo-picker'),title=node('strong'),count=node('span'),head=node('div','rp-head'),grid=node('div','rp-grid'),status=node('small'),hint=node('small'),file=node('input');
 file.type='file';file.multiple=true;file.accept='image/jpeg,image/png,image/webp';file.hidden=true;
 head.append(title,count);status.setAttribute('role','status');area.append(head,grid,hint,status,file);host.before(area);
 const entries=initial.map(path=>({path}));let busy=false,version=0;
 function draw(){
  title.textContent=tr('attach');count.textContent=entries.length+'/3';hint.textContent=tr('max');grid.replaceChildren();
  entries.forEach((e,i)=>{const wrap=node('div'),im=node('img');im.alt=String(i+1);if(e.preview)im.src=e.preview;else url(e.path).then(s=>im.src=s).catch(()=>{});const del=btn(tr('remove'),()=>{if(e.preview)URL.revokeObjectURL(e.preview);entries.splice(i,1);draw();});del.disabled=busy;wrap.append(im,del);grid.append(wrap);});
  if(entries.length<3){const add=btn('',()=>file.click());add.className='rp-add';add.disabled=busy;add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';add.append(document.createTextNode(tr('add')));grid.append(add);}
 }
 file.onchange=async()=>{
  const files=[...file.files];file.value='';
  if(busy)return;if(entries.length+files.length>3){status.textContent=tr('max');return;}
  busy=true;const token=version;status.textContent=tr('processing');draw();
  try{for(const f of files){const blob=await compress(f);if(token!==version)return;entries.push({blob,preview:URL.createObjectURL(blob)});}status.textContent='';}
  catch{status.textContent=tr('bad');}finally{busy=false;draw();}
 };
 draw();
 return {draw,area,async paths(){
  if(busy)throw Error(tr('processing'));
  busy=true;draw();const token=version;
  try{for(const [i,e] of entries.entries()){if(e.path)continue;status.textContent=tr('upload')+' '+(i+1)+'/'+entries.length;
   const {data,error}=await X().db.functions.invoke('review-photos',{body:e.blob,headers:{'Content-Type':'image/jpeg','x-musubu-visitor':X().visitor}});
   if(error||!data?.path)throw Error(tr('fail'));if(token!==version)throw Error(tr('fail'));e.path=data.path;
  }status.textContent='';return entries.map(e=>e.path);
  }catch(e){status.textContent=e.message;throw e;}finally{busy=false;draw();}
 },clear(){version++;entries.forEach(e=>e.preview&&URL.revokeObjectURL(e.preview));entries.length=0;status.textContent='';draw();}};
}
function form(id){return pickers.get(document.getElementById(id));}
function gallery(row,kind,allowEdit=false){
 const paths=row.photo_paths||[],wrap=node('div','review-attachments');
 async function view(index){
  const d=node('dialog','rp-viewer'),im=node('img');let current=index;
  function paint(){const path=paths[current];im.removeAttribute('src');im.alt=tr('view')+' '+(current+1)+'/'+paths.length;url(path).then(src=>{if(paths[current]===path)im.src=src;}).catch(()=>{});}
  d.append(btn(tr('close'),()=>d.close()),im);if(paths.length>1){for(const [label,delta] of [['‹',-1],['›',1]])d.append(btn(label,()=>{current=(current+delta+paths.length)%paths.length;paint();}));}
  document.body.append(d);d.onclose=()=>d.remove();paint();d.showModal();
 }
 paths.forEach((path,i)=>{const b=btn('',()=>view(i)),im=node('img');im.loading='lazy';im.alt=tr('view')+' '+(i+1);b.append(im);wrap.append(b);url(path).then(s=>im.src=s).catch(()=>{});});
 return wrap;
}
function install(f){
 const shop=f.id==='reviewForm',old=shop?f.querySelector('fieldset'):document.getElementById('placeRating'),stars=node('fieldset','rp-stars'),legend=node('legend'),line=node('div');
 legend.dataset.i18n='rating';stars.append(legend,line);old.before(stars);
 if(shop)old.remove();else{old.hidden=true;old.previousElementSibling.previousElementSibling.hidden=true;}
 for(let n=1;n<=5;n++){const label=node('label'),input=node('input'),star=node('span');input.type='radio';input.name=shop?'rating':'placeStars';input.value=n;input.required=true;input.setAttribute('aria-label',String(n)+' / 5');input.defaultChecked=n===5;star.textContent='★';label.append(input,star);line.append(label);input.onchange=()=>{if(!shop)old.value=n;};}
 const heading=node('h3'),name=node('p','rp-place-name');heading.dataset.i18n='writeReview';f.prepend(heading,name);
 function names(){name.textContent=shop?document.getElementById('detailName').textContent:document.querySelector('#reviewPlace option:checked')?.textContent||'';}
 new MutationObserver(names).observe(shop?document.getElementById('detailName'):document.getElementById('reviewPlace'),{childList:true,subtree:true,characterData:true});document.getElementById('reviewPlace').addEventListener('change',names);names();
 const cancel=btn('',()=>{f.hidden=true;document.getElementById(shop?'writeShopReview':'writePlaceReview')?.focus();});
 f.append(cancel);
 const pick=picker(f.querySelector('[type=submit]'));pickers.set(f,pick);f.addEventListener('reset',()=>pick.clear());
 function labels(){cancel.textContent=tr('close');legend.textContent=I.t('rating');heading.textContent=I.t('writeReview');const label=f.querySelector('label[for$="Text"]');if(label){delete label.dataset.i18n;label.textContent=tr('text');}pick.draw();names();}
 labels();document.addEventListener('musubu:languagechange',labels);
}
window.MUSUBU_REVIEW_PHOTOS={form,gallery,picker};
document.addEventListener('DOMContentLoaded',()=>['reviewForm','placeReviewForm'].forEach(id=>install(document.getElementById(id))));
})();
