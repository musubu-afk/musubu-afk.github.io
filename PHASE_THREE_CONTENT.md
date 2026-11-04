# Phase 3 content operations

Edit `phase-three-data.js` in the existing repository. No separate database or admin website is introduced.

## Festivals

`MUSUBU_FESTIVALS` reuses the existing array and locale format:
- `id`, `region`, `enabled`
- `name`, `location`, `description`, `schedule`, `button_text`: Korean defaults
- `translations.ja` / `translations.en`: localized equivalents
- `start_date`, `end_date`: ISO dates, inclusive in Asia/Seoul
- `image_url`, `url`: image and optional HTTP(S) details link
- `demo`: never displayed in production; `image_reference`: visibly labels illustrative artwork

Only enabled records in the selected region with start_date <= today <= end_date are shown. Missing/invalid dates and demo records are hidden. Empty regions take no banner space. `?festival_preview=1` bypasses dates and enables demos, but never bypasses region or enabled. Preview/demo badges remain visible. Search uses the same eligibility rule. One banner is static; multiple banners reuse the existing carousel.

Nonsan dates, hours and location were supplied by the operator, not independently verified. Fukuoka is an undated demo, not an official event announcement. No external detail URL was supplied: the CTA opens a localized information dialog. Set `url` when an official link is available.

Images in `assets/festivals/` are text-free crops from the user-supplied combined visual reference (2026-11-03). The original was not modified. They are illustrative, not verified venue photography. Titles, dates and CTA remain HTML.

## Attraction routes

Existing `places.route_points`, `distance_m`, `duration_minutes` are loaded through the existing approved-place query. `route_points` must contain at least two `[latitude, longitude]` numeric pairs; no path is inferred from a place centre.

For operator-authored route metadata, `MUSUBU_ROUTES` is keyed by the existing place UUID or `story_key` (for example `tapjeong`). Each entry supports:
- `name`, `translations.ko.name`, `translations.ja.name`
- `points`: verified `[latitude,longitude][]`, used only if DB route_points is absent
- `distance_m`, `duration_minutes`: verified values; optional and omitted when unknown
- `difficulty`: `easy`, `moderate`, `hard`, optional
- `waypoints`: `[{point:[latitude,longitude],name,translations:{ja:{name}}}]`
- `source_url`: route source for visitors to consult

No route is visible until real coordinates are provided. No test route is published.

## Registration and provenance

The existing `places` table and registration form now accept meal/dessert/gift/stay in addition to their original categories. No table/column/RLS/approval default is changed. Business submissions remain kind=resident with the existing place reviews, favorites, wiki edits and detail screen. They are labelled “이용자 등록 가맹점”, never as operator-confirmed partners. Only status=approved rows enter search/new/recommendation lists; new excludes is_example and sorts by created_at descending.

Existing `MUSUBU_SHOPS` records are operator-listed; is_demo is always visibly preserved. Operator listing is not a claim of a verified partnership. Future static user-sourced entries can declare registration_source='user'.

## Ranking and carousels

Popularity uses review count descending, then mean rating descending; ties use name. Fictional businesses retain their demo badge, and fictional resident examples are excluded. This is not a personalized or statistically weighted ranking.

Only the separate homepage preview rotates, not the full category/card list. All carousels use ~3 seconds, pause on focus/touch/hover, when offscreen/hidden, and respect reduced motion. Explicit pause/play and manual previous/next are available. Existing review carousel retains swipe/dots and uses the existing real review sources.
