(() => {
 const I=window.MUSUBU_I18N,languages=[['ko','한국어'],['ja','日本語'],['en','English']];
 const dialog=document.createElement('dialog');dialog.className='language-dialog';dialog.innerHTML='<div class="place-head"><h2 data-i18n="language"></h2><button type="button" data-i18n="mapClose"></button></div><div class="language-options"></div>';document.body.append(dialog);dialog.querySelector('.place-head button').onclick=()=>dialog.close();
 languages.forEach(([code,label])=>{const b=document.createElement('button');b.type='button';b.lang=code;b.textContent=label;b.dataset.language=code;b.onclick=()=>dialog.close();dialog.querySelector('.language-options').append(b);});
 document.querySelectorAll('.language-switch').forEach(nav=>{nav.replaceChildren();const b=document.createElement('button');b.type='button';b.className='globe-button';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label',I.t('language'));b.textContent='🌐';b.onclick=()=>{I.apply(dialog);dialog.showModal();};nav.append(b);});
 document.addEventListener('musubu:languagechange',()=>{document.querySelectorAll('.globe-button').forEach(b=>b.setAttribute('aria-label',I.t('language')));});I.apply(dialog);
})();
