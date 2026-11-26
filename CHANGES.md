# CHANGES · this version

## Round 3 (this ZIP)
Done:
1. Contents: one area at a time (Home hero, Organisation, Mission, What we do, How we work, Footer, Section titles). Pill buttons switch areas. Premium button style across the admin.
2. Home hero: photo layout (right, left, or wide above the text), shape (portrait, square, landscape), headline animation (word by word, fade, still), and extra home photos that take turns every five seconds (Still motion shows only the first).
3. Text on photos: words on the home photo and the donation banner, with place (top, middle, bottom) and look (soft shadow, colour band, outline, capitals, slides in). Live preview beside the controls, and the same look on the site.
4. Images: a jump bar to each part of the page. HD conversion: camera rotation is corrected, the longest side goes up to 2400px, and files are saved at high quality. Photos are never enlarged.
5. Programmes and pillars: each card has its own photo, with the same drop area as the rest of the editor.
6. Programmes and testimonials: one card opens at a time, others show as compact rows.
7. Important figures: optional source note under each label (AGENTS.md rule 1: figures need a source).
8. Audio: speaker photo for each recording, shown beside the title on the site.
9. Media: a top menu switches between Images, Audio and Video.
10. Contact & social: a list of extra links (name and link), shown beside Facebook, Instagram and WhatsApp.
11. Motion: Try it now moves the demo box at the level it names.
12. Live preview updates for pillars, how we work, mission, footer and social links.
13. Earlier round: sidebar hover and accordion, stat cards, full calendar, save message, keyboard sound, back-to-top.

## Not done (say so before you test)
- Video file upload. Only YouTube and Vimeo links are supported. Uploading large video files needs a decision on storage size and cost.
- Video thumbnail upload. The site still shows the platform's own thumbnail.
- Shapes & glass: a colour preview on each style card and a quick variation picker.
- Scroll text blur: left as it was.
- Online saving: needs the Supabase admin sign-in finished. Until then changes stay on the device.
- Long-press and resize tiles, and the Done button: not in this code base.
- Not tested in a browser. Syntax checked only.

## Round 2 (this ZIP)
Done:
1. Admin sidebar opens on hover and closes when the mouse leaves. A click no longer keeps it open (the old focus rule did). Keyboard focus still opens it.
2. Sidebar is an accordion: Overview, Website, Media and Settings. One group opens at a time, and its entries appear only inside it. Settings holds Identity, Experience, Business and Admin as nested groups.
3. Statistics cards and admin panels are raised with a stronger edge and layered shadow. Dark mode keeps the same lift.
4. Full calendar dialog is no longer capped at the public 560px width, so it shows the full five weeks.
5. The "not connected to the database" wording is removed from Statistics, the tour, Listening and Data & backup.
6. The "Not saved online" banner now says "Saved on this device" and shows once per visit, not on every save. Saving online still needs an admin sign-in (see Still open).
7. Typing on a keyboard no longer plays a sound.
8. The circular scroll indicator is replaced by a square back-to-top button with a thin progress edge.

## Still open (not done in this ZIP)
- Hero: orientation, placement, multiple images, overlay text and animated text.
- Programmes: image upload and the same editing layout as Contents.
- Pillars: image upload.
- Contents: the simpler "one area at a time" layout, premium buttons, and HD image conversion on upload.
- Media: mega menu, image text overlays and text effects, audio artwork and speaker images, video upload.
- Shapes & glass: colour preview per style and a quick variation picker.
- Contact & social: more links and easier editing.
- Scroll text blur: a richer treatment on the public site.
- Online save: needs the admin sign-in step in Supabase to be finished.
- Not tested in a browser. Checked with node --check only.

## Added (what the brief asked for, and what was added on top)
1. Admin navigation regrouped into Overview, Website, Media and Settings, with submenus under Settings.
2. Media group: Images, Audio and Video (YouTube or Vimeo links).
3. Inbox: comments, donation clicks, social taps and early visits, newest first, with filters and mark-as-read. Unread count on the menu.
4. Shapes & glass: 15 shape styles, each previewed on its own card, and a glass on/off switch.
5. Typography: 6 font pairings with live samples, and text size from 90% to 115%.
6. Motion: Still, Subtle, Rich and Maximum, with a "Try it" for each. Maximum adds parallax on the hero photo.
7. Sounds & haptics: 9 synthesised sounds, 4 characters (Soft, Crisp, Warm, Glass), volume, per-sound switches, a Test button for each, and vibration on phones.
8. iOS-style banners: drop from the top, swipe up to dismiss. Used only for comments, donation clicks and alerts.
9. Mega menu for "Our work", four columns, with the fourth column showing the programme under the pointer.
10. Floating navbar with 8px padding and a rounded, translucent container.
11. Top edge line that reveals the navbar on hover, and returns on scroll up.
12. Statistics: eight counts (visits, today, last 7 days, unique devices, donation clicks, social taps, comments waiting, phone share). A 14-day strip, a full calendar in a dialog, and a ranking of programmes people open.
13. Recordings, plays and listening time moved from Statistics to Media > Audio.
14. Programme editor: live card preview and "Open as a visitor".
15. Image framing: drag to choose the focal point, zoom in, and see exactly what visitors see.
16. Audio editor: waveform, start and end trim, play selection, cut (writes a new WAV), restore original.
17. Stories & comments: live preview of each testimonial and approved comment.
18. Video section on the site and in the admin.
19. Guided tour for first-time admins, four steps, dismissable.
20. Data & backup: JSON export of content, settings, comments, events and a media list. Reset moved here.
21. "Back to the website" and "Preview" are always visible. On mobile, the same menu opens as a drawer.
22. Scroll reveal with rising blur, tuned by the motion setting.
23. Copy: default labels and empty states reworded to be specific. No facts changed.

## Still open (not done in this version)
- Not tested in a browser. The layouts, the mega menu, the banners and the sounds were written but not seen or heard on a device.
- The sounds are synthesised, so they need listening and tuning by ear. The four character packs are a first draft.
- Haptics do not work on iPhone Safari (no vibration API).
- The single-file preview artifact was not built.
- Default copy is a rewording of the existing text. The organisation must confirm every figure and claim.
- Statistics are per browser. The backend is needed for real counts.
- The admin sign-in is still the placeholder: anyone can open the admin.
- The database is not started. DATA.md is the contract.
- The donation link and M-Pesa / bank details stay empty until the organisation fills them in.
