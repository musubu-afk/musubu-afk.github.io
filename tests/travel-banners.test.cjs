const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('each winter event has translations and separate banner and detail artwork', () => {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync('travel-banners.js', 'utf8'), context);
  const events = context.window.MUSUBU_TRAVEL_BANNERS;
  for (const region of ['nonsan', 'fukuoka']) {
    assert.equal(events.filter(f => f.region === region && f.is_active).length, 3);
  }
  const images = new Set();
  for (const f of events) {
    assert.ok(f.title_ko && f.title_ja && f.venue_ko && f.venue_ja);
    assert.ok(f.description_ko && f.description_ja && f.image_is_ai);
    assert.ok(f.start_date && (f.end_date || f.event_status === 'planned'));
    for (const path of [f.banner_image_url, f.detail_image_url]) {
      assert.ok(fs.existsSync(path));
      images.add(path);
    }
    assert.equal(f.image_url, f.banner_image_url);
  }
  assert.equal(images.size, 12);
  assert.equal(events.find(f => f.id === 'hanbit').end_date, null);
});
