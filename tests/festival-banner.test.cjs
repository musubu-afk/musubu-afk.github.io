const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../phase-three-model.js'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync('phase-three-data.js','utf8'),ctx);
const data=ctx.window.MUSUBU_FESTIVALS,[n,f]=data;
for(const day of ['2026-10-23','2026-11-04','2026-11-07'])assert.equal(M.activeFestivals(data,'nonsan',day).length,1);
for(const day of ['2026-10-22','2026-11-08'])assert.equal(M.activeFestivals(data,'nonsan',day).length,0);
assert.equal(M.activeFestivals(data,'fukuoka','2026-11-04')[0].id,f.id);
assert.equal(M.activeFestivals([{...f,show_on_home:false}],'fukuoka','2026-11-04').length,0);
assert.equal(M.activeFestivals([{...f,enabled:false}],'fukuoka','2026-11-04').length,0);
assert.equal(M.activeFestivals([f],'nonsan','2026-11-04').length,0);
assert.equal(M.activeFestivals(data,'fukuoka','2026-11-04',true)[0].id,f.id);
for(const preview of [true,false])assert.equal(M.activeFestivals([{...n,enabled:false}],'nonsan','2026-11-04',preview).length,0);
assert.equal(M.activeFestivals([],'nonsan','2026-11-04').length,0);
assert.equal(M.activeFestivals([{...n,start_date:'2026-02-30'}],'nonsan','2026-11-04').length,0);
for(const event of data){assert.ok(event.translations.ja.name);assert.ok(event.translations.ja.description);assert.ok(fs.existsSync(event.image_url));}
console.log('Festival dates, boundaries, region isolation, disabled, empty, demo preview, locales and assets passed');
