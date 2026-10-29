(() => {
'use strict';
const I=window.MUSUBU_I18N,X=window.MUSUBU_EXPLORE,A=window.MUSUBU_SHOP_APP,$=id=>document.getElementById(id),t=(k,v)=>I.t(k,v);
document.querySelectorAll('#shops > [data-i18n="mapShopNote"]').forEach(n=>n.remove());
const pane=$('nearbyContent'),note=document.createElement('p');note.className='notice';pane.querySelector('h2').after(note);
const disclaimer=document.createElement('p');disclaimer.className='notice';disclaimer.dataset.i18n='mapShopNote';pane.append(disclaimer);
// One shared recommendation UI moves between regions: IDs and review listeners stay intact.
[...$('fukuoka-shops').children].filter(n=>n.id!=='fukuoka-voucher').forEach(n=>n.remove());
function origin(){return X.selected?.region===window.MUSUBU_REGION.current?X.selected:null;}
function distance(s){const o=origin();if(!o)return '';const rad=x=>x*Math.PI/180;const a=Math.sin(rad(s.latitude-o.latitude)/2)**2+Math.cos(rad(o.latitude))*Math.cos(rad(s.latitude))*Math.sin(rad(s.longitude-o.longitude)/2)**2;const km=6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));return t('nearDistance',{name:X.view(o).name,km:km.toFixed(1)});}
window.MUSUBU_NEARBY={distance};
function mount(){const r=window.MUSUBU_REGION.current;$(r==='nonsan'?'shops':'fukuoka-shops').append(pane);const o=origin();I.message(pane.querySelector('h2'),o?'mapNearby':'shopsTitle',o?{name:X.view(o).name}:{});note.hidden=!!o;note.textContent=t('nearChoose');I.apply(pane);A.refresh();}
$('nearPrev').onclick=()=>slide(-1);$('nearNext').onclick=()=>slide(1);
function slide(d){$('shopList').scrollBy({left:d*$('shopList').clientWidth*.85,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
let likeVersion=0,heartBusy=false,current=null,liked=false,hasLikeRow=false;
const hash=crypto.subtle.digest('SHA-256',new TextEncoder().encode(X.visitor)).then(b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''));
async function hearts(shop){current=shop;const v=++likeVersion;$('shopHeart').disabled=true;$('shopHeartStatus').textContent='';try{const h=await hash;const {data,error}=await X.db.from('shop_likes').select('visitor_hash,liked').eq('shop_id',shop.shop_id);if(error)throw error;if(v!==likeVersion)return;hasLikeRow=data.some(x=>x.visitor_hash===h);liked=data.some(x=>x.visitor_hash===h&&x.liked);$('shopHeart').textContent=t('shopHeart',{count:data.filter(x=>x.liked).length});$('shopHeart').setAttribute('aria-pressed',String(liked));}catch{if(v===likeVersion){$('shopHeart').textContent=t('shopHeart',{count:'—'});$('shopHeartStatus').textContent=t('shopHeartError');}}finally{if(v===likeVersion)$('shopHeart').disabled=heartBusy;}}
$('shopHeart').onclick=async()=>{if(heartBusy||!current)return;heartBusy=true;$('shopHeart').disabled=true;const s=current;try{const {error}=hasLikeRow?await X.db.from('shop_likes').update({liked:!liked}).eq('shop_id',s.shop_id).eq('visitor_hash',await hash):await X.db.from('shop_likes').insert({shop_id:s.shop_id,liked:true});if(error)throw error;await hearts(s);}catch{$('shopHeartStatus').textContent=t('shopHeartError');}finally{heartBusy=false;$('shopHeart').disabled=false;}};
document.addEventListener('musubu:shop-detail',e=>hearts(e.detail.shop));
for(const e of ['musubu:regionchange','musubu:languagechange','musubu:screenchange'])document.addEventListener(e,mount);
mount();
})();
