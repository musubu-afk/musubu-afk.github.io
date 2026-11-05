const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('forward geocoder limits results to selected region and preserves coordinates',async()=>{
 let requested;const window={MUSUBU_MAP_CONFIG:{regions:{nonsan:{bounds:[[36,127],[37,128]],latitude:36.5,longitude:127.5}}}};
 const context={window,URL,fetch:async url=>{requested=url;return {ok:true,json:async()=>({results:[{lat:36.2,lon:127.2,name:'장소',formatted:'주소'},{lat:null,lon:127}]})}}};
 vm.runInNewContext(fs.readFileSync('geocoding.js','utf8'),context);const rows=await window.MUSUBU_GEOCODE_SEARCH('논산 주소','nonsan','ko');
 assert.equal(requested.searchParams.get('filter'),'rect:127,36,128,37');assert.equal(requested.searchParams.get('lang'),'ko');assert.equal(rows.length,1);assert.equal(rows[0].lat,36.2);assert.equal(rows[0].lng,127.2);
});
test('search failures reject instead of manufacturing coordinates',async()=>{const window={MUSUBU_MAP_CONFIG:{regions:{fukuoka:{bounds:[[33,130],[34,132]],latitude:33.5,longitude:130.5}}}};vm.runInNewContext(fs.readFileSync('geocoding.js','utf8'),{window,URL,fetch:async()=>({ok:false})});await assert.rejects(window.MUSUBU_GEOCODE_SEARCH('test','fukuoka','ja'));});
