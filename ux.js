/* Miale ya Tumaini · ux.js (sound, haptics, banners, admin alerts). Loaded after app.js.
   Every sound is synthesised in the browser (Web Audio). There are no audio files to ship.
   Browsers only let sound start after a tap or key press, so the first click unlocks it. */
(function () {
  'use strict';
  var MT = window.MT; if (!MT) return;
  var $ = MT.$, esc = MT.esc;

  var AC = null, master = null, noiseBuf = null;
  function L() { return MT.look().sound; }

  function ctx() {
    if (!AC) {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      AC = new C();
      master = AC.createGain();
      var comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master.connect(comp); comp.connect(AC.destination);
    }
    if (AC.state === 'suspended') { AC.resume().catch(function () {}); }
    master.gain.value = Math.max(0, Math.min(1, L().vol / 100)) * .9;
    return AC;
  }

  /* four timbres. Same events, different character. */
  var PACK = {
    soft:   { w: 'sine',     g: .16, a: .012, lp: 4200, p: 1,    h: [.10],        bell: false },
    crisp:  { w: 'triangle', g: .13, a: .003, lp: 7800, p: 1.12, h: [.22, .05],   bell: false },
    warm:   { w: 'sine',     g: .20, a: .020, lp: 2400, p: .9,   h: [.35, .12],   bell: false },
    glass:  { w: 'sine',     g: .13, a: .002, lp: 9000, p: 1.22, h: [],           bell: true }
  };

  function osc(c, type, f, t, dur, dest, toF, amp) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (toF) o.frequency.exponentialRampToValueAtTime(toF, t + dur * .85);
    g.gain.value = amp; o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + .08);
  }
  function tone(c, t, f, dur, vol, pk, o) {
    o = o || {};
    var env = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = o.lp || pk.lp; lp.Q.value = .4;
    env.connect(lp); lp.connect(master);
    var peak = Math.max(.0002, vol * pk.g);
    env.gain.setValueAtTime(.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + (o.a || pk.a));
    env.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc(c, pk.w, f * pk.p, t, dur, env, o.to ? o.to * pk.p : 0, 1);
    if (pk.bell) { osc(c, 'sine', f * pk.p * 2.76, t, dur * .7, env, 0, .35); osc(c, 'sine', f * pk.p * 5.4, t, dur * .4, env, 0, .14); }
    (pk.h || []).forEach(function (a, i) { osc(c, 'sine', f * pk.p * (i + 2), t, dur * .8, env, 0, a); });
  }
  function whoosh(c, t, dur, vol) {
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * .6, c.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var s = c.createBufferSource(); s.buffer = noiseBuf;
    var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(380, t); bp.frequency.exponentialRampToValueAtTime(1700, t + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol * .22, t + dur * .35); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .05);
  }

  /* haptics: short patterns on Android and recent iPhones. Desktop and some browsers ignore them. */
  var HAP = { click: 6, select: 4, success: [10, 40, 10], error: [40, 60, 40], notify: 18, comment: [10, 30, 10], donate: [15, 50, 15, 50, 30], section: 0, media: 5, play: 5, pause: 4 };
  function haptic(key) {
    if (L().haptics === false || !navigator.vibrate || !HAP[key]) return;
    try { navigator.vibrate(HAP[key]); } catch (e) {}
  }

  /* sfx(key): plays the sound for an event if it is on, and the vibration if haptics are on. */
  function sfx(key, variant, force) {
    var s = L();
    if (!force) haptic(key === 'media' && variant === 'pause' ? 'pause' : key);
    if (!force && (!s.on || s.ev[key] === false)) return;
    var c = ctx(); if (!c) return;
    var pk = PACK[s.pack] || PACK.soft, t = c.currentTime + .004;
    switch (key) {
      case 'click':   tone(c, t, 980, .05, .5, pk, { to: 640, a: .002 }); break;
      case 'select':  tone(c, t, 1320, .035, .36, pk, { a: .002 }); tone(c, t + .03, 1760, .05, .2, pk, { a: .002 }); break;
      case 'success': [523.25, 659.25, 783.99].forEach(function (f, i) { tone(c, t + i * .075, f, .34, .6, pk); }); break;
      case 'error':   tone(c, t, 311, .16, .6, pk, { a: .01, lp: 1800 }); tone(c, t + .13, 233, .28, .6, pk, { a: .01, lp: 1800 }); break;
      case 'notify':  tone(c, t, 1174.66, .9, .55, pk); tone(c, t + .12, 1567.98, .7, .32, pk); break;
      case 'comment': tone(c, t, 520, .14, .5, pk, { to: 900, a: .005 }); break;
      case 'donate':
        [261.63, 329.63, 392, 523.25].forEach(function (f, i) { tone(c, t + i * .085, f, .42, .5, pk); });
        [523.25, 659.25, 783.99].forEach(function (f) { tone(c, t + .42, f, 1.1, .42, pk); });
        break;
      case 'section': whoosh(c, t, .42, .9); break;
      case 'media':   if (variant === 'pause') tone(c, t, 440, .09, .45, pk, { a: .004 }); else tone(c, t, 660, .09, .45, pk, { a: .004 }); break;
    }
  }

  /* every button, link, tab, chip and card gives a click. Chips and switches give a select sound. */
  var lastClick = 0;
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('button, a[href], label.tog, input[type=checkbox], input[type=radio], summary, select, .card.click, [role=button], .pick, .palette-card, .swatch, .chips button, .seg button, .tab');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var now = performance.now(); if (now - lastClick < 45) return; lastClick = now;
    var key = 'click';
    if (el.closest('.seg, .chips, .pick, .palette-card, select, [role=menuitemradio]') || el.hasAttribute('aria-pressed') || el.matches('input[type=checkbox], input[type=radio], label.tog')) key = 'select';
    else if (el.tagName === 'A' && (el.getAttribute('href') || '').charAt(0) === '#' && !el.closest('.hero, .acts')) key = 'section';
    sfx(key);
  }, true);

  /* ---------- banners: iOS-style, drop from the top, swipe up to dismiss ---------- */
  var ICON_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
  var q = [], current = null, timer = null;
  function banner(o) { q.push(o); if (!current) next(); }
  function next() {
    var o = q.shift(); if (!o) { current = null; return; }
    current = o;
    var el = document.createElement('div');
    el.className = 'banner'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="bi">' + (o.img ? '<img src="' + esc(o.img) + '" alt="">' : (o.icon || ICON_BELL)) + '</div>' +
      '<div class="bt"><b>' + esc(o.title) + '</b>' + (o.body ? '<small>' + esc(o.body) + '</small>' : '') + '</div>' +
      '<span class="bt-time">' + esc(o.when || 'now') + '</span><span class="bgrab" aria-hidden="true"></span>';
    document.body.appendChild(el);
    void el.offsetWidth;
    requestAnimationFrame(function () { el.classList.add('on'); });
    sfx(o.sound || (o.kind === 'error' ? 'error' : o.kind === 'donate' ? 'donate' : o.kind === 'comment' ? 'comment' : 'notify'));
    attach(el);
    timer = setTimeout(function () { dismiss(el); }, o.ms || 5200);
  }
  function dismiss(el) {
    if (!el || el._gone) return; el._gone = true;
    clearTimeout(timer);
    el.classList.remove('on'); el.classList.add('gone');
    setTimeout(function () { el.remove(); next(); }, 480);
  }
  function attach(el) {
    var y0 = 0, dy = 0, t0 = 0, drag = false, moved = false;
    el.addEventListener('pointerdown', function (e) {
      drag = true; moved = false; y0 = e.clientY; t0 = Date.now(); dy = 0;
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
      el.classList.add('drag'); clearTimeout(timer);
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      dy = Math.min(0, e.clientY - y0);
      if (Math.abs(dy) > 3) moved = true;
      el.style.transform = 'translate(-50%,' + dy + 'px)';
      el.style.opacity = String(Math.max(.25, 1 + dy / 140));
    });
    function end() {
      if (!drag) return; drag = false;
      el.classList.remove('drag');
      var v = dy / Math.max(1, Date.now() - t0);
      if (dy < -34 || v < -.45) { dismiss(el); return; }
      el.style.transform = ''; el.style.opacity = '';
      timer = setTimeout(function () { dismiss(el); }, 3200);
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', function () { if (!moved) dismiss(el); });
  }

  /* ---------- admin alerts: only things that need attention, and only once per new event ---------- */
  var seen = null;
  function poll() {
    if (!MT.adminOn()) return;
    var ev = MT.events(), n = ev.length;
    if (seen === null) { seen = n; return; }
    if (n <= seen) { seen = n; return; }
    var fresh = ev.slice(seen); seen = n;
    var comments = fresh.filter(function (x) { return x.k === 'comment'; }).length;
    var gifts = fresh.filter(function (x) { return x.k === 'donate'; }).length;
    if (comments) banner({ kind: 'comment', title: comments === 1 ? 'New comment waiting' : comments + ' new comments', body: 'Approve or hide it in Stories & comments.', ms: 6000 });
    else if (gifts) banner({ kind: 'donate', title: 'Donation link opened', body: 'A visitor started to give. Counted in Statistics.', ms: 6000 });
    updateBadge();
  }
  function updateBadge() {
    var b = $('#inboxBadge'); if (!b) return;
    var seenAt = MT.jget('mt-inbox-seen', 0);
    var n = MT.events().filter(function (x) { return x.t > seenAt && (x.k === 'comment' || x.k === 'donate' || x.k === 'social' || x.k === 'early'); }).length;
    b.textContent = n; b.hidden = !n;
  }
  setInterval(poll, 4000);
  setInterval(updateBadge, 6000);

  /* the very first sound a visitor hears is the click they make to unlock audio. Nothing plays on load. */
  MT.sfx = sfx;
  MT.haptic = haptic;
  MT.banner = banner;
  MT.updateBadge = updateBadge;
  MT.SOUND_PACKS = [
    ['soft', 'Soft', 'Round and warm. Quiet in an office.'],
    ['crisp', 'Crisp', 'Bright and clear. Feels quick.'],
    ['warm', 'Warm', 'Full and low. Feels calm and human.'],
    ['glass', 'Glass', 'Bell-like with a shimmer. Feels premium.']
  ];
})();
