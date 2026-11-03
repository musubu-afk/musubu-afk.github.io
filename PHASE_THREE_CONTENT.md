# Phase 3 content operations

Edit `phase-three-data.js` in the existing repository. No separate database or admin website is introduced.

## Festivals

`MUSUBU_FESTIVALS` is an array of records with:
- `id`: stable unique text key
- `region`: `nonsan` or `fukuoka` (can extend with configured regions)
- `name`, `description`, `location`, `image_url`, `url`
- `start_date`, `end_date`: verified ISO dates `YYYY-MM-DD`
- `display_from`: optional promotion start date; defaults to start date
- `published`: boolean, must be true to be shown
- `translations`: `{ko:{name,description,location},ja:{name,description,location}}`

The banner shows only the selected region, from display_from through end_date inclusive in Asia/Seoul. One record is static; multiple records rotate. Search also finds published upcoming festivals. Only http/https links are accepted. No past/sample festival is populated in production.

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
