const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('six supplied banners keep regions, sources, translations and concepts separate',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync('travel-banners.js','utf8'),context);const data=context.window.MUSUBU_TRAVEL_BANNERS;
 assert.equal(data.length,6);for(const region of ['nonsan','fukuoka'])assert.equal(data.filter(f=>f.region===region&&f.is_active).length,3);
 for(const f of data){assert.ok(fs.existsSync(f.image_url));assert.ok(f.title_ko&&f.title_ja);if(f.content_type==='event'){assert.ok(f.source_url&&f.start_date&&f.end_date&&f.venue_ja);}else{assert.equal(f.start_date,null);assert.equal(f.end_date,null);assert.equal(f.venue_ko,null);}}
});
