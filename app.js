/* Miale ya Tumaini · app.js (public site + shared store)
   Content lives in the browser for now (localStorage + IndexedDB).
   BACKEND HOOKS (search for "BACKEND"): saveS, mPut, mDel, loadMedia, the comment store (mt-comments),
   the event log (mt-events) and the visit log (mt-visit-log), and adminLogin in admin.js.
   See AGENTS.md and DATA.md before changing storage. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function jget(k, d) { try { var v = JSON.parse(LS.get(k)); return v == null ? d : v; } catch (e) { return d; } }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  var IS_PREVIEW = !!window.MT_PREVIEW_MODE || /[?&]preview=1/.test(location.search);
  var lang = LS.get('mt-lang') === 'sw' ? 'sw' : 'en';
  var view = 'site';

  /* ---------- the choices an admin can make ---------- */
  var MORPHS = [
    ['glass', 'Glass', 'Translucent panels that blur what sits behind them.'],
    ['frosted', 'Frosted', 'Dense frost. Quiet and easy to read.'],
    ['liquid', 'Liquid', 'Heavy blur, very soft corners, a bright top edge.'],
    ['neumorph', 'Soft relief', 'Panels pressed out of the background. No borders.'],
    ['clay', 'Clay', 'Inflated, soft shapes with light inside.'],
    ['brutal', 'Brutal', 'Hard black edges, square corners, offset shadows.'],
    ['outline', 'Outline', 'Transparent panels drawn with one line.'],
    ['flat', 'Flat', 'Solid tints. No shadows, no borders.'],
    ['paper', 'Paper', 'Stacked sheets with a ruled edge.'],
    ['retro', 'Retro', 'Bold outline with a coloured offset shadow.'],
    ['tinted', 'Tinted glass', 'Accent-coloured glass that carries the palette.'],
    ['stitch', 'Stitched', 'Dashed seams, like hand-sewn cloth.'],
    ['sticker', 'Sticker', 'Thick white border, lifted off the page.'],
    ['bevel', 'Chrome bevel', 'Raised edges with a metal-like bevel.'],
    ['editorial', 'Editorial', 'Open layout. Only a thick accent rule marks each block.']
  ];
  var FONTS = [
    { id: 'bricolage', n: 'Bricolage & Figtree', fd: '"Bricolage Grotesque"', fb: 'Figtree', fwh: 800, q: 'family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700', d: 'Warm and modern. The current default.' },
    { id: 'instrument', n: 'Instrument Serif & Sans', fd: '"Instrument Serif"', fb: '"Instrument Sans"', fwh: 400, q: 'family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700', d: 'Editorial and calm. Headings read like a magazine.' },
    { id: 'fraunces', n: 'Fraunces & Inter', fd: 'Fraunces', fb: 'Inter', fwh: 600, q: 'family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700', d: 'Soft serif headings with a clear text face.' },
    { id: 'dm', n: 'DM Serif & DM Sans', fd: '"DM Serif Display"', fb: '"DM Sans"', fwh: 400, q: 'family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700', d: 'Classic display serif, friendly sans for reading.' },
    { id: 'jakarta', n: 'Plus Jakarta Sans', fd: '"Plus Jakarta Sans"', fb: '"Plus Jakarta Sans"', fwh: 800, q: 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800', d: 'One family, confident and simple.' },
    { id: 'manrope', n: 'Manrope', fd: 'Manrope', fb: 'Manrope', fwh: 800, q: 'family=Manrope:wght@400;500;600;700;800', d: 'Geometric and precise. Good for data-heavy pages.' }
  ];
  var MOTIONS = [
    ['off', 'Still', 'No movement. Everything appears at once.'],
    ['subtle', 'Subtle', 'Short fades and small lifts.'],
    ['rich', 'Rich', 'Soft rise with blur as you scroll. The default.'],
    ['max', 'Maximum', 'Longer springs, parallax on the hero photo, stronger blur.']
  ];
  var SOUND_EV = [
    ['click', 'Button click', 'Every button, link and tap.'],
    ['select', 'Select', 'Switching a tab, a palette or a shape.'],
    ['success', 'Saved', 'When a change is saved.'],
    ['error', 'Problem', 'A field needs attention. Also a short vibration.'],
    ['notify', 'Notification', 'A banner that needs your attention.'],
    ['comment', 'Comment', 'A new comment arrives or is sent.'],
    ['donate', 'Donation', 'A donation is started. Celebratory.'],
    ['section', 'Section', 'Moving between sections of the site.'],
    ['media', 'Play', 'Starting or pausing a recording.']
  ];
  var SOUND_DEF = { on: true, vol: 50, pack: 'keys', haptics: true, ev: { click: true, select: true, success: true, error: true, notify: true, comment: true, donate: true, section: true, media: true } };
  var LOOK_DEF = { morph: 'glass', glass: true, font: 'bricolage', size: 100, motion: 'rich', sound: SOUND_DEF };

  /* ---------- default content ---------- */
  var SEC_EN = { nav_work: 'Our work', nav_impact: 'Impact', nav_give: 'Give', nav_gallery: 'Gallery', nav_voices: 'Voices', nav_videos: 'Videos', nav_how: 'How we work', nav_visit: 'Visit',
    pil_t: 'What we do', prog_t: 'Our programmes', prog_i: 'Six programmes. Open one to see what it includes.', imp_t: 'Impact', imp_i: 'What the work looks like, in numbers.',
    give_t: 'Give a child a meal', give_i: 'Every gift keeps children in class, fed and learning.', give_btn: 'Give now', give_call: 'Prefer to give by phone?',
    gal_t: 'Moments', gal_i: 'Photographs shared with written consent.', voi_t: 'Voices', voi_i: 'Listen to the people and stories behind the work.',
    vid_t: 'On video', vid_i: 'Short films from the programmes.', tes_t: 'Kind words', how_t: 'How we work', vis_t: 'Visit and contact',
    con_t: 'Leave us a few words', con_i: 'Our team reads every message before it appears on this page.', c_name: 'First name', c_msg: 'Your comment',
    c_consent: 'I agree that my first name and comment may be shown on this site after approval.', c_sig: 'Your signature', c_sig_clear: 'Clear', c_send: 'Send comment',
    c_e1: 'Please write your comment.', c_e2: 'Please tick the box to agree.', c_e3: 'Please sign in the box.', c_ok: 'Thank you. Your comment is with our team for review.',
    ph: 'Phone', em: 'Email', find: 'Find us', more: 'Learn more', powered: 'Powered by', quick: 'Explore', reach: 'Reach us', follow: 'Follow us', all: 'All',
    mg_see: 'Open programme', mg_take: 'Take part', mg_explore: 'Explore', mg_prog: 'Programmes', mg_comment: 'Leave a comment', mg_discover: 'Discover' };
  var SEC_SW = { nav_work: 'Kazi zetu', nav_impact: 'Athari', nav_give: 'Changia', nav_gallery: 'Picha', nav_voices: 'Sauti', nav_videos: 'Video', nav_how: 'Jinsi tunavyofanya kazi', nav_visit: 'Tembelea',
    pil_t: 'Tunachofanya', prog_t: 'Programu zetu', prog_i: 'Programu sita. Fungua moja kuona inajumuisha nini.', imp_t: 'Athari', imp_i: 'Kazi yetu kwa takwimu.',
    give_t: 'Mpe mtoto mlo', give_i: 'Kila mchango huwaweka watoto darasani, wakiwa wamelishwa na wakijifunza.', give_btn: 'Changia sasa', give_call: 'Ungependa kuchangia kwa simu?',
    gal_t: 'Nyakati', gal_i: 'Picha zilizoshirikiwa kwa idhini ya maandishi.', voi_t: 'Sauti', voi_i: 'Sikiliza watu na hadithi nyuma ya kazi yetu.',
    vid_t: 'Kwenye video', vid_i: 'Filamu fupi kutoka programu zetu.', tes_t: 'Maneno mazuri', how_t: 'Jinsi tunavyofanya kazi', vis_t: 'Tembelea na wasiliana nasi',
    con_t: 'Tuachie maneno machache', con_i: 'Timu yetu husoma kila ujumbe kabla haujaonekana kwenye ukurasa huu.', c_name: 'Jina la kwanza', c_msg: 'Maoni yako',
    c_consent: 'Nakubali jina langu la kwanza na maoni yangu yaonyeshwe kwenye tovuti hii baada ya kuidhinishwa.', c_sig: 'Sahihi yako', c_sig_clear: 'Futa', c_send: 'Tuma maoni',
    c_e1: 'Tafadhali andika maoni yako.', c_e2: 'Tafadhali weka alama ya kukubali.', c_e3: 'Tafadhali weka sahihi yako.', c_ok: 'Asante. Maoni yako yametumwa kwa mapitio.',
    ph: 'Simu', em: 'Barua pepe', find: 'Tupate', more: 'Soma zaidi', powered: 'Inaendeshwa na', quick: 'Gundua', reach: 'Wasiliana nasi', follow: 'Tufuate', all: 'Yote',
    mg_see: 'Fungua programu', mg_take: 'Shiriki', mg_explore: 'Gundua', mg_prog: 'Programu', mg_comment: 'Acha maoni', mg_discover: 'Jifunze' };
  var CONTACT = { phones: ['0723 315 423', '0790 943 693'], email: 'mialeyatumaini@gmail.com', wa: '254723315423', fb: 'https://www.facebook.com/MialeYaTumaini', ig: 'https://www.instagram.com/MialeYaTumaini' };
  var CATS = [['kids', 'Children'], ['visitors', 'Visitors with children'], ['moments', 'Moments together'], ['stories', 'Stories'], ['programmes', 'Programmes']];
  var CONSENT_CATS = ['kids', 'visitors', 'moments', 'stories'];
  var PALETTES = [
    { n: 'Cream & blue', bg: '#F6F0E4', blue: '#0B4FC4', accent: '#F98A0B', brown: '#B76732' },
    { n: 'Sand & forest', bg: '#F3EDE1', blue: '#1F5C4A', accent: '#E0A526', brown: '#8A5A2B' },
    { n: 'Linen & plum', bg: '#F5EFE8', blue: '#5B2A5E', accent: '#F28C5B', brown: '#9C5B3B' },
    { n: 'Warm white & teal', bg: '#FAF6EE', blue: '#0E6F73', accent: '#F2A93B', brown: '#A4572E' },
    { n: 'Oat & terracotta', bg: '#F4ECDD', blue: '#2F4A8A', accent: '#D9643A', brown: '#7D4A2A' },
    { n: 'Sage & coral', bg: '#EEF0E6', blue: '#3D5A3A', accent: '#F07A63', brown: '#6E4F34' },
    { n: 'Cream & ink', bg: '#F7F2E9', blue: '#1C2433', accent: '#F2B134', brown: '#A3642F' },
    { n: 'Blush & navy', bg: '#F8EEE9', blue: '#1D3557', accent: '#E76F51', brown: '#9B4D2E' }
  ];

  var DEF = {
    en: {
      brand: { name: 'Miale ya Tumaini', tag: 'Creating Change Together' },
      hero: { h1: 'An environment where children and families can thrive.', lead: 'Kware, Ongata Rongai, Kenya. Working since 2014.', cta1: 'Give today', cta2: 'See our programmes' },
      mission: { text: 'To create an environment where children and families can thrive through psychosocial support, quality education, sustainable livelihood opportunities and essential legal assistance.' },
      pillars: [
        { t: 'Psychosocial support', d: 'Counselling in a safe, private space.' },
        { t: 'Quality education', d: 'Daily meals and holiday learning for children.' },
        { t: 'Sustainable livelihoods', d: 'Practical skills for parents and guardians.' },
        { t: 'Legal assistance', d: 'Help for families with essential legal needs.' }
      ],
      programmes: [['Feeding', 'Daily hot meals for school-going children.', 'A hot meal every school day helps children stay in class, concentrate and grow.'], ['Holiday', 'Life-skills activities during school holidays.', 'Holidays are filled with life-skills activities so children keep learning and stay safe.'], ['Empowerment Training', 'Practical skills for parents and guardians.', 'Parents and guardians gain practical skills that help their families earn a steady living.'], ['Parental Conversations', 'Forums for parents.', 'Open forums where parents share experiences and support one another.'], ['Home Visits', 'We assess family needs and arrange support.', 'Our team visits families at home, listens, and arranges the support they need.'], ['Counseling', 'Sessions with trained professionals.', 'Children and families meet trained professionals in a safe, private space.']].map(function (p) { return { t: p[0], d: p[1], more: p[2] }; }),
      figures: [{ n: '17000', s: '+', l: 'Meals a month' }, { n: '350', s: '+', l: 'Children a day' }, { n: '2014', s: '', l: 'Working since' }],
      give: { title: '', link: '', mpesa: '', account: '', amounts: 'KSh 500 · KSh 1,000 · KSh 2,500', text: 'Your gift pays for hot meals, counselling sessions and school-holiday activities.' },
      how: [{ t: 'Honest numbers', d: 'Every figure we publish comes from our own records.' }, { t: 'Consent first', d: 'We share a photograph or story only with the written consent of the person and their guardian.' }, { t: 'Data protection', d: 'Personal data is handled under the Kenya Data Protection Act, 2019.' }],
      testimonials: [],
      videos: [],
      contact: Object.assign({ places: ['Junction of Mayor Road and Gataka Road, Kware', 'KenyaWorks Foundation, along Gataka Road', 'Project Ben, Gataka'] }, CONTACT),
      foot: { copy: '© 2026 Miale ya Tumaini. All rights reserved.', blurb: 'Supporting children and families in Kware, Ongata Rongai.' }
    },
    sw: {
      brand: { name: 'Miale ya Tumaini', tag: 'Tunabadilisha Pamoja' },
      hero: { h1: 'Mazingira ambamo watoto na familia wanaweza kustawi.', lead: 'Kware, Ongata Rongai, Kenya. Tunafanya kazi tangu 2014.', cta1: 'Changia leo', cta2: 'Tazama programu zetu' },
      mission: { text: 'Kuunda mazingira ambamo watoto na familia wanaweza kustawi kupitia msaada wa kisaikolojia, elimu bora, fursa endelevu za riziki na msaada muhimu wa kisheria.' },
      pillars: [
        { t: 'Msaada wa kisaikolojia', d: 'Ushauri katika nafasi salama na ya faragha.' },
        { t: 'Elimu bora', d: 'Milo ya kila siku na kujifunza wakati wa likizo.' },
        { t: 'Riziki endelevu', d: 'Stadi za vitendo kwa wazazi na walezi.' },
        { t: 'Msaada wa kisheria', d: 'Msaada kwa familia zenye mahitaji ya kisheria.' }
      ],
      programmes: [['Lishe', 'Milo ya moto ya kila siku kwa watoto wanaosoma shuleni.', 'Mlo wa moto kila siku ya shule huwasaidia watoto kubaki darasani, kuzingatia na kukua.'], ['Likizo', 'Shughuli za stadi za maisha wakati wa likizo za shule.', 'Likizo hujazwa shughuli za stadi za maisha ili watoto waendelee kujifunza na kuwa salama.'], ['Mafunzo ya Uwezeshaji', 'Stadi za vitendo kwa wazazi na walezi.', 'Wazazi na walezi hupata stadi za vitendo zinazosaidia familia kupata kipato cha uhakika.'], ['Mazungumzo ya Wazazi', 'Majukwaa ya mazungumzo kwa wazazi.', 'Majukwaa ya wazi ambapo wazazi hushiriki uzoefu na kusaidiana.'], ['Ziara za Nyumbani', 'Tunatathmini mahitaji ya familia na kupanga msaada.', 'Timu yetu hutembelea familia nyumbani, husikiliza, na kupanga msaada wanaohitaji.'], ['Ushauri', 'Vikao na wataalamu waliofunzwa.', 'Watoto na familia hukutana na wataalamu waliofunzwa katika nafasi salama na ya faragha.']].map(function (p) { return { t: p[0], d: p[1], more: p[2] }; }),
      figures: [{ n: '17000', s: '+', l: 'Milo kwa mwezi' }, { n: '350', s: '+', l: 'Watoto kila siku' }, { n: '2014', s: '', l: 'Tangu mwaka' }],
      give: { title: '', link: '', mpesa: '', account: '', amounts: 'KSh 500 · KSh 1,000 · KSh 2,500', text: 'Mchango wako hulipia milo ya moto, vikao vya ushauri na shughuli za likizo.' },
      how: [{ t: 'Takwimu za kweli', d: 'Kila takwimu tunayochapisha inatoka kwenye rekodi zetu wenyewe.' }, { t: 'Idhini kwanza', d: 'Tunashiriki picha au hadithi tu kwa idhini ya maandishi ya mhusika na mlezi wake.' }, { t: 'Ulinzi wa data', d: 'Taarifa binafsi zinashughulikiwa chini ya Sheria ya Ulinzi wa Data ya Kenya, 2019.' }],
      testimonials: [],
      videos: [],
      contact: Object.assign({ places: ['Makutano ya Mayor Road na Gataka Road, Kware', 'KenyaWorks Foundation, kando ya Gataka Road', 'Project Ben, Gataka'] }, CONTACT),
      foot: { copy: '© 2026 Miale ya Tumaini. Haki zote zimehifadhiwa.', blurb: 'Tunasaidia watoto na familia Kware, Ongata Rongai.' }
    }
  };
  var SECS = { en: SEC_EN, sw: SEC_SW };
  DEF.en.sec = SEC_EN; DEF.sw.sec = SEC_SW;

  /* ---------- store ---------- */
  var S = jget('mt-s', {});
  S.c = S.c || { en: {}, sw: {} }; S.c.en = S.c.en || {}; S.c.sw = S.c.sw || {};
  S.col = S.col || {}; S.cats = S.cats || {}; S.slots = S.slots || {}; S.focus = S.focus || {}; S.look = S.look || {};
  if (S.gal && S.gal.length) { S.cats.moments = (S.cats.moments || []).concat(S.gal); }
  delete S.gal;
  if (S.hero) { S.slots.hero = S.hero; }
  if (S.logo) { S.slots.logo = S.logo; }
  delete S.hero; delete S.logo;

  var saveT = null;
  function saveS() {
    LS.set('mt-s', JSON.stringify(S));
    if (window.MTDB && MTDB.on && adminOn()) {
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        MTDB.saveContent(S).catch(function () {
          if (MT.banner) MT.banner({ kind: 'error', title: 'Not saved online', body: 'Check the connection. Your change is kept on this device.' });
        });
      }, 700);
    }
  }
  function getLang() { return lang; }
  function setLangValue(l) { lang = l === 'sw' ? 'sw' : 'en'; LS.set('mt-lang', lang); document.documentElement.lang = lang; savePrefs(); }
  function get(k) { var v = S.c[lang][k]; return v !== undefined ? v : DEF[lang][k]; }
  function setG(k, v) { S.c[lang][k] = v; saveS(); flash(); }
  var ft;
  function flash() { var e = $('#saved'); if (e) { e.textContent = 'Saved'; clearTimeout(ft); ft = setTimeout(function () { e.textContent = ''; }, 1400); } }
  var tt;
  /* kind: 'ok' (plays the success sound), 'err' (error sound and vibration), or nothing */
  function toast(m, kind) {
    var e = $('#toast'); if (!e) return;
    e.textContent = m; e.classList.toggle('err', kind === 'err'); e.classList.add('on');
    clearTimeout(tt); tt = setTimeout(function () { e.classList.remove('on'); }, 3000);
    if (kind === 'ok' && MT.sfx) MT.sfx('success'); else if (kind === 'err' && MT.sfx) MT.sfx('error');
  }

  /* looks: resolved with defaults, so a missing setting never breaks the page */
  function look() {
    var L = S.look || {};
    return {
      morph: L.morph || LOOK_DEF.morph, glass: L.glass !== false, font: L.font || LOOK_DEF.font,
      size: L.size || 100, motion: L.motion || LOOK_DEF.motion,
      sound: Object.assign({}, SOUND_DEF, L.sound || {}, { ev: Object.assign({}, SOUND_DEF.ev, (L.sound && L.sound.ev) || {}) })
    };
  }
  function setLook(key, val) { S.look = S.look || {}; S.look[key] = val; saveS(); applyLook(); }
  var loadedFonts = {};
  function loadFont(id) {
    var f = FONTS.filter(function (x) { return x.id === id; })[0] || FONTS[0];
    if (!loadedFonts[f.id]) {
      loadedFonts[f.id] = true;
      var l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?' + f.q + '&display=swap';
      document.head.appendChild(l);
    }
    return f;
  }
  function applyLook() {
    var L = look(), h = document.documentElement, f = loadFont(L.font);
    h.dataset.morph = L.morph;
    h.dataset.glass = L.glass ? 'on' : 'off';
    h.dataset.motion = L.motion;
    h.style.setProperty('--size', L.size + '%');
    h.style.setProperty('--fd', f.fd); h.style.setProperty('--fb', f.fb); h.style.setProperty('--fwh', f.fwh);
    var m = $('#hdr'); if (m) m.dataset.morph = L.morph;
  }

  /* focus and zoom for a photo slot: used by hero and donation banner */
  function focusStyle(key) {
    var f = S.focus && S.focus[key];
    if (!f) return '';
    return '--fx:' + f.x + '%;--fy:' + f.y + '%;--fz:' + f.z;
  }

  /* ---------- media store (IndexedDB, memory fallback) ---------- */
  var idb = null, mem = [], MEDIA = [], urls = {};
  function openDB() { return new Promise(function (res) { try { var r = indexedDB.open('miale-media', 1); r.onupgradeneeded = function () { r.result.createObjectStore('m', { keyPath: 'id' }); }; r.onsuccess = function () { idb = r.result; res(); }; r.onerror = function () { res(); }; } catch (e) { res(); } }); }
  function mAll() { return new Promise(function (res) { if (!idb) return res(mem.slice()); var q = idb.transaction('m').objectStore('m').getAll(); q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(mem.slice()); }; }); }
  function mPutLocal(o) { return new Promise(function (res) { if (!idb) { var i = mem.findIndex(function (x) { return x.id === o.id; }); if (i < 0) mem.push(o); else mem[i] = o; return res(); } var tx = idb.transaction('m', 'readwrite'); tx.objectStore('m').put(o); tx.oncomplete = res; tx.onerror = res; }); } // BACKEND
  function mDelLocal(id) { return new Promise(function (res) { if (!idb) { mem = mem.filter(function (x) { return x.id !== id; }); return res(); } var tx = idb.transaction('m', 'readwrite'); tx.objectStore('m').delete(id); tx.oncomplete = res; tx.onerror = res; }); } // BACKEND
  /* ---------- Supabase: remote content, comments, media ---------- */
  function uuid() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)); }
  function loadRemote() {
    if (!(window.MTDB && MTDB.on)) return Promise.resolve();
    return Promise.all([
      MTDB.loadContent().then(function (v) {
        if (v && typeof v === 'object') {
          S = v; S.c = S.c || { en: {}, sw: {} }; S.c.en = S.c.en || {}; S.c.sw = S.c.sw || {};
          S.col = S.col || {}; S.cats = S.cats || {}; S.slots = S.slots || {}; S.focus = S.focus || {}; S.look = S.look || {};
          LS.set('mt-s', JSON.stringify(S));
        }
      }).catch(function () {}),
      MTDB.listComments(false).then(function (rows) {
        window.__MT_PUBLIC_COMMENTS = rows.map(function (r) { return { id: r.id, n: r.name || '', m: r.message, ok: true, d: Date.parse(r.created_at) }; });
      }).catch(function () {})
    ]);
  }
  function mapRow(r) {
    return { id: r.id, kind: r.kind, cat: r.cat, consent: r.consent, title: r.title, speaker: r.speaker, lang: r.lang, desc: r.descr,
      date: Date.parse(r.created_at), dur: Number(r.dur) || 0, plays: r.plays || 0, path: r.path, mime: r.mime,
      url: MTDB.publicUrl(r.path), origPath: r.orig_path || null };
  }
  function extOf(type) { return ((type || 'application/octet-stream').split('/')[1] || 'bin').split(';')[0].replace('jpeg', 'jpg').replace('mpeg', 'mp3').replace('x-wav', 'wav'); }
  function mPut(o) {
    if (!(window.MTDB && MTDB.on)) return mPutLocal(o);
    if (!o.url) {
      var path = uuid() + '.' + extOf(o.blob && o.blob.type);
      return MTDB.uploadFile(path, o.blob).then(function () {
        return MTDB.insertMedia({ kind: o.kind, cat: o.cat || null, consent: !!o.consent, title: o.title || '', speaker: o.speaker || '', lang: o.lang || '', descr: o.desc || '', path: path, mime: o.blob.type, size_bytes: o.blob.size, dur: o.dur || 0, plays: 0 });
      }).then(mapRow);
    }
    var patch = { cat: o.cat || null, consent: !!o.consent, title: o.title || '', speaker: o.speaker || '', lang: o.lang || '', descr: o.desc || '', dur: o.dur || 0, plays: o.plays || 0 };
    if (o.blob) {
      var p2 = uuid() + '.' + extOf(o.blob.type);
      patch.path = p2; patch.mime = o.blob.type; patch.size_bytes = o.blob.size; patch.orig_path = o.origPath || null;
      return MTDB.uploadFile(p2, o.blob).then(function () { return MTDB.updateMedia(o.id, patch); }).then(function () { return o; });
    }
    return MTDB.updateMedia(o.id, patch).then(function () { return o; });
  }
  function mDel(id) {
    if (!(window.MTDB && MTDB.on)) return mDelLocal(id);
    var m = byId(id);
    return MTDB.deleteMedia(id).then(function () { return m && m.path ? MTDB.removeFile(m.path) : null; });
  }
  function loadMedia() {
    if (!(window.MTDB && MTDB.on)) return mAll().then(function (l) { MEDIA = l; });
    return MTDB.listMedia().then(function (rows) { MEDIA = rows.map(mapRow); }).catch(function () {});
  }
  function byId(id) { return MEDIA.filter(function (m) { return String(m.id) === String(id); })[0]; }
  function urlOf(m) { if (m.url) return m.url; if (!urls[m.id]) { urls[m.id] = URL.createObjectURL(m.blob); } return urls[m.id]; }
  function imgUrl(id, fallback) { var m = id && byId(id); return m ? urlOf(m) : fallback; }
  function shrink(file, max, type) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { res(b || file); }, type, .86);
      };
      im.onerror = function () { URL.revokeObjectURL(u); res(file); };
      im.src = u;
    });
  }
  function fmt(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function uid() { return Date.now() + Math.floor(Math.random() * 100000); }

  /* ---------- events and visits (per browser until the backend is connected) ---------- */
  function deviceId() {
    var d = LS.get('mt-device'); if (!d) { d = 'd' + uid().toString(36) + Math.random().toString(36).slice(2, 7); LS.set('mt-device', d); } return d;
  }
  function adminOn() { try { return sessionStorage.getItem('mt-admin') === '1'; } catch (e) { return !!window.__MT_ADMIN; } }
  function track(k, d) {
    if (IS_PREVIEW || view !== 'site' || adminOn()) return;
    if (window.MTDB && MTDB.on) MTDB.track(k, d);
    var log = jget('mt-events', []);
    log.push({ t: Date.now(), k: k, d: String(d || '').slice(0, 120) });
    LS.set('mt-events', JSON.stringify(log.slice(-4000)));
  }
  function events() { return window.__MT_STATS ? window.__MT_STATS.events : jget('mt-events', []); }
  function visits() { if (window.__MT_STATS) return window.__MT_STATS.visits; return jget('mt-visit-log', []).map(function (v) { return typeof v === 'number' ? { t: v, dev: 'd', id: 'old' } : v; }); }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  /* ---------- colours ---------- */
  function lum(hex) { var c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join(''); var n = parseInt(c, 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
  function inkFor(hex) { return lum(hex) > 0.6 ? '#1C2433' : '#FFFFFF'; }
  function applyColors() {
    var c = S.col || {}, st = $('#dyn');
    if (!st) { st = document.createElement('style'); st.id = 'dyn'; document.head.appendChild(st); }
    var L = '';
    if (c.bg) L += '--bg:' + c.bg + ';--surface:' + c.bg + ';';
    if (c.blue) L += '--blue:' + c.blue + ';--blue-ink:' + inkFor(c.blue) + ';';
    if (c.accent) L += '--accent:' + c.accent + ';--accent-ink:' + inkFor(c.accent) + ';--focus:' + c.accent + ';';
    if (c.brown) L += '--brown:' + c.brown + ';';
    st.textContent = L ? ':root:not([data-theme=dark]),[data-theme=light]{' + L + '}' : '';
  }

  /* ---------- icons ---------- */
  function svgp(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var I = {
    sun: svgp('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svgp('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    desk: svgp('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    mob: svgp('<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'),
    user: svgp('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
    menu: svgp('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: svgp('<path d="M6 6l12 12M18 6 6 18"/>'),
    arrow: svgp('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chev: svgp('<path d="m6 9 6 6 6-6"/>'),
    phone: svgp('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    mail: svgp('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    pin: svgp('<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    globe: svgp('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/>'),
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2"/><path fill="#fff" d="M13.4 20v-6.6h2.2l.4-2.6h-2.6V9.2c0-.8.3-1.3 1.4-1.3H16V5.6c-.3 0-1.1-.1-2-.1-2.1 0-3.4 1.2-3.4 3.5v1.8H8.4v2.6h2.2V20z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="6.5" fill="#D62976"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="#fff"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#25D366"/><path fill="#fff" d="M12 5.5a6.5 6.5 0 0 0-5.6 9.8L5.5 18.5l3.3-.9A6.5 6.5 0 1 0 12 5.5zm3.7 8.9c-.2.5-1 .9-1.4.9-.4.1-.8.1-2.4-.5-2-.8-3.3-2.8-3.4-2.9-.1-.1-.8-1.1-.8-2s.5-1.4.7-1.7c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .4.4l.7 1.5c.1.1.1.3 0 .4l-.3.4c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.5.9.8 1.5 1 1.7 1.1.2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.5.7c.2.1.3.2.3.2.1.2.1.6-.1 1z"/></svg>',
    eye: svgp('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeoff: svgp('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>')
  };
  var PICO = ['<path d="M4 3v8a3 3 0 0 0 3 3h0V3M7 3v18M17 3c-2 2-3 5-3 8h3v10"/>', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>', '<path d="M12 3 2 8l10 5 10-5-10-5zM6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/>', '<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>', '<path d="m3 11 9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>', '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>'];

  /* ---------- theme + language controls ---------- */
  function applyTheme(m) {
    if (['light', 'dark', 'system'].indexOf(m) < 0) m = 'system';
    document.documentElement.dataset.theme = m;
    LS.set('mt-theme', m); savePrefs();
    $$('[data-theme-set]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.themeSet === m); });
    placeSeg(); syncDarkBtn();
  }
  function themeSeg() {
    return '<div class="seg" role="group" aria-label="Theme"><span class="th"></span>' +
      '<button data-theme-set="light" aria-label="Light">' + I.sun + '</button>' +
      '<button data-theme-set="dark" aria-label="Dark">' + I.moon + '</button>' +
      '<button data-theme-set="system" aria-label="Match device">' + (phone ? I.mob : I.desk) + '</button></div>';
  }
  function placeSeg() {
    $$('.seg').forEach(function (p) {
      var th = $('.th', p), a = $('[aria-pressed=true]', p);
      if (th && a && a.offsetWidth) { p.style.setProperty('--x', a.offsetLeft + 'px'); p.style.setProperty('--w', a.offsetWidth + 'px'); }
    });
  }
  function setLang(l) { setLangValue(l); if (view === 'site') renderSite(); else if (window.MT && MT.refreshAdmin) MT.refreshAdmin(); }
  function langMenu() {
    var m = $('#langmenu');
    m.innerHTML = [['en', 'English'], ['sw', 'Kiswahili']].map(function (x) {
      return '<button role="menuitemradio" aria-checked="' + (lang === x[0]) + '" data-l="' + x[0] + '">' + x[1] + (lang === x[0] ? '<span aria-hidden="true">✓</span>' : '') + '</button>';
    }).join('');
    $$('button', m).forEach(function (b) { b.onclick = function () { m.hidden = true; $('#langbtn').setAttribute('aria-expanded', 'false'); setLang(b.dataset.l); }; });
  }

  /* ---------- PUBLIC SITE ---------- */
  var io = null, au = new Audio(), cur = null;
  function sec(k) { var s = get('sec'); return s[k] !== undefined ? s[k] : SECS[lang][k]; }
  function labelOf(cat) { var c = CATS.filter(function (x) { return x[0] === cat; })[0]; return c ? c[1] : cat; }
  function visibleGal() {
    var out = [];
    CATS.forEach(function (c) {
      (S.cats[c[0]] || []).forEach(function (id) {
        var m = byId(id);
        if (!m) return;
        if (CONSENT_CATS.indexOf(c[0]) >= 0 && !m.consent) return;
        out.push({ m: m, cat: c[0] });
      });
    });
    return out;
  }
  function parseVideo(u) {
    u = String(u || '').trim();
    var y = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    if (y) return 'https://www.youtube-nocookie.com/embed/' + y[1];
    var v = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (v) return 'https://player.vimeo.com/video/' + v[1];
    return null;
  }

  /* programme card, used by the site and by the admin preview (plain = no reveal, no click) */
  function cardHtml(p, i, plain) {
    return '<article class="card lift' + (plain ? '' : ' click reveal') + '"' + (plain ? '' : ' tabindex="0" role="button" data-p="' + i + '" data-track="prog" data-d="' + esc(p.t) + '"') + ' aria-label="' + esc(p.t) + '">' +
      '<div class="ico">' + svgp(PICO[i % 6]) + '</div><h3>' + esc(p.t) + '</h3><p class="muted" style="margin:0">' + esc(p.d) + '</p><span class="more">' + esc(sec('more')) + I.arrow + '</span></article>';
  }
  function storyHtml(s) {
    return '<figure class="card lift tcard' + (s.plain ? '' : ' reveal') + '"><div class="qm" aria-hidden="true">“</div><q>' + esc(s.text) + '</q><figcaption class="who"><span class="av">' + esc((s.name || '•').charAt(0).toUpperCase()) + '</span><div><b>' + esc(s.name) + '</b>' + (s.role ? '<small>' + esc(s.role) + '</small>' : '') + '</div></figcaption></figure>';
  }
  function donateInner(G, donateImg) {
    var link = G.link ? '<a class="btn btn-b" href="' + esc(G.link) + '" rel="noopener" target="_blank" data-track="donate" data-d="link">' : '<a class="btn btn-b" href="tel:+254723315423" data-track="donate" data-d="phone">';
    return '<div class="card donate-card"' + (donateImg ? ' style="padding:0;overflow:hidden"' : '') + '>' +
      (donateImg ? '<img class="fimg" src="' + donateImg + '" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;' + focusStyle('donate') + '">' : '') +
      '<div style="padding:' + (donateImg ? '24px 0 0' : '0') + '"><h2 class="title">' + esc(G.title || sec('give_t')) + '</h2><p>' + esc(G.text) + '</p><div class="amounts">' + esc(G.amounts).split('·').map(function (a) { return '<span>' + esc(a.trim()) + '</span>'; }).join('') + '</div>' + link + esc(sec('give_btn')) + '</a></div></div>';
  }

  function renderSite() {
    var B = get('brand'), H = get('hero'), M = get('mission'), PL = get('pillars'), P = get('programmes'), F = get('figures'), GV = get('give'), HW = get('how'), C = get('contact'), T = get('testimonials'), FT = get('foot'), VD = get('videos') || [];
    var voices = MEDIA.filter(function (m) { return m.kind === 'audio'; }).sort(function (a, b) { return b.date - a.date; });
    var gal = visibleGal();
    var cms = (window.__MT_PUBLIC_COMMENTS || jget('mt-comments', [])).filter(function (c) { return c.ok; });
    var stories = T.concat(cms.map(function (c) { return { name: c.n || '', role: '', text: c.m }; }));
    var logo = imgUrl(S.slots.logo, 'icons/logo.png'), hero = imgUrl(S.slots.hero, '');
    var donateImg = imgUrl(S.slots.donate, '');
    var wa = 'https://wa.me/' + String(C.wa).replace(/\D/g, '');
    var telOf = function (p) { return 'tel:+254' + p.replace(/\D/g, '').replace(/^0/, ''); };
    var vids = VD.map(function (v) { return { t: v.t, d: v.d, src: parseVideo(v.url) }; }).filter(function (v) { return v.src; });

    $('#brand').innerHTML = '<img src="' + logo + '" alt=""><span>' + esc(B.name) + '</span>';
    var nav = [['programmes', 'nav_work', P.length], ['impact', 'nav_impact', 1], ['give', 'nav_give', 1], ['gallery', 'nav_gallery', gal.length], ['voices', 'nav_voices', voices.length], ['videos', 'nav_videos', vids.length], ['how', 'nav_how', 1], ['visit', 'nav_visit', 1]].filter(function (n) { return n[2]; });
    var megaTrig = '<button class="mg-trig" id="mgTrig" aria-expanded="false" aria-controls="mega">' + esc(sec('nav_work')) + I.chev + '</button>';
    var grp = { programmes: 'mg_explore', impact: 'mg_discover', give: 'mg_take' };
    $('#nav').innerHTML = nav.map(function (n) {
      var head = grp[n[0]] ? '<span class="nav-h" aria-hidden="true">' + esc(sec(grp[n[0]])) + '</span>' : '';
      if (n[0] === 'programmes') return head + megaTrig;
      return head + '<a href="#' + n[0] + '">' + esc(sec(n[1])) + '</a>';
    }).join('');

    var megaVis = '<div class="mg-vis" id="mgVis"></div>';
    $('#mega').innerHTML =
      '<div><p class="mh">' + esc(sec('mg_prog')) + '</p><nav class="mg-list" aria-label="' + esc(sec('mg_prog')) + '">' +
      P.map(function (p, i) { return '<a href="#programmes" data-mi="' + i + '">' + esc(p.t) + '<span>' + I.arrow + '</span></a>'; }).join('') + '</nav></div>' +
      '<div><p class="mh">' + esc(sec('mg_explore')) + '</p><div class="mg-plain">' +
      '<a href="#impact">' + esc(sec('nav_impact')) + '</a><a href="#gallery">' + esc(sec('nav_gallery')) + '</a><a href="#voices">' + esc(sec('nav_voices')) + '</a><a href="#how">' + esc(sec('nav_how')) + '</a></div></div>' +
      '<div><p class="mh">' + esc(sec('mg_take')) + '</p><div class="mg-plain">' +
      '<a href="#give">' + esc(sec('nav_give')) + '</a><a href="#visit">' + esc(sec('nav_visit')) + '</a><a href="#share">' + esc(sec('mg_comment')) + '</a></div></div>' + megaVis;

    $('#foot-brand').innerHTML = '<img src="' + logo + '" alt="" width="40" height="40" style="border-radius:50%;border:1px solid var(--line)"><span>' + esc(B.name) + '</span>';
    $('#foot-blurb').textContent = FT.blurb || '';
    $('#copy').textContent = FT.copy;
    $('#powered').textContent = sec('powered');
    $('#fquick').innerHTML = nav.slice(0, 5).map(function (n) { return '<a href="#' + (n[0]) + '">' + esc(n[0] === 'programmes' ? sec('nav_work') : sec(n[1])) + '</a>'; }).join('');
    $('#freach').innerHTML = C.phones.map(function (p) { return '<a href="' + telOf(p) + '" data-track="call" data-d="' + esc(p) + '">' + esc(p) + '</a>'; }).join('') + '<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>';

    var h = '';
    h += '<section class="hero wrap" id="top"><div class="hgrid"><div><p class="eyebrow">' + esc(B.tag) + '</p><h1 id="h1" aria-label="' + esc(H.h1) + '">' +
      H.h1.split(' ').map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--k:' + i + '">' + esc(w) + '</span></span> '; }).join('') +
      '</h1><p class="lead">' + esc(H.lead) + '</p><div class="acts"><a class="btn btn-p" href="#give" data-track="donate" data-d="hero">' + esc(H.cta1) + '</a><a class="btn btn-s" href="#programmes">' + esc(H.cta2) + '</a></div></div>' +
      '<div class="frame-wrap"><div class="frame' + (hero ? '' : ' empty') + '">' + (hero ? '<img src="' + hero + '" alt="" style="' + focusStyle('hero') + '">' : '<div class="frame-fallback">' + esc(B.name) + '</div>') + '</div>' +
      (F[0] ? '<div class="stat-chip a"><b class="count" data-count="' + esc(F[0].n) + '" data-suffix="' + esc(F[0].s) + '">' + esc(Number(F[0].n).toLocaleString('en-US')) + esc(F[0].s) + '</b><small>' + esc(F[0].l) + '</small></div>' : '') +
      (F[1] ? '<div class="stat-chip b"><b>' + esc(Number(F[1].n).toLocaleString('en-US')) + esc(F[1].s) + '</b><small>' + esc(F[1].l) + '</small></div>' : '') +
      '</div></div></section>';
    h += '<div class="pillars wrap-full" aria-label="' + esc(sec('pil_t')) + '">' + PL.map(function (p) { return '<div class="reveal"><b>' + esc(p.t) + '</b><span>' + esc(p.d) + '</span></div>'; }).join('') + '</div>';
    h += '<section class="wrap sec" id="mission"><p class="mission" id="mtext">' + M.text.split(' ').map(function (w) { return '<span class="mw">' + esc(w) + '</span>'; }).join(' ') + '</p></section>';
    h += '<section class="wrap sec" id="programmes"><h2 class="title reveal">' + esc(sec('prog_t')) + '</h2><p class="intro reveal">' + esc(sec('prog_i')) + '</p><div class="grid g3 bento">' +
      P.map(function (p, i) { return cardHtml(p, i, false); }).join('') + '</div></section>';
    h += '<section class="sec" id="impact"><div class="band"><div class="wrap" style="padding-block:clamp(56px,8vw,92px)"><h2 class="title reveal">' + esc(sec('imp_t')) + '</h2><p class="intro reveal">' + esc(sec('imp_i')) + '</p><div class="grid g3 fig-grid">' +
      F.map(function (f, i) { return '<div class="card reveal" style="--i:' + i + '"><p class="fig count" data-count="' + esc(f.n) + '" data-suffix="' + esc(f.s) + '"' + (/^\d{4}$/.test(f.n) ? ' data-plain="1"' : '') + '>0</p><p class="fig-label">' + esc(f.l) + '</p></div>'; }).join('') + '</div></div></div></section>';
    h += '<section class="wrap sec" id="give"><div class="donate">' + donateInner(GV, donateImg).replace('class="card donate-card"', 'class="card donate-card reveal"') +
      '<div class="card reveal"><h3>' + esc(sec('give_call')) + '</h3>' + C.phones.map(function (p) { return '<a class="clink" href="' + telOf(p) + '" data-track="call" data-d="' + esc(p) + '">' + I.phone + '<span>' + esc(p) + '</span></a>'; }).join('') +
      (GV.mpesa ? '<p style="margin-top:14px"><b>M-Pesa:</b> ' + esc(GV.mpesa) + '</p>' : '') + (GV.account ? '<p><b>Account:</b> ' + esc(GV.account) + '</p>' : '') + '</div></div></section>';
    if (gal.length) {
      h += '<section class="wrap sec" id="gallery"><h2 class="title reveal">' + esc(sec('gal_t')) + '</h2><p class="intro reveal">' + esc(sec('gal_i')) + '</p><div class="gal">' +
        gal.map(function (g) { return '<figure data-src="' + urlOf(g.m) + '" data-cat="' + esc(labelOf(g.cat)) + '"><img src="' + urlOf(g.m) + '" alt="" loading="lazy"><figcaption>' + esc(labelOf(g.cat)) + '</figcaption></figure>'; }).join('') + '</div></section>';
    }
    if (voices.length) {
      h += '<section class="wrap sec" id="voices"><h2 class="title reveal">' + esc(sec('voi_t')) + '</h2><p class="intro reveal">' + esc(sec('voi_i')) + '</p><div class="grid g2">' +
        voices.map(function (a) { return '<article class="card voice reveal" data-id="' + a.id + '"><div class="vtop"><button class="play" aria-label="Play ' + esc(a.title) + '">' + I.play + '</button><div><h3 style="margin:0 0 4px">' + esc(a.title) + '</h3><div class="vmeta">' + (a.speaker ? '<span>' + esc(a.speaker) + '</span>' : '') + (a.lang ? '<span class="chip">' + esc(a.lang) + '</span>' : '') + '<span>' + new Date(a.date).toLocaleDateString(lang === 'sw' ? 'sw-KE' : 'en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) + '</span></div></div></div>' + (a.desc ? '<p class="muted" style="margin:0">' + esc(a.desc) + '</p>' : '') + '<div class="bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><div class="time"><span class="tc">0:00</span><span>' + fmt(a.dur) + '</span></div></article>'; }).join('') + '</div></section>';
    }
    if (vids.length) {
      h += '<section class="wrap sec" id="videos"><h2 class="title reveal">' + esc(sec('vid_t')) + '</h2><p class="intro reveal">' + esc(sec('vid_i')) + '</p><div class="grid g2">' +
        vids.map(function (v) { return '<article class="reveal"><div class="video"><iframe src="' + esc(v.src) + '" title="' + esc(v.t) + '" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><h3 style="margin:14px 0 4px">' + esc(v.t) + '</h3>' + (v.d ? '<p class="muted" style="margin:0">' + esc(v.d) + '</p>' : '') + '</article>'; }).join('') + '</div></section>';
    }
    if (stories.length) {
      h += '<section class="wrap sec" id="stories"><h2 class="title reveal">' + esc(sec('tes_t')) + '</h2><div class="rail">' + stories.map(storyHtml).join('') + '</div></section>';
    }
    h += '<section class="wrap sec" id="how"><h2 class="title reveal">' + esc(sec('how_t')) + '</h2><div class="grid g3 how">' +
      HW.map(function (x, i) { return '<div class="card lift reveal"><span class="num">0' + (i + 1) + '</span><h3>' + esc(x.t) + '</h3><p class="muted" style="margin:0">' + esc(x.d) + '</p></div>'; }).join('') + '</div></section>';
    h += '<section class="wrap sec" id="visit"><h2 class="title reveal">' + esc(sec('vis_t')) + '</h2><div class="grid g2" style="margin-top:1.2em"><div class="card reveal">' +
      C.phones.map(function (p) { return '<a class="clink" href="' + telOf(p) + '" data-track="call" data-d="' + esc(p) + '">' + I.phone + '<span>' + esc(p) + '</span></a>'; }).join('') +
      '<a class="clink" href="mailto:' + esc(C.email) + '">' + I.mail + '<span>' + esc(C.email) + '</span></a>' +
      '<div class="csoc"><a class="soc" href="' + esc(C.fb) + '" rel="noopener" target="_blank" aria-label="Facebook" data-track="social" data-d="facebook">' + I.fb + '</a><a class="soc" href="' + esc(C.ig) + '" rel="noopener" target="_blank" aria-label="Instagram" data-track="social" data-d="instagram">' + I.ig + '</a><a class="soc" href="' + wa + '" rel="noopener" target="_blank" aria-label="WhatsApp" data-track="social" data-d="whatsapp">' + I.wa + '</a></div></div>' +
      '<div class="card reveal"><h3>' + esc(sec('find')) + '</h3>' + C.places.map(function (p) { return '<div class="clink" style="cursor:default">' + I.pin + '<span>' + esc(p) + '</span></div>'; }).join('') + '</div></div></section>';
    h += '<section class="wrap sec" id="share"><div class="card connect reveal"><div><h2>' + esc(sec('con_t')) + '</h2><p class="muted">' + esc(sec('con_i')) + '</p></div>' +
      '<form class="form" id="cform" novalidate><div class="field"><label for="cn">' + esc(sec('c_name')) + '</label><input class="in" id="cn" maxlength="40" autocomplete="given-name"></div>' +
      '<div class="field"><label for="cm">' + esc(sec('c_msg')) + '</label><textarea id="cm" rows="4" maxlength="800"></textarea><p class="err" id="cme" hidden></p></div>' +
      '<div class="field"><span class="lbl">' + esc(sec('c_sig')) + '</span><div class="sig-box"><canvas id="sig" aria-label="Signature pad"></canvas><button type="button" class="sig-clear" id="sigclr">' + esc(sec('c_sig_clear')) + '</button></div><p class="err" id="sige" hidden></p></div>' +
      '<div class="check"><input type="checkbox" id="cc"><label for="cc">' + esc(sec('c_consent')) + '</label><span></span><p class="err" id="cce" hidden></p></div>' +
      '<button class="btn btn-b" type="submit" style="justify-self:start">' + esc(sec('c_send')) + '</button></form></div></section>';
    $('#main').innerHTML = h;
    $('#h1').classList.add('x');
    langMenu();
    afterRender();
  }

  function afterRender() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        var el = x.target; el.classList.add('shown'); io.unobserve(el);
        $$('[data-count]', el).forEach(countUp);
      });
    }, { threshold: .15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    if (document.documentElement.dataset.motion === 'off') $$('.reveal').forEach(function (el) { el.classList.add('shown'); });
    function countUp(el) {
      var to = +el.dataset.count, s = el.dataset.suffix || '', plain = el.dataset.plain, t0 = performance.now();
      var f = function (v) { return plain ? String(v) : v.toLocaleString('en-US'); };
      if (reduce || document.documentElement.dataset.motion === 'off') { el.textContent = f(to) + s; return; }
      (function step(n) { var p = Math.min(1, (n - t0) / 1700), v = Math.round(to * (1 - Math.pow(1 - p, 4))); el.textContent = f(v) + (p === 1 ? s : ''); if (p < 1) requestAnimationFrame(step); })(t0);
    }
    $$('.card.click').forEach(function (c) {
      function open() { openDlg(+c.dataset.p); }
      c.onclick = open;
      c.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    });
    $$('.gal figure').forEach(function (f) { f.onclick = function () { $('#lbimg').src = f.dataset.src; $('#lb').showModal(); }; });
    setupMega();
    setupForm();
    setupVoices();
    syncV();
    onScroll();
    applyTheme(LS.get('mt-theme') || 'system');
    if (location.hash && location.hash.charAt(1) !== '/') { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  /* mega menu: opens on hover (fine pointers), on tap (touch), closes on leave or Escape */
  var megaT = null;
  function megaOpen(on) {
    var m = $('#mega'), b = $('#mgTrig'); if (!m || !b) return;
    m.hidden = !on; b.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { megaVis(0); }
  }
  function megaVis(i) {
    var p = get('programmes')[i]; if (!p) return;
    var v = $('#mgVis'); if (!v) return;
    v.classList.remove('swap'); void v.offsetWidth; v.classList.add('swap');
    v.innerHTML = '<div class="ico">' + svgp(PICO[i % 6]) + '</div><div><h4>' + esc(p.t) + '</h4><p style="margin-top:8px">' + esc(p.d) + '</p></div>' +
      '<a class="mg-go" href="#programmes" data-mo="' + i + '">' + esc(sec('mg_see')) + I.arrow + '</a>';
    $$('.mg-list a').forEach(function (a) { a.classList.toggle('on', +a.dataset.mi === i); });
  }
  function setupMega() {
    var trig = $('#mgTrig'), m = $('#mega'), nb = $('#navbar');
    if (!trig || !m) return;
    var inT = null, outT = null;
    if (!phone) {
      trig.onpointerenter = function () { clearTimeout(outT); inT = setTimeout(function () { megaOpen(true); }, 90); };
      nb.onpointerenter = function () { clearTimeout(outT); };
      nb.onpointerleave = function () { clearTimeout(inT); outT = setTimeout(function () { megaOpen(false); }, 280); };
    }
    trig.onclick = function (e) { e.preventDefault(); megaOpen(m.hidden); };
    trig.onkeydown = function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); megaOpen(true); var f = $('.mg-list a', m); if (f) f.focus(); } };
    var links = $$('.mg-list a', m);
    links.forEach(function (a, i) {
      a.onpointerenter = function () { megaVis(+a.dataset.mi); };
      a.onfocus = function () { megaVis(+a.dataset.mi); };
      a.onclick = function () { megaOpen(false); };
      a.onkeydown = function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus(); }
        if (e.key === 'Escape') { megaOpen(false); trig.focus(); }
      };
    });
    $$('.mg-plain a', m).forEach(function (a) { a.onclick = function () { megaOpen(false); }; });
    var go = $('#mgVis'); if (go) go.onclick = function (e) { var a = e.target.closest('[data-mo]'); if (a) { megaOpen(false); openDlg(+a.dataset.mo); } };
  }

  /* comment form with a signature pad */
  function setupForm() {
    var f = $('#cform'); if (!f) return;
    var cm = $('#cm'), cc = $('#cc'), cme = $('#cme'), cce = $('#cce'), sigE = $('#sige'), cv = $('#sig');
    var ctx = cv.getContext('2d'), drawing = false, has = false, last = null;
    function size() { var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; cv.width = Math.max(10, r.width * dpr); cv.height = 120 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = getComputedStyle(cv).color || '#1C2433'; }
    size();
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (e) { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); e.preventDefault(); });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; has = true; e.preventDefault(); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drawing = false; }); });
    $('#sigclr').onclick = function () { var r = cv.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); has = false; };
    function er(i, e, m) { e.textContent = m; e.hidden = false; i.setAttribute('aria-invalid', 'true'); }
    function ok(i, e) { e.hidden = true; i.removeAttribute('aria-invalid'); }
    f.onsubmit = function (e) {
      e.preventDefault();
      var valid = true;
      if (!cm.value.trim()) { er(cm, cme, sec('c_e1')); valid = false; } else ok(cm, cme);
      if (!has) { sigE.textContent = sec('c_e3'); sigE.hidden = false; valid = false; } else sigE.hidden = true;
      if (!cc.checked) { er(cc, cce, sec('c_e2')); valid = false; } else ok(cc, cce);
      if (!valid) { if (MT.sfx) MT.sfx('error'); (!cm.value.trim() ? cm : !has ? cv : cc).focus(); return; }
      var sig = cv.toDataURL('image/png'), nm = $('#cn').value.trim(), msg = cm.value.trim();
      var done = function () {
        f.reset(); has = false; var r = cv.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height);
        if (MT.banner) MT.banner({ kind: 'ok', title: sec('c_ok').split('.')[0], body: sec('c_ok'), sound: 'comment' });
      };
      if (MTDB.on) {
        MTDB.submitComment({ name: nm, message: msg, signature: sig }).then(function () { track('comment', 'visitor'); done(); })
          .catch(function () { if (MT.banner) MT.banner({ kind: 'error', title: 'Not sent', body: 'Check your connection and try again.' }); });
        return;
      }
      var l = jget('mt-comments', []);
      l.unshift({ id: uid(), n: nm, m: msg, d: Date.now(), ok: false, sig: sig, consent: true });
      LS.set('mt-comments', JSON.stringify(l.slice(0, 300)));
      track('comment', 'visitor'); done();
    };
  }

  /* audio: plays, counts plays, seeks. Every recording keeps its trims (baked in when cut). */
  function setupVoices() {
    var vm = MEDIA.filter(function (m) { return m.kind === 'audio'; });
    $$('.voice').forEach(function (el) {
      var a = vm.filter(function (x) { return String(x.id) === el.dataset.id; })[0]; if (!a) return;
      var btn = $('.play', el), bar = $('.bar', el);
      btn.onclick = function () {
        if (cur === a.id && !au.paused) { au.pause(); if (MT.sfx) MT.sfx('media', 'pause'); return; }
        if (cur !== a.id) { au.src = urlOf(a); cur = a.id; a.plays = (a.plays || 0) + 1; if (MTDB.on) MTDB.incrementPlays(a.id); else mPut(a); track('play', a.title); }
        au.play(); if (MT.sfx) MT.sfx('media', 'play'); syncV();
      };
      bar.onclick = function (e) { if (cur === a.id && au.duration) { var r = bar.getBoundingClientRect(); au.currentTime = (e.clientX - r.left) / r.width * au.duration; } };
      bar.onkeydown = function (e) { if (cur === a.id && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) au.currentTime += e.key === 'ArrowRight' ? 5 : -5; };
    });
  }
  function syncV() {
    $$('.voice').forEach(function (el) {
      var on = String(cur) === el.dataset.id;
      $('.play', el).innerHTML = on && !au.paused ? I.pause : I.play;
      $('.bar', el).style.setProperty('--v', on && au.duration ? au.currentTime / au.duration : 0);
      $('.tc', el).textContent = on ? fmt(au.currentTime) : '0:00';
    });
  }
  ['play', 'pause', 'timeupdate', 'ended'].forEach(function (e) { au.addEventListener(e, syncV); });

  /* programme details dialog. Also used by the admin's "open as visitor" button. */
  function openDlg(i) {
    var p = get('programmes')[i]; if (!p) return;
    $('#dlgbody').innerHTML = '<button class="ibtn x" aria-label="Close" id="dx">' + I.close + '</button><div class="ico">' + svgp(PICO[i % 6]) + '</div><h2 style="font-size:1.9rem">' + esc(p.t) + '</h2><p class="muted" style="font-size:1.05rem">' + esc(p.more || p.d) + '</p><a class="btn btn-p" href="#give" id="dgo">' + esc(get('hero').cta1) + '</a>' + '<div class="dlg-acts"><button class="btn btn-ghost btn-sm" id="dshare" type="button">Share</button><button class="btn btn-ghost btn-sm" id="dprint" type="button">Print</button></div>';
    var d = $('#dlg'); if (!d.open) d.showModal();
    track('prog', p.t);
    $('#dx').onclick = function () { d.close(); };
    $('#dgo').onclick = function () { d.close(); };
    $('#dshare').onclick = function () {
      var url = location.href.split('#')[0] + '#programmes';
      if (navigator.share) navigator.share({ title: p.t, text: p.d, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied', 'ok'); }, function () { toast('Could not copy the link', 'err'); });
      else toast('Sharing is not available here', 'err');
    };
    $('#dprint').onclick = function () { window.print(); };
  }

  function savePrefs() {
    if (!(window.MTDB && MTDB.on)) return;
    MTDB.savePrefs({ lang: lang, theme: LS.get('mt-theme') || 'system' });
  }
  function syncDarkBtn() {
    var db = $('#darkbtn'); if (!db) return;
    var t = document.documentElement.dataset.theme;
    var dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    db.innerHTML = dark ? I.sun : I.moon;
    db.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  /* pointer feedback (mouse and trackpad only): a soft light that follows the cursor on cards, and buttons that lean toward it */
  function setupFx() {
    if (phone || !window.matchMedia('(pointer: fine)').matches) return;
    document.addEventListener('pointermove', function (e) {
      var t = e.target; if (!t || !t.closest) return;
      var c = t.closest('.card');
      if (c) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      var b = t.closest('.btn-p, .btn-b');
      if (b) { var rb = b.getBoundingClientRect(); b.style.translate = ((e.clientX - (rb.left + rb.width / 2)) * .16).toFixed(1) + 'px ' + ((e.clientY - (rb.top + rb.height / 2)) * .2).toFixed(1) + 'px'; }
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var b = e.target.closest && e.target.closest('.btn-p, .btn-b');
      if (b && !b.contains(e.relatedTarget)) b.style.translate = '';
    }, true);
  }

  /* header: hide on scroll down, show on scroll up or when the pointer reaches the top edge */
  var lastY = scrollY, hideT = null;
  function setHidden(on) {
    var hdr = $('#hdr'); if (!hdr) return;
    hdr.classList.toggle('hide', on);
    document.body.classList.toggle('nav-hidden', on);
  }
  function navIsOpen() { var n = $('#nav'); return n && n.classList.contains('open'); }
  function megaIsOpen() { var m = $('#mega'); return m && !m.hidden; }
  function onScroll() {
    var y = scrollY, d = y - lastY; lastY = y;
    var hdr = $('#hdr'); if (!hdr) return;
    hdr.classList.toggle('solid', y > 40);
    if (y < 90) { clearTimeout(hideT); setHidden(false); }
    else if (d > 4 && !navIsOpen() && !megaIsOpen()) setHidden(true);
    else if (d < -4) setHidden(false);
    var m = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--p', m > 0 ? (y / m).toFixed(4) : 0);
    var tt = $('#totop');
    if (tt) { tt.classList.toggle('on', y > 700); tt.style.setProperty('--p', document.documentElement.style.getPropertyValue('--p') || 0); }
    var mo = document.documentElement.dataset.motion, fr = $('.frame');
    if (fr && (mo === 'rich' || mo === 'max')) fr.style.setProperty('--py', Math.min(y, 800) * (mo === 'max' ? .14 : .05));
    var mt = $('#mtext');
    if (mt) {
      var r = mt.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .9 - r.top) / (r.height + innerHeight * .45))), ws = $$('.mw', mt), n = Math.round(p * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    }
  }
  var tick = false;
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; onScroll(); }); } }, { passive: true });

  /* visit log: once per browser session. Early visits (before 9am local time) are flagged for the inbox. */
  (function logVisit() {
    try {
      if (IS_PREVIEW || adminOn()) return;
      if (sessionStorage.getItem('mt-v')) return;
      sessionStorage.setItem('mt-v', '1');
      var now = Date.now(), log = jget('mt-visit-log', []);
      log.push({ t: now, dev: phone ? 'm' : 'd', id: deviceId(), lang: lang });
      LS.set('mt-visit-log', JSON.stringify(log.slice(-6000)));
      if (new Date(now).getHours() < 9) track('early', 'first visit before 9am');
    } catch (e) {}
  })();

  /* outbound clicks from the site (donate, social, phone) */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-track]');
    if (t && view === 'site') track(t.dataset.track, t.dataset.d || '');
  });

  /* ---------- router + boot ---------- */
  function route() {
    var h = location.hash, adm = h.indexOf('#/admin') === 0, was = view;
    $('#site').hidden = adm;
    $('#admin').hidden = !adm;
    if (adm) { view = 'admin'; document.body.classList.remove('nav-hidden'); if (window.MT && MT.enterAdmin) MT.enterAdmin(); scrollTo(0, 0); }
    else {
      view = 'site';
      if (was !== 'site' || !$('#main').innerHTML) renderSite();
      else if (!h || h === '#/') scrollTo(0, 0);
      else if (h.charAt(1) !== '/') { var t = document.getElementById(h.slice(1)); if (t) t.scrollIntoView(); }
    }
  }

  window.MT = {
    $: $, $$: $$, esc: esc, I: I, LS: LS, jget: jget, clone: clone, S: function () { return S; }, DEF: DEF, SEC_EN: SEC_EN,
    PALETTES: PALETTES, CATS: CATS, CONSENT_CATS: CONSENT_CATS, MORPHS: MORPHS, FONTS: FONTS, MOTIONS: MOTIONS, SOUND_EV: SOUND_EV, SOUND_DEF: SOUND_DEF,
    get: get, saveS: saveS, setG: setG, flash: flash, toast: toast, getLang: getLang, setLang: setLang, lang: function () { return lang; },
    MEDIA: function () { return MEDIA; }, loadMedia: loadMedia, byId: byId, urlOf: urlOf, imgUrl: imgUrl, mPut: mPut, mDel: mDel, shrink: shrink, fmt: fmt, uid: uid,
    applyColors: applyColors, applyTheme: applyTheme, applyLook: applyLook, look: look, setLook: setLook, loadFont: loadFont, focusStyle: focusStyle,
    themeSeg: themeSeg, placeSeg: placeSeg, langMenu: langMenu, labelOf: labelOf, reduce: reduce, phone: phone, IS_PREVIEW: IS_PREVIEW,
    cardHtml: cardHtml, storyHtml: storyHtml, openDlg: openDlg, parseVideo: parseVideo, track: track, events: events, visits: visits, dayKey: dayKey,
    renderSite: renderSite, route: route, adminOn: adminOn, syncDarkBtn: syncDarkBtn, savePrefs: savePrefs, uuid: uuid,
    comments: function () { return window.__MT_ADMIN_COMMENTS || jget('mt-comments', []); }, sec: sec, SECS: SECS, setHidden: setHidden, deviceId: deviceId, svgp: svgp, PICO: PICO
  };

  openDB().then(loadRemote).then(loadMedia).then(function () {
    applyColors();
    applyLook();
    $('#themepill').innerHTML = themeSeg();
    syncDarkBtn();
    var dbt = $('#darkbtn');
    if (dbt) dbt.onclick = function () {
      var t = document.documentElement.dataset.theme;
      var dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
      applyTheme(dark ? 'light' : 'dark');
    };
    setupFx();
    var tt = $('#totop');
    if (tt) tt.onclick = function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); };
    document.addEventListener('click', function (e) { var m = $('#mega'); if (m && !m.hidden && !e.target.closest('#navbar')) megaOpen(false); });
    applyTheme(LS.get('mt-theme') || 'system');
    document.documentElement.lang = lang;
    langMenu();
    var lb = $('#langbtn'), lm = $('#langmenu'), nav = $('#nav'), bg = $('#burger'), edge = $('#edge'), hdr = $('#hdr');
    lb.onclick = function (e) { e.stopPropagation(); lm.hidden = !lm.hidden; lb.setAttribute('aria-expanded', !lm.hidden); };
    bg.onclick = function () { var o = nav.classList.toggle('open'); bg.setAttribute('aria-expanded', o); bg.innerHTML = o ? I.close : I.menu; document.body.style.overflow = o ? 'hidden' : ''; setHidden(false); placeSeg(); };
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); bg.setAttribute('aria-expanded', 'false'); bg.innerHTML = I.menu; document.body.style.overflow = ''; } });
    document.addEventListener('click', function (e) { if (!lm.hidden && !lm.contains(e.target) && e.target !== lb) { lm.hidden = true; lb.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { lm.hidden = true; megaOpen(false); nav.classList.remove('open'); bg.innerHTML = I.menu; document.body.style.overflow = ''; } });
    document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-theme-set]'); if (t) applyTheme(t.dataset.themeSet); });
    edge.addEventListener('pointerenter', function () { clearTimeout(hideT); setHidden(false); });
    hdr.addEventListener('pointerenter', function () { clearTimeout(hideT); });
    hdr.addEventListener('pointerleave', function () {
      if (scrollY > 90 && !navIsOpen() && !megaIsOpen()) hideT = setTimeout(function () { setHidden(true); }, 380);
    });
    $('#lb').addEventListener('click', function () { this.close(); });
    $('#dlg').addEventListener('click', function (e) { if (e.target === this) this.close(); });
    addEventListener('resize', placeSeg);
    addEventListener('hashchange', route);
    route();
    if (!window.__MT_SELF && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(function () {});
  });
})();
