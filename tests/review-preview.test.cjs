// In-memory fixtures never reach the public review database.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('review-cards.js','utf8');
const timers=new Map(),motion={matches:false};
let width=390,step=390,id=0,intersection;
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.scrollLeft=0;this.dataset={};this.events={};}
 get clientWidth(){return width;}
 get scrollWidth(){return Math.max(width,this.children.length*step);}
 append(...nodes){for(const n of nodes){n.offsetLeft=this.children.length*step;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 addEventListener(k,f){this.events[k]=f;}
 setAttribute(){} matches(){return false;}
 scrollTo({left}){this.scrollLeft=Math.max(0,Math.min(this.scrollWidth-width,left));}
}
const win=new Element();win.MUSUBU_I18N={t:k=>k,locale:'ko',lang:'ko'};
win.MUSUBU_REVIEW_PHOTOS={gallery:r=>new Element('gallery'+r.photo_paths.length)};
const doc=new Element();doc.createElement=t=>new Element(t);doc.createTextNode=t=>new Element('text');doc.querySelector=()=>null;
motion.addEventListener=()=>{};
const ctx={window:win,document:doc,Intl,Date,AbortController,localStorage:{getItem:()=>null},matchMedia:()=>motion,
 setTimeout(f,ms){timers.set(++id,{f,ms});return id;},clearTimeout:i=>timers.delete(i),
 ResizeObserver:class{observe(){} disconnect(){}},IntersectionObserver:class{constructor(f){intersection=f;}observe(){} disconnect(){}}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const host=new Element(),rows=Array.from({length:4},(_,i)=>({id:String(i),rating:4,created_at:new Date().toISOString(),review_text:'fixture',photo_paths:Array(i).fill('photo')}));
function render(n){win.MUSUBU_REVIEW_CARDS.list(host,rows.slice(0,n),'reviews');if(n)intersection([{isIntersecting:true}]);}
render(0);assert.equal(host.children[0].tag,'p');render(1);assert.equal(host.children[1].hidden,true);assert.equal(timers.size,0);
render(4);const [track,nav]=host.children;assert(!nav.hidden);assert.equal(track.children[0].children.length,3);
for(let i=1;i<4;i++)assert.deepEqual(track.children[i].children.map(x=>x.tag),['header','gallery'+i,'p','footer']);
assert.equal([...timers.values()][0].ms,5000);[...timers.values()][0].f();assert.equal(track.scrollLeft,390);
track.events.pointerdown();assert.equal(timers.size,0);win.events.pointerup();assert.equal(timers.size,1);
motion.matches=true;render(4);assert.equal(timers.size,0);motion.matches=false;width=900;step=300;render(3);assert(host.children[1].hidden);render(4);assert(!host.children[1].hidden);
const app=fs.readFileSync('app.js','utf8');const handler=app.slice(app.indexOf('function imageError(event)'),app.indexOf("$('detailImage').onerror"));const imgCtx={fallback:'assets/shop-placeholder.svg'};vm.createContext(imgCtx);vm.runInContext(handler,imgCtx);const img={dataset:{fallback:'assets/nearby-stay.svg'},onerror:()=>{},src:'missing.jpg'};imgCtx.imageError({currentTarget:img});assert.equal(img.src,'assets/nearby-stay.svg');assert.equal(img.onerror,null);console.log('PASS: image error returns to category placeholder, removes handler to prevent error loops.');
