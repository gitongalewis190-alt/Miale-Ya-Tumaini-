/* Miale ya Tumaini · ux.js (sound, haptics, key feedback, banners, admin alerts). Loaded after app.js.
   All sounds are synthesised with the Web Audio API. No audio files.
   Browsers allow sound only after a tap or key press, so the first interaction unlocks it. */
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
      var comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
      master.connect(comp); comp.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(function () {});
    master.gain.value = Math.max(0, Math.min(1, L().vol / 100)) * .85;
    return AC;
  }
  function noise(c) {
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * .5, c.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  /* four characters. "keys" is the default: a short, dry key tick like a laptop keyboard. */
  var PACK = {
    keys:    { key: 3800, tick: .55, body: 1900, bodyG: .12, wave: 'sine',     g: .16, a: .006, lp: 6500, p: 1,    h: [.08], bell: false, root: 880 },
    marimba: { key: 2600, tick: .35, body: 620,  bodyG: .22, wave: 'triangle', g: .20, a: .004, lp: 3600, p: 1,    h: [.18], bell: false, root: 880 },
    glass:   { key: 4800, tick: .30, body: 2200, bodyG: .10, wave: 'sine',     g: .13, a: .002, lp: 9000, p: 1.1,  h: [],     bell: true,  root: 1046.5 },
    soft:    { key: 2400, tick: .22, body: 1100, bodyG: .06, wave: 'sine',     g: .12, a: .020, lp: 2800, p: .95,  h: [.05], bell: false, root: 784 }
  };

  function osc(c, type, f, t, dur, dest, toF, amp) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (toF) o.frequency.exponentialRampToValueAtTime(toF, t + dur * .85);
    g.gain.value = amp; o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + .06);
  }
  function tone(c, t, f, dur, vol, pk, o) {
    o = o || {};
    var env = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = o.lp || pk.lp; lp.Q.value = .3;
    env.connect(lp); lp.connect(master);
    var peak = Math.max(.0002, vol * pk.g);
    env.gain.setValueAtTime(.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + (o.a || pk.a));
    env.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc(c, o.wave || pk.wave, f * pk.p, t, dur, env, o.to ? o.to * pk.p : 0, 1);
    if (pk.bell) { osc(c, 'sine', f * pk.p * 2.76, t, dur * .6, env, 0, .35); osc(c, 'sine', f * pk.p * 5.4, t, dur * .35, env, 0, .14); }
    (pk.h || []).forEach(function (a, i) { osc(c, 'sine', f * pk.p * (i + 2), t, dur * .7, env, 0, a); });
  }
  /* the key tick: a filtered noise snap plus a short body tone. hi = a lighter key (select). */
  function keyTick(c, t, pk, vol, hi) {
    var src = c.createBufferSource(); src.buffer = noise(c);
    var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = pk.key * (hi ? 1.3 : 1); bp.Q.value = 5;
    var g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol * pk.tick), t + .0015); g.gain.exponentialRampToValueAtTime(.0001, t + .014);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + .03);
    var o = c.createOscillator(), og = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(pk.body * (hi ? 1.2 : 1), t); o.frequency.exponentialRampToValueAtTime(pk.body * .5, t + .02);
    og.gain.setValueAtTime(Math.max(.0002, vol * pk.bodyG), t); og.gain.exponentialRampToValueAtTime(.0001, t + .025);
    o.connect(og); og.connect(master); o.start(t); o.stop(t + .03);
  }
  function whoosh(c, t, dur, vol) {
    var s = c.createBufferSource(); s.buffer = noise(c);
    var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(1800, t + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol * .16), t + dur * .4); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .05);
  }

  /* haptics: short patterns where the browser supports vibration (Android). iPhone Safari has none. */
  var HAP = { click: 6, select: 4, success: [10, 40, 10], error: [40, 60, 40], notify: 18, comment: [10, 30, 10], donate: [15, 50, 15, 50, 30], section: 0, media: 5, pause: 4 };
  function haptic(key) {
    if (L().haptics === false || !navigator.vibrate || !HAP[key]) return;
    try { navigator.vibrate(HAP[key]); } catch (e) {}
  }

  /* sfx(key, variant, force). force plays even when that sound is switched off (used by the Test buttons). */
  function sfx(key, variant, force) {
    var s = L();
    if (!force) haptic(key === 'media' && variant === 'pause' ? 'pause' : key);
    if (!force && (!s.on || s.ev[key] === false)) return;
    var c = ctx(); if (!c) return;
    var pk = PACK[s.pack] || PACK.keys, t = c.currentTime + .005, v = 1;
    switch (key) {
      case 'click':   keyTick(c, t, pk, variant === 'key-soft' ? v * .35 : v); break;
      case 'select':  keyTick(c, t, pk, v * .8, true); tone(c, t + .01, pk.root * 1.5, .05, .18, pk, { a: .002 }); break;
      case 'success':
        tone(c, t, pk.root, .42, .55, pk);
        tone(c, t + .075, pk.root * 1.5, .44, .5, pk);
        tone(c, t + .15, pk.root * 2, .5, .32, pk);
        break;
      case 'error':
        tone(c, t, 196, .14, .55, pk, { a: .006, lp: 900, wave: 'triangle' });
        tone(c, t + .13, 147, .2, .5, pk, { a: .006, lp: 900, wave: 'triangle' });
        break;
      case 'notify':
        tone(c, t, 1318.5, .5, .42, pk); tone(c, t + .11, 1046.5, .5, .38, pk); tone(c, t + .22, 1568, .6, .34, pk);
        break;
      case 'comment': tone(c, t, 600, .09, .42, pk, { to: 950, a: .004 }); break;
      case 'donate':
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(c, t + i * .09, f, .5, .48, pk); });
        [1046.5, 1318.5, 1568].forEach(function (f) { tone(c, t + .4, f, 1.2, .3, pk); });
        break;
      case 'section': whoosh(c, t, .34, v); break;
      case 'media':
        if (variant === 'pause') keyTick(c, t, pk, v * .7); else tone(c, t, pk.root * .75, .12, .4, pk, { a: .004 });
        break;
    }
  }

  /* feedback on every control: pointer press (mouse, pen, touch) and keyboard activation */
  var lastTick = 0;
  function interactive(el) {
    return el && el.closest && el.closest('button, a[href], label.tog, input[type=checkbox], input[type=radio], select, summary, .card.click, [role=button], .pick, .palette-card, .swatch, .chips button, .seg button, .tab, .nav-h');
  }
  function kindOf(el) {
    if (el.closest('.seg, .chips, .pick, .palette-card, select, [role=menuitemradio], input[type=checkbox], input[type=radio], label.tog') || el.hasAttribute('aria-pressed')) return 'select';
    if (el.tagName === 'A' && (el.getAttribute('href') || '').charAt(0) === '#' && !el.closest('.hero, .acts')) return 'section';
    return 'click';
  }
  function press(e) {
    var el = interactive(e.target); if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var now = performance.now(); if (now - lastTick < 35) return; lastTick = now;
    sfx(kindOf(el));
  }
  document.addEventListener('pointerdown', function (e) { if (e.button === 0 || e.pointerType !== 'mouse') press(e); }, true);
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t.matches && t.matches('input:not([type=password]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]), textarea')) {
      if (e.key.length === 1 || e.key === 'Backspace') sfx('click', 'key-soft', false);
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && interactive(t)) { var now = performance.now(); if (now - lastTick > 35) { lastTick = now; sfx(kindOf(t)); } }
  }, true);

  /* ---------- banners: drop from the top, swipe up to dismiss ---------- */
  var ICON_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
  var ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 8v5M12 17h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  var q = [], current = null, timer = null;
  function banner(o) { q.push(o); if (!current) next(); }
  function next() {
    var o = q.shift(); if (!o) { current = null; return; }
    current = o;
    var el = document.createElement('div');
    el.className = 'banner'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    var icon = o.img ? '<img src="' + esc(o.img) + '" alt="">' : (o.icon || (o.kind === 'error' ? ICON_WARN : o.kind === 'ok' ? ICON_OK : ICON_BELL));
    el.innerHTML = '<div class="bi' + (o.kind === 'ok' ? ' ok' : o.kind === 'error' ? ' err' : '') + '">' + icon + '</div>' +
      '<div class="bt"><b>' + esc(o.title) + '</b>' + (o.body ? '<small>' + esc(o.body) + '</small>' : '') + '</div>' +
      (o.action ? '<button class="bact" type="button">' + esc(o.action.label) + '</button>' : '') +
      '<span class="bgrab" aria-hidden="true"></span>';
    document.body.appendChild(el);
    void el.offsetWidth;
    requestAnimationFrame(function () { el.classList.add('on'); });
    sfx(o.sound || (o.kind === 'error' ? 'error' : o.kind === 'ok' ? 'success' : o.kind === 'donate' ? 'donate' : o.kind === 'comment' ? 'comment' : 'notify'));
    if (o.action) el.querySelector('.bact').onclick = function (e) { e.stopPropagation(); o.action.run(); dismiss(el); };
    attach(el);
    timer = setTimeout(function () { dismiss(el); }, o.ms || 5000);
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
      if (e.target.closest('.bact')) return;
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
    el.addEventListener('click', function (e) { if (!moved && !e.target.closest('.bact')) dismiss(el); });
  }

  /* ---------- admin alerts: only what needs attention, once per new event ---------- */
  var seen = null;
  function poll() {
    if (!MT.adminOn()) return;
    var ev = MT.events(), n = ev.length;
    if (seen === null || n < seen) { seen = n; return; }
    if (n === seen) return;
    var fresh = ev.slice(seen); seen = n;
    var comments = fresh.filter(function (x) { return x.k === 'comment'; }).length;
    var gifts = fresh.filter(function (x) { return x.k === 'donate'; }).length;
    if (comments) banner({ kind: 'comment', title: comments === 1 ? 'New comment waiting' : comments + ' new comments', body: 'Approve or hide it in Stories & comments.', ms: 6000,
      action: { label: 'Open', run: function () { location.hash = '#/admin/stories'; } } });
    else if (gifts) banner({ kind: 'donate', title: 'Donation link opened', body: 'A visitor started to give.', ms: 6000 });
    updateBadge();
  }
  function updateBadge() {
    var b = $('#inboxBadge'); if (!b) return;
    var seenAt = MT.jget('mt-inbox-seen', 0);
    var n = MT.events().filter(function (x) { return x.t > seenAt && (x.k === 'comment' || x.k === 'donate' || x.k === 'social' || x.k === 'early'); }).length;
    b.textContent = n; b.hidden = !n;
  }
  setInterval(poll, 4000);
  setInterval(updateBadge, 8000);

  MT.sfx = sfx;
  MT.haptic = haptic;
  MT.banner = banner;
  MT.updateBadge = updateBadge;
  MT.SOUND_PACKS = [
    ['keys', 'Keys', 'A short, dry tick, like a laptop keyboard. The default.'],
    ['marimba', 'Marimba', 'Soft wooden tone for success. Warm and gentle.'],
    ['glass', 'Glass', 'Bright, bell-like. Feels clean and premium.'],
    ['soft', 'Soft', 'Quiet and rounded. Good for late evenings.']
  ];
})();
