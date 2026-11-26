/* Miale ya Tumaini · admin.js (admin panel, loaded after app.js and ux.js)
   BACKEND HOOK: adminLogin must be replaced with a real sign-in request (search "BACKEND").
   Until then, any input enters the admin. Do not publish with this open. */
(function () {
  'use strict';
  var MT = window.MT; if (!MT) return;
  var $ = MT.$, $$ = MT.$$, I = MT.I, esc = MT.esc;
  var S = function () { return MT.S(); };
  var get = MT.get;
  var built = false, curTab = 'overview', UPL = null, cid = 0, curFilter = 'all';
  var curProg = 0, curStory = 0, curComment = null, curVid = 0, curSlot = 'hero', curInbox = 'all', tourStep = 0;
  var PEAKS = {}, TRIM = {}, AUD = {};
  var EDIT_LANG_TABS = ['content', 'programmes', 'impact', 'stories', 'contact', 'give', 'video'];

  /* ---------- navigation: grouped, with submenus in Settings ---------- */
  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var P = {
    overview: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13L22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7l3.5-7z"/>',
    content: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    programmes: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    impact: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    stories: '<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>',
    images: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    audio: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v3"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
    brand: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c2 0 2-2 1-3s0-3 2-3h3a3 3 0 0 0 3-3 9 9 0 0 0-9-9z"/>',
    type: '<path d="M4 7V5h16v2M9 20h6M12 5v15"/>',
    shapes: '<rect x="3" y="3" width="18" height="18" rx="5"/><rect x="7" y="7" width="10" height="10" rx="3"/>',
    motion: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    sounds: '<path d="M11 5 6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/>',
    give: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
    contact: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    appearance: '<path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9z"/><path d="M12 3v18"/>',
    data: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    site: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    out: '<path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h11"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    play: '<path d="M8 5v14l11-7z"/>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    check: '<path d="M5 12l5 5 9-10"/>'
  };
  var GROUPS = [
    { g: 'Overview', items: [['overview', 'Statistics', P.overview], ['inbox', 'Inbox', P.inbox]] },
    { g: 'Website', items: [['content', 'Content', P.content], ['programmes', 'Programmes', P.programmes], ['impact', 'Impact figures', P.impact], ['stories', 'Stories & comments', P.stories]] },
    { g: 'Media', items: [['images', 'Images', P.images], ['audio', 'Audio', P.audio], ['video', 'Video', P.video]] },
    { g: 'Settings', subs: [
      { s: 'Identity', items: [['brand', 'Brand & colours', P.brand], ['type', 'Typography', P.type], ['shapes', 'Shapes & glass', P.shapes]] },
      { s: 'Experience', items: [['motion', 'Motion', P.motion], ['sounds', 'Sounds & haptics', P.sounds], ['language', 'Language', P.language]] },
      { s: 'Business', items: [['give', 'Donations', P.give], ['contact', 'Contact & social', P.contact]] },
      { s: 'Admin', items: [['appearance', 'Admin look', P.appearance], ['data', 'Data & backup', P.data]] }
    ] }
  ];
  var TABS = [];
  GROUPS.forEach(function (g) {
    (g.items || []).forEach(function (t) { TABS.push(t); });
    (g.subs || []).forEach(function (s) { s.items.forEach(function (t) { TABS.push(t); }); });
  });
  var TITLES = {}; TABS.forEach(function (t) { TITLES[t[0]] = t[1]; });

  function tabHtml(t, sub) {
    return '<a class="tab' + (sub ? ' sub' : '') + '" data-tab="' + t[0] + '" href="#/admin/' + t[0] + '">' + ic(t[2]) + '<span>' + esc(t[1]) + '</span>' +
      (t[0] === 'inbox' ? '<b class="badge" id="inboxBadge" hidden></b>' : '') + '</a>';
  }

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
  var TPL = { pillars: { t: '', d: '' }, programmes: { t: '', d: '', more: '' }, figures: { n: '', s: '', l: '' }, how: { t: '', d: '' }, testimonials: { name: '', role: '', text: '' }, videos: { t: '', url: '', d: '' } };

  /* a list of editable cards. pick: true adds a "preview this" button. */
  function listEd(g, fields, noun, pick) {
    var l = get(g), sel = g === 'programmes' ? curProg : g === 'testimonials' ? curStory : g === 'videos' ? curVid : -1;
    var items = l.map(function (it, i) {
      return '<article class="item' + (i === sel && pick ? ' sel' : '') + '"><div class="item-h"><span class="idx">' + esc(noun) + ' ' + (i + 1) + '</span><div class="item-a">' +
        (pick ? '<button type="button" class="ibtn-s" data-pick="' + g + '|' + i + '" aria-label="Preview this ' + esc(noun) + '" title="Preview">' + ic(P.eye) + '</button>' : '') +
        '<button type="button" class="ibtn-s" data-mv="' + g + '|' + i + '|-1" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>' + ic(P.up) + '</button>' +
        '<button type="button" class="ibtn-s" data-mv="' + g + '|' + i + '|1" aria-label="Move down"' + (i === l.length - 1 ? ' disabled' : '') + '>' + ic(P.down) + '</button>' +
        '<button type="button" class="ibtn-s danger" data-rm="' + g + '|' + i + '" aria-label="Remove">' + ic(P.trash) + '</button></div></div>' +
        fields.map(function (f) { return F(g, f[1], it[f[0]] || '', { i: i, k: f[0], area: f[2], rows: f[3] }); }).join('') + '</article>';
    }).join('');
    return '<div class="ccards">' + (items || '<p class="muted">Nothing here yet.</p>') + '</div><div style="margin-top:12px"><button type="button" class="btn btn-sm btn-ghost" data-add="' + g + '">+ Add ' + esc(noun) + '</button></div>';
  }

  /* ---------- auth: Supabase accounts when connected; a local placeholder otherwise ---------- */
  var DB = function () { return window.MTDB; };
  function signedIn() { return MT.adminOn(); }
  function setMsg(id, msg) { var e = $('#' + id); if (!e) return; e.textContent = msg || ''; e.hidden = !msg; }
  function showLogin(mode) {
    var setup = mode === 'setup';
    $('#aform').hidden = setup; $('#sform').hidden = !setup;
    $('#ltitle').textContent = setup ? 'Create the admin account' : 'Sign in';
    $('#lsub').textContent = setup ? 'First visit. This account becomes the owner of the site.' : 'Miale ya Tumaini admin';
  }
  function grant() { window.__MT_ADMIN = true; try { sessionStorage.setItem('mt-admin', '1'); } catch (x) {} }
  function revoke() { window.__MT_ADMIN = false; try { sessionStorage.removeItem('mt-admin'); } catch (x) {} }
  function afterSignIn() { grant(); location.hash = '#/admin/overview'; enterAdmin(); }
  function checkAccess() {
    return DB().isAdmin().then(function (ok) {
      if (ok) return true;
      return DB().adminExists().then(function (exists) { showLogin(exists ? 'signin' : 'setup'); return false; });
    }).catch(function () { showLogin('signin'); return false; });
  }
  function submitSignIn(e) {
    e.preventDefault(); setMsg('aerr', '');
    if (!DB().on) { afterSignIn(); return; }
    DB().signIn($('#ae').value.trim(), $('#ap').value)
      .then(function () { return DB().isAdmin(); })
      .then(function (ok) {
        if (ok) return afterSignIn();
        return DB().adminExists().then(function (exists) {
          if (exists) throw new Error('This account is not an admin of this site.');
          return DB().claimAdmin().then(function (c) { if (!c) throw new Error('An admin was just created. Sign in with that account.'); afterSignIn(); });
        });
      })
      .catch(function (err) { setMsg('aerr', (err && err.message) || 'Sign-in failed.'); MT.sfx('error'); });
  }
  function submitSetup(e) {
    e.preventDefault(); setMsg('serr', ''); setMsg('sinfo', '');
    var em = $('#se').value.trim(), p1 = $('#sp').value, p2 = $('#sp2').value;
    if (!/^\S+@\S+\.\S+$/.test(em)) { setMsg('serr', 'Enter a valid email address.'); MT.sfx('error'); return; }
    if (p1.length < 8) { setMsg('serr', 'Use at least 8 characters.'); MT.sfx('error'); return; }
    if (p1 !== p2) { setMsg('serr', 'The two passwords do not match.'); MT.sfx('error'); return; }
    DB().signUp(em, p1).then(function (res) {
      if (!res || !res.session) { setMsg('sinfo', 'Check your email for the confirmation link, then come back and sign in here.'); return; }
      return DB().claimAdmin().then(function (c) { if (c) afterSignIn(); else { setMsg('serr', 'An admin already exists. Sign in instead.'); showLogin('signin'); } });
    }).catch(function (err) { setMsg('serr', (err && err.message) || 'Could not create the account.'); MT.sfx('error'); });
  }
  function signOut() {
    revoke();
    if (DB().on) DB().signOut().catch(function () {});
    location.hash = '#/admin';
    MT.toast('Signed out');
  }
  function loadAdminData() {
    if (!DB().on) return Promise.resolve();
    return Promise.all([
      DB().stats().then(function (s) { window.__MT_STATS = s; }).catch(function () {}),
      DB().listComments(true).then(function (rows) {
        window.__MT_ADMIN_COMMENTS = rows.map(function (r) { return { id: r.id, n: r.name || '', m: r.message, ok: !!r.approved, d: Date.parse(r.created_at), sig: r.signature || '' }; });
      }).catch(function () {})
    ]);
  }

  /* command palette: Ctrl+K or Cmd+K */
  var CMD = [];
  function openPalette() {
    if (!MT.adminOn()) return;
    if (!$('#cmdk')) {
      var d = document.createElement('dialog'); d.id = 'cmdk'; d.setAttribute('aria-label', 'Search the admin');
      d.innerHTML = '<div class="dlg cmdk-box"><input class="in" id="cmdkq" placeholder="Go to a page or action" aria-label="Search the admin" autocomplete="off"><ul class="cmdk-list" id="cmdkl" role="listbox"></ul></div>';
      document.body.appendChild(d);
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      $('#cmdkq').addEventListener('input', function () { renderCmd(this.value); });
      $('#cmdkl').addEventListener('click', function (e) { var li = e.target.closest('li[data-go]'); if (li) runCmd(li.dataset.go); });
      d.addEventListener('keydown', function (e) {
        var items = $$('#cmdkl li[data-go]'), i = items.indexOf($('#cmdkl li.on'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var n = Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
          items.forEach(function (x, k) { x.classList.toggle('on', k === n); });
        }
        if (e.key === 'Enter') { e.preventDefault(); var on = $('#cmdkl li.on'); if (on) runCmd(on.dataset.go); }
      });
    }
    CMD = TABS.map(function (t) { return { label: t[1], sub: groupOf(t[0]), go: 'tab:' + t[0] }; }).concat([
      { label: 'Preview the site', sub: 'Action', go: 'preview' }, { label: 'View the website', sub: 'Action', go: 'site' }, { label: 'Sign out', sub: 'Action', go: 'out' }]);
    $('#cmdkq').value = '';
    renderCmd('');
    $('#cmdk').showModal();
    setTimeout(function () { $('#cmdkq').focus(); }, 30);
  }
  function renderCmd(q) {
    q = (q || '').trim().toLowerCase();
    var list = CMD.filter(function (c) { return (c.label + ' ' + c.sub).toLowerCase().indexOf(q) >= 0; });
    $('#cmdkl').innerHTML = list.map(function (c, i) { return '<li role="option" data-go="' + esc(c.go) + '" class="' + (i === 0 ? 'on' : '') + '"><span>' + esc(c.label) + '</span><small>' + esc(c.sub) + '</small></li>'; }).join('') || '<li class="muted">Nothing matches.</li>';
  }
  function runCmd(go) {
    $('#cmdk').close();
    if (go.indexOf('tab:') === 0) location.hash = '#/admin/' + go.slice(4);
    else if (go === 'preview') openPreview('desktop');
    else if (go === 'site') location.hash = '#/';
    else if (go === 'out') signOut();
  }
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && MT.adminOn()) { e.preventDefault(); openPalette(); }
  });

  /* ---------- shell ---------- */
  function build() {
    if (built) return; built = true;
    var A = $('#admin');
    A.innerHTML =
      '<section class="alogin" id="alogin"><a class="ibtn backbtn" href="#/" aria-label="Back to the website">' + I.close + '</a>' +
      '<div class="card lcard"><img src="icons/logo.png" alt="" id="lgimg"><h2 id="ltitle" style="font-size:1.8rem;margin:0">Sign in</h2><p class="muted" id="lsub" style="margin:0">Miale ya Tumaini admin</p>' +
      '<form id="aform" class="form" novalidate><div class="field"><label for="ae">Email</label><input class="in" id="ae" type="email" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false"></div>' +
      '<div class="field"><label for="ap">Password</label><div class="pwbox"><input class="in" id="ap" type="password" autocomplete="current-password" style="padding-right:48px"><button type="button" class="eye" id="eye" aria-label="Show password" aria-pressed="false">' + I.eye + '</button></div></div>' +
      '<p class="err" id="aerr" hidden></p><button class="btn btn-p btn-wide" type="submit">Sign in</button></form>' +
      '<form id="sform" class="form" novalidate hidden><div class="field"><label for="se">Admin email</label><input class="in" id="se" type="email" autocomplete="username" autocapitalize="off"></div>' +
      '<div class="field"><label for="sp">Choose a password (8 or more characters)</label><input class="in" id="sp" type="password" autocomplete="new-password"></div>' +
      '<div class="field"><label for="sp2">Repeat the password</label><input class="in" id="sp2" type="password" autocomplete="new-password"></div>' +
      '<p class="err" id="serr" hidden></p><p class="muted" id="sinfo" style="margin:0;font-size:.9rem" hidden></p><button class="btn btn-p btn-wide" type="submit">Create the admin account</button></form></div></section>' +
      '<div class="shell" id="ashell" hidden>' +
      '<header class="mtop"><button type="button" class="ibtn" id="menuBtn" aria-label="Open menu" aria-controls="side" aria-expanded="false">' + ic(P.menu) + '</button>' +
      '<span class="ttl" id="mttl"></span><a class="ibtn" href="#/" aria-label="View the website" title="View the website">' + ic(P.site) + '</a>' +
      '<button type="button" class="ibtn" id="mout" aria-label="Sign out" title="Sign out">' + ic(P.out) + '</button></header>' +
      '<div class="scrim" id="scrim"></div>' +
      '<aside class="side" id="side" aria-label="Admin navigation">' +
      '<a class="brand" href="#/admin/overview"><img src="icons/logo.png" alt="" id="alogo"><span>Miale ya Tumaini</span></a>' +
      '<a class="tab" href="#/" id="tosite" style="color:var(--blue)">' + ic(P.site) + '<span>Back to the website</span></a>' +
      GROUPS.map(function (g) {
        if (g.items) return '<div class="grp">' + esc(g.g) + '</div>' + g.items.map(function (t) { return tabHtml(t, false); }).join('');
        return '<div class="grp">' + esc(g.g) + '</div>' + g.subs.map(function (s) {
          return '<div class="sub-h">' + esc(s.s) + '</div>' + s.items.map(function (t) { return tabHtml(t, true); }).join('');
        }).join('');
      }).join('') +
      '<span class="sp"></span><div class="sofoot"><button type="button" class="tab signout" id="signout">' + ic(P.out) + '<span>Sign out</span></button></div></aside>' +
      '<main class="amain" id="apanel"></main></div>';
    $('#aform').onsubmit = submitSignIn;
    $('#sform').onsubmit = submitSetup;
    $('#eye').onclick = function () { var p = $('#ap'), s = p.type === 'password'; p.type = s ? 'text' : 'password'; this.innerHTML = s ? I.eyeoff : I.eye; this.setAttribute('aria-pressed', s); };
    $('#signout').onclick = signOut;
    $('#mout').onclick = signOut;
    $('#menuBtn').onclick = function () { setDrawer(!$('#side').classList.contains('open')); };
    $('#scrim').onclick = function () { setDrawer(false); };
    $('#side').addEventListener('click', function (e) { if (e.target.closest('a.tab')) setDrawer(false); });
    var Pn = $('#apanel');
    Pn.addEventListener('input', onInput);
    Pn.addEventListener('change', onChange);
    Pn.addEventListener('click', onClick);
    Pn.addEventListener('submit', function (e) { if (e.target.id === 'uform') { e.preventDefault(); uploadAudio(); } });
    Pn.addEventListener('pointerdown', onPointer);
    Pn.addEventListener('dragover', function (e) { var d = e.target.closest('.drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
    Pn.addEventListener('dragleave', function (e) { var d = e.target.closest('.drop'); if (d) d.classList.remove('over'); });
    Pn.addEventListener('drop', function (e) {
      var d = e.target.closest('.drop'); if (!d) return;
      e.preventDefault(); d.classList.remove('over');
      if (d.dataset.audio) pickAudio(e.dataTransfer.files[0]);
      else upImgs(d.dataset.drop, e.dataTransfer.files);
    });
  }
  function setDrawer(on) {
    $('#side').classList.toggle('open', on); $('#scrim').classList.toggle('on', on);
    $('#menuBtn').setAttribute('aria-expanded', on ? 'true' : 'false');
  }

  function enterAdmin() {
    build();
    var tab = location.hash.split('/')[2] || '';
    var shell = $('#ashell'), login = $('#alogin');
    var openShell = function () {
      if (!TITLES[tab]) { location.hash = '#/admin/overview'; return; }
      login.hidden = true; shell.hidden = false;
      $$('.tab[data-tab]').forEach(function (a) { a.classList.toggle('act', a.dataset.tab === tab); if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      $('#alogo').src = MT.imgUrl(S().slots.logo, 'icons/logo.png');
      setDrawer(false);
      panel(tab);
      loadAdminData().then(function () { if (curTab === tab) panel(tab); });
    };
    var showLoginScreen = function () { login.hidden = false; shell.hidden = true; };
    if (!DB().on) { if (signedIn()) openShell(); else { showLogin('signin'); showLoginScreen(); } return; }
    if (signedIn()) { openShell(); return; }
    checkAccess().then(function (ok) { if (ok) { grant(); openShell(); } else showLoginScreen(); });
  }

  function editingNote() {
    var l = MT.lang() === 'sw' ? 'Kiswahili' : 'English';
    return '<span class="muted" style="font-size:.9rem">Editing in <b>' + l + '</b> · <a href="#/admin/language">change</a></span>';
  }
  function groupOf(tab) {
    var out = '';
    GROUPS.forEach(function (g) {
      if (g.items && g.items.some(function (t) { return t[0] === tab; })) out = g.g;
      if (g.subs) g.subs.forEach(function (s) { if (s.items.some(function (t) { return t[0] === tab; })) out = g.g + ' · ' + s.s; });
    });
    return out;
  }
  function head(tab, sub) {
    return '<div class="ahead"><div><p class="crumb">' + esc(groupOf(tab)) + '</p><h2>' + esc(TITLES[tab]) + '</h2>' + (sub ? '<p class="muted" style="margin:6px 0 0">' + sub + '</p>' : '') + '</div>' +
      '<div class="ahead-r">' + (EDIT_LANG_TABS.indexOf(tab) >= 0 ? editingNote() : '') +
      '<button type="button" class="btn btn-sm btn-ghost" data-preview="desktop">' + ic(P.eye) + ' Preview</button><span class="saved" id="saved" role="status" aria-live="polite"></span></div></div>';
  }
  function split(editor) {
    return '<div class="split"><div class="split-col" style="display:grid;gap:20px;min-width:0">' + editor + '</div>' +
      '<aside class="split-prev" aria-label="Live preview"><div class="pvlabel"><span>Live preview</span><span class="muted" style="text-transform:none;letter-spacing:0;font-weight:600">Updates as you type</span></div><div class="pvstage" id="pvBody"></div></aside></div>';
  }

  /* ---------- panels ---------- */
  function panel(tab) {
    curTab = tab;
    var Pn = $('#apanel'), body = '';
    $('#mttl') && ($('#mttl').textContent = TITLES[tab]);
    $$('.tab[data-tab]').forEach(function (a) { a.classList.toggle('act', a.dataset.tab === tab); });
    var sub = subOf(tab);
    switch (tab) {
      case 'overview': body = overviewHtml(); break;
      case 'inbox': body = inboxHtml(); break;
      case 'content': body = split(contentHtml()); break;
      case 'programmes': body = split(panelBox('Programme cards', listEd('programmes', [['t', 'Name'], ['d', 'Short text', 1], ['more', 'Full text (shown when the card opens)', 1, 4]], 'programme', true), 'Six cards is the layout the site is designed for.')); break;
      case 'impact': body = split(panelBox('Impact figures', listEd('figures', [['n', 'Number (digits only)'], ['s', 'After the number (e.g. +)'], ['l', 'Label']], 'figure'), 'Numbers count up on the site when visitors scroll to them.')); break;
      case 'images': body = imagesHtml(); break;
      case 'audio': body = audioHtml(); break;
      case 'video': body = split(panelBox('Videos', listEd('videos', [['t', 'Title'], ['url', 'Link (YouTube or Vimeo)'], ['d', 'Short description', 1, 2]], 'video', true), 'Paste the normal share link. Only YouTube and Vimeo links are accepted.')); break;
      case 'stories': body = split(storiesHtml()); break;
      case 'brand': body = brandHtml(); break;
      case 'type': body = typeHtml(); break;
      case 'shapes': body = shapesHtml(); break;
      case 'motion': body = motionHtml(); break;
      case 'sounds': body = soundsHtml(); break;
      case 'language': body = languageHtml(); break;
      case 'give': body = split(giveHtml()); break;
      case 'contact': body = contactHtml(); break;
      case 'appearance': body = appearanceHtml(); break;
      case 'data': body = dataHtml(); break;
    }
    Pn.innerHTML = head(tab, sub) + body;
    MT.placeSeg();
    if (tab === 'audio') initWaves();
    if (tab === 'images') { /* focus stage is live */ }
    renderPreview();
    if (tab === 'inbox') markInboxSeenSoon();
    MT.updateBadge && MT.updateBadge();
  }
  function subOf(tab) {
    return { overview: 'What visitors do, counted in this browser for now. Connect a backend to count everyone.', inbox: 'Comments, donation clicks, social taps and early visits, newest first.',
      content: 'Words on the home page. Every text has a default, so you can edit one at a time.', programmes: 'Six cards. Click a card on the site to show its full text.',
      impact: 'Figures that count up when visitors scroll to them.', images: 'Choose where a photo goes, then frame it. Photos of children need consent.',
      audio: 'Upload recordings, listen, trim and cut them. Changes are saved in the recording.', video: 'Embed films from YouTube or Vimeo.', stories: 'Testimonials on the site, and visitor comments to approve.',
      contact: 'Shown in the Visit section and in the footer.', give: 'Donation details. Leave a field empty to hide it.', brand: 'Name, logo colours and palette.',
      type: 'Typefaces and text size for the whole site. The preview uses each typeface as it would look.', shapes: 'How cards, buttons and panels look. Fifteen styles, and glass can be turned off.',
      motion: 'How much things move as visitors scroll. Less is also a valid choice.', sounds: 'Clicks, success, errors and alerts. Each sound can be tested here.',
      language: 'Choose which language you are editing.', appearance: 'How the admin looks on this device.', data: 'Export everything in one file, or reset the site to its original state.' }[tab] || '';
  }

  /* Overview: stats, mini calendar, rankings, a guided tour until it is dismissed */
  function overviewHtml() {
    var log = MT.visits(), ev = MT.events(), cms = MT.comments();
    var now = Date.now(), tk = MT.dayKey(now), cnt = {};
    log.forEach(function (v) { var k = MT.dayKey(v.t); cnt[k] = (cnt[k] || 0) + 1; });
    var week = 0; for (var i = 0; i < 7; i++) week += cnt[MT.dayKey(now - i * 864e5)] || 0;
    var devs = {}; log.forEach(function (v) { devs[v.id] = 1; });
    var mob = log.filter(function (v) { return v.dev === 'm'; }).length;
    var count = function (k) { return ev.filter(function (e) { return e.k === k; }).length; };
    var progs = {}; ev.filter(function (e) { return e.k === 'prog'; }).forEach(function (e) { progs[e.d] = (progs[e.d] || 0) + 1; });
    var top = Object.keys(progs).map(function (k) { return [k, progs[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    var topMax = top.length ? top[0][1] : 1;
    var waiting = cms.filter(function (c) { return !c.ok; }).length;
    var stats = [
      ['Visits', log.length, 'all time', P.overview], ['Today', cnt[tk] || 0, 'visits so far', P.spark],
      ['Last 7 days', week, (week / 7).toFixed(1) + ' a day', P.impact], ['Unique devices', Object.keys(devs).length, 'this browser', P.chat],
      ['Donation clicks', count('donate'), 'started giving', P.give], ['Social taps', count('social'), 'Facebook, Instagram, WhatsApp', P.stories],
      ['Comments waiting', waiting, 'to approve', P.chat], ['On a phone', (log.length ? Math.round(mob / log.length * 100) : 0) + '%', 'of visits', P.contact]
    ];
    var statsHtml = '<div class="stats">' + stats.map(function (s) {
      return '<div class="card lift stat"><i>' + ic(s[3]) + '</i><b class="count">' + esc(s[1]) + '</b><span>' + esc(s[0]) + '</span><small>' + esc(s[2]) + '</small></div>';
    }).join('') + '</div>';
    var bars = '', days = [];
    for (var j = 13; j >= 0; j--) days.push(now - j * 864e5);
    var dmax = Math.max.apply(null, days.map(function (d) { return cnt[MT.dayKey(d)] || 0; }).concat([1]));
    bars = days.map(function (d) {
      var v = cnt[MT.dayKey(d)] || 0, isT = MT.dayKey(d) === tk;
      return '<i class="' + (isT ? 'today' : (v ? '' : 'empty')) + '" style="--h:' + Math.max(v ? 10 : 4, v / dmax * 100) + '" title="' + esc(new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })) + ': ' + v + '"></i>';
    }).join('');
    var mini = '<section class="card mini-cal"><div class="section-h" style="margin:0"><div><h3>Visits, last 14 days</h3><p>Today is orange. Open the full calendar for every day.</p></div>' +
      '<button type="button" class="btn btn-sm btn-ghost" data-cal="1">Open full calendar</button></div>' +
      '<div class="mini-bars" role="img" aria-label="Visits per day for the last 14 days">' + bars + '</div>' +
      '<div class="mini-lbl"><span>' + esc(new Date(days[0]).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })) + '</span><span>Today</span></div></section>';
    var ranking = '<section class="card"><h3 style="margin-bottom:14px">Programmes people open</h3><div class="rank">' +
      (top.length ? top.map(function (r) {
        return '<div class="rank-row"><span>' + esc(r[0]) + '</span><small>' + r[1] + (r[1] === 1 ? ' open' : ' opens') + '</small><div class="rank-track"><i style="--s:' + Math.round(r[1] / topMax * 100) + '"></i></div></div>';
      }).join('') : '<p class="muted" style="margin:0">Nothing yet. Opens appear here once visitors click a programme card.</p>') + '</div></section>';
    var tour = MT.jget('mt-tour-done', false) ? '' : tourHtml();
    return tour + statsHtml + '<div class="ovgrid">' + mini + ranking + '</div>';
  }

  /* guided tour: four short steps, shown until it is finished or skipped */
  var TOUR = [
    ['Your numbers live here', 'Statistics counts visits, donation clicks and comments in this browser. Connect the backend and the counts cover every visitor.'],
    ['Preview before you publish', 'Every editor has a live preview beside it, so you see the change as it will look. The Preview button shows the whole site on a desktop or a phone.'],
    ['Changes save as you type', 'Each field saves on its own. The Saved label confirms it. Errors are shown in place, with a short sound and a vibration on phones.'],
    ['Tune the feel of the site', 'Shapes & glass, Typography, Motion and Sounds & haptics change how the site feels. Each one previews its effect right there.']
  ];
  function tourHtml() {
    var t = TOUR[tourStep];
    return '<section class="tour" aria-label="Guided tour"><div class="dots">' + TOUR.map(function (x, i) { return '<i class="' + (i === tourStep ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      '<h3>' + esc(t[0]) + '</h3><p>' + esc(t[1]) + '</p><div class="tr">' +
      (tourStep < TOUR.length - 1 ? '<button type="button" class="btn btn-sm btn-p" data-tour="next">Next</button>' : '<button type="button" class="btn btn-sm btn-p" data-tour="done">Finish</button>') +
      '<button type="button" class="btn btn-sm btn-ghost" data-tour="skip">Skip the tour</button><span class="muted" style="color:inherit;opacity:.8;font-size:.86rem">Step ' + (tourStep + 1) + ' of ' + TOUR.length + '</span></div></section>';
  }

  /* full calendar, in a dialog. Tap or hover a day to see its visit times. */
  function calDialog() {
    var d = $('#calDlg');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'calDlg'; d.setAttribute('aria-label', 'Visits calendar');
      d.innerHTML = '<div class="dlg" style="width:min(640px,calc(100vw - 32px))"><button class="ibtn x" aria-label="Close" id="calX">' + I.close + '</button><h2 style="font-size:1.6rem;margin-bottom:4px">Visits calendar</h2><p class="muted" style="margin:0 0 16px">Five weeks, Monday first. Tap a day for its times.</p><div id="calBody"></div><div class="day-list" id="calList" aria-live="polite"></div></div>';
      document.body.appendChild(d);
      $('#calX').onclick = function () { d.close(); };
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    }
    var log = MT.visits(), now = new Date(), today = new Date(); today.setHours(0, 0, 0, 0);
    var cnt = {}, times = {};
    log.forEach(function (v) { var k = MT.dayKey(v.t); cnt[k] = (cnt[k] || 0) + 1; (times[k] = times[k] || []).push(v.t); });
    var max = 1; Object.keys(cnt).forEach(function (k) { if (cnt[k] > max) max = cnt[k]; });
    var dow = (today.getDay() + 6) % 7, start = new Date(today.getTime() - (dow + 28) * 864e5);
    var cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (x) { return '<div class="dow">' + x + '</div>'; }).join('');
    for (var i = 0; i < 35; i++) {
      var dt = new Date(start.getTime() + i * 864e5), k = MT.dayKey(dt), v = cnt[k] || 0, fut = dt > today, isT = k === MT.dayKey(today);
      var lvl = v === 0 ? '' : 'lvl' + Math.min(3, Math.ceil(v / max * 3));
      cells += '<button type="button" class="day ' + lvl + (isT ? ' today' : '') + (fut ? ' future' : '') + '" data-dayk="' + k + '"' + (fut ? ' disabled' : '') + ' aria-label="' + esc(dt.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })) + ': ' + v + ' visits"' + ' style="text-align:left;cursor:pointer;color:inherit;font:inherit">' +
        '<span class="dn">' + dt.getDate() + '</span><span class="dv">' + (fut ? '' : v) + '</span></button>';
    }
    $('#calBody').innerHTML = '<div class="cal">' + cells + '</div><div class="legend">Fewer <i style="background:var(--bg)"></i><i style="background:color-mix(in srgb,var(--blue) 12%,var(--bg))"></i><i style="background:color-mix(in srgb,var(--blue) 22%,var(--bg))"></i><i style="background:color-mix(in srgb,var(--blue) 32%,var(--bg))"></i> More</div>';
    $$('#calBody [data-dayk]').forEach(function (b) {
      var show = function () {
        var k = b.dataset.dayk, list = (times[k] || []).sort(function (a, c) { return a - c; });
        $('#calList').innerHTML = '<b>' + esc(new Date(list[0] || Date.now()).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'short' })) + '</b> · ' +
          (list.length ? list.map(function (t) { return esc(new Date(t).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })); }).join(', ') : 'no visits');
      };
      b.onmouseenter = show; b.onfocus = show; b.onclick = show;
    });
    d.showModal();
  }

  /* inbox: comments, donation clicks, social taps, early visits. Newest first. */
  var KIND = {
    comment: ['New comment', 'Waiting for approval. Open Stories & comments to approve it.', P.chat],
    donate: ['Donation link opened', 'A visitor started to give.', P.give],
    social: ['Social link tapped', null, P.stories],
    early: ['Early visit', 'First visit of the day, before 9am.', P.overview],
    call: ['Phone number tapped', null, P.contact],
    play: ['Recording played', null, P.audio],
    prog: ['Programme opened', null, P.programmes]
  };
  function inboxHtml() {
    var seenAt = MT.jget('mt-inbox-seen', 0);
    var all = MT.events().slice().reverse();
    var kinds = { all: 'All', comment: 'Comments', donate: 'Giving', social: 'Social', early: 'Early visits' };
    var list = all.filter(function (e) {
      if (curInbox === 'all') return ['comment', 'donate', 'social', 'early'].indexOf(e.k) >= 0;
      return e.k === curInbox;
    }).slice(0, 150);
    var rows = list.map(function (e) {
      var k = KIND[e.k] || [e.k, '', P.overview], isNew = e.t > seenAt;
      var sub = k[1] === null ? e.d : (e.k === 'donate' && e.d ? 'Via ' + e.d : k[1]);
      return '<article class="note-row' + (isNew ? ' new' : '') + '"><span class="nb">' + ic(k[2]) + '</span><div><b>' + esc(k[0]) + (e.d && k[1] === null ? '' : '') + '</b><small>' + esc(sub || '') + '</small></div>' +
        '<time datetime="' + new Date(e.t).toISOString() + '">' + esc(new Date(e.t).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })) + '</time></article>';
    }).join('');
    return '<div class="section-h" style="margin-top:0"><div class="chips" role="group" aria-label="Filter">' +
      Object.keys(kinds).map(function (k) { return '<button type="button" data-ifilter="' + k + '" aria-pressed="' + (curInbox === k) + '">' + kinds[k] + '</button>'; }).join('') +
      '</div><button type="button" class="btn btn-sm btn-ghost" data-markread="1">Mark all as read</button></div>' +
      (rows ? '<div class="inbox">' + rows + '</div>' : '<section class="card"><h3>Nothing new</h3><p class="muted" style="margin:0">When someone comments, starts a donation or taps a social link, it appears here. A banner also drops from the top of the screen when it needs your attention.</p></section>');
  }
  function markInboxSeenSoon() { /* the list is marked read only when the button is pressed, so nothing is lost by opening it */ }

  /* ---------- content and programmes ---------- */
  function contentHtml() {
    var H = get('hero'), M = get('mission'), sc = get('sec'), keys = Object.keys(MT.SECS.en);
    var labels = { nav_work: 'Menu: our work', nav_impact: 'Menu: impact', nav_give: 'Menu: give', nav_gallery: 'Menu: gallery', nav_voices: 'Menu: voices', nav_videos: 'Menu: videos', nav_how: 'Menu: how we work', nav_visit: 'Menu: visit', pil_t: 'What we do title', prog_t: 'Programmes title', prog_i: 'Programmes intro', imp_t: 'Impact title', imp_i: 'Impact intro', give_t: 'Donate title', give_i: 'Donate intro', give_btn: 'Donate button', give_call: 'Give by phone title', gal_t: 'Gallery title', gal_i: 'Gallery intro', voi_t: 'Voices title', voi_i: 'Voices intro', vid_t: 'Videos title', vid_i: 'Videos intro', tes_t: 'Kind words title', how_t: 'How we work title', vis_t: 'Visit title', con_t: 'Comment panel title', con_i: 'Comment panel text', c_name: 'Comment: name label', c_msg: 'Comment: message label', c_consent: 'Comment: consent text', c_sig: 'Comment: signature label', c_sig_clear: 'Comment: clear signature', c_send: 'Comment: button', c_e1: 'Comment: empty message error', c_e2: 'Comment: consent error', c_e3: 'Comment: signature error', c_ok: 'Comment: thank-you message', ph: 'Phone label', em: 'Email label', find: 'Places title', more: 'Programme card link', powered: 'Footer: powered by', quick: 'Footer: explore', reach: 'Footer: reach us', follow: 'Footer: follow us', all: 'Gallery: all filter', mg_see: 'Menu: open programme link', mg_take: 'Menu: take part heading', mg_explore: 'Menu: explore heading', mg_prog: 'Menu: programmes heading', mg_comment: 'Menu: leave a comment link' };
    return panelBox('Hero', F('hero', 'Headline', H.h1, { k: 'h1', area: 1, rows: 2 }) + F('hero', 'Short line under the headline', H.lead, { k: 'lead' }) + '<div class="row2">' + F('hero', 'Main button', H.cta1, { k: 'cta1' }) + F('hero', 'Second button', H.cta2, { k: 'cta2' }) + '</div>') +
      panelBox('Organisation', '<div class="row2">' + F('brand', 'Name', get('brand').name, { k: 'name' }) + F('brand', 'Tagline (shown under the logo)', get('brand').tag, { k: 'tag' }) + '</div>') +
      panelBox('Mission', F('mission', 'Mission statement', M.text, { k: 'text', area: 1, rows: 4 })) +
      panelBox('What we do', listEd('pillars', [['t', 'Title'], ['d', 'Short line']], 'pillar'), 'The four pillars sit under the hero.') +
      panelBox('How we work', listEd('how', [['t', 'Title'], ['d', 'Text', 1]], 'item')) +
      panelBox('Footer', F('foot', 'Short line under the name', get('foot').blurb, { k: 'blurb' }) + F('foot', 'Copyright line', get('foot').copy, { k: 'copy' })) +
      '<details class="panel"><summary style="font:700 1.05rem var(--fd);cursor:pointer">Section titles and labels</summary><p class="muted" style="margin:8px 0 14px">Advanced. Change only if a heading needs different words.</p><div class="row2">' +
      keys.map(function (k) { return F('sec', labels[k] || k, sc[k] !== undefined ? sc[k] : MT.SECS[MT.lang()][k], { k: k }); }).join('') + '</div></details>';
  }

  /* ---------- stories and comments ---------- */
  function storiesHtml() {
    var cl = MT.comments();
    var cards = cl.map(function (c) {
      return '<article class="item' + (curComment === c.id ? ' sel' : '') + '"><div class="item-h"><div><b>' + esc(c.n || 'No name') + '</b> <span class="meta">' + new Date(c.d).toLocaleString('en-KE') + '</span></div><span class="tag ' + (c.ok ? 'on' : 'warn') + '">' + (c.ok ? 'On the site' : 'Waiting') + '</span></div>' +
        '<p style="margin:0">' + esc(c.m) + '</p>' +
        (c.sig ? '<div><p class="meta" style="margin:0 0 6px;font-size:.8rem">Signature (admin only, never shown publicly)</p><img src="' + esc(c.sig) + '" alt="Signature" style="height:60px;background:var(--bg);border:1px solid var(--line);border-radius:12px"></div>' : '') +
        '<div class="item-a"><button type="button" class="btn btn-sm btn-ghost" data-cpick="' + c.id + '">' + ic(P.eye) + ' Preview</button><button class="btn btn-sm btn-ghost" data-cm="' + (c.ok ? 'hide' : 'ok') + '" data-id="' + c.id + '">' + (c.ok ? 'Hide from site' : 'Approve and show') + '</button><button class="btn btn-sm btn-danger" data-cm="del" data-id="' + c.id + '">Delete</button></div></article>';
    }).join('');
    return panelBox('Testimonials (shown on the site)', listEd('testimonials', [['name', 'Name'], ['role', 'Role or place'], ['text', 'What they said', 1, 4]], 'testimonial', true)) +
      '<div class="section-h" style="margin-top:8px"><div><h3>Visitor comments (' + cl.length + ')</h3><p>Only comments approved here appear on the site. A signature is kept for your records.</p></div></div>' +
      (cards ? '<div class="ccards two">' + cards + '</div>' : '<p class="muted">No comments yet. They appear here as visitors send them.</p>');
  }

  /* ---------- images: slots, framing, consent, library ---------- */
  function imagesHtml() {
    var slots = S().slots, cats = S().cats || {}, all = MT.MEDIA().filter(function (m) { return m.kind === 'img'; });
    function thumb(id, emptyTxt) { var u = id && MT.imgUrl(id, ''); return '<div class="thumb">' + (u ? '<img src="' + u + '" alt="">' : '<div class="empty-t">' + esc(emptyTxt) + '</div>') + '</div>'; }
    var single = [
      ['hero', 'Home page photo', 'Beside the headline. Portrait works best.', slots.hero],
      ['logo', 'Logo', 'Square, transparent PNG works best.', slots.logo],
      ['donate', 'Donation banner', 'Wide photo at the top of the donation card.', slots.donate]
    ];
    var slotHtml = single.map(function (s) {
      return '<div class="slot card"><div class="sh"><h3>' + esc(s[1]) + '</h3><span class="tag ' + (s[3] ? 'on' : '') + '">' + (s[3] ? 'Set' : 'Default') + '</span></div>' + thumb(s[3], 'Using the default') +
        '<p>' + esc(s[2]) + '</p><label class="drop" data-drop="slot:' + s[0] + '" for="up-' + s[0] + '"><p>' + (s[3] ? 'Replace' : 'Choose or drop an image') + '</p></label><input type="file" id="up-' + s[0] + '" data-up="slot:' + s[0] + '" accept="image/*" hidden>' +
        (s[3] ? '<button type="button" class="btn btn-sm btn-ghost" data-clear="' + s[0] + '" style="justify-self:start">Use default</button>' : '') + '</div>';
    }).join('');
    var catDesc = { kids: 'Portraits of children. Needs written consent.', visitors: 'Visitors with children. Needs written consent.', moments: 'Moments with the children. Needs written consent.', stories: 'Photos that go with a story. Needs written consent.', programmes: 'Photos of programme sessions. Check faces for consent.' };
    var catHtml = MT.CATS.map(function (c) {
      var n = (cats[c[0]] || []).length;
      return '<div class="slot card"><div class="sh"><h3>' + esc(c[1]) + '</h3><span class="tag ' + (n ? 'on' : '') + '">' + n + (n === 1 ? ' photo' : ' photos') + '</span></div>' +
        '<p>' + esc(catDesc[c[0]]) + '</p><label class="drop" data-drop="cat:' + c[0] + '" for="up-' + c[0] + '"><p>Add photos</p><span>Choose several or drop them here</span></label><input type="file" id="up-' + c[0] + '" data-up="cat:' + c[0] + '" accept="image/*" multiple hidden></div>';
    }).join('');
    var lib = '<div class="chips" role="group" aria-label="Filter"><button type="button" data-filter="all" aria-pressed="' + (curFilter === 'all') + '">All (' + all.length + ')</button>' +
      MT.CATS.map(function (c) { return '<button type="button" data-filter="' + c[0] + '" aria-pressed="' + (curFilter === c[0]) + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>';
    var shown = all.filter(function (m) { return curFilter === 'all' || m.cat === curFilter; });
    var tiles = shown.length ? '<div class="tiles" style="margin-top:14px">' + shown.map(function (m) {
      var needs = MT.CONSENT_CATS.indexOf(m.cat) >= 0, hidden = needs && !m.consent;
      return '<div class="tile"><img src="' + MT.urlOf(m) + '" alt="">' + '<button type="button" class="rm" data-delimg="' + m.id + '" aria-label="Remove image">' + ic(P.x) + '</button>' +
        '<div class="cap"><small>' + esc(m.cat ? MT.labelOf(m.cat) : 'Unfiled') + '</small>' + (hidden ? '<span class="tag warn">Hidden: no consent</span>' : '') +
        (needs ? '<label class="tog" style="font-size:.8rem"><input type="checkbox" data-consent="' + m.id + '"' + (m.consent ? ' checked' : '') + '><span>Consent</span></label>' : '') + '</div>' +
        '<div style="padding:0 12px 12px"><select class="in" data-movecat="' + m.id + '" aria-label="Category" style="padding:8px 10px;font-size:.85rem">' + MT.CATS.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === m.cat ? ' selected' : '') + '>' + esc(c[1]) + '</option>'; }).join('') + '</select></div></div>';
    }).join('') + '</div>' : '<p class="muted" style="margin:14px 0 0">No photos here yet. Drop some into a group above.</p>';
    return focusHtml() +
      '<div class="section-h" style="margin-top:34px"><div><h3>Image slots</h3><p>One photo for each place on the site.</p></div></div><div class="slots">' + slotHtml + '</div>' +
      '<div class="section-h" style="margin-top:34px"><div><h3>Photo catalogue</h3><p>Photos of children show on the site only after <b>Consent</b> is ticked.</p></div></div><div class="slots">' + catHtml + '</div>' +
      '<div class="section-h" style="margin-top:34px"><div><h3>Library</h3><p>Every photo, grouped by where it is used.</p></div></div>' + lib + tiles;
  }
  function focusHtml() {
    var key = curSlot, id = S().slots[key], u = id ? MT.imgUrl(id, '') : '', f = (S().focus || {})[key] || { x: 50, y: 50, z: 1 };
    var ratio = key === 'hero' ? '4 / 5' : '16 / 9';
    var chips = [['hero', 'Home page photo'], ['donate', 'Donation banner']].map(function (c) {
      return '<button type="button" data-slotpick="' + c[0] + '" aria-pressed="' + (curSlot === c[0]) + '">' + esc(c[1]) + '</button>';
    }).join('');
    return '<section class="panel"><div class="section-h" style="margin:0"><div><h3>Frame the photo</h3><p>Drag on the photo to choose what stays in view. Zoom in to crop tighter. This is exactly what visitors see.</p></div><div class="chips" role="group" aria-label="Photo">' + chips + '</div></div>' +
      '<div class="row2" style="align-items:start;grid-template-columns:minmax(0,' + (key === 'hero' ? '340px' : '1fr') + ') minmax(0,1fr)">' +
      '<div class="focus-stage" id="fstage" data-key="' + key + '" style="aspect-ratio:' + ratio + ';--fx:' + f.x + '%;--fy:' + f.y + '%;--fz:' + f.z + '">' +
      (u ? '<img src="' + u + '" alt="">' : '<div style="position:absolute;inset:0;display:grid;place-items:center;color:var(--muted);text-align:center;padding:16px">No photo yet. Add one in Image slots below.</div>') +
      '<span class="dot"></span><span class="frame-line"></span></div>' +
      '<div style="display:grid;gap:12px"><div class="zoomrow"><span>Zoom</span><input type="range" min="1" max="1.8" step="0.02" value="' + f.z + '" data-zoom="' + key + '" aria-label="Zoom"><output>' + Math.round(f.z * 100) + '%</output></div>' +
      '<p class="muted" style="margin:0">Centre point: ' + Math.round(f.x) + '% across, ' + Math.round(f.y) + '% down.</p>' +
      '<div class="aud-tools"><button type="button" class="btn btn-sm btn-ghost" data-focus-reset="' + key + '">Reset framing</button></div></div></div></section>';
  }

  /* ---------- audio: upload, waveform, trim, cut ---------- */
  function audioHtml() {
    var al = MT.MEDIA().filter(function (m) { return m.kind === 'audio'; }).sort(function (a, b) { return b.date - a.date; });
    var plays = al.reduce(function (s, x) { return s + (x.plays || 0); }, 0);
    var listen = al.reduce(function (s, x) { return s + (x.dur || 0) * (x.plays || 0); }, 0);
    var up = '<form class="panel" id="uform"><h3>Upload a recording</h3><label class="drop" data-audio="1" for="file"><p id="dname">Choose or drop an audio file</p><span>MP3, WAV, M4A or OGG</span></label><input type="file" id="file" accept="audio/*" hidden data-audio-input="1">' +
      '<div class="row2"><div class="field"><label for="ut">Title</label><input class="in" id="ut" maxlength="80"></div><div class="field"><label for="us">Speaker</label><input class="in" id="us" maxlength="60"></div></div>' +
      '<div class="row2"><div class="field"><label for="ul">Language</label><input class="in" id="ul" maxlength="30"></div></div>' +
      '<div class="field"><label for="ud">About this recording</label><textarea id="ud" rows="3" maxlength="400"></textarea></div><p class="err" id="ue" hidden></p><button class="btn btn-p btn-sm" type="submit" style="justify-self:start">Upload recording</button></form>';
    var list = al.map(function (x) {
      var t = TRIM[x.id] || { s: 0, e: x.dur || 0 };
      return '<article class="item" data-audio-item="' + x.id + '"><div class="item-h"><span class="idx">' + esc(x.title) + '</span><span class="meta">' + MT.fmt(x.dur) + ((x.orig || x.origPath) ? ' · cut' : '') + '</span></div>' +
        '<div class="wave" data-wave="' + x.id + '" aria-label="Waveform: click to move the play position"><canvas></canvas><span class="sel" style="left:' + (x.dur ? t.s / x.dur * 100 : 0) + '%;width:' + (x.dur ? (t.e - t.s) / x.dur * 100 : 100) + '%"></span><span class="head" style="left:0%"></span></div>' +
        '<div class="trimrow"><div class="field"><label for="ts' + x.id + '">Start: <output id="tso' + x.id + '">' + MT.fmt(t.s) + '</output></label><input type="range" id="ts' + x.id + '" min="0" max="' + (x.dur || 0) + '" step="0.1" value="' + t.s + '" data-trim="' + x.id + '|s"></div>' +
        '<div class="field"><label for="te' + x.id + '">End: <output id="teo' + x.id + '">' + MT.fmt(t.e) + '</output></label><input type="range" id="te' + x.id + '" min="0" max="' + (x.dur || 0) + '" step="0.1" value="' + t.e + '" data-trim="' + x.id + '|e"></div></div>' +
        '<div class="aud-tools"><button type="button" class="btn btn-sm btn-ghost" data-playsel="' + x.id + '">' + ic(P.play) + ' Play selection</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-cutau="' + x.id + '">' + ic(P.scissors) + ' Cut to selection</button>' +
        ((x.orig || x.origPath) ? '<button type="button" class="btn btn-sm btn-ghost" data-restau="' + x.id + '">' + ic(P.undo) + ' Restore original</button>' : '') +
        '<span class="time-lbl">Keeps <b>' + MT.fmt(t.e - t.s) + '</b></span></div>' +
        '<div class="mini-stats"><span>Plays <b>' + (x.plays || 0) + '</b></span><span>Listening <b>' + MT.fmt((x.dur || 0) * (x.plays || 0)) + '</b></span><span>Date <b>' + new Date(x.date).toLocaleDateString('en-KE') + '</b></span></div>' +
        '<div class="row2"><div class="field"><label>Title</label><input class="in" data-au="' + x.id + '" data-f="title" value="' + esc(x.title) + '"></div><div class="field"><label>Speaker</label><input class="in" data-au="' + x.id + '" data-f="speaker" value="' + esc(x.speaker || '') + '"></div></div>' +
        '<div class="field"><label>About</label><textarea rows="2" data-au="' + x.id + '" data-f="desc">' + esc(x.desc || '') + '</textarea></div>' +
        '<div><button type="button" class="btn btn-sm btn-danger" data-delau="' + x.id + '">Delete recording</button></div></article>';
    }).join('');
    return '<div class="ovgrid" style="margin-top:0">' + up + '<section class="card" style="align-content:start"><h3>Listening</h3><div class="mini-stats" style="flex-direction:column;gap:12px;font-size:1rem">' +
      '<span>Recordings <b>' + al.length + '</b></span><span>Plays <b>' + plays + '</b></span><span>Total listening time <b>' + MT.fmt(listen) + '</b></span></div><p class="muted" style="margin:14px 0 0;font-size:.88rem">Counted in this browser. The backend will count every listener.</p></section></div>' +
      '<div class="section-h" style="margin-top:28px"><div><h3>Recordings (' + al.length + ')</h3><p>Trim with the sliders, then cut. The original is kept until you restore it.</p></div></div>' +
      (list ? '<div class="ccards two">' + list + '</div>' : '<p class="muted">No recordings yet.</p>');
  }
  var DEC = {};
  function decodeItem(x) {
    if (DEC[x.id]) return Promise.resolve(DEC[x.id]);
    var C = window.AudioContext || window.webkitAudioContext; if (!C || (!x.blob && !x.url)) return Promise.resolve(null);
    var c = new C();
    return (x.blob ? x.blob.arrayBuffer() : fetch(x.url).then(function (r) { return r.arrayBuffer(); })).then(function (b) { return c.decodeAudioData(b); }).then(function (buf) {
      var ch = buf.getChannelData(0), N = 260, step = Math.max(1, Math.floor(ch.length / N)), peaks = [];
      for (var i = 0; i < N; i++) { var mx = 0; for (var j = 0; j < step; j++) { var v = Math.abs(ch[i * step + j] || 0); if (v > mx) mx = v; } peaks.push(mx); }
      DEC[x.id] = { peaks: peaks, buf: buf };
      c.close && c.close();
      return DEC[x.id];
    }).catch(function () { c.close && c.close(); return null; });
  }
  function drawWave(x) {
    var box = $('[data-wave="' + x.id + '"]'); if (!box) return;
    var cv = $('canvas', box), d = DEC[x.id]; if (!cv || !d) return;
    var r = box.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    cv.width = Math.max(10, r.width * dpr); cv.height = Math.max(10, r.height * dpr);
    var g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    var col = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#0B4FC4';
    g.fillStyle = col; g.globalAlpha = .75;
    var bw = cv.width / d.peaks.length, mid = cv.height / 2;
    d.peaks.forEach(function (p, i) { var h = Math.max(2, p * cv.height * .92); g.fillRect(i * bw + bw * .2, mid - h / 2, Math.max(1, bw * .6), h); });
  }
  function initWaves() {
    MT.MEDIA().filter(function (m) { return m.kind === 'audio'; }).forEach(function (x) {
      if (!TRIM[x.id]) TRIM[x.id] = { s: 0, e: x.dur || 0 };
      decodeItem(x).then(function (d) {
        if (!d) return;
        if (!x.dur) { x.dur = d.buf.duration; TRIM[x.id].e = d.buf.duration; }
        drawWave(x);
      });
    });
  }
  function wavFrom(buf, s0, s1) {
    var sr = buf.sampleRate, nch = buf.numberOfChannels, n = Math.max(0, Math.floor((s1 - s0) * sr));
    var len = n * nch * 2 + 44, ab = new ArrayBuffer(len), v = new DataView(ab);
    var w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, len - 8, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, nch, true); v.setUint32(24, sr, true); v.setUint32(28, sr * nch * 2, true);
    v.setUint16(32, nch * 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * nch * 2, true);
    var chans = []; for (var c = 0; c < nch; c++) chans.push(buf.getChannelData(c));
    var o = 44, start = Math.floor(s0 * sr);
    for (var i2 = 0; i2 < n; i2++) for (var k = 0; k < nch; k++) {
      var x = Math.max(-1, Math.min(1, chans[k][start + i2] || 0));
      v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2;
    }
    return new Blob([ab], { type: 'audio/wav' });
  }
  function cutAudio(id) {
    var x = MT.byId(id), t = TRIM[id]; if (!x || !t) return;
    decodeItem(x).then(function (d) {
      if (!d) { MT.toast('This file could not be read to cut it.', 'err'); return; }
      if (t.e - t.s < .2) { MT.toast('Choose a longer part to keep.', 'err'); return; }
      var wav = wavFrom(d.buf, t.s, Math.min(t.e, d.buf.duration));
      if (MTDB.on) { x.origPath = x.origPath || x.path; } else if (!x.orig) { x.orig = x.blob; }
      x.blob = wav; x.dur = t.e - t.s; x.mime = 'audio/wav';
      delete DEC[id]; delete AUD[id];
      TRIM[id] = { s: 0, e: x.dur };
      MT.mPut(x).then(MT.loadMedia).then(function () { MT.toast('Recording cut and saved', 'ok'); panel('audio'); });
    });
  }
  function restoreAudio(id) {
    var x = MT.byId(id); if (!x) return;
    if (MTDB.on) {
      if (!x.origPath) return;
      MTDB.updateMedia(id, { path: x.origPath, orig_path: null, mime: null }).then(MT.loadMedia).then(function () {
        delete DEC[id]; delete AUD[id]; TRIM[id] = { s: 0, e: 0 };
        MT.toast('Original restored', 'ok'); panel('audio');
      }).catch(function () { MT.toast('Could not restore. Check the connection.', 'err'); });
      return;
    }
    if (!x.orig) return;
    x.blob = x.orig; delete x.orig; delete DEC[id]; delete AUD[id];
    TRIM[id] = { s: 0, e: 0 };
    MT.mPut(x).then(MT.loadMedia).then(function () { MT.toast('Original restored'); panel('audio'); });
  }
  function playSel(id) {
    var x = MT.byId(id), t = TRIM[id]; if (!x) return;
    var a = AUD[id];
    if (!a) { a = new Audio(MT.urlOf(x)); AUD[id] = a; a.ontimeupdate = function () { if (a.currentTime >= (TRIM[id].e || a.duration)) { a.pause(); } }; }
    if (!a.paused) { a.pause(); return; }
    a.currentTime = t.s; a.play().catch(function () {});
  }
  function uploadAudio() {
    var er = $('#ue');
    if (!UPL) { er.textContent = 'Choose an audio file first.'; er.hidden = false; MT.sfx('error'); return; }
    if (!$('#ut').value.trim()) { er.textContent = 'Add a title.'; er.hidden = false; MT.sfx('error'); return; }
    er.hidden = true;
    var pr = new Audio(), u = URL.createObjectURL(UPL);
    function save(d) {
      URL.revokeObjectURL(u);
      MT.mPut({ id: MT.uid(), kind: 'audio', title: $('#ut').value.trim(), speaker: $('#us').value.trim(), lang: $('#ul').value.trim(), desc: $('#ud').value.trim(), date: Date.now(), dur: d, plays: 0, consent: true, blob: UPL })
        .then(MT.loadMedia).then(function () { UPL = null; MT.toast('Recording uploaded', 'ok'); panel('audio'); });
    }
    pr.preload = 'metadata';
    pr.onloadedmetadata = function () { save(isFinite(pr.duration) ? pr.duration : 0); };
    pr.onerror = function () { save(0); };
    pr.src = u;
  }
  function pickAudio(f) {
    if (!f) return;
    UPL = f; $('#dname').textContent = f.name;
    var t = $('#ut'); if (t && !t.value) t.value = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  }

  /* ---------- brand, typography, shapes, motion, sounds ---------- */
  function brandHtml() {
    var c = S().col || {};
    var swatches = MT.PALETTES.map(function (p, i) {
      return '<button type="button" class="palette-card" data-palette="' + i + '" aria-label="Use ' + esc(p.n) + '" title="' + esc(p.n) + '">' +
        '<span><i style="background:' + p.bg + '"></i><i style="background:' + p.blue + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.brown + '"></i></span><span>' + esc(p.n) + '</span></button>';
    }).join('');
    var pal = { bg: c.bg || MT.PALETTES[0].bg, blue: c.blue || MT.PALETTES[0].blue, accent: c.accent || MT.PALETTES[0].accent };
    var live = '<div class="palette-live" style="background:' + pal.bg + ';color:#1C2433"><b style="font:800 1.4rem var(--fd)">' + esc(get('brand').name) + '</b><div class="pl-band" style="background:' + pal.blue + ';color:' + MT.esc(inkOf(pal.blue)) + '">Impact band, numbers and headings sit here.</div><div class="pl-btns"><span class="btn btn-sm" style="background:' + pal.accent + ';color:' + inkOf(pal.accent) + ';min-height:40px">Give now</span><span class="btn btn-sm" style="border:2px solid ' + pal.blue + ';color:' + pal.blue + ';min-height:40px;background:transparent">See programmes</span></div></div>';
    return panelBox('Name', '<div class="row2">' + F('brand', 'Organisation name', get('brand').name, { k: 'name' }) + F('brand', 'Tagline', get('brand').tag, { k: 'tag' }) + '</div>') +
      panelBox('Palette', '<p class="muted">Pick a set, then fine-tune. The site stays solid: no gradients, and the blue is always flat.</p><div class="swatches" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' + swatches + '</div>' +
        '<div class="swatches" style="margin-top:6px">' + colourRow('bg', 'Background (cream)', c.bg || MT.PALETTES[0].bg) + colourRow('blue', 'Main blue', c.blue || MT.PALETTES[0].blue) + colourRow('accent', 'Accent (buttons)', c.accent || MT.PALETTES[0].accent) + colourRow('brown', 'Warm brown (labels)', c.brown || MT.PALETTES[0].brown) + '</div>' +
        live + '<div><button type="button" class="btn btn-sm btn-ghost" id="rescol">Back to the default palette</button></div>');
  }
  function inkOf(hex) { return MT.phone && false ? '#000' : (function () { var c = hex.replace('#', ''); var n = parseInt(c, 16); var l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; return l > .6 ? '#1C2433' : '#FFFFFF'; })(); }
  function colourRow(k, label, v) {
    return '<label class="swatch"><input type="color" data-col="' + k + '" value="' + v + '" aria-label="' + esc(label) + '"><span><b>' + esc(label) + '</b><small>' + v.toUpperCase() + '</small></span></label>';
  }

  function typeHtml() {
    var L = MT.look(), cur = L.font;
    var picks = MT.FONTS.map(function (f) {
      var st = '--pfd:' + esc(f.fd) + ';--pfb:' + esc(f.fb) + ';--pfw:' + f.fwh;
      return '<button type="button" class="pick" data-font="' + f.id + '" aria-pressed="' + (cur === f.id) + '"><span class="pk-prev type-prev" style="' + st + ';display:grid;gap:6px;align-content:center;text-align:left"><b>Miale ya Tumaini</b><span>Counselling and meals for children and families in Kware.</span></span><span class="pk-name">' + esc(f.n) + '</span><span class="pk-desc">' + esc(f.d) + '</span></button>';
    }).join('');
    return '<section class="panel"><h3>Typeface</h3><p class="muted">Applies to every page, including the admin. Headings and text pair as shown.</p><div class="type-grid">' + picks + '</div></section>' +
      '<section class="panel"><h3>Text size</h3><p class="muted">Scales all text on the site. The default is 100%.</p><div class="range-row"><input type="range" min="90" max="115" step="1" value="' + L.size + '" data-look="size" aria-label="Text size"><output>' + L.size + '%</output></div>' +
      '<div class="sample-text" style="margin-top:8px"><b>An environment where children and families can thrive.</b>Counselling in a safe, private space. Daily meals and holiday learning for children.</div></section>';
  }

  function shapesHtml() {
    var L = MT.look();
    var grid = MT.MORPHS.map(function (m) {
      return '<button type="button" class="pick" data-morph="' + m[0] + '" aria-pressed="' + (L.morph === m[0]) + '"><span class="pk-prev" style="display:grid;place-items:center"><span class="mp pk-mini" data-morph="' + m[0] + '" style="display:block;text-align:center;width:88%">Button</span></span><span class="pk-name">' + esc(m[1]) + '</span><span class="pk-desc">' + esc(m[2]) + '</span></button>';
    }).join('');
    return '<section class="panel"><div class="section-h" style="margin:0"><div><h3>Glass effect</h3><p>Turn the blur and see-through panels off for a solid, quiet site. The shape you choose below still applies.</p></div>' +
      '<label class="tog"><input type="checkbox" data-look="glass" ' + (L.glass ? 'checked' : '') + '><span>' + (L.glass ? 'On' : 'Off') + '</span></label></div></section>' +
      '<section class="panel"><h3>Shape style</h3><p class="muted">Fifteen styles. Each card below shows the style as it would look on this admin.</p><div class="shape-grid">' + grid + '</div></section>';
  }

  function motionHtml() {
    var L = MT.look();
    var cards = MT.MOTIONS.map(function (m) {
      return '<div class="pick" style="cursor:default" data-motion-card="' + m[0] + '"><span class="pk-prev" style="display:block;padding:0;overflow:hidden"><span data-motion="' + m[0] + '" style="display:block;padding:14px;height:100%"><span class="reveal shown" id="demo-' + m[0] + '" style="display:block;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px;font-weight:700;font-size:.92rem">Miale ya Tumaini</span></span></span>' +
        '<span class="pk-name">' + esc(m[1]) + '</span><span class="pk-desc">' + esc(m[2]) + '</span>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-sm btn-ghost" data-try="' + m[0] + '">Try it</button>' +
        '<button type="button" class="btn btn-sm ' + (L.motion === m[0] ? 'btn-b' : 'btn-ghost') + '" data-motion-set="' + m[0] + '">' + (L.motion === m[0] ? 'Chosen' : 'Use this') + '</button></div></div>';
    }).join('');
    return '<section class="panel"><h3>Scroll motion</h3><p class="muted">How elements arrive as visitors scroll. Maximum adds parallax on the hero photo and stronger blur. Still turns all movement off.</p><div class="motion-grid">' + cards + '</div></section>';
  }

  function soundsHtml() {
    var s = MT.look().sound;
    var packs = MT.SOUND_PACKS.map(function (p) {
      return '<button type="button" class="pick" data-pack="' + p[0] + '" aria-pressed="' + (s.pack === p[0]) + '"><span class="pk-name">' + esc(p[1]) + '</span><span class="pk-desc">' + esc(p[2]) + '</span><span class="pk-prev" style="min-height:0;padding:10px"><span class="muted" style="font-size:.85rem">Press to hear this pack</span></span></button>';
    }).join('');
    var evs = MT.SOUND_EV.map(function (e) {
      return '<div class="ev-row"><div><b>' + esc(e[1]) + '</b><small>' + esc(e[2]) + '</small></div><div style="display:flex;gap:10px;align-items:center">' +
        '<button type="button" class="btn btn-sm btn-ghost" data-sfx-test="' + e[0] + '">Test</button>' +
        '<label class="tog"><input type="checkbox" data-sev="' + e[0] + '"' + (s.ev[e[0]] !== false ? ' checked' : '') + ' aria-label="' + esc(e[1]) + ' on"></label></div></div>';
    }).join('');
    return '<section class="panel"><div class="section-h" style="margin:0"><div><h3>Sounds</h3><p>Synthesised in the browser, so nothing needs to be downloaded. Browsers need one tap before sound can start.</p></div>' +
      '<label class="tog"><input type="checkbox" data-look="soundOn" ' + (s.on ? 'checked' : '') + '><span>' + (s.on ? 'On' : 'Off') + '</span></label></div>' +
      '<div class="range-row"><input type="range" min="0" max="100" step="1" value="' + s.vol + '" data-look="vol" aria-label="Volume"><output>' + s.vol + '%</output></div></section>' +
      '<section class="panel"><h3>Sound character</h3><div class="sound-grid">' + packs + '</div></section>' +
      '<section class="panel"><div class="section-h" style="margin:0"><div><h3>Each sound</h3><p>Switch single sounds off, or press Test to hear them as they will play.</p></div>' +
      '<label class="tog"><input type="checkbox" data-look="haptics" ' + (s.haptics ? 'checked' : '') + '><span>Vibration ' + (s.haptics ? 'on' : 'off') + '</span></label></div><div class="ev-list">' + evs + '</div></section>';
  }

  function languageHtml() {
    var l = MT.lang();
    return panelBox('Editing language', '<p class="muted" style="margin:0">English and Kiswahili are edited separately. The site shows the language a visitor chooses.</p>' +
      '<div class="seg" role="group" aria-label="Editing language" style="width:max-content" id="langseg"><span class="th"></span><button type="button" data-el="en" aria-pressed="' + (l === 'en') + '" style="padding:0 16px;font-weight:700;min-width:0;height:36px">English</button><button type="button" data-el="sw" aria-pressed="' + (l === 'sw') + '" style="padding:0 16px;font-weight:700;min-width:0;height:36px">Kiswahili</button></div>');
  }

  /* ---------- donations, contact, video ---------- */
  function giveHtml() {
    var G = get('give');
    return panelBox('Donation card', F('give', 'Title (leave empty to use the default)', G.title || '', { k: 'title' }) + F('give', 'Text under the title', G.text, { k: 'text', area: 1, rows: 3 }) + F('give', 'Suggested amounts, separated by ·', G.amounts, { k: 'amounts' }) + F('give', 'Donation link (opens in a new tab)', G.link, { k: 'link' }), 'If the link is empty, the button calls the first phone number instead.') +
      panelBox('Other ways to give', '<div class="row2">' + F('give', 'M-Pesa details', G.mpesa, { k: 'mpesa' }) + F('give', 'Bank account details', G.account, { k: 'account' }) + '</div>', 'Shown in the card only when filled in.');
  }
  function contactHtml() {
    var C = get('contact');
    return panelBox('Phone and email', F('contact', 'Phone numbers (one per line)', C.phones.join('\n'), { k: 'phones', lines: 1, area: 1, rows: 3 }) + '<div class="row2">' + F('contact', 'Email', C.email, { k: 'email' }) + F('contact', 'WhatsApp number (with country code)', C.wa, { k: 'wa' }) + '</div>') +
      panelBox('Social links', '<div class="row2">' + F('contact', 'Facebook link', C.fb, { k: 'fb' }) + F('contact', 'Instagram link', C.ig, { k: 'ig' }) + '</div>') +
      panelBox('Places (one per line)', F('contact', 'Addresses and landmarks', C.places.join('\n'), { k: 'places', lines: 1, area: 1, rows: 4 }));
  }

  /* ---------- appearance and data ---------- */
  function appearanceHtml() {
    return panelBox('Admin theme', '<p class="muted" style="margin:0">Light or dark for this admin on this device.</p>' + MT.themeSeg()) +
      panelBox('Guided tour', '<p class="muted" style="margin:0">A four-step walk through the admin. It opens on Statistics until it is finished or skipped.</p><div><button type="button" class="btn btn-sm btn-ghost" data-tour="restart">Show the tour again</button></div>');
  }
  function dataHtml() {
    var cm = MT.comments(), ev = MT.events(), vis = MT.visits(), media = MT.MEDIA();
    return panelBox('Export everything', '<p class="muted" style="margin:0">One file with your content, settings, comments, the event log and a list of every photo and recording. Recording files are listed by name and not included, since they are large. Use this as the handover file when the backend is connected.</p>' +
      '<table class="datatable"><tbody><tr><td>Comments</td><td><b>' + cm.length + '</b></td></tr><tr><td>Events logged</td><td><b>' + ev.length + '</b></td></tr><tr><td>Visits logged</td><td><b>' + vis.length + '</b></td></tr><tr><td>Photos and recordings</td><td><b>' + media.length + '</b></td></tr></tbody></table>' +
      '<div><button type="button" class="btn btn-sm btn-p" data-export="1">Download export (JSON)</button></div>') +
      panelBox('Reset', '<p class="muted" style="margin:0">Puts the content, colours, looks and images back to the original. This cannot be undone.</p><div><button type="button" class="btn btn-sm btn-danger" id="resall">Reset the site</button></div>');
  }
  function exportJson() {
    var data = {
      exported: new Date().toISOString(), site: 'Miale ya Tumaini', content: MT.S(), comments: MT.comments(),
      events: MT.events(), visits: MT.visits(),
      media: MT.MEDIA().map(function (m) { return { id: m.id, kind: m.kind, title: m.title || '', cat: m.cat || null, consent: !!m.consent, date: m.date, dur: m.dur || null, plays: m.plays || 0, size: m.blob ? m.blob.size : 0, type: m.blob ? m.blob.type : '' }; })
    };
    var s = data.content; if (s && s.c) { /* content already holds text and look */ }
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'miale-export-' + MT.dayKey(Date.now()) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    MT.toast('Export downloaded', 'ok');
  }

  /* ---------- preview beside each editor ---------- */
  function emptyMsg(t) { return '<p class="muted" style="margin:0">' + esc(t || 'Nothing to preview yet. Add an item to see it here.') + '</p>'; }
  function renderPreview() {
    var b = $('#pvBody'); if (!b) return;
    var h = '';
    if (curTab === 'content') {
      var H = get('hero');
      h = '<div class="pv-site"><p class="eyebrow" style="margin-bottom:.8em">' + esc(get('brand').tag) + '</p><h1 style="font-size:clamp(1.7rem,3vw,2.4rem);margin:0 0 .35em">' + esc(H.h1) + '</h1><p class="lead" style="font-size:1rem;margin:0 0 1.2em;opacity:1;animation:none;max-width:none">' + esc(H.lead) + '</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><span class="btn btn-p btn-sm">' + esc(H.cta1) + '</span><span class="btn btn-s btn-sm">' + esc(H.cta2) + '</span></div></div>';
    } else if (curTab === 'programmes') {
      var P1 = get('programmes'), p = P1[curProg];
      h = p ? '<div class="pv-site">' + MT.cardHtml(p, curProg, true) + '</div>' : emptyMsg();
      h += '<div class="pv-site" style="display:flex;gap:8px;flex-wrap:wrap">' + P1.map(function (x, i) { return '<span class="tag ' + (i === curProg ? 'on' : '') + '">' + (i + 1) + '. ' + esc(x.t || 'Untitled') + '</span>'; }).join('') + '</div>';
      h += '<div style="display:flex;gap:10px"><button type="button" class="btn btn-sm btn-ghost" data-visitor="' + curProg + '">Open as a visitor</button></div>';
    } else if (curTab === 'impact') {
      var F1 = get('figures');
      h = '<div class="pv-site band" style="margin:0;padding:22px;border-radius:24px"><div style="display:grid;gap:12px">' + F1.map(function (f) {
        return '<div class="card" style="background:color-mix(in srgb,var(--blue-ink) 8%,var(--blue));color:var(--blue-ink);box-shadow:none;padding:18px;border:0"><p class="fig" style="font-size:2.6rem;margin:0">' + esc(f.n) + esc(f.s) + '</p><p class="fig-label" style="margin:0">' + esc(f.l) + '</p></div>';
      }).join('') + '</div></div>';
    } else if (curTab === 'stories') {
      if (curComment) {
        var cm = MT.comments().filter(function (c) { return c.id === curComment; })[0];
        h = cm ? '<div class="pv-site">' + MT.storyHtml({ name: cm.n || '', text: cm.m, plain: true }) + '</div><p class="muted" style="margin:0;font-size:.85rem">How it looks once approved. The signature stays private.</p>' : emptyMsg();
      } else {
        var T = get('testimonials'), t = T[curStory];
        h = t ? '<div class="pv-site">' + MT.storyHtml({ name: t.name, role: t.role, text: t.text || 'What they said appears here.', plain: true }) + '</div>' : emptyMsg('Add a testimonial, or approve a visitor comment.');
      }
    } else if (curTab === 'give') {
      var G = get('give');
      h = '<div class="pv-site"><div class="card donate-card" style="background:var(--accent);color:var(--accent-ink);border-color:transparent"><h2 style="font-size:1.6rem;color:inherit">' + esc(G.title || sec0('give_t')) + '</h2><p style="color:inherit;opacity:.9">' + esc(G.text) + '</p>' +
        '<div class="amounts">' + esc(G.amounts).split('·').map(function (a) { return '<span style="color:inherit">' + esc(a.trim()) + '</span>'; }).join('') + '</div>' +
        '<span class="btn btn-b" style="background:var(--accent-ink);color:var(--accent)">' + esc(get('sec').give_btn || MT.SECS.en.give_btn) + '</span></div></div>' +
        (G.mpesa || G.account ? '<p class="muted" style="font-size:.9rem;margin:0">Also shown: ' + [G.mpesa ? 'M-Pesa' : '', G.account ? 'bank account' : ''].filter(Boolean).join(' and ') + '.</p>' : '');
    } else if (curTab === 'video') {
      var V = get('videos'), v = V[curVid], src = v ? MT.parseVideo(v.url) : null;
      h = !v ? emptyMsg('Add a video to preview it here.') : src ? '<div class="pv-site"><div class="video"><iframe src="' + esc(src) + '" title="' + esc(v.t) + '" loading="lazy" allowfullscreen></iframe></div><h3 style="margin:12px 0 4px">' + esc(v.t || 'Untitled') + '</h3>' + (v.d ? '<p class="muted" style="margin:0">' + esc(v.d) + '</p>' : '') + '</div>' : '<div class="card" style="border-color:#E9B4AE"><p class="err" style="margin:0">This link is not a YouTube or Vimeo link, so it cannot be shown. Paste the normal share link.</p></div>';
    }
    b.innerHTML = h;
  }
  function sec0(k) { return MT.SECS.en[k] || ''; }

  /* ---------- events ---------- */
  function onInput(e) {
    var el = e.target;
    if (el.dataset.g) {
      var g = el.dataset.g, v = MT.clone(get(g)), i = el.dataset.i, k = el.dataset.k;
      var val = el.dataset.lines ? el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : el.value;
      if (i !== undefined && k) v[i][k] = val; else if (i !== undefined) v[i] = val; else if (k) v[k] = val; else v = val;
      MT.setG(g, v);
      if (g === 'sec' || g === 'hero' || g === 'brand' || g === 'programmes' || g === 'figures' || g === 'testimonials' || g === 'videos' || g === 'give') renderPreview();
      if (g === 'videos') renderPreview();
    } else if (el.dataset.col) {
      var s = S(); s.col = s.col || {}; s.col[el.dataset.col] = el.value; MT.saveS(); MT.applyColors(); MT.flash();
      if (curTab === 'brand') { var sel = $('#apanel'); }
    } else if (el.dataset.au) {
      var m = MT.byId(el.dataset.au);
      if (m) { m[el.dataset.f] = el.value; MT.mPut(m); MT.flash(); }
    } else if (el.dataset.zoom) {
      var key = el.dataset.zoom, f = fget(key); f.z = +el.value; fset(key, f);
      el.parentNode.querySelector('output').textContent = Math.round(f.z * 100) + '%';
      updateStage(key);
    } else if (el.dataset.trim) {
      var q = el.dataset.trim.split('|'), id = q[0], tr = TRIM[id] || (TRIM[id] = { s: 0, e: 0 });
      tr[q[1]] = +el.value;
      if (tr.s > tr.e) { if (q[1] === 's') tr.e = tr.s; else tr.s = tr.e; }
      var x = MT.byId(id), out = $('#' + (q[1] === 's' ? 'tso' : 'teo') + id);
      if (out) out.textContent = MT.fmt(q[1] === 's' ? tr.s : tr.e);
      if (x && x.dur) {
        var box = $('[data-audio-item="' + id + '"] .sel');
        if (box) { box.style.left = (tr.s / x.dur * 100) + '%'; box.style.width = ((tr.e - tr.s) / x.dur * 100) + '%'; }
      }
      var lbl = $('[data-audio-item="' + id + '"] .time-lbl b');
      if (lbl) lbl.textContent = MT.fmt(tr.e - tr.s);
    } else if (el.dataset.look === 'size') {
      MT.setLook('size', +el.value); var o = el.parentNode.querySelector('output'); if (o) o.textContent = el.value + '%';
    } else if (el.dataset.look === 'vol') {
      var L2 = MT.look(), sd = MT.clone(L2.sound); sd.vol = +el.value; MT.setLook('sound', sd);
      var o2 = el.parentNode.querySelector('output'); if (o2) o2.textContent = el.value + '%';
    }
  }
  function onChange(e) {
    var el = e.target;
    if (el.dataset.up && el.files.length) upImgs(el.dataset.up, el.files);
    else if (el.dataset.audioInput) pickAudio(el.files[0]);
    else if (el.dataset.consent) setImg(el.dataset.consent, { consent: el.checked }, 'Consent saved');
    else if (el.dataset.movecat) moveImg(el.dataset.movecat, el.value);
    else if (el.dataset.sev) {
      var sd = MT.clone(MT.look().sound); sd.ev = sd.ev || {}; sd.ev[el.dataset.sev] = el.checked; MT.setLook('sound', sd); MT.toast('Saved', 'ok');
    } else if (el.dataset.look === 'glass') { MT.setLook('glass', el.checked); panel('shapes'); }
    else if (el.dataset.look === 'soundOn') { var s1 = MT.clone(MT.look().sound); s1.on = el.checked; MT.setLook('sound', s1); panel('sounds'); }
    else if (el.dataset.look === 'haptics') { var s2 = MT.clone(MT.look().sound); s2.haptics = el.checked; MT.setLook('sound', s2); panel('sounds'); }
  }
  function onClick(e) {
    var b = e.target.closest('button, a'); if (!b) return;
    var tab = curTab;
    if (b.dataset.add) { var v = MT.clone(get(b.dataset.add)); v.push(MT.clone(TPL[b.dataset.add])); MT.setG(b.dataset.add, v); if (b.dataset.add === 'programmes') curProg = v.length - 1; if (b.dataset.add === 'testimonials') curStory = v.length - 1; if (b.dataset.add === 'videos') curVid = v.length - 1; panel(tab); }
    else if (b.dataset.rm) {
      var p = b.dataset.rm.split('|'), arr = MT.clone(get(p[0])), at = +p[1], gone = arr.splice(at, 1)[0];
      MT.setG(p[0], arr); panel(tab);
      MT.banner({ kind: 'ok', sound: 'click', title: 'Removed', body: 'Tap Undo to bring it back.', ms: 6500,
        action: { label: 'Undo', run: function () { var back = MT.clone(get(p[0])); back.splice(at, 0, gone); MT.setG(p[0], back); panel(curTab); } } });
    }
    else if (b.dataset.mv) {
      var q = b.dataset.mv.split('|'), arr = MT.clone(get(q[0])), from = +q[1], to = from + (+q[2]);
      if (to >= 0 && to < arr.length) { var t2 = arr[from]; arr[from] = arr[to]; arr[to] = t2; MT.setG(q[0], arr); panel(tab); }
    }
    else if (b.dataset.pick) { var pk = b.dataset.pick.split('|'); if (pk[0] === 'programmes') curProg = +pk[1]; if (pk[0] === 'testimonials') { curStory = +pk[1]; curComment = null; } if (pk[0] === 'videos') curVid = +pk[1]; panel(tab); }
    else if (b.dataset.cpick) { curComment = b.dataset.cpick; panel(tab); }
    else if (b.dataset.visitor !== undefined) MT.openDlg(+b.dataset.visitor);
    else if (b.dataset.filter) { curFilter = b.dataset.filter; panel(tab); }
    else if (b.dataset.delimg) deleteImg(b.dataset.delimg);
    else if (b.dataset.clear) { var s = S(); s.slots[b.dataset.clear] = null; MT.saveS(); MT.toast('Default restored', 'ok'); panel(tab); }
    else if (b.dataset.slotpick) { curSlot = b.dataset.slotpick; panel(tab); }
    else if (b.dataset.focusReset) { var f0 = S().focus || {}; delete f0[b.dataset.focusReset]; S().focus = f0; MT.saveS(); MT.toast('Framing reset', 'ok'); panel(tab); }
    else if (b.dataset.delau) { if (confirm('Delete this recording?')) MT.mDel(b.dataset.delau).then(MT.loadMedia).then(function () { MT.toast('Recording deleted', 'ok'); panel(tab); }); }
    else if (b.dataset.cutau) cutAudio(b.dataset.cutau);
    else if (b.dataset.restau) restoreAudio(b.dataset.restau);
    else if (b.dataset.playsel) playSel(b.dataset.playsel);
    else if (b.dataset.cm) {
      var cid2 = b.dataset.id;
      if (!DB().on) {
        var l = MT.comments().slice();
        if (b.dataset.cm === 'del') { if (!confirm('Delete this comment for good?')) return; l = l.filter(function (c) { return String(c.id) !== cid2; }); }
        else l = l.map(function (c) { if (String(c.id) === cid2) c.ok = b.dataset.cm === 'ok'; return c; });
        MT.LS.set('mt-comments', JSON.stringify(l)); MT.toast('Saved', 'ok'); panel(tab); return;
      }
      var job;
      if (b.dataset.cm === 'del') { if (!confirm('Delete this comment for good?')) return; job = DB().deleteComment(cid2); }
      else job = DB().setCommentApproved(cid2, b.dataset.cm === 'ok');
      job.then(loadAdminData).then(function () {
        MT.toast(b.dataset.cm === 'del' ? 'Comment deleted' : (b.dataset.cm === 'ok' ? 'Approved. It now shows on the site.' : 'Hidden from the site'), 'ok');
        panel(tab);
      }).catch(function () { MT.toast('Could not save. Check the connection.', 'err'); });
    }
    else if (b.dataset.filter === undefined && b.dataset.ifilter) { curInbox = b.dataset.ifilter; panel('inbox'); }
    else if (b.dataset.markread) { MT.LS.set('mt-inbox-seen', String(Date.now())); MT.toast('All caught up', 'ok'); panel('inbox'); }
    else if (b.dataset.el) { MT.setLang(b.dataset.el); panel(tab); }
    else if (b.dataset.palette !== undefined) {
      var pal = MT.PALETTES[+b.dataset.palette], s2 = S(); s2.col = { bg: pal.bg, blue: pal.blue, accent: pal.accent, brown: pal.brown };
      MT.saveS(); MT.applyColors(); MT.toast('Palette applied: ' + pal.n, 'ok'); panel(tab);
    }
    else if (b.dataset.font) { MT.setLook('font', b.dataset.font); MT.toast('Typeface changed', 'ok'); panel('type'); }
    else if (b.dataset.morph) { MT.setLook('morph', b.dataset.morph); MT.toast('Shape style: ' + b.textContent.trim().split('\n')[0], 'ok'); panel('shapes'); }
    else if (b.dataset.motionSet) { MT.setLook('motion', b.dataset.motionSet); MT.toast('Motion set', 'ok'); panel('motion'); }
    else if (b.dataset.try) { tryMotion(b.dataset.try); }
    else if (b.dataset.pack) { var s3 = MT.clone(MT.look().sound); s3.pack = b.dataset.pack; MT.setLook('sound', s3); MT.sfx('success', null, true); panel('sounds'); }
    else if (b.dataset.sfxTest) { MT.sfx(b.dataset.sfxTest, null, true); }
    else if (b.dataset.preview) openPreview(b.dataset.preview);
    else if (b.dataset.cal) calDialog();
    else if (b.dataset.tour) {
      if (b.dataset.tour === 'next') { tourStep = Math.min(TOUR.length - 1, tourStep + 1); panel('overview'); }
      else if (b.dataset.tour === 'restart') { tourStep = 0; MT.LS.set('mt-tour-done', ''); location.hash = '#/admin/overview'; panel('overview'); }
      else { MT.LS.set('mt-tour-done', '1'); tourStep = 0; panel('overview'); MT.toast('Tour finished. You can show it again in Admin look.', 'ok'); }
    }
    else if (b.dataset.export) exportJson();
    else if (b.id === 'rescol') { var s4 = S(); s4.col = {}; MT.saveS(); MT.applyColors(); MT.toast('Default palette restored', 'ok'); panel(tab); }
    else if (b.id === 'resall') {
      if (confirm('Reset all content, colours, looks and images to the original? This cannot be undone.')) {
        var fresh = { c: { en: {}, sw: {} }, col: {}, cats: {}, slots: {}, focus: {}, look: {} };
        try { localStorage.setItem('mt-s', JSON.stringify(fresh)); } catch (x) {}
        location.reload();
      }
    }
  }
  function onPointer(e) {
    var st = e.target.closest('#fstage'), wv = e.target.closest('[data-wave]');
    if (st) {
      e.preventDefault();
      var key = st.dataset.key;
      var move = function (ev) {
        var r = st.getBoundingClientRect(), f = fget(key);
        f.x = Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100));
        f.y = Math.max(0, Math.min(100, (ev.clientY - r.top) / r.height * 100));
        fset(key, f); updateStage(key);
      };
      move(e);
      var up = function () { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); MT.flash(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    } else if (wv) {
      var id = wv.dataset.wave, x = MT.byId(id), r2 = wv.getBoundingClientRect();
      if (!x || !x.dur) return;
      var a = AUD[id];
      if (!a) { a = new Audio(MT.urlOf(x)); AUD[id] = a; }
      var t = (e.clientX - r2.left) / r2.width * x.dur;
      a.currentTime = Math.max(0, t);
      var head = $('.head', wv); if (head) head.style.left = (t / x.dur * 100) + '%';
    }
  }
  function fget(key) { var f = (S().focus || {})[key] || {}; return { x: f.x == null ? 50 : f.x, y: f.y == null ? 50 : f.y, z: f.z || 1 }; }
  function fset(key, f) { S().focus = S().focus || {}; S().focus[key] = { x: Math.round(f.x * 10) / 10, y: Math.round(f.y * 10) / 10, z: Math.round(f.z * 100) / 100 }; MT.saveS(); }
  function updateStage(key) {
    var st = $('#fstage'); if (!st || st.dataset.key !== key) return;
    var f = fget(key);
    st.style.setProperty('--fx', f.x + '%'); st.style.setProperty('--fy', f.y + '%'); st.style.setProperty('--fz', f.z);
    var img = $('img', st); if (img) { img.style.transformOrigin = f.x + '% ' + f.y + '%'; img.style.transform = 'scale(' + f.z + ')'; }
  }
  function tryMotion(level) {
    var d = $('#demo-' + level); if (!d) return;
    d.classList.remove('shown'); void d.offsetWidth;
    setTimeout(function () { d.classList.add('shown'); }, 60);
  }

  /* ---------- images ---------- */
  function upImgs(target, files) {
    var arr = [].slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!arr.length) { MT.toast('Choose an image file (JPG, PNG or WebP).', 'err'); return; }
    var kind = target.split(':')[0], key = target.split(':')[1];
    var max = kind === 'slot' && key === 'logo' ? 512 : 1800;
    var type = kind === 'slot' && key === 'logo' ? 'image/png' : 'image/jpeg';
    Promise.all(arr.map(function (f) {
      return MT.shrink(f, max, type).then(function (b) { var id = MT.uid(); return MT.mPut({ id: id, kind: 'img', blob: b, date: Date.now(), cat: kind === 'cat' ? key : null, consent: false }).then(function (res) { return (res && res.id) || id; }); });
    })).then(function (ids) {
      var s = S();
      if (kind === 'slot') { var old = s.slots[key]; s.slots[key] = ids[0]; if (old) MT.mDel(old); }
      else { s.cats = s.cats || {}; s.cats[key] = (s.cats[key] || []).concat(ids); }
      MT.saveS();
      return MT.loadMedia();
    }).then(function () { MT.toast('Image saved', 'ok'); MT.applyColors(); panel(curTab); });
  }
  function setImg(id, patch, msg) {
    var m = MT.byId(id); if (!m) return;
    Object.keys(patch).forEach(function (k) { m[k] = patch[k]; });
    MT.mPut(m).then(function () { MT.flash(); if (msg) MT.toast(msg, 'ok'); panel(curTab); });
  }
  function moveImg(id, cat) {
    var m = MT.byId(id); if (!m) return;
    var s = S(); s.cats = s.cats || {};
    if (m.cat && s.cats[m.cat]) s.cats[m.cat] = s.cats[m.cat].filter(function (x) { return x !== id; });
    m.cat = cat; s.cats[cat] = (s.cats[cat] || []).concat([id]); MT.saveS();
    MT.mPut(m).then(function () { MT.toast('Moved to ' + MT.labelOf(cat), 'ok'); panel(curTab); });
  }
  function deleteImg(id) {
    if (!confirm('Remove this photo from the site and the library?')) return;
    var s = S(); s.cats = s.cats || {};
    Object.keys(s.cats).forEach(function (k) { s.cats[k] = s.cats[k].filter(function (x) { return x !== id; }); });
    Object.keys(s.slots).forEach(function (k) { if (s.slots[k] === id) s.slots[k] = null; });
    MT.saveS();
    MT.mDel(id).then(MT.loadMedia).then(function () { MT.toast('Photo removed', 'ok'); panel(curTab); });
  }

  /* ---------- preview (desktop or phone) ---------- */
  function openPreview(kind) {
    var d = $('#prev');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'prev';
      d.innerHTML = '<div class="pvbar"><b id="pvl"></b><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="seg" role="group" aria-label="Device"><span class="th"></span><button type="button" data-pvd="desktop" aria-label="Desktop">' + I.desk + '</button><button type="button" data-pvd="mobile" aria-label="Phone">' + I.mob + '</button></div><button class="btn btn-sm btn-ghost" id="pvc">Close preview</button></div></div>' +
        '<div class="pvstageframe"><iframe id="pvf" title="Site preview"></iframe></div>';
      document.body.appendChild(d);
      $('#pvc').onclick = function () { d.close(); };
      d.addEventListener('click', function (e) { var t = e.target.closest('[data-pvd]'); if (t) setPreviewDevice(t.dataset.pvd); });
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    }
    setPreviewDevice(kind || 'desktop');
    d.showModal();
    MT.placeSeg();
  }
  function setPreviewDevice(kind) {
    var f = $('#pvf'), l = $('#pvl');
    f.style.width = kind === 'mobile' ? '390px' : '100%';
    f.style.maxWidth = kind === 'mobile' ? '390px' : '100%';
    l.textContent = kind === 'mobile' ? 'Phone preview · 390 px' : 'Desktop preview';
    if (window.__MT_SELF) f.srcdoc = window.__MT_SELF.replace('<head>', '<head><script>window.MT_PREVIEW_MODE=1<\/script>');
    else f.src = 'index.html?preview=1#/';
    $$('#prev [data-pvd]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pvd === kind); });
  }

  /* ---------- global hooks ---------- */
  MT.enterAdmin = enterAdmin;
  MT.refreshAdmin = function () { panel(curTab); MT.placeSeg(); };
})();
