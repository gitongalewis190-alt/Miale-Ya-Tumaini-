# Upload guide · Miale ya Tumaini website

## 1. What you are uploading
Everything inside the `miale-site` folder (or the contents of the zip). Upload the files themselves, not the folder wrapper, so `index.html` sits at the top level of the site.

Files: `index.html`, `styles.css`, `app.js`, `ux.js`, `admin.js`, `sw.js`, `_headers`, `manifest.webmanifest`, `offline.html`, `robots.txt`, `sitemap.xml`, `icons/` (three PNG files), plus the four guide files (`README.md`, `AGENTS.md`, `CHANGES.md`, `DATA.md`) and this guide. The guide files are for developers; they are harmless to publish, but you can leave them out.

## 2. Before you upload
- **Set your domain** in `sitemap.xml` (replace `REPLACE-WITH-DOMAIN`).
- **Do not publish while the admin is open to everyone.** Sign-in is a placeholder: any input enters the admin. Either keep the site unlinked until the backend sign-in is connected, or ask the developer to add real sign-in first. The admin lives at `/#/admin`.
- Confirm the donation details (link, M-Pesa, bank) are correct, or leave them empty so they stay hidden.

## 3. Where to host
The `_headers` file uses the Netlify and Cloudflare Pages format, so either works well:
- **Netlify:** drag the folder onto app.netlify.com/drop, or connect a Git repository. Set the publish directory to the root.
- **Cloudflare Pages:** create a project, upload the files directly (Direct Upload), and leave the build command empty.
- Any static host works, but without `_headers` the security headers and the embedded-video permissions must be set by hand (see `README.md`).

## 4. After the first upload
1. Open the site on a desktop and on a phone. Check the header, the menu and the mega menu.
2. Open `/#/admin`, sign in, and check that Statistics loads.
3. Upload one test photo in Images, and check it appears under the right group.
4. Play a sound: go to Settings > Sounds & haptics and press Test. Tap a button on the site. The first tap unlocks sound in most browsers.
5. Check the donation card and the comment form. Send a test comment, then approve it in Stories & comments.

## 5. When you change the files later
- Replace the files, then bump `CACHE_NAME` in `sw.js` (for example `miale-shell-v5`). This makes returning visitors pick up the new version.
- Clear your own browser cache, or open the site in a private window to confirm the change.

## 6. Important limits (read before going live)
- Content, photos, comments and statistics are saved **in each visitor's browser**, not on a server. Real visitors will not see the changes you make in the admin until the backend is connected. Statistics count only the browser they were recorded in.
- Photos of children show only when consent is ticked. Comments show only when approved.
- The sounds and the layouts were built without being tested on a device. Please report anything that sounds wrong or sits in the wrong place.
- Haptic (vibration) feedback does not work on iPhone.

## 7. Backup
Use Admin > Data & backup > Download export before any major change. It saves content, settings, comments and the event log in one file. Photos and recordings are listed but not included because of their size; keep your originals.
