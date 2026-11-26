/* Miale ya Tumaini · supabase-client.js
   Every database call goes through window.MTDB. If config.js is not filled in, MTDB.on is false
   and the site falls back to browser storage, so nothing breaks before the project exists. */
(function () {
  'use strict';
  var cfg = window.MT_CONFIG || {};
  var ready = !!(window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey && !/YOUR-/.test(cfg.supabaseUrl + cfg.supabaseAnonKey));
  var sb = ready ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
  var BUCKET = 'media';

  function ok(res) { if (res && res.error) throw res.error; return res ? res.data : null; }
  function deviceId() { return window.MT ? MT.deviceId() : 'unknown'; }

  var DB = {
    on: ready,
    client: sb,

    /* admin account: created on the first visit, then sign-in */
    adminExists: function () { return sb.rpc('admin_exists').then(ok); },
    signUp: function (email, password) { return sb.auth.signUp({ email: email, password: password }).then(ok); },
    signIn: function (email, password) { return sb.auth.signInWithPassword({ email: email, password: password }).then(ok); },
    signOut: function () { return sb.auth.signOut(); },
    claimAdmin: function () { return sb.rpc('claim_admin').then(ok); },
    isAdmin: function () {
      return sb.auth.getSession().then(function (r) {
        if (!r.data || !r.data.session) return false;
        return sb.rpc('is_admin').then(ok);
      });
    },

    /* site content and settings: one JSON row ('content') */
    loadContent: function () { return sb.from('site_settings').select('value').eq('key', 'content').maybeSingle().then(ok).then(function (r) { return r ? r.value : null; }); },
    saveContent: function (value) { return sb.from('site_settings').upsert({ key: 'content', value: value, updated_at: new Date().toISOString() }, { onConflict: 'key' }).then(ok); },

    /* comments: visitors insert (unapproved), the public reads approved ones, admins approve and delete */
    submitComment: function (c) {
      return sb.from('comments').insert({ name: c.name || null, message: c.message, signature: c.signature || null, consent: true, approved: false }).then(ok);
    },
    listComments: function (all) {
      /* signatures are for admins only: the public query leaves that column out */
      var cols = all ? 'id,name,message,signature,approved,created_at' : 'id,name,message,approved,created_at';
      var q = sb.from('comments').select(cols).order('created_at', { ascending: false }).limit(300);
      if (!all) q = q.eq('approved', true);
      return q.then(ok);
    },
    setCommentApproved: function (id, approved) { return sb.from('comments').update({ approved: approved, approved_at: approved ? new Date().toISOString() : null }).eq('id', id).then(ok); },
    deleteComment: function (id) { return sb.from('comments').delete().eq('id', id).then(ok); },

    /* anonymous analytics: events (clicks), visits and visitor preferences */
    track: function (kind, detail) { if (!sb) return; sb.from('events').insert({ kind: String(kind).slice(0, 30), detail: String(detail || '').slice(0, 200), device_hash: deviceId() }).then(function () {}, function () {}); },
    visit: function (kind, lang) { if (!sb) return; sb.from('visits').insert({ device_hash: deviceId(), device_kind: kind, lang: lang }).then(function () {}, function () {}); },
    savePrefs: function (prefs) { if (!sb) return; sb.from('visitor_prefs').insert({ device_hash: deviceId(), prefs: prefs }).then(function () {}, function () {}); },
    stats: function () {
      return Promise.all([
        sb.from('visits').select('device_hash,device_kind,lang,created_at').order('created_at', { ascending: false }).limit(5000).then(ok),
        sb.from('events').select('kind,detail,device_hash,created_at').order('created_at', { ascending: false }).limit(5000).then(ok)
      ]).then(function (r) {
        return {
          visits: r[0].map(function (v) { return { t: Date.parse(v.created_at), dev: v.device_kind, id: v.device_hash, lang: v.lang }; }),
          events: r[1].map(function (e) { return { t: Date.parse(e.created_at), k: e.kind, d: e.detail || '' }; })
        };
      });
    },

    /* media: files in the 'media' storage bucket, metadata in the media table */
    listMedia: function () { return sb.from('media').select('*').order('created_at', { ascending: true }).then(ok); },
    publicUrl: function (path) { return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; },
    uploadFile: function (path, blob) { return sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'application/octet-stream', upsert: false }).then(ok); },
    removeFile: function (path) { return sb.storage.from(BUCKET).remove([path]).then(ok); },
    insertMedia: function (row) { return sb.from('media').insert(row).select().single().then(ok); },
    updateMedia: function (id, patch) { return sb.from('media').update(patch).eq('id', id).then(ok); },
    deleteMedia: function (id) { return sb.from('media').delete().eq('id', id).then(ok); },
    incrementPlays: function (id) { if (sb) sb.rpc('increment_plays', { p_id: id }).then(function () {}, function () {}); }
  };
  window.MTDB = DB;
})();
