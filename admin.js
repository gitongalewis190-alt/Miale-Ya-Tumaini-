/* Miale ya Tumaini · admin.js (admin panel, loaded after app.js)
   BACKEND HOOK: the sign-in handler (adminLogin) must be replaced with a real request.
   Until then, any input enters the admin. Do not publish with this open. */
(function () {
  'use strict';
  var MT = window.MT;
  if (!MT) return;
  var $ = MT.$, $$ = MT.$$, I = MT.I, esc = MT.esc;
  var S = function () { return MT.S(); };
  var get = MT.get;
  var built = false, curTab = 'overview', UPL = null, cid = 0;

  /* ---------- navigation: grouped, so the rail reads in five seconds ---------- */
  var GROUPS = [
    { g: 'Overview', items: [['overview', 'Statistics', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>']] },
    { g: 'Website', items: [
      ['content', 'Content', '<path d="M4 6h16M4 12h16M4 18h10"/>'],
      ['programmes', 'Programmes', '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'],
      ['impact', 'Impact figures', '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'],
      ['images', 'Images', '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'],
      ['audio', 'Audio', '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v3"/>'],
      ['stories', 'Stories & comments', '<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>']
    ] },
    { g: 'Settings', items: [
      ['contact', 'Contact & social', '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'],
      ['give', 'Donations', '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>'],
      ['brand', 'Brand & colours', '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c2 0 2-2 1-3s0-3 2-3h3a3 3 0 0 0 3-3 9 9 0 0 0-9-9z"/>'],
      ['language', 'Language', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/>'],
      ['appearance', 'Appearance', '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>']
    ] }
  ];
  var TABS = [];
  GROUPS.forEach(function (g) { g.items.forEach(function (t) { TABS.push(t); }); });
  var TITLES = {}; TABS.forEach(function (t) { TITLES[t[0]] = t[1]; });
  var EDIT_LANG_TABS = ['content', 'programmes', 'impact', 'stories', 'contact', 'give'];

  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var ICON = {
    up: ic('<path d="M12 19V5M6 11l6-6 6 6"/>'), down: ic('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    x: ic('<path d="M6 6l12 12M18 6 6 18"/>'), out: ic('<path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h11"/>'),
    trash: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'), check: ic('<path d="M5 12l5 5 9-10"/>')
  };

  /* ---------- form helpers ---------- */
  function F(g, label, val, o) {
    o = o || {};
    var id = 'f' + (++cid), a = 'data-g="' + g + '"' + (o.i !== undefined ? ' data-i="' + o.i + '"' : '') + (o.k ? ' data-k="' + o.k + '"' : '') + (o.lines ? ' data-lines="1"' : '');
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      (o.area ? '<textarea id="' + id + '" rows="' + (o.rows || 3) + '" ' + a + '>' + esc(val) + '</textarea>' : '<input class="in" id="' + id + '" ' + a + ' value="' + esc(val) + '">') + '</div>';
  }
  function panelBox(title, body, note) {
    return '<section class="panel"><h3>' + esc(title) + '</h3>' + (note ? '<p class="muted">' + esc(note) + '</p>' : '') + body + '</section>';
  }
  function listEd(g, fields, noun, label) {
    var l = get(g);
    var items = l.map(function (it, i) {
      return '<article class="item"><div class="item-h"><span class="idx">' + esc(label || noun) + ' ' + (i + 1) + '</span><div class="item-a">' +
        '<button type="button" class="ibtn-s" data-mv="' + g + '|' + i + '|-1" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>' + ICON.up + '</button>' +
        '<button type="button" class="ibtn-s" data-mv="' + g + '|' + i + '|1" aria-label="Move down"' + (i === l.length - 1 ? ' disabled' : '') + '>' + ICON.down + '</button>' +
        '<button type="button" class="ibtn-s danger" data-rm="' + g + '|' + i + '" aria-label="Remove">' + ICON.trash + '</button></div></div>' +
        fields.map(function (f) { return F(g, f[1], it[f[0]] || '', { i: i, k: f[0], area: f[2], rows: f[3] }); }).join('') + '</article>';
    }).join('');
    return '<div class="ccards">' + items + '</div><div style="margin-top:12px"><button type="button" class="btn btn-sm btn-ghost" data-add="' + g + '">+ Add ' + esc(noun) + '</button></div>';
  }
  var TPL = { pillars: { t: '', d: '' }, programmes: { t: '', d: '', more: '' }, figures: { n: '', s: '', l: '' }, how: { t: '', d: '' }, testimonials: { name: '', role: '', text: '' } };

  /* ---------- auth (BACKEND HOOK) ---------- */
  function signedIn() { try { return sessionStorage.getItem('mt-admin') === '1'; } catch (e) { return false; } }
  function adminLogin() {
    // BACKEND HOOK: replace with a real sign-in request. For now any input (even empty) enters.
    try { sessionStorage.setItem('mt-admin', '1'); } catch (x) {}
    location.hash = '#/admin/overview';
  }
  function signOut() {
    try { sessionStorage.removeItem('mt-admin'); } catch (x) {}
    location.hash = '#/admin';
    MT.toast('Signed out');
  }

  /* ---------- shell ---------- */
  function build() {
    if (built) return; built = true;
    var A = $('#admin');
    A.innerHTML =
      '<section class="alogin" id="alogin"><a class="ibtn backbtn" href="#/" aria-label="Back to the website">' + I.close + '</a>' +
      '<div class="card lcard"><img src="icons/logo.png" alt="" id="lgimg"><h2 style="font-size:1.8rem;margin:0">Sign in</h2><p class="muted" style="margin:0">Miale ya Tumaini admin</p>' +
      '<form id="aform" class="form" novalidate><div class="field"><label for="ae">Email</label><input class="in" id="ae" type="text" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false"></div>' +
      '<div class="field"><label for="ap">Password</label><div class="pwbox" style="position:relative"><input class="in" id="ap" type="password" autocomplete="current-password" style="padding-right:48px"><button type="button" class="eye" id="eye" aria-label="Show password" aria-pressed="false">' + I.eye + '</button></div></div>' +
      '<button class="btn btn-p" type="submit" style="width:100%">Sign in</button></form></div></section>' +
      '<div class="shell" id="ashell" hidden><aside class="side" id="side"><a class="brand" href="#/admin/overview"><img src="icons/logo.png" alt="" id="alogo"><span>Miale ya Tumaini</span></a>' +
      GROUPS.map(function (g) {
        return '<div class="grp">' + esc(g.g) + '</div>' + g.items.map(function (t) {
          return '<a class="tab" data-tab="' + t[0] + '" href="#/admin/' + t[0] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + t[2] + '</svg><span>' + esc(t[1]) + '</span></a>';
        }).join('');
      }).join('') +
      '<span class="sp"></span><button type="button" class="tab signout" id="signout">' + ICON.out + '<span>Sign out</span></button></aside>' +
      '<main class="amain" id="apanel"></main></div>';
    $('#aform').onsubmit = function (e) { e.preventDefault(); adminLogin(); };
    $('#eye').onclick = function () { var p = $('#ap'), s = p.type === 'password'; p.type = s ? 'text' : 'password'; this.innerHTML = s ? I.eyeoff : I.eye; this.setAttribute('aria-pressed', s); };
    $('#signout').onclick = signOut;
    var P = $('#apanel');
    P.addEventListener('input', onInput);
    P.addEventListener('change', onChange);
    P.addEventListener('click', onClick);
    P.addEventListener('submit', function (e) { if (e.target.id === 'uform') { e.preventDefault(); uploadAudio(); } });
    P.addEventListener('dragover', function (e) { var d = e.target.closest('.drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
    P.addEventListener('dragleave', function (e) { var d = e.target.closest('.drop'); if (d) d.classList.remove('over'); });
    P.addEventListener('drop', function (e) {
      var d = e.target.closest('.drop'); if (!d) return;
      e.preventDefault(); d.classList.remove('over');
      if (d.dataset.audio) pickAudio(e.dataTransfer.files[0]);
      else upImgs(d.dataset.drop, e.dataTransfer.files);
    });
  }

  function enterAdmin() {
    build();
    var h = location.hash, tab = h.split('/')[2] || '';
    var show = signedIn();
    $('#alogin').hidden = show; $('#ashell').hidden = !show;
    if (!show) return;
    if (!TITLES[tab]) { location.hash = '#/admin/overview'; return; }
    $$('.tab[data-tab]').forEach(function (a) { a.classList.toggle('act', a.dataset.tab === tab); if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#alogo').src = MT.imgUrl(S().slots.logo, 'icons/logo.png');
    panel(tab);
  }

  function editingNote() {
    var l = MT.lang() === 'sw' ? 'Kiswahili' : 'English';
    return '<span class="muted" style="font-size:.9rem">Editing in <b>' + l + '</b> · <a href="#/admin/language">change</a></span>';
  }

  /* ---------- panels ---------- */
  function head(tab, sub) {
    return '<div class="ahead"><div><p class="crumb">' + esc(groupOf(tab)) + '</p><h2>' + esc(TITLES[tab]) + '</h2>' + (sub ? '<p class="muted" style="margin:6px 0 0">' + sub + '</p>' : '') + '</div>' +
      '<div style="display:flex;gap:14px;align-items:center">' + (EDIT_LANG_TABS.indexOf(tab) >= 0 ? editingNote() : '') + '<span class="saved" id="saved" role="status" aria-live="polite"></span></div></div>';
  }
  function groupOf(tab) { var g = GROUPS.filter(function (x) { return x.items.some(function (t) { return t[0] === tab; }); })[0]; return g ? g.g : ''; }

  function panel(tab) {
    curTab = tab;
    var P = $('#apanel'), body = '';
    $$('.tab[data-tab]').forEach(function (a) { a.classList.toggle('act', a.dataset.tab === tab); });
    if (tab === 'overview') body = overviewHtml();
    else if (tab === 'content') body = contentHtml();
    else if (tab === 'programmes') body = panelBox('Programme cards', listEd('programmes', [['t', 'Name'], ['d', 'Short text', 1], ['more', 'Full text (shown when the card opens)', 1, 4]], 'programme'), 'Six cards is the layout the site is designed for.');
    else if (tab === 'impact') body = panelBox('Impact figures', '<div class="slots" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">' + get('figures').map(function (f) { return '<div class="card" style="background:var(--blue);color:var(--blue-ink);box-shadow:none;padding:20px"><p class="fig" style="font-size:2.6rem;margin:0">' + esc(f.n) + esc(f.s) + '</p><p style="margin:0;opacity:.9">' + esc(f.l) + '</p></div>'; }).join('') + '</div>' + listEd('figures', [['n', 'Number (digits only)'], ['s', 'After the number (e.g. +)'], ['l', 'Label']], 'figure'), 'Numbers count up on the site when visitors scroll to them.');
    else if (tab === 'images') body = imagesHtml();
    else if (tab === 'audio') body = audioHtml();
    else if (tab === 'stories') body = storiesHtml();
    else if (tab === 'contact') body = contactHtml();
    else if (tab === 'give') body = giveHtml();
    else if (tab === 'brand') body = brandHtml();
    else if (tab === 'language') body = languageHtml();
    else if (tab === 'appearance') body = appearanceHtml();
    P.innerHTML = head(tab, subOf(tab)) + body;
    placeSegs();
    if (tab === 'overview') {}
  }
  function subOf(tab) {
    return { overview: 'Visits, recordings and comments for this browser’s site data.', content: 'Words on the home page. Every text has a default, so you can edit one at a time.', programmes: 'Six cards. Click a card on the site to show its full text.', impact: 'Figures that count up when visitors scroll to them.', images: 'Choose where a photo goes, or drop it into a slot.', audio: 'Upload recordings and edit their details.', stories: 'Approve comments before they show on the site.', contact: 'Shown in the Visit section and in the footer.', give: 'Donation details. Leave a field empty to hide it.', brand: 'Name, logo colours and palette.', language: 'Choose which language you are editing.', appearance: 'How the admin and the site look on this device.' }[tab] || '';
  }
  function placeSegs() { MT.applyTheme(localStorage.getItem('mt-theme') || 'system'); MT.placeSeg(); }

  /* Overview: stats + a true calendar of visits */
  function overviewHtml() {
    var log = MT.jget('mt-visit-log', []), au = MT.MEDIA().filter(function (m) { return m.kind === 'audio'; });
    var plays = au.reduce(function (s, x) { return s + (x.plays || 0); }, 0);
    var listen = au.reduce(function (s, x) { return s + (x.dur || 0) * (x.plays || 0); }, 0);
    var cms = MT.jget('mt-comments', []);
    var imgs = MT.MEDIA().filter(function (m) { return m.kind === 'img'; }).length;
    var stats = [
      ['Visits', log.length, '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'],
      ['Recordings', au.length, '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0"/>'],
      ['Plays', plays, '<path d="M8 5v14l11-7z"/>'],
      ['Listening time', MT.fmt(listen), '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
      ['Comments', cms.length, '<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>'],
      ['Images', imgs, '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>']
    ];
    var statsHtml = '<div class="stats">' + stats.map(function (s) {
      return '<div class="card lift stat"><i>' + ic(s[2]) + '</i><b class="count">' + esc(s[1]) + '</b><span>' + esc(s[0]) + '</span></div>';
    }).join('') + '</div>';

    // Calendar: five full weeks ending today, Monday first. Every logged visit is counted into its local day.
    var counts = {}, times = {};
    log.forEach(function (t) { var k = dayKey(t); counts[k] = (counts[k] || 0) + 1; (times[k] = times[k] || []).push(t); });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var dow = (today.getDay() + 6) % 7;
    var start = new Date(today.getTime() - (dow + 28) * 864e5);
    var max = 1; Object.keys(counts).forEach(function (k) { if (counts[k] > max) max = counts[k]; });
    var cells = '', dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return '<div class="dow">' + d + '</div>'; }).join('');
    var last7 = 0, last7Days = 0;
    for (var i = 0; i < 35; i++) {
      var d = new Date(start.getTime() + i * 864e5), k = dayKey(d), v = counts[k] || 0;
      var future = d > today, isToday = k === dayKey(today), inWeek = (today - d) / 864e5 < 7 && d <= today;
      if (inWeek) { last7 += v; last7Days++; }
      var lvl = v === 0 ? 'none' : 'lvl' + Math.min(3, Math.ceil(v / max * 3));
      var when = (times[k] || []).sort(function (a, b) { return a - b; }).map(function (t) { return new Date(t).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); }).join(', ');
      var label = d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
      cells += '<div class="day ' + (future ? 'none' : lvl) + (isToday ? ' today' : '') + (inWeek ? ' wk' : '') + '" tabindex="0" aria-label="' + esc(label + ': ' + v + ' visits') + '" style="' + (future ? 'opacity:.35' : '') + '">' +
        '<span class="dn">' + d.getDate() + '</span><span class="dv">' + (future ? '' : v) + '</span>' +
        (future ? '' : '<span class="bar-v" style="--s:' + (v / max) + '"></span>') +
        (future ? '' : '<span class="tip">' + esc(label) + ' · ' + v + (v === 1 ? ' visit' : ' visits') + (when ? ' · ' + esc(when) : '') + '</span>') + '</div>';
    }
    var cal = '<section class="panel"><div class="section-h"><div><h3>Visits calendar</h3><p>Last five weeks. Today is outlined in orange. Hover or focus a day for its exact visit times.</p></div></div>' +
      '<div class="cal">' + dows + cells + '</div>' +
      '<div class="legend">Fewer <i style="background:var(--bg)"></i><i style="background:color-mix(in srgb,var(--blue) 12%,var(--bg))"></i><i style="background:color-mix(in srgb,var(--blue) 22%,var(--bg))"></i><i style="background:color-mix(in srgb,var(--blue) 32%,var(--bg))"></i> More</div></section>';
    var totals = '<section class="panel"><h3>Last 7 days</h3><div class="totals">' +
      '<div><span>Visits</span><b>' + last7 + '</b></div>' +
      '<div><span>Average per day</span><b>' + (last7Days ? (last7 / 7).toFixed(1) : '0') + '</b></div>' +
      '<div><span>Visits today</span><b>' + (counts[dayKey(today)] || 0) + '</b></div>' +
      '<div><span>All time</span><b>' + log.length + '</b></div></div>' +
      '<p class="muted" style="font-size:.85rem;margin:0">Counts come from this browser. Connect a backend to count every visitor.</p></section>';
    return statsHtml + '<div class="cal-wrap" style="margin-top:20px">' + cal + totals + '</div>';
  }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function contentHtml() {
    var H = get('hero'), M = get('mission'), sc = get('sec'), keys = Object.keys(MT.SEC_EN);
    var labels = { nav_work: 'Menu: our work', nav_impact: 'Menu: impact', nav_give: 'Menu: give', nav_gallery: 'Menu: gallery', nav_voices: 'Menu: voices', nav_how: 'Menu: how we work', nav_visit: 'Menu: visit', pil_t: 'What we do title', prog_t: 'Programmes title', prog_i: 'Programmes intro', imp_t: 'Impact title', imp_i: 'Impact intro', give_t: 'Donate title', give_i: 'Donate intro', give_btn: 'Donate button', give_call: 'Give by phone title', gal_t: 'Gallery title', gal_i: 'Gallery intro', voi_t: 'Voices title', voi_i: 'Voices intro', tes_t: 'Kind words title', how_t: 'How we work title', vis_t: 'Visit title', con_t: 'Comment panel title', con_i: 'Comment panel text', c_name: 'Comment: name label', c_msg: 'Comment: message label', c_consent: 'Comment: consent text', c_sig: 'Comment: signature label', c_sig_clear: 'Comment: clear signature', c_send: 'Comment: button', c_e1: 'Comment: empty message error', c_e2: 'Comment: consent error', c_e3: 'Comment: signature error', c_ok: 'Comment: thank-you message', ph: 'Phone label', em: 'Email label', find: 'Places title', more: 'Programme card link', powered: 'Footer: powered by', quick: 'Footer: explore', reach: 'Footer: reach us', follow: 'Footer: follow us', all: 'Gallery: all filter' };
    return panelBox('Hero', F('hero', 'Headline', H.h1, { k: 'h1', area: 1, rows: 2 }) + F('hero', 'Short line under the headline', H.lead, { k: 'lead' }) + '<div class="row2">' + F('hero', 'Main button', H.cta1, { k: 'cta1' }) + F('hero', 'Second button', H.cta2, { k: 'cta2' }) + '</div>') +
      panelBox('Organisation', '<div class="row2">' + F('brand', 'Name', get('brand').name, { k: 'name' }) + F('brand', 'Tagline (shown under the logo)', get('brand').tag, { k: 'tag' }) + '</div>') +
      panelBox('Mission', F('mission', 'Mission statement', M.text, { k: 'text', area: 1, rows: 4 })) +
      panelBox('What we do', listEd('pillars', [['t', 'Title'], ['d', 'Short line']], 'pillar'), 'The four pillars sit under the hero. They replace the old scrolling banner.') +
      panelBox('How we work', listEd('how', [['t', 'Title'], ['d', 'Text', 1]], 'item')) +
      panelBox('Footer', F('foot', 'Short line under the name', get('foot').blurb, { k: 'blurb' }) + F('foot', 'Copyright line', get('foot').copy, { k: 'copy' })) +
      '<details class="panel"><summary style="font:700 1.05rem var(--fd);cursor:pointer">Section titles and labels</summary><p class="muted" style="margin:8px 0 14px">Advanced. Change only if a heading needs different words.</p><div class="row2">' +
      keys.map(function (k) { return F('sec', labels[k] || k, sc[k] !== undefined ? sc[k] : MT.SECS[MT.lang()][k], { k: k }); }).join('') + '</div></details>';
  }

  function imagesHtml() {
    var slots = S().slots, cats = S().cats || {}, all = MT.MEDIA().filter(function (m) { return m.kind === 'img'; });
    function thumb(id, emptyTxt) { var u = id && MT.imgUrl(id, ''); return '<div class="thumb">' + (u ? '<img src="' + u + '" alt="">' : '<div class="empty-t">' + esc(emptyTxt) + '</div>') + '</div>'; }
    var single = [
      ['hero', 'Home page photo', 'Beside the headline. Landscape or portrait, JPG or PNG.', slots.hero],
      ['logo', 'Logo', 'Square, transparent PNG works best.', slots.logo],
      ['donate', 'Donation banner', 'Wide photo at the top of the donation card.', slots.donate]
    ];
    var slotHtml = single.map(function (s) {
      return '<div class="slot"><div class="sh"><h3>' + esc(s[1]) + '</h3><span class="tag ' + (s[3] ? 'on' : '') + '">' + (s[3] ? 'Set' : 'Default') + '</span></div>' + thumb(s[3], 'Using the default') +
        '<p>' + esc(s[2]) + '</p><label class="drop" data-drop="slot:' + s[0] + '" for="up-' + s[0] + '"><p>' + (s[3] ? 'Replace' : 'Choose or drop an image') + '</p></label><input type="file" id="up-' + s[0] + '" data-up="slot:' + s[0] + '" accept="image/*" hidden>' +
        (s[3] ? '<button type="button" class="btn btn-sm btn-ghost" data-clear="' + s[0] + '" style="justify-self:start">Use default</button>' : '') + '</div>';
    }).join('');
    var catDesc = { kids: 'Portraits of children. Needs written consent.', visitors: 'Visitors with children. Needs written consent.', moments: 'Moments with the children. Needs written consent.', stories: 'Photos that go with a story. Needs written consent.', programmes: 'Photos of programme sessions. Check faces for consent.' };
    var catHtml = MT.CATS.map(function (c) {
      var n = (cats[c[0]] || []).length;
      return '<div class="slot"><div class="sh"><h3>' + esc(c[1]) + '</h3><span class="tag ' + (n ? 'on' : '') + '">' + n + (n === 1 ? ' photo' : ' photos') + '</span></div>' +
        '<p>' + esc(catDesc[c[0]]) + '</p><label class="drop" data-drop="cat:' + c[0] + '" for="up-' + c[0] + '"><p>Add photos</p><span>Choose several or drop them here</span></label><input type="file" id="up-' + c[0] + '" data-up="cat:' + c[0] + '" accept="image/*" multiple hidden></div>';
    }).join('');
    var lib = '<div class="chips" role="group" aria-label="Filter"><button type="button" data-filter="all" aria-pressed="' + (curFilter === 'all') + '">All (' + all.length + ')</button>' +
      MT.CATS.map(function (c) { return '<button type="button" data-filter="' + c[0] + '" aria-pressed="' + (curFilter === c[0]) + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>';
    var shown = all.filter(function (m) { return curFilter === 'all' || m.cat === curFilter; });
    var tiles = shown.length ? '<div class="tiles" style="margin-top:14px">' + shown.map(function (m) {
      var needs = MT.CONSENT_CATS.indexOf(m.cat) >= 0;
      return '<div class="tile"><img src="' + MT.urlOf(m) + '" alt=""><button type="button" class="rm" data-delimg="' + m.id + '" aria-label="Remove image">' + ICON.x + '</button>' +
        '<div class="cap"><small>' + esc(m.cat ? MT.labelOf(m.cat) : 'Unfiled') + '</small>' +
        (needs ? '<label style="display:flex;gap:6px;align-items:center;font-size:.8rem;font-weight:700;cursor:pointer"><input type="checkbox" data-consent="' + m.id + '"' + (m.consent ? ' checked' : '') + '> Consent</label>' : '') + '</div>' +
        '<div style="padding:0 12px 12px"><select class="in" data-movecat="' + m.id + '" aria-label="Category" style="padding:8px 10px;font-size:.85rem">' + MT.CATS.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === m.cat ? ' selected' : '') + '>' + esc(c[1]) + '</option>'; }).join('') + '</select></div></div>';
    }).join('') + '</div>' : '<p class="muted" style="margin:14px 0 0">No photos here yet.</p>';
    return '<div class="slots">' + slotHtml + '</div>' +
      '<div class="section-h" style="margin-top:34px"><div><h3>Photo catalogue</h3><p>Photos of children show on the site only after <b>Consent</b> is ticked. Without it they stay hidden.</p></div></div>' +
      '<div class="slots">' + catHtml + '</div>' +
      '<div class="section-h" style="margin-top:34px"><div><h3>Library</h3><p>Every photo, grouped by where it is used.</p></div></div>' + lib + tiles;
  }
  var curFilter = 'all';

  function audioHtml() {
    var al = MT.MEDIA().filter(function (m) { return m.kind === 'audio'; }).sort(function (a, b) { return b.date - a.date; });
    UPL = UPL || null;
    var up = '<form class="panel" id="uform"><h3>Upload a recording</h3><label class="drop" data-audio="1" for="file"><p id="dname">Choose or drop an audio file</p><span>MP3, WAV, M4A or OGG</span></label><input type="file" id="file" accept="audio/*" hidden data-audio-input="1">' +
      '<div class="row2"><div class="field"><label for="ut">Title</label><input class="in" id="ut" maxlength="80"></div><div class="field"><label for="us">Speaker</label><input class="in" id="us" maxlength="60"></div></div>' +
      '<div class="row2"><div class="field"><label for="ul">Language</label><input class="in" id="ul" maxlength="30"></div></div>' +
      '<div class="field"><label for="ud">About this recording</label><textarea id="ud" rows="3" maxlength="400"></textarea></div><p class="err" id="ue" hidden></p><button class="btn btn-p btn-sm" type="submit" style="justify-self:start">Upload recording</button></form>';
    var list = al.map(function (x) {
      return '<article class="item"><div class="item-h"><span class="idx">' + esc(x.title) + '</span><span class="meta">' + MT.fmt(x.dur) + ' · ' + (x.plays || 0) + ' plays</span></div>' +
        '<div class="row2"><div class="field"><label>Title</label><input class="in" data-au="' + x.id + '" data-f="title" value="' + esc(x.title) + '"></div><div class="field"><label>Speaker</label><input class="in" data-au="' + x.id + '" data-f="speaker" value="' + esc(x.speaker || '') + '"></div></div>' +
        '<div class="field"><label>About</label><textarea rows="2" data-au="' + x.id + '" data-f="desc">' + esc(x.desc || '') + '</textarea></div>' +
        '<div><button class="btn btn-sm btn-danger" data-delau="' + x.id + '">Delete recording</button></div></article>';
    }).join('');
    return '<div class="cal-wrap" style="grid-template-columns:minmax(0,1fr)">' + up + '</div>' +
      '<div class="section-h" style="margin-top:28px"><div><h3>Recordings (' + al.length + ')</h3></div></div>' +
      (list ? '<div class="ccards two">' + list + '</div>' : '<p class="muted">No recordings yet.</p>');
  }

  function storiesHtml() {
    var cl = MT.jget('mt-comments', []);
    var cards = cl.map(function (c) {
      return '<article class="item"><div class="item-h"><div><b>' + esc(c.n || 'No name') + '</b> <span class="meta">' + new Date(c.d).toLocaleString('en-KE') + '</span></div><span class="tag ' + (c.ok ? 'on' : '') + '">' + (c.ok ? 'On the site' : 'Waiting') + '</span></div>' +
        '<p style="margin:0">' + esc(c.m) + '</p>' +
        (c.sig ? '<div><p class="meta" style="margin:0 0 6px;font-size:.8rem">Signature (admin only, never shown publicly)</p><img src="' + esc(c.sig) + '" alt="Signature" style="height:60px;background:var(--bg);border:1px solid var(--line);border-radius:12px"></div>' : '') +
        '<div class="item-a"><button class="btn btn-sm btn-ghost" data-cm="' + (c.ok ? 'hide' : 'ok') + '" data-id="' + c.id + '">' + (c.ok ? 'Hide from site' : 'Approve and show') + '</button><button class="btn btn-sm btn-danger" data-cm="del" data-id="' + c.id + '">Delete</button></div></article>';
    }).join('');
    return panelBox('Testimonials (shown on the site)', listEd('testimonials', [['name', 'Name'], ['role', 'Role or place'], ['text', 'What they said', 1, 4]], 'testimonial')) +
      '<div class="section-h" style="margin-top:28px"><div><h3>Visitor comments (' + cl.length + ')</h3><p>Only comments approved here appear on the site. A signature is kept for your records.</p></div></div>' +
      (cards ? '<div class="ccards two">' + cards + '</div>' : '<p class="muted">No comments yet.</p>');
  }

  function contactHtml() {
    var C = get('contact');
    return panelBox('Phone and email', F('contact', 'Phone numbers (one per line)', C.phones.join('\n'), { k: 'phones', lines: 1, area: 1, rows: 3 }) + '<div class="row2">' + F('contact', 'Email', C.email, { k: 'email' }) + F('contact', 'WhatsApp number (with country code)', C.wa, { k: 'wa' }) + '</div>') +
      panelBox('Social links', '<div class="row2">' + F('contact', 'Facebook link', C.fb, { k: 'fb' }) + F('contact', 'Instagram link', C.ig, { k: 'ig' }) + '</div>') +
      panelBox('Places (one per line)', F('contact', 'Addresses and landmarks', C.places.join('\n'), { k: 'places', lines: 1, area: 1, rows: 4 }));
  }

  function giveHtml() {
    var G = get('give'), D = get('give');
    return panelBox('Donation card', F('give', 'Title (leave empty to use the default)', G.title || '', { k: 'title' }) + F('give', 'Text under the title', G.text, { k: 'text', area: 1, rows: 3 }) + F('give', 'Suggested amounts, separated by ·', G.amounts, { k: 'amounts' }) + F('give', 'Donation link (opens in a new tab)', G.link, { k: 'link' }), 'If the link is empty, the button calls the first phone number instead.') +
      panelBox('Other ways to give', '<div class="row2">' + F('give', 'M-Pesa details', G.mpesa, { k: 'mpesa' }) + F('give', 'Bank account details', G.account, { k: 'account' }) + '</div>', 'Shown in the card only when filled in. The donation banner photo is set in Images.');
  }

  function brandHtml() {
    var c = S().col || {};
    var swatches = MT.PALETTES.map(function (p, i) {
      return '<button type="button" class="palette-card" data-palette="' + i + '" aria-label="Use ' + esc(p.n) + '" title="' + esc(p.n) + '">' +
        '<span style="display:flex;height:44px"><i style="flex:1;background:' + p.bg + '"></i><i style="flex:1;background:' + p.blue + '"></i><i style="flex:1;background:' + p.accent + '"></i><i style="flex:1;background:' + p.brown + '"></i></span><span style="display:block;padding:10px 12px;font-weight:700;font-size:.9rem">' + esc(p.n) + '</span></button>';
    }).join('');
    return panelBox('Name', '<div class="row2">' + F('brand', 'Organisation name', get('brand').name, { k: 'name' }) + F('brand', 'Tagline', get('brand').tag, { k: 'tag' }) + '</div>') +
      panelBox('Palette', '<p class="muted">Pick a set, then fine-tune. The site stays solid: no gradients, and the blue is always flat.</p><div class="swatches" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' + swatches + '</div>' +
        '<div class="swatches" style="margin-top:6px">' +
        colourRow('bg', 'Background (cream)', c.bg || MT.PALETTES[0].bg) + colourRow('blue', 'Main blue', c.blue || MT.PALETTES[0].blue) + colourRow('accent', 'Accent (buttons)', c.accent || MT.PALETTES[0].accent) + colourRow('brown', 'Warm brown (labels)', c.brown || MT.PALETTES[0].brown) +
        '</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-sm btn-ghost" id="rescol">Back to the default palette</button></div>');
  }
  function colourRow(k, label, v) {
    return '<label class="swatch"><input type="color" data-col="' + k + '" value="' + v + '" aria-label="' + esc(label) + '"><span><b>' + esc(label) + '</b><small>' + v.toUpperCase() + '</small></span></label>';
  }

  function languageHtml() {
    var l = MT.lang();
    return panelBox('Editing language', '<p class="muted" style="margin:0">English and Kiswahili are edited separately. The site shows the language a visitor chooses.</p>' +
      '<div class="seg" role="group" aria-label="Editing language" style="width:max-content" id="langseg"><span class="th"></span><button type="button" data-el="en" aria-pressed="' + (l === 'en') + '" style="padding:0 16px;font-weight:700;min-width:0;height:36px">English</button><button type="button" data-el="sw" aria-pressed="' + (l === 'sw') + '" style="padding:0 16px;font-weight:700;min-width:0;height:36px">Kiswahili</button></div>');
  }

  function appearanceHtml() {
    return panelBox('Admin theme', '<p class="muted" style="margin:0">Light or dark for this admin on this device.</p>' + MT.themeSeg()) +
      panelBox('Preview the site', '<p class="muted" style="margin:0">See how the site looks on a desktop or a phone. Preview uses your latest saved edits.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-sm btn-ghost" data-preview="desktop">Desktop preview</button><button type="button" class="btn btn-sm btn-ghost" data-preview="mobile">Phone preview</button></div>');
  }

  /* ---------- events ---------- */
  function onInput(e) {
    var el = e.target;
    if (el.dataset.g) {
      var g = el.dataset.g, v = MT.clone(get(g)), i = el.dataset.i, k = el.dataset.k;
      var val = el.dataset.lines ? el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : el.value;
      if (i !== undefined && k) v[i][k] = val; else if (i !== undefined) v[i] = val; else if (k) v[k] = val; else v = val;
      MT.setG(g, v);
    } else if (el.dataset.col) {
      var s = S(); s.col = s.col || {}; s.col[el.dataset.col] = el.value; MT.saveS(); MT.applyColors(); MT.flash();
    } else if (el.dataset.au) {
      var m = MT.byId(+el.dataset.au);
      if (m) { m[el.dataset.f] = el.value; MT.mPut(m); MT.flash(); }
    }
  }
  function onChange(e) {
    var el = e.target;
    if (el.dataset.up && el.files.length) upImgs(el.dataset.up, el.files);
    else if (el.dataset.audioInput) pickAudio(el.files[0]);
    else if (el.dataset.consent) setImg(+el.dataset.consent, { consent: el.checked }, 'Consent saved');
    else if (el.dataset.movecat) moveImg(+el.dataset.movecat, el.value);
  }
  function onClick(e) {
    var b = e.target.closest('button'); if (!b) { var lab = e.target.closest('[data-filter]'); if (lab) {} return; }
    var tab = curTab;
    if (b.dataset.add) { var v = MT.clone(get(b.dataset.add)); v.push(MT.clone(TPL[b.dataset.add])); MT.setG(b.dataset.add, v); panel(tab); }
    else if (b.dataset.rm) { var p = b.dataset.rm.split('|'), v2 = MT.clone(get(p[0])); v2.splice(+p[1], 1); MT.setG(p[0], v2); panel(tab); }
    else if (b.dataset.mv) {
      var q = b.dataset.mv.split('|'), arr = MT.clone(get(q[0])), from = +q[1], to = from + (+q[2]);
      if (to >= 0 && to < arr.length) { var t = arr[from]; arr[from] = arr[to]; arr[to] = t; MT.setG(q[0], arr); panel(tab); }
    }
    else if (b.dataset.filter) { curFilter = b.dataset.filter; panel(tab); }
    else if (b.dataset.delimg) deleteImg(+b.dataset.delimg);
    else if (b.dataset.clear) { var s = S(); s.slots[b.dataset.clear] = null; MT.saveS(); panel(tab); }
    else if (b.dataset.delau) { if (confirm('Delete this recording?')) MT.mDel(+b.dataset.delau).then(MT.loadMedia).then(function () { panel(tab); }); }
    else if (b.dataset.cm) {
      var id = +b.dataset.id, l = MT.jget('mt-comments', []);
      l = b.dataset.cm === 'del' ? l.filter(function (c) { return c.id !== id; }) : l.map(function (c) { if (c.id === id) c.ok = b.dataset.cm === 'ok'; return c; });
      MT.LS.set('mt-comments', JSON.stringify(l)); panel(tab);
    }
    else if (b.dataset.el) { MT.setLang(b.dataset.el); panel(tab); }
    else if (b.dataset.palette !== undefined) {
      var pal = MT.PALETTES[+b.dataset.palette], s2 = S(); s2.col = { bg: pal.bg, blue: pal.blue, accent: pal.accent, brown: pal.brown };
      MT.saveS(); MT.applyColors(); MT.flash(); MT.toast('Palette applied: ' + pal.n); panel(tab);
    }
    else if (b.dataset.preview) openPreview(b.dataset.preview);
    else if (b.id === 'rescol') { var s3 = S(); s3.col = {}; MT.saveS(); MT.applyColors(); MT.toast('Default palette restored'); panel(tab); }
    else if (b.id === 'resall') {
      if (confirm('Reset all content, colours and images to the original? This cannot be undone.')) {
        var fresh = { c: { en: {}, sw: {} }, col: {}, cats: {}, slots: {} };
        try { localStorage.setItem('mt-s', JSON.stringify(fresh)); } catch (x) {}
        location.reload();
      }
    }
  }

  /* ---------- images ---------- */
  function upImgs(target, files) {
    var arr = [].slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!arr.length) return;
    var kind = target.split(':')[0], key = target.split(':')[1];
    var max = kind === 'slot' && key === 'logo' ? 512 : 1800;
    var type = kind === 'slot' && key === 'logo' ? 'image/png' : 'image/jpeg';
    Promise.all(arr.map(function (f) {
      return MT.shrink(f, max, type).then(function (b) { var id = MT.uid(); return MT.mPut({ id: id, kind: 'img', blob: b, date: Date.now(), cat: kind === 'cat' ? key : null, consent: false }).then(function () { return id; }); });
    })).then(function (ids) {
      var s = S();
      if (kind === 'slot') { var old = s.slots[key]; s.slots[key] = ids[0]; if (old) MT.mDel(old); }
      else { s.cats = s.cats || {}; s.cats[key] = (s.cats[key] || []).concat(ids); }
      MT.saveS();
      return MT.loadMedia();
    }).then(function () { MT.toast('Image saved'); MT.applyColors(); panel(curTab); });
  }
  function setImg(id, patch, msg) {
    var m = MT.byId(id); if (!m) return;
    Object.keys(patch).forEach(function (k) { m[k] = patch[k]; });
    MT.mPut(m).then(function () { MT.flash(); if (msg) MT.toast(msg); });
  }
  function moveImg(id, cat) {
    var m = MT.byId(id); if (!m) return;
    var s = S(); s.cats = s.cats || {};
    if (m.cat && s.cats[m.cat]) s.cats[m.cat] = s.cats[m.cat].filter(function (x) { return x !== id; });
    m.cat = cat; s.cats[cat] = (s.cats[cat] || []).concat([id]); MT.saveS();
    MT.mPut(m).then(function () { MT.toast('Moved to ' + MT.labelOf(cat)); panel(curTab); });
  }
  function deleteImg(id) {
    if (!confirm('Remove this photo from the site and the library?')) return;
    var s = S(); s.cats = s.cats || {};
    Object.keys(s.cats).forEach(function (k) { s.cats[k] = s.cats[k].filter(function (x) { return x !== id; }); });
    Object.keys(s.slots).forEach(function (k) { if (s.slots[k] === id) s.slots[k] = null; });
    MT.saveS();
    MT.mDel(id).then(MT.loadMedia).then(function () { panel(curTab); });
  }

  /* ---------- audio ---------- */
  function pickAudio(f) {
    if (!f) return;
    UPL = f; $('#dname').textContent = f.name;
    var t = $('#ut'); if (t && !t.value) t.value = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  }
  function uploadAudio() {
    var er = $('#ue');
    if (!UPL) { er.textContent = 'Choose an audio file first.'; er.hidden = false; return; }
    if (!$('#ut').value.trim()) { er.textContent = 'Add a title.'; er.hidden = false; return; }
    er.hidden = true;
    var pr = new Audio(), u = URL.createObjectURL(UPL);
    function save(d) {
      URL.revokeObjectURL(u);
      MT.mPut({ id: MT.uid(), kind: 'audio', title: $('#ut').value.trim(), speaker: $('#us').value.trim(), lang: $('#ul').value.trim(), desc: $('#ud').value.trim(), date: Date.now(), dur: d, plays: 0, blob: UPL })
        .then(MT.loadMedia).then(function () { UPL = null; MT.toast('Recording uploaded'); panel('audio'); });
    }
    pr.preload = 'metadata';
    pr.onloadedmetadata = function () { save(isFinite(pr.duration) ? pr.duration : 0); };
    pr.onerror = function () { save(0); };
    pr.src = u;
  }

  /* ---------- preview (desktop or phone width) ---------- */
  function openPreview(kind) {
    var d = $('#prev');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'prev';
      d.style.cssText = 'width:100vw;height:100vh;max-width:100vw;max-height:100vh;background:var(--bg)';
      d.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--surface);border-bottom:1px solid var(--line)"><b id="pvl"></b><button class="btn btn-sm btn-ghost" id="pvc">Close preview</button></div><div style="height:calc(100vh - 58px);overflow:auto;display:flex;justify-content:center;background:var(--surface-2);padding:16px"><iframe id="pvf" title="Site preview" style="border:1px solid var(--line);border-radius:22px;background:var(--bg);height:100%;width:100%;transition:width .4s var(--out)"></iframe></div>';
      document.body.appendChild(d);
      $('#pvc').onclick = function () { d.close(); };
    }
    var w = kind === 'mobile' ? '390px' : '100%';
    $('#pvf').style.width = w; $('#pvf').style.maxWidth = kind === 'mobile' ? '390px' : '100%';
    $('#pvl').textContent = kind === 'mobile' ? 'Phone preview · 390 px' : 'Desktop preview';
    $('#pvf').src = 'index.html#/';
    d.showModal();
  }

  /* ---------- global hooks ---------- */
  MT.enterAdmin = enterAdmin;
  MT.refreshAdmin = function () { panel(curTab); MT.placeSeg(); };
})();
