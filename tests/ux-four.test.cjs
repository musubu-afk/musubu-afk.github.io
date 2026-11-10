const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../phase-three-model.js');
test('recommendations isolate region, publication, business and demo records',()=>{
 const rows=[{id:'story',region:'nonsan',status:'approved',category:'scenery'},{id:'shop',region:'nonsan',status:'approved',category:'meal'},{id:'private',region:'nonsan',status:'pending',category:'nature'},{id:'other',region:'fukuoka',status:'approved',category:'scenery'},{id:'demo',region:'nonsan',status:'approved',shop_id:'demo',is_demo:true}];
 const metrics=()=>({count:0,rating:0});
 assert.deepEqual(M.recommendations(rows,'nonsan',false,metrics).map(p=>p.id),['story']);
 assert.deepEqual(M.recommendations(rows,'nonsan',true,metrics).map(p=>p.id),['shop']);
});
test('newest excludes private and examples, orders actual creation timestamps',()=>{
 const row={region:'nonsan',status:'approved',kind:'resident'};
 const rows=[{...row,id:'old',created_at:'2026-10-01'},{...row,id:'new',created_at:'2026-11-10'},{...row,id:'pending',status:'pending',created_at:'2026-11-11'}];
 assert.deepEqual(M.newest(rows).map(p=>p.id),['new','old']);
});
test('confirmed future events are upcoming, unconfirmed and expired events stay hidden',()=>{
 const f={region:'nonsan',enabled:true,start_date:'2027-01-01',end_date:'2027-01-02',official_confirmed:true,source_url:'https://example.org/official'};
 assert.equal(M.activeFestivals([f],'nonsan','2026-11-10').length,1);
 assert.equal(M.activeFestivals([{...f,official_confirmed:false}],'nonsan','2026-11-10').length,0);
 assert.equal(M.activeFestivals([f],'nonsan','2027-01-03').length,0);
 assert.equal(M.recommendable({name:'시험용',status:'approved'}),false);
});
