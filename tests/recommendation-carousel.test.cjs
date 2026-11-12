const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('shared carousel advances at 3s and stops for interaction, offscreen, reduced motion and one item',()=>{
 let now=0,id=0;const jobs=new Map();
 function advance(ms){const end=now+ms;while(true){const next=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;jobs.delete(next[0]);next[1].fn();}now=end;}
 class Element{constructor(){this.events={};this.children=[];this.style={};this.scrollWidth=1000;this.clientWidth=300;this.dataset={};this.classList={contains:()=>false,add(){},remove(){}};}remove(){}before(){}prepend(...items){this.children.unshift(...items);}insertBefore(item){this.children.push(item);}querySelector(){return new Element();}querySelectorAll(){return [];}getBoundingClientRect(){return {width:100};}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}addEventListener(k,fn){this.events[k]=fn;}setAttribute(){}removeAttribute(){}contains(){return false;}animate(){}}
 const motion={matches:false,addEventListener(){}},context={el:()=>new Element(),button:(key,fn)=>Object.assign(new Element(),{onclick:fn}),I:{apply(){}},t:()=>'',matchMedia:()=>motion,document:{hidden:false,body:{},addEventListener(){},querySelector(){return null;}},IntersectionObserver:class{observe(){}},MutationObserver:class{observe(){}},ResizeObserver:class{observe(){}},setTimeout:(fn,ms)=>{jobs.set(++id,{fn,at:now+ms});return id;},clearTimeout:i=>jobs.delete(i)};
 vm.createContext(context);const source=fs.readFileSync('phase-three.js','utf8');vm.runInContext(source.slice(source.indexOf('class Carousel'),source.indexOf('let festivalDialog'))+';this.Carousel=Carousel;this.RecommendationCarousel=RecommendationCarousel',context);
 const c=new context.Carousel(new Element(),()=>new Element());c.set([{id:1},{id:2}]);advance(2999);assert.equal(c.index,0);advance(1);assert.equal(c.index,1);
 for(const reason of ['touch','hover','focus','offscreen']){c.hold(reason,true);assert.equal(jobs.size,0);advance(6000);assert.equal(c.index,1);c.hold(reason,false);assert.equal(jobs.size,1);}
 motion.matches=true;c.update();assert.equal(jobs.size,0);motion.matches=false;c.set([{id:1}]);assert.equal(jobs.size,0);
 const r=new context.RecommendationCarousel(new Element(),()=>new Element());r.set([{id:1},{id:2}]);const first=r.body.children[0];r.move(1);assert.equal(r.body.children[0],first);assert.equal(r.body.style.transform,'translateX(-112px)');assert.equal(r.body.style.transition,'transform 360ms ease');r.hold('offscreen',true);advance(360);assert.equal(r.index,1);
 r.hold('offscreen',false);advance(3360);assert.equal(r.index,0);
 r.viewport.clientWidth=1000;r.body.scrollWidth=1000;r.update();assert.equal(jobs.size,1);assert.equal(r.controls.hidden,false);advance(3360);assert.equal(r.index,1);
 r.viewport.clientWidth=300;r.update();assert.equal(jobs.size,1);
 r.set([{id:3},{id:4},{id:5}]);assert.equal(r.index,0);advance(3360);assert.equal(r.index,1);
 r.dots.children[0].onclick();advance(360);assert.equal(r.index,0);r.dots.children[2].onclick();assert.equal(r.body.style.transform,'translateX(-224px)');advance(360);assert.equal(r.index,2);
 r.set([]);assert.equal(jobs.size,0);
 r.set([{id:8}]);assert.equal(r.index,0);assert.equal(jobs.size,0);
 assert.equal(r.root.events.mouseenter,undefined);
 r.set([{id:1},{id:2}]);r.body.events.pointerdown({button:0,clientX:200,clientY:20,pointerId:1});assert.equal(jobs.size,0);
 r.body.hasPointerCapture=()=>false;r.body.events.pointerup({type:'pointerup',clientX:100,clientY:20,pointerId:1});advance(360);assert.equal(r.index,1);advance(3360);assert.equal(r.index,0);
});
