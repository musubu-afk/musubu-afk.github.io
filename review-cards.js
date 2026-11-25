(() => {
'use strict';
const I=window.MUSUBU_I18N, db=()=>window.MUSUBU_EXPLORE.db;
const label=(ko,ja)=>I.lang==='ja'?ja:ko;
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;};
function button(text,action){const b=make('button','',text);b.type='button';b.onclick=action;return b;}
const key='musubu.review.credential.v1';
let memory='',issuing=null,owners=null;
function stored(){try{return localStorage.getItem(key)||memory;}catch{return memory;}}
async function issue(){
 if(stored())return stored();
 const {data,error}=await db().rpc('issue_review_credential');if(error)throw error;
 memory=data;try{localStorage.setItem(key,data);}catch{}return data;
}
async function authorize(query){
 if(!stored()&&!issuing)issuing=(navigator.locks?navigator.locks.request(key,issue):issue()).finally(()=>{issuing=null;});
 const credential=stored()||await issuing;
 return query.setHeader('x-review-credential',credential);
}
function mine(){
 if(!stored())return Promise.resolve(new Set());
 if(!owners)owners=authorize(db().rpc('my_review_ids')).then(({data,error})=>{
  if(error)throw error;return new Set(data.map(r=>r.kind+'/'+r.review_id));
 }).catch(()=>{owners=null;return new Set();});
 return owners;
}
window.addEventListener('storage',e=>{if(e.key===key)owners=null;});
function changed(){owners=null;document.dispatchEvent(new Event('musubu:review-changed'));}
function modal(title){
 const d=make('dialog','visitor-review-dialog'),heading=make('h3','',title);
 const close=button(I.t('mapClose'),()=>d.close());d.append(heading,close);document.body.append(d);d.addEventListener('close',()=>d.remove(),{once:true});return d;
}
async function history(row,kind){
 const d=modal(I.t('history')),out=make('div');d.append(out);d.showModal();
 try{
  const place=kind==='place_reviews';
  const versions=await db().from(place?'place_review_edits':'shop_review_history').select('rating,review_text,created_at').eq('review_id',row.id).order('id',{ascending:false});
  if(versions.error)throw versions.error;
  let items=versions.data;
  if(place){const first=await db().from('place_reviews').select('rating,review_text,created_at').eq('id',row.id).single();if(first.error)throw first.error;items=[...items,first.data];}
  else items=[row,...items];
  for(const v of items){const item=make('section');item.append(make('strong','',Number(v.rating).toFixed(1)+' ★'),make('p','',v.review_text));out.append(item);}
 }catch{out.textContent=I.t('reviewsError');}
}
function edit(row,kind){
 const d=modal(I.t('editReview')),f=make('form'),rating=make('select'),body=make('textarea'),msg=make('p'),save=make('button','',I.t('editReview'));
 for(let i=1;i<=5;i++)rating.add(new Option('★ '+i,i));rating.value=row.rating;rating.setAttribute('aria-label',I.t('rating'));
 body.value=row.review_text;body.required=true;body.minLength=2;body.maxLength=kind==='reviews'?500:1000;body.setAttribute('aria-label',label('방문 후기','訪問の感想'));
 save.type='submit';msg.setAttribute('role','status');f.append(rating,body,save,msg);d.append(f);
 const pick=window.MUSUBU_REVIEW_PHOTOS.picker(save,row.photo_paths||[]);
 f.onsubmit=async e=>{e.preventDefault();if(f.inert)return;f.inert=true;d.querySelector('button').disabled=true;
  try{const photos=await pick.paths();const {error}=await authorize(db().rpc('revise_visitor_review',{k:kind,rid:row.id,old_text:row.review_text,old_rating:row.rating,old_photos:row.photo_paths||[],body:body.value,stars:Number(rating.value),photos,lang:I.lang}));
   if(error)throw error;d.close();changed();
  }catch(e){msg.textContent=I.t(e.message?.includes('version_conflict')?'editConflict':'mapSaveError');}finally{f.inert=false;d.querySelector('button').disabled=false;}
 };
 d.oncancel=e=>{if(f.inert)e.preventDefault();};d.onclose=()=>pick.clear();d.showModal();
}
function card(row,kind){
 const c=make('article','visitor-review-card');c.dataset.reviewId=row.id;
 const head=make('header'),score=make('strong'),date=make('time');date.dateTime=row.created_at;date.textContent=new Intl.DateTimeFormat(I.locale,{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Seoul'}).format(new Date(row.created_at));
 score.append(make('span','','★'.repeat(row.rating)),document.createTextNode(' '+Number(row.rating).toFixed(1)));head.append(score,date);c.append(head);
 if(row.photo_paths?.length)c.append(window.MUSUBU_REVIEW_PHOTOS.gallery(row,kind));
 const content=make('p','visitor-review-body',row.review_text);if(row.language)content.lang=row.language;
 const foot=make('footer'),actions=make('div'),source=make('details'),summary=make('summary','',label('방문자 후기','訪問者のクチコミ'));
 source.append(summary,button(I.t('history'),()=>history(row,kind)));
 const remove=button(I.t('deleteReview'),()=>window.MUSUBU_COMMUNITY.requestReviewDelete(row,kind));actions.append(remove);
 mine().then(ids=>{if(ids.has(kind+'/'+row.id))actions.prepend(button(I.t('editReview'),()=>edit(row,kind)));});
 foot.append(source,actions);c.append(content,foot);return c;
}
const instances=new WeakMap(),motion=matchMedia('(prefers-reduced-motion: reduce)');
function list(host,rows,kind){
 instances.get(host)?.();host.replaceChildren();
 if(!rows.length){host.append(make('p','review-empty',I.t('emptyReviews')));return;}
 const track=make('div','visitor-review-track'),nav=make('div','visitor-review-nav'),pos=make('span');
 track.append(...rows.map(r=>card(r,kind)));track.tabIndex=0;
 host.append(track,nav);let timer,visible=false,held=false,manual=false;
 function limit(){return Math.max(0,track.scrollWidth-track.clientWidth);}
 function stride(){return track.children.length>1?track.children[1].offsetLeft-track.children[0].offsetLeft:track.clientWidth;}
 function move(dir){const x=track.scrollLeft,m=limit();const dest=dir>0&&x>=m-2?0:dir<0&&x<=2?m:x+dir*stride();track.scrollTo({left:dest,behavior:motion.matches?'instant':'smooth'});}
 const prev=button('‹',()=>move(-1)),next=button('›',()=>move(1)),pause=button('Ⅱ',()=>{manual=!manual;paint();});
 prev.setAttribute('aria-label',I.t('reviewPrevious'));next.setAttribute('aria-label',I.t('reviewNext'));
 nav.append(prev,pos,next,pause);
 function paint(){clearTimeout(timer);const m=limit();nav.hidden=m<2;pause.textContent=manual?'▶':'Ⅱ';pause.setAttribute('aria-label',I.t(manual?'p3Play':'p3Pause'));
  pos.textContent=(1+Math.round(track.scrollLeft/Math.max(1,stride())))+' / '+(1+Math.round(m/Math.max(1,stride())));
  if(m>1&&visible&&!held&&!manual&&!motion.matches&&!document.hidden)timer=setTimeout(()=>{if(!host.matches(':hover,:focus-within')&&!document.querySelector('.rp-viewer[open],.visitor-review-dialog[open],dialog[open] form:focus-within'))move(1);paint();},5000);
 }
 const abort=new AbortController(),on=(el,type,fn)=>el.addEventListener(type,fn,{signal:abort.signal});
 on(track,'scroll',paint);on(track,'pointerdown',()=>{held=true;paint();});for(const type of ['pointerup','pointercancel'])on(window,type,()=>{held=false;paint();});
 on(motion,'change',paint);on(document,'visibilitychange',paint);
 const resize=new ResizeObserver(paint),observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;paint();});resize.observe(track);observer.observe(track);paint();
 instances.set(host,()=>{abort.abort();resize.disconnect();observer.disconnect();clearTimeout(timer);});
}
window.MUSUBU_REVIEW_CARDS={authorize,changed,list};
})();
