// Never present an untranslated street as though it were a complete translation.
(() => {
 const names=[
 ['충청남도','忠清南道','South Chungcheong'],['논산시','論山市','Nonsan'],['부여군','扶餘郡','Buyeo'],['부여읍','扶餘邑','Buyeo-eup'],
 ['후쿠오카현','福岡県','Fukuoka Prefecture'],['후쿠오카시','福岡市','Fukuoka'],['주오구','中央区','Chuo Ward'],['하카타구','博多区','Hakata Ward'],['오이타현','大分県','Oita Prefecture'],['유후시','由布市','Yufu'],['조나이','城内','Jonai'],['오테몬','大手門','Otemon'],['오호리공원','大濠公園','Ohori Park']
 ];
 function format(text,lang){
  const original=String(text||'').trim();let normalized=original.replaceAll('チュンチョンナムド','忠清南道').replaceAll('후쿠오카켄','후쿠오카현');const idx={ko:0,ja:1,en:2}[lang]??0;
  for(const row of names)for(const name of row.slice().sort((a,b)=>b.length-a.length))normalized=normalized.split(name).join(row[idx]);
  // Keep a component only if its script is supported in the chosen UI language.
  const bad=lang==='ja'?/[\uac00-\ud7af\u1100-\u11ff]/:lang==='ko'?/[\u3040-\u30ff\u3400-\u9fff]/:/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;
  const tokens=normalized.split(/\s+/);let partial=tokens.some(x=>bad.test(x));
  let kept=tokens.filter(x=>!bad.test(x));if(partial)kept=kept.filter(x=>!/^\d[\d\-–]*$/.test(x));
  return {address:[...new Set(kept)].join(' '),original,partial};
 }
 window.MUSUBU_ADDRESS={format};
})();
