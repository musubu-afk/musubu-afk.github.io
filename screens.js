(() => {
 'use strict';
 const names=['story','shops','review'];
 function current(){const value=location.hash.slice(1).replace(/^fukuoka-/,'');return value==='voucher'?'shops':names.includes(value)?value:'story';}
 function render(){
  const screen=current(),region=window.MUSUBU_REGION.current;
  document.querySelectorAll('.main > .card').forEach(el=>el.hidden=el.id.replace(/^fukuoka-/,'')!==screen);
  document.querySelectorAll('.flow a').forEach(a=>{const active=a.hash.replace(/^#fukuoka-/,'#')==='#'+screen;a.setAttribute('aria-current',active?'page':'false');});
  document.body.dataset.screen=screen;
  document.querySelectorAll('.main:not([hidden]) > .card:not([hidden])').forEach(el=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)el.animate([{opacity:0,transform:'translateX(16px)'},{opacity:1,transform:'translateX(0)'}],{duration:220,easing:'ease-out'});});
  document.dispatchEvent(new CustomEvent('musubu:screenchange',{detail:{screen,region}}));
 }
 function go(screen){if(!names.includes(screen))return;const url=new URL(location.href);url.hash=(window.MUSUBU_REGION.current==='fukuoka'?'fukuoka-':'')+screen;history.pushState(null,'',url);render();window.scrollTo({top:0,behavior:'instant'});}
 document.querySelectorAll('.flow a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.hash.slice(1).replace(/^fukuoka-/,''));}));
 window.addEventListener('hashchange',render);window.addEventListener('popstate',render);
 document.addEventListener('musubu:regionchange',render);
 window.MUSUBU_SCREENS={go};render();
})();
