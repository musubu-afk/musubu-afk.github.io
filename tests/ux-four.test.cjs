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
