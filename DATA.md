# DATA.md · what the backend must store

No SQL has been written or run. This is the contract for the backend work.

| Entity | Fields (current names) | Where it lives now |
|---|---|---|
| Site content (per language en/sw) | hero, mission, pillars, how, programmes, figures, give, contact, foot, brand, testimonials, videos, section labels | localStorage `mt-s` (`c.en`, `c.sw`) |
| Colours | bg, blue, accent, brown | `mt-s` `col` |
| Photo slots | hero, logo, donate → media id | `mt-s` `slots` |
| Photo categories | kids, visitors, moments, stories, programmes → media ids | `mt-s` `cats` |
| Focus and zoom | per slot: x %, y %, z | `mt-s` `focus` |
| Look and sound | morph, glass, font, size, motion, sound{on, vol, pack, haptics, ev} | `mt-s` `look` |
| Media | id, kind (img, audio), cat, consent, title, speaker, lang, desc, date, dur, plays, blob, orig | IndexedDB `miale-media` |
| Comments | id, name, message, date, approved, signature (admin only) | localStorage `mt-comments` |
| Events | time, kind (comment, donate, social, call, prog, play, early), detail | localStorage `mt-events` |
| Visits | time, device kind (m or d), device id, language | localStorage `mt-visit-log` |
| Admin session | signed-in flag | sessionStorage `mt-admin` (replace with a real session) |

Suggested tables when the time comes: content_entries (locale, key, value JSON), settings (key, value JSON), media (id, kind, storage_url, cat, consent, metadata), comments (id, status, approved_by, approved_at), events (id, kind, detail, created_at, device_hash), visits (id, created_at, device_hash, device_kind, locale). Keep signatures in a restricted store. Do not publish them.
