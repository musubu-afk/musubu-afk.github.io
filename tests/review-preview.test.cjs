// Isolated lifecycle tests; fixtures are never sent to Supabase or the public app.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let jobs=new Map(),next=1,clock=0;
const setTimeout=(fn,ms)=>{const id=next++;jobs.set(id,{fn,at:clock+ms});return id;},clearTimeout=id=>jobs.delete(id);
function advance(ms){const end=clock+ms;for(;;){const pair=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(!pair||pair[1].at>end)break;clock=pair[1].at;jobs.delete(pair[0]);pair[1].fn();}clock=end;}
class Element {constructor(){this.children=[];this.events={};this.attrs={};this.classes=new Set();this.classList={add:(...s)=>s.forEach(x=>this.classes.add(x)),remove:(...s)=>s.forEach(x=>this.classes.delete(x))};}append(...n){this.children.push(...n);}before(){}replaceChildren(...n){this.children=n;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.events[k]=fn;}contains(e){return this===e||this.children.includes(e);}}
const motion={matches:false};const document={hidden:false};
const ctx={node:()=>new Element(),t:(k,v)=>k+JSON.stringify(v||{}),I:{locale:'ko-KR'},motion,document,setTimeout,clearTimeout,MutationObserver:class {constructor(fn){this.fn=fn;}observe(){}},IntersectionObserver:class{constructor(fn){this.fn=fn;}observe(){}}};vm.createContext(ctx);
const source=fs.readFileSync('review-previews.js','utf8');vm.runInContext(source.slice(source.indexOf('class ReviewPreview'),source.indexOf('const shop=new ReviewPreview'))+';this.Preview=ReviewPreview',ctx);
const dialog=new Element();dialog.open=true;const p=new ctx.Preview(dialog,new Element(),()=>{});
const rows=[1,2,3].map(i=>({id:String(i),rating:i+2,review_text:'isolated fixture '+i,created_at:'2026-10-30T00:00:00Z'}));
p.set([]);assert(p.root.hidden);assert.equal(jobs.size,0);
p.set(rows.slice(0,1));assert(!p.root.hidden);assert(p.controls.hidden);assert.equal(jobs.size,0);
p.set(rows);assert.equal(jobs.size,1);advance(5000);advance(320);assert.equal(p.index,1);assert.equal(jobs.size,1);
p.hold('hover',true);advance(10000);assert.equal(p.index,1);assert.equal(jobs.size,0);p.hold('hover',false);assert.equal(jobs.size,1);
p.hold('focus',true);assert.equal(jobs.size,0);p.hold('focus',false);
p.move(1);advance(320);assert.equal(p.index,2);assert.equal(jobs.size,1);
p.card.events.pointerdown({clientX:100,clientY:0});p.card.events.pointerup({clientX:20,clientY:5});advance(320);assert.equal(p.index,0);
p.card.events.pointerdown({clientX:100,clientY:0});p.card.events.pointerup({clientX:95,clientY:100});advance(320);assert.equal(p.index,0);
p.pause.onclick();assert.equal(jobs.size,0);advance(10000);assert.equal(p.index,0);p.pause.onclick();assert.equal(jobs.size,1);
document.hidden=true;p.stop();advance(6000);assert.equal(jobs.size,0);document.hidden=false;p.schedule();assert.equal(jobs.size,1);
dialog.open=false;dialog.events.close();assert.equal(jobs.size,0);advance(6000);assert.equal(p.index,0);
dialog.open=true;p.observer.fn();assert.equal(jobs.size,1);p.set(rows.slice(0,1));assert.equal(jobs.size,0);
motion.matches=true;p.set(rows);assert.equal(jobs.size,0);p.move(1);assert.equal(p.index,1);assert.equal(jobs.size,0);
assert.equal(p.card.attrs['aria-live'],undefined);
console.log('PASS: 0/1/multiple, 5s rotation, hover/focus/touch pause, horizontal swipe, vertical scroll, explicit pause, background, close/reopen, data replacement, reduced motion, no aria-live.');
const app=fs.readFileSync('app.js','utf8');const handler=app.slice(app.indexOf('function imageError(event)'),app.indexOf("$('detailImage').onerror"));const imgCtx={fallback:'assets/shop-placeholder.svg'};vm.createContext(imgCtx);vm.runInContext(handler,imgCtx);const img={dataset:{fallback:'assets/nearby-stay.svg'},onerror:()=>{},src:'missing.jpg'};imgCtx.imageError({currentTarget:img});assert.equal(img.src,'assets/nearby-stay.svg');assert.equal(img.onerror,null);console.log('PASS: image error returns to category placeholder, removes handler to prevent error loops.');
