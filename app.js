/* Miale ya Tumaini · app.js
   Progressive enhancement only. The page reads correctly without this script.
   Every storage, service worker and install call is guarded. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Copy (English is authoritative; Kiswahili is a DRAFT pending native review) ---------- */
  var DICT = {
    en: {
      skip: 'Skip to content', lang_label: 'Language', theme_label: 'Theme',
      theme_light: 'Light', theme_dark: 'Dark', theme_system: 'System',
      nav_work: 'Our work', nav_impact: 'Impact', nav_how: 'How we work', nav_visit: 'Visit',
      hero_eyebrow: 'Kware, Ongata Rongai, Kenya · Working since 2014',
      hero_h1: 'An environment where children and families can thrive.',
      hero_cta_contact: 'Get in touch', hero_cta_programmes: 'See our programmes',
      photo_placeholder: 'A photograph appears here once subject and use consent are recorded.',
      mission_kicker: 'Mission',
      mission_text: 'To create an environment where children and families can thrive through psychosocial support, quality education, sustainable livelihood opportunities and essential legal assistance.',
      src_mission: 'Source: mialeyatumaini.org · Sourced · checked 25 Nov 2026',
      vision_kicker: 'Vision', vision_text: "Our vision statement is awaiting the organization's approval.",
      vision_label: "Draft, awaiting the organization's approval", badge_draft: 'Draft',
      badge_sourced: 'Sourced', badge_pending: 'Pending verification', badge_consent: 'Consent required',
      prog_title: 'Our programmes', prog_intro: 'Six programmes for children and families.',
      p1n: 'Feeding', p1d: 'Daily hot meals for school-going children.',
      p2n: 'Holiday', p2d: 'Life-skills activities during school holidays.',
      p3n: 'Empowerment Training', p3d: 'Practical skills for parents and guardians.',
      p4n: 'Parental Conversations', p4d: 'Forums for parents.',
      p5n: 'Home Visits', p5d: 'Assess family needs and arrange support.',
      p6n: 'Counseling', p6d: 'Sessions with trained professionals.',
      impact_title: 'Impact', impact_intro: 'Each figure is shown with its status. Figures without a record yet are shown, not hidden.',
      fig1_label: 'Meals a month', fig1_src: 'No underlying record supplied yet. Last checked 25 Nov 2026.',
      fig2_label: 'Children a day', fig2_src: 'No underlying record supplied yet. Last checked 25 Nov 2026.',
      fig3_label: 'Working since', fig3_src: 'Source: mialeyatumaini.org · Last checked 25 Nov 2026.',
      impact_note: 'Figures marked pending will be replaced or confirmed once a record is available.',
      story_title: 'A story',
      story_text: 'A family story is published here only after written guardian consent for website use is recorded. It is anonymized: no name, age or medical detail. Until then this section stays empty.',
      how_title: 'How we work',
      how1_t: 'Sourced figures', how1_d: 'We publish a figure only with its source and the date we checked it.',
      how2_t: 'Consent before photos', how2_d: 'No photograph is shown until consent is recorded for the person pictured and for website use.',
      how3_t: 'Data handling', how3_d: 'Personal data is handled under the Kenya Data Protection Act, 2019.',
      how4_t: 'Registration and governance', how4_d: 'We publish our registration and governance details once they are confirmed.',
      visit_title: 'Visit and contact', visit_phones: 'Phone', visit_email: 'Email', visit_social: 'Social', visit_places: 'Places',
      loc1: 'Junction of Mayor Road and Gataka Road, Kware',
      loc2: 'KenyaWorks Foundation, along Gataka Road',
      loc3: 'Project Ben, Gataka',
      comments_title: 'Leave a comment', comments_intro: 'Our staff read every comment before anything is shown publicly.',
      c_name_label: 'First name', c_name_help: 'Use your first name only. It is shown with your comment, so readers know who wrote it.',
      c_msg_label: 'Your comment', c_msg_help: 'Staff read your comment before it can be shown.',
      c_consent_label: 'I agree that my first name and comment may be shown on this site after staff approval.',
      c_consent_help: 'You can withdraw consent at any time by emailing us.',
      c_submit: 'Send comment',
      c_err_msg: 'Please write your comment.', c_err_consent: 'Please tick the consent box before sending.',
      c_notice: 'Comments are not connected yet, so nothing was sent. Please email us for now.',
      privacy_title: 'Privacy notice', privacy_pending: 'The full notice is awaiting legal review.',
      lbl_controller: 'Controller', lbl_purposes: 'Purposes', lbl_basis: 'Lawful basis',
      lbl_retention: 'Retention', lbl_rights: 'Your rights', lbl_contact: 'Contact',
      pv_controller: 'Data controller: Miale ya Tumaini, Kware, Ongata Rongai, Kenya.',
      pv_purposes: 'Responding to messages and publishing approved comments.',
      pv_basis: 'Your consent, for comments.',
      pv_retention: 'Retention period to be confirmed by the organization.',
      pv_rights: 'You may access, correct or delete your information.',
      pv_contact: 'Contact mialeyatumaini@gmail.com.',
      staff_label: 'Preview', staff_title: 'Staff moderation preview',
      staff_text: 'Not for public use. The backend is not connected, so nothing here is saved or sent.',
      staff_queue_title: 'Awaiting review (0)',
      staff_empty: 'No comments are waiting. Comments will appear here once the backend is connected.',
      staff_close: 'Close',
      footer_copy: '© 2026 Miale ya Tumaini. All rights reserved.', footer_privacy: 'Privacy',
      footer_staff: 'Staff preview', install_btn: 'Install app',
      ios_title: 'Add to Home Screen on iPhone', ios1: 'Open this site in Safari.',
      ios2: 'Tap the Share button.', ios3: 'Choose Add to Home Screen, then Add.'
    },
    sw: {
      skip: 'Ruka hadi kwenye maudhui', lang_label: 'Lugha', theme_label: 'Mandhari',
      theme_light: 'Angavu', theme_dark: 'Giza', theme_system: 'Mfumo',
      nav_work: 'Kazi zetu', nav_impact: 'Athari', nav_how: 'Jinsi tunavyofanya kazi', nav_visit: 'Tembelea',
      hero_eyebrow: 'Kware, Ongata Rongai, Kenya · Tunafanya kazi tangu 2014',
      hero_h1: 'Mazingira ambamo watoto na familia wanaweza kustawi.',
      hero_cta_contact: 'Wasiliana nasi', hero_cta_programmes: 'Tazama programu zetu',
      photo_placeholder: 'Picha itaonyeshwa hapa baada ya idhini ya mhusika na ya matumizi kurekodiwa.',
      mission_kicker: 'Dhamira',
      mission_text: 'Kuunda mazingira ambamo watoto na familia wanaweza kustawi kupitia msaada wa kisaikolojia, elimu bora, fursa endelevu za riziki na msaada muhimu wa kisheria.',
      src_mission: 'Chanzo: mialeyatumaini.org · Chanzo kimethibitishwa · Ilikaguliwa 25 Nov 2026',
      vision_kicker: 'Maono', vision_text: 'Taarifa ya maono inasubiri idhini ya shirika.',
      vision_label: 'Rasimu, inasubiri idhini ya shirika', badge_draft: 'Rasimu',
      badge_sourced: 'Chanzo kimethibitishwa', badge_pending: 'Inasubiri uthibitisho', badge_consent: 'Idhini inahitajika',
      prog_title: 'Programu zetu', prog_intro: 'Programu sita kwa watoto na familia.',
      p1n: 'Lishe', p1d: 'Milo ya moto ya kila siku kwa watoto wanaosoma shuleni.',
      p2n: 'Likizo', p2d: 'Shughuli za stadi za maisha wakati wa likizo za shule.',
      p3n: 'Mafunzo ya Uwezeshaji', p3d: 'Stadi za vitendo kwa wazazi na walezi.',
      p4n: 'Mazungumzo ya Wazazi', p4d: 'Majukwaa ya mazungumzo kwa wazazi.',
      p5n: 'Ziara za Nyumbani', p5d: 'Kutathmini mahitaji ya familia na kupanga msaada.',
      p6n: 'Ushauri', p6d: 'Vikao na wataalamu waliofunzwa.',
      impact_title: 'Athari', impact_intro: 'Takwimu zinaonyeshwa pamoja na hali yake. Takwimu zisizo na rekodi bado zinaonyeshwa, hazifichwi.',
      fig1_label: 'Milo kwa mwezi', fig1_src: 'Rekodi ya chanzo haijawasilishwa bado. Ilikaguliwa 25 Nov 2026.',
      fig2_label: 'Watoto kila siku', fig2_src: 'Rekodi ya chanzo haijawasilishwa bado. Ilikaguliwa 25 Nov 2026.',
      fig3_label: 'Tangu 2014', fig3_src: 'Chanzo: mialeyatumaini.org · Ilikaguliwa 25 Nov 2026.',
      impact_note: 'Takwimu zinazosubiri uthibitisho zitabadilishwa au kuthibitishwa mara rekodi itakapopatikana.',
      story_title: 'Hadithi',
      story_text: 'Hadithi ya familia itachapishwa hapa tu baada ya idhini ya maandishi ya mlezi kwa matumizi ya tovuti kurekodiwa. Itaficha jina, umri na taarifa za afya. Hadi hapo sehemu hii itabaki tupu.',
      how_title: 'Jinsi tunavyofanya kazi',
      how1_t: 'Takwimu zenye chanzo', how1_d: 'Tunachapisha takwimu pamoja na chanzo chake na tarehe tulipokikagua.',
      how2_t: 'Idhini kabla ya picha', how2_d: 'Hakuna picha itakayoonyeshwa kabla ya idhini ya mhusika na ya matumizi ya tovuti.',
      how3_t: 'Data chini ya Sheria ya Ulinzi wa Data, 2019', how3_d: 'Tunashughulikia taarifa binafsi kwa mujibu wa Sheria ya Ulinzi wa Data ya Kenya, 2019.',
      how4_t: 'Usajili na utawala', how4_d: 'Tutachapisha maelezo ya usajili na utawala mara yatakapothibitishwa.',
      visit_title: 'Tembelea na wasiliana nasi', visit_phones: 'Simu', visit_email: 'Barua pepe', visit_social: 'Mitandao ya kijamii', visit_places: 'Maeneo',
      loc1: 'Makutano ya Mayor Road na Gataka Road, Kware',
      loc2: 'KenyaWorks Foundation, kando ya Gataka Road',
      loc3: 'Project Ben, Gataka',
      comments_title: 'Acha maoni', comments_intro: 'Wafanyakazi wetu husoma kila maoni kabla hayajaonyeshwa hadharani.',
      c_name_label: 'Jina la kwanza', c_name_help: 'Tumia jina lako la kwanza tu. Linaonyeshwa pamoja na maoni yako.',
      c_msg_label: 'Maoni yako', c_msg_help: 'Wafanyakazi husoma maoni yako kabla hayajaonyeshwa.',
      c_consent_label: 'Nakubali jina langu la kwanza na maoni yangu yaonyeshwe kwenye tovuti hii baada ya wafanyakazi kuidhinisha.',
      c_consent_help: 'Unaweza kuondoa idhini yako wakati wowote kwa kutuandikia barua pepe.',
      c_submit: 'Tuma maoni',
      c_err_msg: 'Tafadhali andika maoni yako.', c_err_consent: 'Tafadhali kubali kabla ya kutuma.',
      c_notice: 'Maoni hayajaunganishwa bado, kwa hiyo hakuna kilichotumwa. Tafadhali tutumie barua pepe kwa sasa.',
      privacy_title: 'Taarifa ya faragha', privacy_pending: 'Taarifa kamili inasubiri mapitio ya kisheria.',
      lbl_controller: 'Mdhibiti', lbl_purposes: 'Madhumuni', lbl_basis: 'Msingi wa kisheria',
      lbl_retention: 'Muda wa kuhifadhi', lbl_rights: 'Haki zako', lbl_contact: 'Mawasiliano',
      pv_controller: 'Mdhibiti wa data: Miale ya Tumaini, Kware, Ongata Rongai, Kenya.',
      pv_purposes: 'Kujibu ujumbe na kuchapisha maoni yaliyoidhinishwa.',
      pv_basis: 'Idhini yako, kwa maoni.',
      pv_retention: 'Muda wa kuhifadhi utathibitishwa na shirika.',
      pv_rights: 'Una haki ya kupata, kurekebisha au kufuta taarifa zako.',
      pv_contact: 'Wasiliana na mialeyatumaini@gmail.com.',
      staff_label: 'Hakiki', staff_title: 'Hakiki ya usimamizi wa maoni',
      staff_text: 'Si kwa matumizi ya umma. Hifadhidata haijaunganishwa, kwa hiyo hakuna kinachohifadhiwa au kutumwa hapa.',
      staff_queue_title: 'Yanasubiri mapitio (0)',
      staff_empty: 'Hakuna maoni yanayosubiri. Yataonekana hapa mara hifadhidata itakapounganishwa.',
      staff_close: 'Funga',
      footer_copy: '© 2026 Miale ya Tumaini. Haki zote zimehifadhiwa.', footer_privacy: 'Faragha',
      footer_staff: 'Hakiki ya wafanyakazi', install_btn: 'Sakinisha programu',
      ios_title: 'Ongeza kwenye skrini ya kwanza kwenye iPhone', ios1: 'Fungua tovuti hii kwenye Safari.',
      ios2: 'Gusa kitufe cha Shiriki.', ios3: 'Chagua Ongeza kwenye Skrini ya Kwanza, kisha Ongeza.'
    }
  };

  var VALID_LANGS = ['en', 'sw'];
  var VALID_THEMES = ['light', 'dark', 'system'];

  /* ---------- Guarded storage: the site works when storage is blocked ---------- */
  var storage = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (err) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (err) { /* blocked: choice lasts this visit only */ }
    }
  };


  /* ---------- Language ---------- */
  function translate(key, lang) {
    var table = DICT[lang] || DICT.en;
    return table[key] !== undefined ? table[key] : DICT.en[key];
  }

  function applyLanguage(lang) {
    if (VALID_LANGS.indexOf(lang) === -1) { lang = 'en'; }
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var text = translate(el.getAttribute('data-i18n'), lang);
      if (text !== undefined) { el.textContent = text; }
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', translate(el.getAttribute('data-i18n-aria'), lang));
    });
    document.querySelectorAll('[data-lang-set]').forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-lang-set') === lang ? 'true' : 'false');
    });
    storage.set('miale-lang', lang);
  }

  function resolveLanguage() {
    var fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (VALID_LANGS.indexOf(fromUrl) !== -1) { return fromUrl; }
    var stored = storage.get('miale-lang');
    return VALID_LANGS.indexOf(stored) !== -1 ? stored : 'en';
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    if (VALID_THEMES.indexOf(theme) === -1) { theme = 'system'; }
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-set]').forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-theme-set') === theme ? 'true' : 'false');
    });
    storage.set('miale-theme', theme);
  }

  /* ---------- Header blur after the hero ---------- */
  function setupHeaderBlur() {
    var header = document.querySelector('.site-header');
    var hero = document.querySelector('.hero');
    if (!header || !hero) { return; }
    function update() {
      var threshold = hero.offsetTop + hero.offsetHeight - 80;
      header.classList.toggle('is-scrolled', window.scrollY > threshold);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Reveals ---------- */
  function setupReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Comment form: validation, linked errors, no data stored ---------- */
  function setupCommentForm() {
    var form = document.getElementById('comment-form');
    if (!form) { return; }
    var message = document.getElementById('c-msg');
    var msgError = document.getElementById('c-msg-error');
    var consent = document.getElementById('c-consent');
    var consentError = document.getElementById('c-consent-error');
    var status = document.getElementById('comment-status');

    function showError(input, errorEl, text) {
      errorEl.textContent = text;
      errorEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    }
    function clearError(input, errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
      input.removeAttribute('aria-invalid');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var lang = document.documentElement.getAttribute('lang') || 'en';
      var valid = true;
      if (message.value.trim() === '') {
        showError(message, msgError, translate('c_err_msg', lang));
        valid = false;
      } else { clearError(message, msgError); }
      if (!consent.checked) {
        showError(consent, consentError, translate('c_err_consent', lang));
        valid = false;
      } else { clearError(consent, consentError); }
      if (!valid) {
        var first = consent.checked ? message : consent;
        first.focus();
        return;
      }
      /* Backend not connected: nothing is stored or sent. Be honest about that. */
      status.textContent = translate('c_notice', lang);
      status.hidden = false;
      form.reset();
    });
  }

  /* ---------- Staff preview dialog (hidden route: #staff) ---------- */
  function setupStaffDialog() {
    var dialog = document.getElementById('staff-dialog');
    if (!dialog) { return; }
    function openDialog() {
      if (dialog.open) { return; }
      if (typeof dialog.showModal === 'function') { dialog.showModal(); }
      else { dialog.setAttribute('open', ''); }
      dialog.querySelector('[data-close-dialog]').focus();
    }
    function closeDialog() {
      if (typeof dialog.close === 'function') { dialog.close(); }
      else { dialog.removeAttribute('open'); }
    }
    document.querySelectorAll('[data-open-staff]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        openDialog();
        history.replaceState(null, '', '#staff');
      });
    });
    dialog.querySelectorAll('[data-close-dialog]').forEach(function (button) {
      button.addEventListener('click', closeDialog);
    });
    dialog.addEventListener('close', function () {
      if (window.location.hash === '#staff') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
    function syncWithHash() {
      if (window.location.hash === '#staff') { openDialog(); }
    }
    window.addEventListener('hashchange', syncWithHash);
    syncWithHash();
  }

  /* ---------- Install prompt (Android and desktop Chromium) ---------- */
  function setupInstall() {
    var button = document.getElementById('install-btn');
    var deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
      if (button) { button.hidden = false; }
    });
    if (!button) { return; }
    button.addEventListener('click', function () {
      if (!deferredPrompt) { return; }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        button.hidden = true;
      }).catch(function () {
        deferredPrompt = null;
        button.hidden = true;
      });
    });
    window.addEventListener('appinstalled', function () { button.hidden = true; });
  }

  /* ---------- Service worker: offline fallback, guarded ---------- */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) { return; }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') { return; }
    navigator.serviceWorker.register('sw.js').catch(function () {
      /* Offline support unavailable; the site still works online. */
    });
  }

  /* ---------- Start ---------- */
  function start() {
    var lang = resolveLanguage();
    var theme = storage.get('miale-theme') || 'system';
    applyTheme(theme);
    applyLanguage(lang);

    document.querySelectorAll('[data-lang-set]').forEach(function (button) {
      button.addEventListener('click', function () { applyLanguage(button.getAttribute('data-lang-set')); });
    });
    document.querySelectorAll('[data-theme-set]').forEach(function (button) {
      button.addEventListener('click', function () { applyTheme(button.getAttribute('data-theme-set')); });
    });

    setupHeaderBlur();
    setupReveals();
    setupCommentForm();
    setupStaffDialog();
    setupInstall();
    registerServiceWorker();
  }

  try { start(); } catch (err) {
    /* Last resort: show the static English page rather than a broken one. */
    document.documentElement.classList.remove('js');
  }
})();
