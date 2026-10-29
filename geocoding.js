// Origin-restricted browser key, without database privileges.
(() => {
 const key='6acea95f9bee41778d0e85fc7818102c',cache=new Map();
 async function query(point,lang,signal){
  const id=[point.lat,point.lng,lang].join(':');if(cache.has(id))return cache.get(id);
  const url=new URL('https://api.geoapify.com/v1/geocode/reverse');
  Object.entries({lat:point.lat,lon:point.lng,lang,format:'json',limit:1,apiKey:key}).forEach(([k,v])=>url.searchParams.set(k,v));
  const r=await fetch(url,{signal,credentials:'omit'});if(!r.ok)throw Error('address_lookup_failed');
  const p=(await r.json()).results?.[0];if(!p)throw Error('address_not_found');cache.set(id,p);return p;
 }
 const join=p=>[...new Set([p.state,p.county,p.city,p.district,p.suburb,p.quarter,p.street,p.housenumber].filter(Boolean))].join(' ')||p.formatted;
 window.MUSUBU_GEOCODE=async(point,lang,signal)=>{
  const p=await query(point,lang,signal),raw=join(p);if(!raw)throw Error('address_not_found');
  const result=window.MUSUBU_ADDRESS.format(raw,lang);
  // Obtain one coherent native-language address only when translated parts are missing.
  const native=p.country_code==='kr'?'ko':p.country_code==='jp'?'ja':lang;
  if(result.partial&&native!==lang){try{result.original=join(await query(point,native,signal));}catch{/* Keep provider result visibly labelled as original. */}}
  return {address:result.address.slice(0,300),original:result.original.slice(0,300),partial:result.partial};
 };
})();
