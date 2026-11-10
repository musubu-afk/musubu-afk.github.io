const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('shared carousel advances at 3s and stops for interaction, offscreen, reduced motion and one item',()=>{
 let now=0,id=0;const jobs=new Map();
 function advance(ms){const end=now+ms;while(true){const next=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;jobs.delete(next[0]);next[1].fn();}now=end;}
 class Element{constructor(){this.events={};this.children=[];this.dataset={};this.classList={contains:()=>false,add(){},remove(){}};}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}addEventListener(k,fn){this.events[k]=fn;}setAttribute(){}removeAttribute(){}contains(){return false;}animate(){}}
 const motion={matches:false,addEventListener(){}},context={el:()=>new Element(),button:(key,fn)=>Object.assign(new Element(),{onclick:fn}),I:{apply(){}},t:()=>'',matchMedia:()=>motion,document:{hidden:false,body:{},addEventListener(){},querySelector(){return null;}},IntersectionObserver:class{observe(){}},MutationObserver:class{observe(){}},setTimeout:(fn,ms)=>{jobs.set(++id,{fn,at:now+ms});return id;},clearTimeout:i=>jobs.delete(i)};
 vm.createContext(context);const source=fs.readFileSync('phase-three.js','utf8');vm.runInContext(source.slice(source.indexOf('class Carousel'),source.indexOf('let festivalDialog'))+';this.Carousel=Carousel',context);
 const c=new context.Carousel(new Element(),()=>new Element());c.set([{id:1},{id:2}]);advance(2999);assert.equal(c.index,0);advance(1);assert.equal(c.index,1);
 for(const reason of ['touch','hover','focus','offscreen']){c.hold(reason,true);assert.equal(jobs.size,0);advance(6000);assert.equal(c.index,1);c.hold(reason,false);assert.equal(jobs.size,1);}
 motion.matches=true;c.update();assert.equal(jobs.size,0);motion.matches=false;c.set([{id:1}]);assert.equal(jobs.size,0);
});
