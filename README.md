# Miale ya Tumaini website

Static site. Upload the CONTENTS of this folder to the repository root.

Files
- `index.html`: page shell (public site and admin mount point), script order: app.js, ux.js, admin.js
- `styles.css`: all styling. Sections: tokens, 15 shape styles, motion levels, public site, admin
- `app.js`: public site, shared store, looks, mega menu, edge reveal, event tracking, router
- `ux.js`: sounds (synthesised, no files), haptics, click sounds, swipe-to-dismiss banners, admin alerts
- `admin.js`: admin panel (sign-in, navigation, editors with previews, audio, images, settings)
- `sw.js`, `_headers`, `manifest.webmanifest`, `offline.html`, `robots.txt`, `sitemap.xml`, `icons/`
- `AGENTS.md`: the brief for anyone changing this project. Read it first.
- `CHANGES.md`: what changed in this version and what is still open.
- `DATA.md`: the data the backend will need to store. No SQL has been written or run.

## Admin
Open `index.html#/admin`, or use the person icon in the header. Sign in (see the backend hook below).
Navigation groups: Overview (Statistics, Inbox), Website (Content, Programmes, Impact figures, Stories & comments),
Media (Images, Audio, Video), Settings (Identity: Brand, Typography, Shapes & glass; Experience: Motion, Sounds & haptics,
Language; Business: Donations, Contact & social; Admin: Admin look, Data & backup).
"Back to the website" and "Preview" are always visible. On a phone the same menu opens from the top bar.

Photos of children show on the public site only after **Consent** is ticked on each photo.
Visitor comments show only after **Approve and show**. The signature is visible to admins only and is never published.

## For the backend developers
Content, photos, comments, statistics and admin accounts are stored in Supabase once `config.js` is filled in (see JOURNEY.md, section 8). Without it, the site falls back to browser storage.
Replace these, all marked BACKEND in the code:
- `app.js`: `saveS`, `mPut` / `mDel` / `loadMedia` (media), the comment store (`mt-comments`), the event log (`mt-events`), the visit log (`mt-visit-log`).
- `admin.js`: `adminLogin`. **Until this is replaced, anyone can open the admin.** Do not publish with it open.
- Donation link and M-Pesa / bank details are set in Admin > Donations and are empty until filled in.

## Hosting
`_headers` sets the Content-Security-Policy. It allows `blob:` images and audio, the admin preview frame (`frame-ancestors 'self'`), and embedded YouTube (youtube-nocookie) and Vimeo players.
`sw.js` precaches the shell; bump `CACHE_NAME` whenever shell files change.
Set the real domain in `sitemap.xml` (currently `REPLACE-WITH-DOMAIN`).
