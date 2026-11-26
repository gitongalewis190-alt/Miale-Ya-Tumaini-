# The journey · Miale ya Tumaini website

A record of how the site was built, what changed at each step, and what is still open. Written so that anyone picking this up can see why things are the way they are.

## 1. Starting point
A static site (HTML, CSS, vanilla JavaScript) with a public page for visitors and an admin area for staff. Content, photos and comments were stored in each browser. Nothing was shared between visitors.

## 2. Premium pass
- Admin regrouped into Overview, Website, Media and Settings, with submenus under Settings.
- Fifteen shape styles, a glass on/off switch, typography pairings, four motion levels and a sound settings page.
- Live previews beside every editor. Audio cut and trim. Image framing with a focal point and zoom.
- Floating navbar with a mega menu. A hairline at the top of the page brings the navbar back on hover.

## 3. Upload and repository
- Packaged as a zip with an upload guide (`UPLOAD-GUIDE.md`).
- A repository was supplied that held stale files (a build script, a tokens record, and placeholder icons). They were removed. The shared files matched the build.

## 4. Sound and feedback (this step)
- The original sounds were generic defaults. They were replaced with a synthesised set: a short dry key tick for every button press (mouse, pen and touch), a lighter tick for selections, and a soft three-note success tone. Four characters are available: Keys (default), Marimba, Glass and Soft.
- Keyboard typing in text fields produces a quiet tick, and Enter or Space on a control gives the same feedback as a click.
- Top banners drop in from the top of the screen and swipe up to dismiss. A banner can carry one action (for example, Undo).
- Mouse only: a soft light follows the cursor across cards, and primary buttons lean slightly toward the pointer.
- Dark mode is a single button beside the language button on phones. On larger screens the three-way theme control stays in the header.
- The phone menu is grouped into Explore, Discover and Take part. Dark mode and language are no longer in the menu.
- The mega menu opens on a short hover delay, stays open while the pointer is inside it, closes after a short grace period, and supports the arrow keys and Escape.

## 5. Eight features, chosen to differ from one another
1. Cursor light on cards (mouse only).
2. Buttons that lean toward the pointer (mouse only).
3. Back-to-top button with a progress ring.
4. Share a programme (system share sheet, or copy link).
5. Print a programme.
6. Admin command palette (Ctrl+K or Cmd+K).
7. Undo for removed programme, impact and story items.
8. Visitor preferences (language and theme) saved to the database for the owner's statistics, and restored on the device.

## 6. Connected to Supabase
- **Admin accounts.** The first visit to the admin asks for an email and password. The first account created becomes the owner. Later visits sign in. Passwords are stored and checked by Supabase, never by the site.
- **Content.** Every change in the admin is saved to one settings row. Visitors read it on each visit.
- **Comments.** Visitors submit comments, which are kept unapproved until an admin approves them. Only approved comments are public.
- **Photos and recordings.** Files go to one storage bucket. Metadata goes to a table. Photos without consent are hidden from visitors by the database itself, not only by the page.
- **Statistics.** Visits, clicks, plays and preferences are written to the database. The admin reads them back.
- **Security rules.** Row-level security limits visitors to reading approved content and writing comments and events. Only the owner can change content.

## 7. Status (updated after project creation)
- **Done:** the Supabase project "Miale ya Tumaini" was created (ap-south-1, $0 a month, approved by the owner). Its URL and publishable key are in `config.js`. The schema was applied. The photo and audio storage bucket exists.
- **Security advisor:** `claim_admin` could be called by anonymous visitors and is now restricted to signed-in users. The admins table has no direct access for the public or for signed-in users. `is_admin`, `admin_exists` and `increment_plays` stay callable by visitors, because the row-level security policies call them. Each one returns only a true or false answer, or increments a plays counter.
- **Fixed:** the public comment query no longer fetches signatures. Signatures are visible to admins only.
- **Still to do by hand:** set email confirmation under Authentication > Providers > Email, set the site URL under Authentication > URL Configuration, and run one real sign-in and upload.
- **Not verified in a browser:** sounds, phone layout, the mega menu and the sign-in screen.

## 8. Steps to finish (for the owner or a developer)
1. Done: the project exists and `config.js` is filled in.
2. Done: the schema is applied.
3. (Done.)
4. In Authentication > Providers > Email, decide whether new accounts must confirm their email. If they must, the first admin confirms by email and then signs in. If not, they are signed in at once.
5. In Authentication > URL Configuration, set the site URL to the live domain.
6. Open `/#/admin` and create the admin account. Do this straight after the site goes live, because the first account created becomes the owner.
7. Upload the files and check the sign-in, one photo upload, one comment and one approval.

## 9. Known limits
- Photos in the public bucket are reachable by their address. Addresses are random identifiers, but anyone with the address can open the file, even if consent is withdrawn. A private bucket with time-limited links would close this gap.
- The first admin account is claimed by whoever signs up first while no admin exists. Set it up immediately after launch.
- Haptic (vibration) feedback does not work on iPhone.
