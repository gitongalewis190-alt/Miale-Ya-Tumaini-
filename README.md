# Miale ya Tumaini website

Static site: `index.html`, `styles.css`, `app.js` (public site and shared store), `admin.js` (admin panel), plus PWA files.
Upload the CONTENTS of this folder to the repository root.

## Admin
Open `index.html#/admin` or use the person icon in the header.
Sections: Statistics (visits calendar), Content, Programmes, Impact figures, Images (photo slots and the consent-gated catalogue), Audio, Stories & comments, Contact & social, Donations, Brand & colours (palette presets), Language, Appearance (theme and phone/desktop preview). Sign out is at the bottom of the rail.

Photos of children show on the public site only after the **Consent** box is ticked on each photo.
Visitor comments show only after **Approve and show** in Stories & comments. The signature is visible to admins only and is never published.

## For the backend developers
Content is currently saved in the visitor's own browser (localStorage + IndexedDB), so changes made in the admin are visible only on that browser.
Replace these in the code, all marked or named below:
- `app.js`: `saveS` / `get` / `setG` (settings), `mAll` / `mPut` / `mDel` (images and audio), the comment storage (`mt-comments`, written by the comment form), and the visit log (`mt-visit-log`, written once per browser session).
- `admin.js`: `adminLogin` (marked BACKEND HOOK). **Until this is replaced, anyone can open the admin.** Do not publish with it open.
- Donation link and M-Pesa / bank details are set in Admin > Donations and are empty until filled in.

## Hosting
If the host serves `_headers`, its Content-Security-Policy already allows `blob:` images and audio, and allows the admin preview frame (`frame-ancestors 'self'`).
`sw.js` precaches the shell; bump `CACHE_NAME` whenever shell files change.
Set the real domain in `sitemap.xml` (currently `REPLACE-WITH-DOMAIN`).
