# AGENTS.md · brief for any agent working on Miale ya Tumaini

## Goal
A premium, calm website and admin for a Kenyan children's and family charity. Visitors read, listen, watch and give. The charity's staff edit everything themselves, with live previews, and never need a developer for routine changes.

## Rules that do not change
1. **Facts come from the organisation.** Do not invent figures, names, programme details, or testimonials. Default copy is what the organisation supplied. Anything new is a placeholder and must be flagged.
2. **Consent first.** Photos of children are hidden on the public site until consent is ticked. Do not weaken this.
3. **Solid, not generic.** Surfaces are solid colours. Glass is an option the owner can turn off (Settings > Shapes & glass). No gradients on brand surfaces. The blue is flat.
4. **Every change has a visible result.** Editors show a live preview beside them. Saves confirm with the "Saved" label. Errors use the error sound and a short vibration.
5. **Motion is the owner's choice.** Four levels: Still, Subtle, Rich (default), Maximum. Everything must work with Still. Respect prefers-reduced-motion on top of this.
6. **Sound is synthesised.** `ux.js` builds every sound with the Web Audio API. Do not add audio files for UI sounds unless asked. Browsers need one tap before sound can start, so nothing plays on load.
7. **No new frameworks.** The project is static HTML, CSS and vanilla JS. Keep it that way until the backend decision is made.
8. **Storage is Supabase.** `supabase-client.js` (window.MTDB) is the only place that talks to the database. If config.js is empty, the site falls back to browser storage. Never put the service-role key in the site.
9. **Row-level security is the access control.** Change `supabase/schema.sql` deliberately and re-run it. Keep the rules for consent and comment approval intact.

## Architecture
- `app.js` owns the store (`S`), defaults, the public site render, and `window.MT` (the API the other files use).
- `ux.js` owns sound, haptics, click sounds and banners. It reads settings from `MT.look().sound`.
- `admin.js` owns the admin. It only talks to the rest of the site through `MT`.
- Looks live in `S.look`: `morph` (one of 15 shapes), `glass` (on/off), `font` (one of 6 pairings), `size`, `motion`, `sound`. `MT.applyLook()` writes them to `<html data-*>` and CSS variables.
- Shape styles are CSS variable sets keyed by `[data-morph=name]` in styles.css. The admin uses `.mp[data-morph=…]` to preview each one.
- Events: `MT.track(kind, detail)` writes to the `events` table when connected, and to `mt-events` on the device. Kinds: comment, donate, social, call, prog, play, early. Preview and admin sessions are not tracked.

## Decisions taken (and why)
- Floating navbar with a mega menu for "Our work". The fourth column shows the programme under the pointer, as in the brief. Touch devices open the menu on tap.
- The top edge line is the reveal cue. When the navbar is tucked away, a thin accent line runs the full width. Hovering it brings the navbar back, and leaving the navbar hides it again.
- Statistics leads with simple counts. Recordings, plays and listening time moved to Media > Audio, where they belong.
- The calendar is a 14-day strip on the page. The full five-week calendar opens in a dialog.
- Settings are grouped under Identity, Experience, Business and Admin, so each page has one job.
- Audio cutting writes a new WAV and keeps the original until restored. Cutting is destructive for the public, so the original is kept.
- The guided tour is four steps, shown on Statistics until finished or skipped.

## Working on this
- Run `node --check` on the JS files after edits. Test in a browser before shipping: the sound design and the mobile layout were built without listening or seeing them on a device.
- When shell files change, bump `CACHE_NAME` in sw.js.
- Update CHANGES.md with what you did and what is still open.
- Do not start the database work unless asked. DATA.md is the contract to build from.
