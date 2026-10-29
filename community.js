(() => {
'use strict';
const X=window.MUSUBU_EXPLORE,I=window.MUSUBU_I18N,db=X.db,$=id=>document.getElementById(id),t=(k,v)=>I.t(k,v);
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const button=(key,fn)=>{const b=el('button','community-button',t(key));b.type='button';b.onclick=fn;return b;};
const status=(node,key)=>I.message(node,key);
const region=()=>window.MUSUBU_REGION.current;
let edits=new Map(),reactions=new Map(),votes=new Map(),reviewRows=[],reviewEdits=[],activePlace=null,reviewVersion=0,channel=null,editorTarget=null,busy=false;
const hashPromise=crypto.subtle.digest('SHA-256',new TextEncoder().encode(X.visitor)).then(b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''));
// Keep original shop reviews accessible through shop detail panels. Primary screen now reviews places.
const legacyReview=el('div');legacyReview.hidden=true;while($('review').firstChild)legacyReview.append($('review').firstChild);$('shops').append(legacyReview);$('fukuoka-review').replaceChildren();
const reviewSection=el('div','community-reviews');reviewSection.innerHTML=`<span class="tag" data-i18n="placeReviewTag"></span><h2 data-i18n="placeReviewTitle"></h2><p data-i18n="wikiNotice"></p><label for="reviewPlace" data-i18n="choosePlace"></label><select id="reviewPlace"></select><p id="placeReviewStats" role="status"></p><form id="placeReviewForm"><label for="placeRating" data-i18n="rating"></label><select id="placeRating" name="rating" required><option value="5">★★★★★ · 5</option><option value="4">★★★★☆ · 4</option><option value="3">★★★☆☆ · 3</option><option value="2">★★☆☆☆ · 2</option><option value="1">★☆☆☆☆ · 1</option></select><label for="placeReviewText" data-i18n="reviewTextLabel"></label><textarea id="placeReviewText" name="review_text" required minlength="2" maxlength="1000" data-i18n-placeholder="placeReviewHint"></textarea><button type="submit" class="submit" id="savePlaceReview" data-i18n="savePlaceReview"></button><p id="placeReviewStatus" role="status"></p></form><p id="placeReviewConnection" role="status"></p><button type="button" class="community-button" id="refreshPlaceReviews" data-i18n="retry"></button><div id="placeReviewList"></div>`;
$('review').append(reviewSection);
const detailActions=el('div','community-actions');detailActions.id='communityActions';$('detailLike').after(detailActions);$('detailLike').classList.add('vote-button');
const dislike=button('dislike',()=>vote(-1));dislike.id='detailDislike';detailActions.append(dislike,button('editPlace',()=>openEditor('place',X.selected)),button('history',()=>showHistory('place',X.selected)),button('placeReviews',()=>{const p=X.selected;$('placeDialog').close();window.MUSUBU_SCREENS.go('review');$('reviewPlace').value=p.id;selectReviews(p.id);}));
const originalAddress=el('details','original-address');originalAddress.innerHTML='<summary data-i18n="addressOriginal"></summary><p></p>';$('placeDetailMeta').after(originalAddress);
const addressNotice=el('p','notice');addressNotice.dataset.i18n='mapAddressPartial';originalAddress.before(addressNotice);
const wikiNote=el('p','notice');wikiNote.dataset.i18n='wikiNotice';detailActions.after(wikiNote);
const editor=el('dialog','place-dialog');editor.id='wikiEditor';editor.innerHTML=`<div class="place-head"><h2 data-i18n="editTitle"></h2><button type="button" id="closeWiki" data-i18n="mapClose"></button></div><form class="place-scroll" id="wikiForm"><p data-i18n="wikiNotice"></p><div id="wikiPlaceFields"><label for="wikiName" data-i18n="mapName"></label><input id="wikiName" maxlength="80" minlength="2"><label for="wikiPinColor" data-i18n="pinColor"></label><select id="wikiPinColor"><option value="green" data-i18n="pin_green"></option><option value="blue" data-i18n="pin_blue"></option><option value="orange" data-i18n="pin_orange"></option><option value="pink" data-i18n="pin_pink"></option><option value="purple" data-i18n="pin_purple"></option><option value="red" data-i18n="pin_red"></option></select><label for="wikiAddress" data-i18n="address"></label><input id="wikiAddress" maxlength="300"><label for="wikiTip" data-i18n="mapTip"></label><textarea id="wikiTip" maxlength="300"></textarea></div><div id="wikiRatingField"><label for="wikiRating" data-i18n="rating"></label><select id="wikiRating"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select></div><label for="wikiText" data-i18n="editContent"></label><textarea id="wikiText" required></textarea><label for="wikiNote" data-i18n="editReason"></label><input id="wikiNote" required minlength="2" maxlength="200"><button class="submit" id="saveWiki" data-i18n="saveEdit"></button><p id="wikiStatus" role="status"></p></form>`;document.body.append(editor);
const historyDialog=el('dialog','place-dialog');historyDialog.innerHTML=`<div class="place-head"><h2 data-i18n="history"></h2><button type="button" data-i18n="mapClose"></button></div><div class="place-scroll" id="wikiHistory"></div>`;document.body.append(historyDialog);historyDialog.querySelector('button').onclick=()=>historyDialog.close();
const deleteDialog=el('dialog','place-dialog');deleteDialog.innerHTML=`<div class="place-head"><h2 data-i18n="deleteReview"></h2><button type="button" data-i18n="mapClose"></button></div><form class="place-scroll"><p data-i18n="mapDeleteIntro"></p><label><span data-i18n="mapDeleteReason"></span><textarea required minlength="5" maxlength="1000" name="reason"></textarea></label><button class="submit" data-i18n="mapDeleteSend"></button><p role="status"></p></form>`;document.body.append(deleteDialog);deleteDialog.querySelector('.place-head button').onclick=()=>deleteDialog.close();
let deleteReviewId=null;
function requestReviewDelete(r){deleteReviewId=r.id;deleteDialog.querySelector('form').reset();deleteDialog.querySelector('p[role]').textContent='';deleteDialog.showModal();}
deleteDialog.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=e.currentTarget.querySelector('button'),msg=e.currentTarget.querySelector('p[role]');b.disabled=true;try{const reason=new FormData(e.currentTarget).get('reason').trim();if(reason.length<5)throw Error();const {error}=await db.from('review_deletion_requests').insert({review_id:deleteReviewId,reason});if(error)throw error;status(msg,'mapDeleteSent');}catch{status(msg,'mapSaveError');}finally{b.disabled=false;}};
function mount(){ $(region()==='nonsan'?'review':'fukuoka-review').append(reviewSection);fillPlaces();renderRewards(); }
function fillPlaces(){const select=$('reviewPlace'),old=select.value;select.replaceChildren();const first=el('option','',t('choosePlace'));first.value='';select.append(first);X.places.filter(p=>p.region===region()).forEach(p=>{const o=el('option','',X.view(p).name);o.value=p.id;select.append(o);});if([...select.options].some(o=>o.value===old))select.value=old;else{select.value='';selectReviews(null);} $('savePlaceReview').disabled=!select.value;}
async function allRows(table,filter,order){let rows=[];for(let start=0;;start+=500){let q=db.from(table).select('*').order(order,{ascending:false}).range(start,start+499);if(filter)q=q.eq(filter[0],filter[1]);const r=await q;if(r.error)throw r.error;rows.push(...r.data);if(r.data.length<500)return rows;}}
async function decorate(places){
 const data=await allRows('place_edits',null,'id');
 edits=new Map();for(const e of data||[]){if(!edits.has(e.place_id))edits.set(e.place_id,[]);edits.get(e.place_id).push(e);}
 for(const p of places){const latest=edits.get(p.id)?.[0];if(latest)p.wiki={name:latest.name,reason:latest.reason,tip:latest.tip,address:latest.address,language:latest.language,pin_color:latest.pin_color||p.pin_color,address_original:latest.address_original};}
 await loadVotes();
}
async function loadVotes(){const [a,b]=await Promise.all([db.rpc('place_reaction_counts'),hashPromise]);if(a.error)throw a.error;reactions=new Map((a.data||[]).map(r=>[r.place_id,r]));const own=await db.from('place_reactions').select('place_id,value').eq('visitor_hash',b);if(own.error)throw own.error;votes=new Map((own.data||[]).map(r=>[r.place_id,r.value]));renderVotes();}
function renderVotes(){const p=X.selected;if(!p)return;const r=reactions.get(p.id)||{likes:0,dislikes:0},v=votes.get(p.id)||0;I.clear($('detailLike'));$('detailLike').textContent='❤️ '+t('like')+' · '+r.likes;dislike.textContent='😐 '+t('dislike')+' · '+r.dislikes;$('detailLike').setAttribute('aria-pressed',String(v===1));dislike.setAttribute('aria-pressed',String(v===-1));$('detailLike').disabled=dislike.disabled=busy;}
async function vote(value){if(busy||!X.selected)return;busy=true;const id=X.selected.id;renderVotes();try{const next=votes.get(id)===value?0:value;const {error}=await db.from('place_reactions').upsert({place_id:id,value:next},{onConflict:'place_id,visitor_hash'});if(error)throw error;await loadVotes();await X.loadCounts();}catch{status($('likeStatus'),'mapSaveError');}finally{busy=false;renderVotes();}}
$('detailLike').onclick=()=>vote(1);
function currentReview(r){return {...r,...(reviewEdits.find(e=>e.review_id===r.id)||{}),id:r.id};}
function openEditor(type,row,versionContent=null){
 if(!row)return;editorTarget={type,row,previous:type==='place'?edits.get(row.id)?.[0]?.id||null:reviewEdits.find(e=>e.review_id===row.id)?.id||null};
 const v=versionContent||(type==='place'?X.view(row):currentReview(row));$('wikiForm').reset();I.clear($('wikiStatus'));
 $('wikiPlaceFields').hidden=type!=='place';$('wikiRatingField').hidden=type==='place';$('wikiName').required=type==='place';$('wikiName').value=v.name||'';$('wikiAddress').value=v.address||'';$('wikiPinColor').value=v.pin_color||(row.kind==='official'?'blue':row.kind==='walk'?'orange':'green');$('wikiTip').value=v.tip||'';$('wikiRating').value=String(v.rating||5);
 $('wikiText').minLength=type==='place'?10:2;$('wikiText').maxLength=type==='place'?1200:1000;
 let content=v.reason||v.review_text||'';
 if(type==='place'&&row.story_key&&!row.wiki&&!versionContent){const paragraph=$('story-'+row.story_key)?.querySelector(':scope > p');if(paragraph)content=paragraph.textContent;}
 $('wikiText').value=content;if(versionContent)$('wikiNote').value=t('restoreNote');$('saveWiki').disabled=false;editor.showModal();
}
$('closeWiki').onclick=()=>{if(!busy)editor.close();};editor.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('wikiForm').onsubmit=async e=>{
 e.preventDefault();if(busy||!editorTarget)return;const {type,row,previous}=editorTarget,content=$('wikiText').value.trim(),note=$('wikiNote').value.trim();if(content.length<(type==='place'?10:2)||note.length<2)return;
 busy=true;$('saveWiki').disabled=true;status($('wikiStatus'),'saving');
 try{const data=type==='place'?{place_id:row.id,previous_id:previous,name:$('wikiName').value.trim(),reason:content,tip:$('wikiTip').value.trim(),address:$('wikiAddress').value.trim(),address_original:$('wikiAddress').value.trim()!==X.view(row).address?$('wikiAddress').value.trim():(X.view(row).address_original||row.address_original||row.address||''),pin_color:$('wikiPinColor').value,language:I.lang,edit_note:note}:{review_id:row.id,previous_id:previous,rating:Number($('wikiRating').value),review_text:content,language:I.lang,edit_note:note};
 const {error}=await db.from(type==='place'?'place_edits':'place_review_edits').insert(data);if(error)throw error;
 editor.close();await X.load();if(type==='review')await loadReviews();if($('placeDialog').open){renderWiki(X.selected);}status($('placeReviewStatus'),'editSaved');
 }catch(error){status($('wikiStatus'),String(error.message).includes('version_conflict')?'editConflict':'mapSaveError');}finally{busy=false;$('saveWiki').disabled=false;renderVotes();}
};
async function showHistory(type,row){
 const box=$('wikiHistory');box.replaceChildren();historyDialog.showModal();
 let original={...row,id:null,edit_note:t('originalVersion')};if(type==='place'&&row.story_key){const key={donam:'donamText',tapjeong:'tapjeongText',ohori:'ohoriText',yufuin:'yufuinText'}[row.story_key];original.reason=window.MUSUBU_REGION_TEXT?.(key)||t(key);}
 const versions=type==='place'?(edits.get(row.id)||[]):reviewEdits.filter(e=>e.review_id===row.id);
 for(const v of [...versions,original]){
  const card=el('article','history-card'),heading=el('strong','',v.id?'#'+v.id+' · '+v.edit_note:t('originalVersion'));
  card.append(heading,el('p','',v.reason||v.review_text),el('small','',new Date(v.created_at).toLocaleString(I.locale)),button('restore',()=>{historyDialog.close();openEditor(type,row,v);}));box.append(card);
 }
}
function renderWiki(p){if(!p)return;const v=X.view(p);$('placeDetailTitle').textContent=v.name;const meta=$('placeDetailMeta');meta.textContent=(p.is_example?t('mapExample'):t(p.kind==='official'?'mapOfficial':p.kind==='walk'?'mapWalk':'mapResident'))+' · '+t('mapCategory_'+p.category)+' · '+(v.address||t('mapAddressUnknown'));renderVotes();addressNotice.hidden=!v.addressPartial;originalAddress.hidden=!v.address_original||v.address_original===v.address;originalAddress.querySelector('p').textContent=v.address_original||'';
 if(p.story_key){const a=$('story-'+p.story_key);const para=a?.querySelector(':scope > p');if(para){if(!para.dataset.originalKey){para.dataset.originalKey=para.dataset.i18n||'';para.dataset.originalRegionKey=para.dataset.regionText||'';}
 if(p.wiki){delete para.dataset.i18n;delete para.dataset.regionText;para.textContent=p.wiki.reason;para.lang=p.wiki.language;}else if(para.dataset.originalRegionKey){para.dataset.regionText=para.dataset.originalRegionKey;}else if(para.dataset.originalKey){para.dataset.i18n=para.dataset.originalKey;I.apply(a);}}
 }else{$('communityReason').textContent=X.view(p).reason;$('communityTip').textContent=X.view(p).tip||t('mapNoTip');}
}
async function loadReviews(){
 const id=activePlace,version=++reviewVersion;if(!id){$('placeReviewList').replaceChildren();$('placeReviewStats').textContent='';return;}
 status($('placeReviewStats'),'reviewsLoading');
 try{const rows=await allRows('place_reviews',['place_id',id],'created_at');const revisions=rows.length?await allRows('place_review_edits',null,'id'):[];if(version!==reviewVersion)return;
 const ids=new Set(rows.map(r=>r.id));reviewRows=rows;reviewEdits=revisions.filter(r=>ids.has(r.review_id));renderReviews();
 }catch{if(version===reviewVersion)status($('placeReviewStats'),'reviewsError');}
}
function renderReviews(){
 const rows=reviewRows.map(currentReview);I.message($('placeReviewStats'),'stats',{rating:rows.length?(rows.reduce((a,r)=>a+r.rating,0)/rows.length).toFixed(1):'—',count:rows.length});$('placeReviewList').replaceChildren();
 if(!rows.length)$('placeReviewList').append(el('p','',t('emptyReviews')));
 rows.forEach((r,i)=>{const card=el('article','place-review-card');card.append(el('strong','',('★'.repeat(r.rating))+' · '+new Date(r.created_at).toLocaleDateString(I.locale)),el('p','review-original',r.review_text));card.querySelector('p').lang=r.language;
 if(reviewEdits.some(e=>e.review_id===r.id))card.append(el('small','',t('editedPublicly')));
 const bar=el('div','community-actions');bar.append(button('editReview',()=>openEditor('review',reviewRows[i])),button('history',()=>showHistory('review',reviewRows[i])),button('deleteReview',()=>requestReviewDelete(r)));card.append(bar);$('placeReviewList').append(card);});
}
function selectReviews(id){activePlace=id;reviewRows=[];reviewEdits=[];if(channel){db.removeChannel(channel);channel=null;}$('savePlaceReview').disabled=!id;I.clear($('placeReviewStatus'));loadReviews();if(id){channel=db.channel('place-review-'+id).on('postgres_changes',{event:'*',schema:'public',table:'place_reviews',filter:'place_id=eq.'+id},loadReviews).on('postgres_changes',{event:'INSERT',schema:'public',table:'place_review_edits'},loadReviews).subscribe(state=>status($('placeReviewConnection'),state==='SUBSCRIBED'?'connected':'connecting'));}else I.clear($('placeReviewConnection'));}
$('reviewPlace').onchange=e=>selectReviews(e.target.value||null);$('refreshPlaceReviews').onclick=loadReviews;
let reviewRequestId=crypto.randomUUID();
$('placeReviewForm').onsubmit=async e=>{e.preventDefault();if(busy||!activePlace)return;const review_text=$('placeReviewText').value.trim();if(review_text.length<2)return;busy=true;$('savePlaceReview').disabled=true;status($('placeReviewStatus'),'saving');try{const {error}=await db.from('place_reviews').insert({id:reviewRequestId,place_id:activePlace,rating:Number($('placeRating').value),review_text,language:I.lang});if(error&&error.code!=='23505')throw error;reviewRequestId=crypto.randomUUID();e.target.reset();status($('placeReviewStatus'),'placeReviewSaved');await Promise.all([loadReviews(),renderRewards()]);}catch{status($('placeReviewStatus'),'mapSaveError');}finally{busy=false;$('savePlaceReview').disabled=!activePlace;}};
async function renderRewards(){
 const hosts=[$('voucher'),$('fukuoka-voucher')];let rows=[],error;try{const r=await db.from('community_rewards').select('id,kind,amount,used,created_at').order('created_at');rows=r.data||[];error=r.error;}catch{error=true;}
 hosts.forEach(host=>{let box=host.querySelector('.community-rewards');if(!box){box=el('div','community-rewards');host.prepend(box);}box.replaceChildren();box.append(el('h2','',t('rewardTitle')),el('p','notice',t('rewardRules')));
 if(error){box.append(el('p','',t('rewardError')));return;}
 for(const kind of ['place','review']){const row=rows.find(r=>r.kind===kind),card=el('div','reward-card'+(!row?' locked':''));card.append(el('strong','',t(kind==='place'?'placeReward':'reviewReward')),el('p','', '₩1,000 · MUSUBU DEMO COUPON'));const b=button(row?.used?'voucherUsed':row?'useVoucher':'rewardLocked',async()=>{b.disabled=true;const {error}=await db.from('community_rewards').update({used:true}).eq('id',row.id);if(error){b.disabled=false;b.textContent=t('mapSaveError');}else renderRewards();});b.disabled=!row||row.used;card.append(b);box.append(card);}
 });
 // Keep legacy shop-review coupon available in Nonsan, marked separately.
 const legacy=$('voucherBox');legacy.closest('section').querySelectorAll(':scope > [data-i18n]').forEach(n=>n.hidden=true);legacy.hidden=legacy.classList.contains('locked');
 $('fukuoka-voucher').querySelectorAll(':scope > :not(.community-rewards)').forEach(n=>n.hidden=true);
}
function applyLocal(){[reviewSection,editor,historyDialog,deleteDialog].forEach(n=>I.apply(n));}
function relabel(){applyLocal();detailActions.querySelectorAll('button:not(#detailDislike)').forEach((b,i)=>b.textContent=t(['editPlace','history','placeReviews'][i]));fillPlaces();renderVotes();renderReviews();renderRewards();}
document.addEventListener('musubu:places-loaded',()=>{fillPlaces();if($('placeDialog').open)renderWiki(X.selected);});
document.addEventListener('musubu:place-detail',e=>renderWiki(e.detail.place));
document.addEventListener('musubu:regionchange',()=>{selectReviews(null);editor.close();historyDialog.close();deleteDialog.close();mount();});
document.addEventListener('musubu:languagechange',relabel);
document.addEventListener('musubu:reward-earned',renderRewards);
window.MUSUBU_COMMUNITY={decorate,renderVotes};
mount();applyLocal();X.load();
})();
