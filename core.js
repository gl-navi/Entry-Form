/* GL-Navi Recruit Form Core v1.0.0
 * Hosted form factory that powers every recruit entry form on Studio.
 * Usage: EntryForm.create({...config...});
 */
(function(global) {
  'use strict';

  var VERSION = '1.0.0';

  // ============================================================
  // STYLES
  // ============================================================
  var SHADOW_CSS = `
:host{--input-bg:rgb(161,239,255);--input-border:2px solid #FFFFFF;--font-family:'Zen Kaku Gothic New',sans-serif;--primary-color:#0078d7;--placeholder-color:#283593;--error-color:#ff9090;--success-color:#388e3c}
*{box-sizing:border-box;margin:0;padding:0}
#entry_entryForm{font-family:var(--font-family)!important;font-weight:bold!important}
.form-row{display:flex;flex-wrap:wrap;margin-bottom:20px;row-gap:20px;column-gap:25px;align-items:flex-start}
.form-group{flex:1 1 250px;margin-bottom:15px;display:flex;flex-direction:column}
label{display:block;margin-bottom:8px;font-weight:600;color:#fff}
.required-label::after{content:"*";color:var(--error-color);margin-left:4px}
input,select{width:100%;padding:10px 12px;border:var(--input-border);border-radius:4px;background-color:var(--input-bg);transition:background-color .3s ease,border-color .3s ease;font-size:16px;font-family:var(--font-family);font-weight:bold;line-height:1.5}
select{color:var(--placeholder-color)}
input:focus{background:#dddddd!important;outline:none;box-shadow:0 0 0 3px rgba(0,120,215,.2)}
select:focus{outline:none;box-shadow:0 0 0 3px rgba(0,120,215,.2);border-color:var(--primary-color)}
input:hover,input:focus:hover{background:#EEEEEE!important}
input::placeholder,input::-webkit-input-placeholder,input::-moz-placeholder{opacity:.5;color:var(--placeholder-color);font-weight:bold;font-family:var(--font-family)}
.file-input-container{position:relative;overflow:hidden;display:inline-block;width:100%}
.file-input-label{display:flex;align-items:center;justify-content:center;padding:10px 20px;border:var(--input-border);border-radius:4px;background-color:var(--input-bg);color:var(--placeholder-color);cursor:pointer;transition:background-color .2s,transform .1s;text-align:center;width:100%;user-select:none;margin:0;height:47.2px}
.file-input-label:hover{background-color:#005a9e}
.file-input-label:active{transform:translateY(1px)}
.file-input{position:absolute;left:0;top:0;opacity:0;cursor:pointer;width:100%;height:100%;z-index:1}
.file-name{margin-top:8px;font-size:14px;color:#fff;font-weight:normal;word-break:break-all}
.checkbox-group{display:flex;align-items:center;justify-content:center;margin:50px 0 40px 0;flex-wrap:nowrap}
.checkbox-input{width:auto;margin-right:10px;transform:scale(1.5);transform-origin:50% 60%;cursor:pointer}
#entry_privacyPolicyLabel{margin:0}
#entry_privacy_policy_link,#entry_privacy_policy_link:visited{color:#44D8F1;text-decoration:underline;transition:color .2s}
#entry_privacy_policy_link:hover{color:#7ae5ff}
#entry_privacy_policy_link:focus{outline:2px solid #44D8F1;outline-offset:2px}
#entry_privacyPolicyError{text-align:center}
.submit-btn{background:linear-gradient(106deg,#49fff1 0%,#0062e9 100%);transition:transform .4s cubic-bezier(.4,.4,0,1),background .3s;color:#fff;font-weight:bold;border:none;padding:24px 24px;font-size:16px;border-radius:4px;cursor:pointer;display:block;margin:30px auto 0;width:100%;max-width:300px;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.submit-btn:hover{transform:scale(1.05,1.05)}
.submit-btn:focus{outline:none;box-shadow:0 0 0 3px rgba(73,255,241,.5)}
.submit-btn:disabled{background:linear-gradient(106deg,#b9e6e0 0%,#99b7d4 100%);cursor:not-allowed;transform:none}
.error-message{color:var(--error-color);font-size:14px;margin-top:5px;display:none;font-weight:500}
input:focus-visible,select:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
`;

  var HOST_CSS = `
@media(min-width:1139px){#entry_form-container{max-width:600px;width:100%}}
@media(min-width:704px) and (max-width:1139px){#entry_form-container{width:100%}#form_text{font-size:16px}}
@media(max-width:704px) and (min-width:541px){#entry_form-container{width:300px}#form_text{font-size:12px}}
@media(max-width:540px){#entry_form-container{width:100%}.submit-btn{width:100%}}
@media(hover:none){.submit-btn:hover{transform:none}}
@media(-ms-high-contrast:active),(-ms-high-contrast:none){.submit-btn{background:#0062e9}}
`;

  // ============================================================
  // CONSTANTS
  // ============================================================
  var ALLOWED_FILE_FORMATS = [
    { ext: '.pdf',  mime: 'application/pdf' },
    { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { ext: '.xls',  mime: 'application/vnd.ms-excel' },
    { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { ext: '.doc',  mime: 'application/msword' }
  ];
  var MAX_FILE_SIZE = 10 * 1024 * 1024;
  var EMAIL_REGEX_MARKETO = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  var EMAIL_REGEX_SF = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  var PHONE_REGEX_MARKETO = /^([0-9()+. \t-])+(\s?(x|ext|extension)\s?([0-9()])+)?$/;
  var PHONE_REGEX_SF = /^(\+?[0-9\s\-\(\)]{8,20})$/;
  var PRIVACY_POLICY_URL = 'https://recruit.gl-navi.co.jp/privacypolicy';
  var FALLBACK_EMAIL = 'saiyou@gl-navi.co.jp';
  var DEFAULT_ERROR_LOG = 'https://eoimhkgidqcxp6a.m.pipedream.net';
  var FETCH_TIMEOUT_MS = 60000;
  var MARKETO_MAX_WAIT_MS = 5000;
  var MARKETO_SUBMIT_TIMEOUT_MS = 3000;

  // Shared business data — exposed so per-form configs can reference them.
  var OCCUPATIONS = {
    is: 'インサイドセールス',
    fs: 'フィールドセールス',
    fs_expert: 'フィールドセールス・エクスパート',
    jw_sales: 'Japan Wingセールス',
    jw_instructor: 'Japan Wing講師',
    c_entry: 'DXコンサルタント・エントリーレベル',
    c: 'DXコンサルタント',
    c_expert: 'DXコンサルタント・エクスパート',
    ds: 'データサイエンティスト',
    cf: 'コーポレートファンクション',
    designer: 'Brand / UIUX Designer（ジュニア〜ミドル）'
  };
  var RECORD_TYPES = {
    hq: '中途本社レコードタイプ',
    consultant: '中途コンサルレコードタイプ',
    con: '中途コンサルレコードタイプ',
    honsya: '中途本社レコードタイプ',
    konsaru: '中途コンサルレコードタイプ',
    japanwing: 'JapanWingレコードタイプ',
    honsha: '中途本社レコードタイプ',
    consult: '中途コンサルレコードタイプ',
    jw: 'JapanWingレコードタイプ',
    designer: '中途本社レコードタイプ'
  };

  // ============================================================
  // FIELD CATALOG
  // ============================================================
  var FIELD_CATALOG = {
    lastName:     { type:'text', label:'姓', placeholder:'山田', required:true, maxLength:255, errorEmpty:'姓を入力してください' },
    firstName:    { type:'text', label:'名', placeholder:'太郎', required:true, maxLength:255, errorEmpty:'名を入力してください' },
    email:        { type:'email', label:'Eメール', placeholder:'mail@example.com', required:true, maxLength:255, validator:'email', errorEmpty:'Eメールを入力してください', errorInvalid:'有効なメールアドレスを入力してください' },
    emailConfirmation: { type:'email', label:'Eメール (再入力)', name:'email_confirmation', placeholder:'mail@example.com', required:true, maxLength:255, validator:'emailConfirmation', errorEmpty:'Eメールを再入力してください', errorInvalid:'一致するメールアドレスを入力してください' },
    phone:        { type:'tel', label:'電話番号', placeholder:'090-1234-5678', required:true, maxLength:255, validator:'phone', errorEmpty:'電話番号を入力してください', errorInvalid:'有効な電話番号を入力してください' },
    resume:       { type:'file', label:'履歴書', placeholder:'ファイルを選択', required:true, accept:ALLOWED_FILE_FORMATS, maxSize:MAX_FILE_SIZE, errorEmpty:'履歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）' },
    cv:           { type:'file', label:'職務経歴書', name:'CV', placeholder:'ファイルを選択', required:true, accept:ALLOWED_FILE_FORMATS, maxSize:MAX_FILE_SIZE, errorEmpty:'職務経歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）' },
    universityName:{type:'text', label:'大学名', placeholder:'○○大学', required:true, maxLength:255, errorEmpty:'大学名を入力してください' },
    faculty:      { type:'text', label:'学部', placeholder:'工学部', required:true, maxLength:255, errorEmpty:'学部を入力してください' },
    department:   { type:'text', label:'学科', placeholder:'情報工学科', required:true, maxLength:255, errorEmpty:'学科を入力してください' },
    graduationYear: { type:'number', label:'卒業年度', placeholder:function(){return String(new Date().getFullYear()-3);}, required:true, validator:'graduationYear', errorEmpty:'卒業年度を入力してください', errorInvalid:'有効な卒業年度を入力してください' },
    briefingDate: { type:'date', label:'説明会参加日', required:true, errorEmpty:'説明会参加日を入力してください' },
    briefingReport: { type:'file', label:'説明会感想文', placeholder:'ファイルを選択', required:true, accept:ALLOWED_FILE_FORMATS, maxSize:MAX_FILE_SIZE, errorEmpty:'説明会感想文をアップロードしてください（PDF、Excel、Word形式、10MB以下）' },
    desiredOccupation: { type:'select', label:'応募職種', required:true, errorEmpty:'応募職種を選択してください',
      options: [
        { value:'', label:'ご希望の職種を選択してください' },
        { value:'新卒・第二新卒 オープンポジション', label:'・新卒・第二新卒: オープンポジション' },
        { value:'インサイドセールス', label:'・インサイドセールス' },
        { value:'フィールドセールス', label:'・フィールドセールス' },
        { value:'フィールドセールス・エキスパート', label:'・フィールドセールス・エキスパート' },
        { value:'DXコンサルタント・エントリーレベル', label:'・DXコンサルタント・エントリーレベル' },
        { value:'DXコンサルタント', label:'・DXコンサルタント' },
        { value:'DXコンサルタント・エキスパート', label:'・DXコンサルタント・エキスパート' },
        { value:'データサイエンティスト', label:'・データサイエンティスト' },
        { value:'コーポレートファンクション', label:'・コーポレートファンクション' },
        { value:'Brand / UIUX Designer（ジュニア〜ミドル）', label:'・Brand / UIUX Designer（ジュニア〜ミドル）' }
      ]
    }
  };

  // ============================================================
  // VALIDATORS  (return null if valid, else error message string)
  // ============================================================
  function vText(v, def) {
    if (def.required && (!v || !String(v).trim())) return def.errorEmpty || (def.label + 'を入力してください');
    if (v && def.maxLength && String(v).length > def.maxLength) return (def.label || '入力') + 'を' + def.maxLength + '文字以内で入力してください';
    return null;
  }
  function vEmail(v, def) {
    var e = vText(v, def); if (e) return e;
    if (!v) return null;
    if (!EMAIL_REGEX_MARKETO.test(v) || !EMAIL_REGEX_SF.test(v)) return def.errorInvalid;
    return null;
  }
  function vEmailConf(v, def, api) {
    var e = vText(v, def); if (e) return e;
    if (!v) return null;
    if (!EMAIL_REGEX_MARKETO.test(v)) return '有効なメールアドレスを入力してください';
    if (api.getValue('email') !== v) return '一致するメールアドレスを入力してください';
    return null;
  }
  function vPhone(v, def) {
    var e = vText(v, def); if (e) return e;
    if (!v) return null;
    if (v.replace(/[^0-9]/g,'').length < 8) return def.errorInvalid;
    if (!PHONE_REGEX_MARKETO.test(v) || !PHONE_REGEX_SF.test(v)) return def.errorInvalid;
    return null;
  }
  function vGradYear(v, def) {
    if (!def.required) return null;
    if (!v || !String(v).trim()) return def.errorEmpty;
    if (!/^\d+$/.test(String(v).trim())) return '有効な卒業年度を整数で入力してください';
    var y = parseInt(v, 10);
    var cur = new Date().getFullYear();
    if (y < 1950 || y > cur + 10) return def.errorInvalid;
    return null;
  }
  function vFile(file, def) {
    if (def.required && !file) return def.errorEmpty;
    if (!file) return null;
    if (file.size === 0) return 'ファイルが空です。有効なファイルをアップロードしてください';
    if (def.maxSize && file.size > def.maxSize) return 'ファイルサイズは' + Math.round(def.maxSize/1024/1024) + 'MB以下にしてください';
    var fname = file.name.toLowerCase();
    var ok = (def.accept || ALLOWED_FILE_FORMATS).some(function(f){return fname.endsWith(f.ext) || file.type === f.mime;});
    if (!ok) return '許可されているファイル形式：PDF、Excel、Word形式のみ';
    return null;
  }
  function vSelect(v, def) {
    if (def.required && !v) return def.errorEmpty;
    return null;
  }
  var VALIDATORS = {
    text:vText, email:vEmail, emailConfirmation:vEmailConf, phone:vPhone,
    graduationYear:vGradYear, file:vFile, select:vSelect, number:vText, date:vText, tel:vPhone
  };

  // ============================================================
  // HELPERS
  // ============================================================
  function escHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function collectFieldNames(layout){var n=[];layout.forEach(function(r){r.forEach(function(name){n.push(name);});});return n;}

  function getQueryParamValue(spec) {
    var value = spec.default || '';
    if (spec.pathSegment) {
      var segs = window.location.pathname.split('/').filter(Boolean);
      var last = segs[segs.length - 1] || '';
      var key = spec.transform === 'lowercase' ? last.toLowerCase() : last;
      if (key && spec.mapping && Object.prototype.hasOwnProperty.call(spec.mapping, key)) {
        value = spec.mapping[key];
      }
    }
    if (spec.queryParam) {
      var params = new URLSearchParams(window.location.search);
      var raw = params.get(spec.queryParam);
      if (raw != null && raw !== '') {
        var t = spec.transform === 'lowercase' ? raw.toLowerCase() : raw;
        if (spec.mapping) {
          if (Object.prototype.hasOwnProperty.call(spec.mapping, t)) value = spec.mapping[t];
        } else {
          value = t;
        }
      }
    }
    return value;
  }

  function logError(error, ctx) {
    try {
      var endpoint = (ctx && ctx.errorLogEndpoint) || DEFAULT_ERROR_LOG;
      var formPayload = {};
      if (ctx && ctx.formData) {
        ctx.formData.forEach(function(v, k){
          formPayload[k] = (v instanceof File) ? { filename:v.name, size:v.size, type:v.type } : v;
        });
      }
      var debug = {
        meta: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          screen: window.screen.width + 'x' + window.screen.height,
          formType: (ctx && ctx.formType) || 'unknown',
          coreVersion: VERSION
        },
        error: {
          name: error.name || 'Unknown',
          message: error.message || '',
          status: error.status || 0,
          stack: error.stack || ''
        },
        formSubmission: formPayload
      };
      var body = JSON.stringify(debug);
      // sendBeacon survives ad blockers and tab close better than fetch
      if (navigator.sendBeacon) {
        try {
          var blob = new Blob([body], { type: 'application/json' });
          if (navigator.sendBeacon(endpoint, blob)) return;
        } catch (e) {}
      }
      fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:body, keepalive:true })
        .catch(function(e){ console.warn('[EntryForm] log fail:', e); });
    } catch (e) { console.warn('[EntryForm] logError fail:', e); }
  }

  async function fetchWithRetry(url, options, retries, timeoutMs) {
    retries = retries == null ? 2 : retries;
    timeoutMs = timeoutMs || FETCH_TIMEOUT_MS;
    var controller = new AbortController();
    var to = setTimeout(function(){ controller.abort(); }, timeoutMs);
    try {
      var res = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
      clearTimeout(to);
      return res;
    } catch (err) {
      clearTimeout(to);
      if (err.name === 'AbortError') {
        var t = new Error('Request timed out'); t.name = 'TimeoutError'; throw t;
      }
      // Don't retry timeouts (would re-upload large files); only retry network failures
      if (retries > 0) {
        await new Promise(function(r){ setTimeout(r, 1000); });
        return fetchWithRetry(url, options, retries - 1, timeoutMs);
      }
      throw err;
    }
  }

  // ============================================================
  // RENDERER
  // ============================================================
  function renderField(name, def) {
    var id = 'entry_' + name;
    var n = def.name || name;
    var req = def.required ? 'required aria-required="true"' : '';
    var labelClass = def.required ? 'required-label' : '';
    var ph = typeof def.placeholder === 'function' ? def.placeholder() : (def.placeholder || '');
    if (def.type === 'file') {
      return '<div class="form-group" data-field="'+name+'">'+
        '<label for="'+id+'" class="'+labelClass+'" id="'+id+'Label">'+escHtml(def.label)+'</label>'+
        '<div class="file-input-container">'+
          '<label for="'+id+'" class="file-input-label" id="'+id+'FileName">'+escHtml(ph || 'ファイルを選択')+'</label>'+
          '<input type="file" id="'+id+'" name="'+n+'" class="file-input" '+req+'>'+
        '</div>'+
        '<div class="error-message" id="'+id+'Error">'+escHtml(def.errorEmpty || '')+'</div>'+
      '</div>';
    }
    if (def.type === 'select') {
      var opts = (def.options || []).map(function(o){
        return '<option value="'+escHtml(o.value)+'">'+escHtml(o.label)+'</option>';
      }).join('');
      return '<div class="form-group" data-field="'+name+'">'+
        '<label for="'+id+'" class="'+labelClass+'" id="'+id+'Label">'+escHtml(def.label)+'</label>'+
        '<select id="'+id+'" name="'+n+'" '+req+'>'+opts+'</select>'+
        '<div class="error-message" id="'+id+'Error">'+escHtml(def.errorEmpty || '')+'</div>'+
      '</div>';
    }
    var ml = def.maxLength ? ' maxlength="'+def.maxLength+'"' : '';
    return '<div class="form-group" data-field="'+name+'">'+
      '<label for="'+id+'" class="'+labelClass+'" id="'+id+'Label">'+escHtml(def.label)+'</label>'+
      '<input type="'+def.type+'" id="'+id+'" name="'+n+'" '+req+' placeholder="'+escHtml(ph)+'"'+ml+'>'+
      '<div class="error-message" id="'+id+'Error">'+escHtml(def.errorEmpty || '')+'</div>'+
    '</div>';
  }

  // ============================================================
  // FACTORY
  // ============================================================
  function create(config) {
    try { _create(config); }
    catch (err) {
      console.error('[EntryForm] init failed:', err);
      logError(err, { formType: config && config.formType });
    }
  }

  function _create(config) {
    if (!config || !config.layout || !config.endpoint || !config.successUrl) {
      throw new Error('EntryForm.create: layout, endpoint, successUrl required');
    }
    var targetSel = config.target || '#for_form';
    var oldDiv = document.querySelector(targetSel);
    if (!oldDiv) { console.error('[EntryForm] target not found:', targetSel); return; }

    // Container + shadow DOM
    var container = document.createElement('div');
    container.id = 'entry_form-container';
    oldDiv.replaceWith(container);
    var shadow = container.attachShadow({ mode: 'open' });

    var s1 = document.createElement('style'); s1.textContent = SHADOW_CSS; shadow.appendChild(s1);
    var s2 = document.createElement('style'); s2.textContent = HOST_CSS; container.appendChild(s2);

    // Build field defs (catalog + overrides)
    var fieldNames = collectFieldNames(config.layout);
    var fieldDefs = {};
    fieldNames.forEach(function(name){
      var base = FIELD_CATALOG[name];
      if (!base) throw new Error('Unknown field: ' + name);
      fieldDefs[name] = Object.assign({}, base, (config.fieldOverrides || {})[name] || {});
    });

    // Render form
    var rowsHtml = config.layout.map(function(row){
      return '<div class="form-row">' + row.map(function(name){
        return renderField(name, fieldDefs[name]);
      }).join('') + '</div>';
    }).join('');

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<form id="entry_entryForm" novalidate enctype="multipart/form-data" accept-charset="utf-8" class="notranslate">' +
        rowsHtml +
        '<div class="checkbox-group">' +
          '<input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true">' +
          '<label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">採用選考に関する<a target="_blank" href="' + PRIVACY_POLICY_URL + '" id="entry_privacy_policy_link" rel="noopener">プライバシーポリシー</a>に同意する</label>' +
        '</div>' +
        '<div class="error-message" id="entry_privacyPolicyError">プライバシーポリシーに同意する必要があります</div>' +
        '<input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">' +
        '<button type="submit" id="entry_submitBtn" class="submit-btn">エントリー</button>' +
      '</form>';
    shadow.appendChild(wrap);

    var form = shadow.getElementById('entry_entryForm');
    var sbmtBtn = shadow.getElementById('entry_submitBtn');
    var ppCheckbox = shadow.getElementById('entry_privacyPolicy');
    var ppTimestamp = shadow.getElementById('entry_privacyPolicyTimestamp');

    // Hidden fields from URL
    if (config.queryParams) {
      Object.keys(config.queryParams).forEach(function(key){
        var value = getQueryParamValue(config.queryParams[key]);
        if (value) {
          var input = document.createElement('input');
          input.type = 'hidden'; input.name = key; input.id = 'entry_' + key; input.value = value;
          form.appendChild(input);
        }
      });
    }

    // ============= Public API for callbacks =============
    var meta = {};
    var api = {
      getValue: function(name){
        var el = shadow.getElementById('entry_' + name);
        if (!el) return undefined;
        if (el.type === 'checkbox') return el.checked;
        if (el.type === 'file') return el.files && el.files[0];
        return el.value;
      },
      setValue: function(name, val){
        var el = shadow.getElementById('entry_' + name);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!val; else el.value = val == null ? '' : val;
      },
      setRequired: function(name, req){
        var el = shadow.getElementById('entry_' + name);
        var lbl = shadow.getElementById('entry_' + name + 'Label');
        if (el) {
          el.required = !!req;
          if (req) el.setAttribute('aria-required', 'true'); else el.removeAttribute('aria-required');
        }
        if (lbl) {
          if (req) lbl.classList.add('required-label'); else lbl.classList.remove('required-label');
        }
        if (fieldDefs[name]) fieldDefs[name].required = !!req;
      },
      setVisible: function(name, vis){
        var g = shadow.querySelector('[data-field="' + name + '"]');
        if (g) g.style.display = vis ? '' : 'none';
        if (!vis) {
          var er = shadow.getElementById('entry_' + name + 'Error');
          if (er) { er.setAttribute('style','display:none !important;'); er.setAttribute('aria-hidden','true'); }
        }
      },
      setMeta: function(k, v){ meta[k] = v; },
      getMeta: function(k){ return meta[k]; }
    };

    // Apply initially hidden fields
    if (config.initiallyHidden) {
      config.initiallyHidden.forEach(function(name){
        api.setVisible(name, false);
        api.setRequired(name, false);
      });
    }

    // ============= Validation helpers =============
    function showErr(name, msg){
      var er = shadow.getElementById('entry_' + name + 'Error');
      if (!er) return;
      if (msg) er.textContent = msg;
      er.setAttribute('style', 'display:block !important;');
      er.setAttribute('aria-hidden', 'false');
    }
    function hideErr(name){
      var er = shadow.getElementById('entry_' + name + 'Error');
      if (!er) return;
      er.setAttribute('style', 'display:none !important;');
      er.setAttribute('aria-hidden', 'true');
    }
    function clearAllErrs(){
      shadow.querySelectorAll('.error-message').forEach(function(e){
        e.setAttribute('style','display:none !important;');
        e.setAttribute('aria-hidden','true');
      });
    }
    function isVisible(name){
      var g = shadow.querySelector('[data-field="' + name + '"]');
      return g ? g.style.display !== 'none' : true;
    }
    function validateOne(name){
      var def = fieldDefs[name];
      if (!def || !isVisible(name)) return true;
      var validator = VALIDATORS[def.validator] || VALIDATORS[def.type] || VALIDATORS.text;
      var value = (def.type === 'file') ? api.getValue(name) : api.getValue(name);
      var err = validator(value, def, api);
      if (err) { showErr(name, err); return false; }
      hideErr(name); return true;
    }
    function validatePrivacy(){
      if (!ppCheckbox.checked) { showErr('privacyPolicy', 'プライバシーポリシーに同意する必要があります'); return false; }
      hideErr('privacyPolicy'); return true;
    }

    // ============= Wire up event listeners =============
    fieldNames.forEach(function(name){
      var el = shadow.getElementById('entry_' + name);
      if (!el) return;
      var def = fieldDefs[name];

      if (def.type === 'file') {
        var nameLbl = shadow.getElementById('entry_' + name + 'FileName');
        el.addEventListener('change', function(){
          if (this.files && this.files.length > 0) {
            nameLbl.textContent = this.files[0].name;
            nameLbl.style.fontWeight = 'bold';
          } else {
            nameLbl.textContent = '選択されていません';
          }
          validateOne(name);
          if (config.onChange) try { config.onChange(name, this.files[0], api); } catch(e){console.warn(e);}
        });
      } else if (def.type === 'select') {
        el.addEventListener('change', function(){
          validateOne(name);
          if (config.onChange) try { config.onChange(name, this.value, api); } catch(e){console.warn(e);}
        });
      } else {
        el.addEventListener('blur', function(){ validateOne(name); });
        el.addEventListener('change', function(){
          if (config.onChange) try { config.onChange(name, this.value, api); } catch(e){console.warn(e);}
        });
      }
    });

    ppCheckbox.addEventListener('change', function(){
      ppTimestamp.value = this.checked ? new Date().toISOString() : '';
    });
    ppCheckbox.addEventListener('blur', validatePrivacy);

    // ============= Marketo init =============
    var mktoFormEl = null;
    var mktoEnabled = !!config.marketo;
    if (mktoEnabled) {
      sbmtBtn.disabled = true;
      sbmtBtn.textContent = '読込中...';
      var deadline = Date.now() + MARKETO_MAX_WAIT_MS;
      var initMkto = function(){
        if (typeof MktoForms2 !== 'undefined') {
          MktoForms2.whenReady(function(f){
            mktoFormEl = f;
            sbmtBtn.disabled = false;
            sbmtBtn.textContent = 'エントリー';
          });
        } else if (Date.now() < deadline) {
          setTimeout(initMkto, 100);
        } else {
          console.warn('[EntryForm] Marketo did not load. Continuing without it.');
          mktoFormEl = null;
          sbmtBtn.disabled = false;
          sbmtBtn.textContent = 'エントリー';
        }
      };
      initMkto();
    }

    // ============= Submit pipeline =============
    var submitting = false;
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      if (submitting) return;
      clearAllErrs();
      var ok = true;
      fieldNames.forEach(function(n){ if (!validateOne(n)) ok = false; });
      if (!validatePrivacy()) ok = false;
      if (!ok) return;

      submitting = true;
      setSubmitting(true);

      var formData = new FormData(form);
      // Rename uploaded files to safe names
      var entries = []; formData.forEach(function(v,k){entries.push([k,v]);});
      entries.forEach(function(p){
        var v = p[1];
        if (v instanceof File && v.name) {
          var ext = v.name.split('.').pop();
          formData.set(p[0], new File([v], 'upload-' + Date.now() + '.' + ext, { type: v.type }));
        }
      });

      // GA4 ping
      if (typeof gtag === 'function') {
        try { gtag('event', 'form_submit_attempt', { event_category:'Application', event_label: config.gaEventLabel || config.formType || 'Form' }); } catch(e){}
      }

      fetchWithRetry(config.endpoint, { method: 'POST', body: formData })
        .then(function(res){
          if (!res.ok) {
            return res.json().catch(function(){ return res.text(); }).then(function(d){
              var e = new Error(res.statusText || 'Request failed');
              e.status = res.status; e.data = d; throw e;
            });
          }
          // Marketo step
          if (!mktoEnabled || !mktoFormEl) return null;
          return new Promise(function(resolve){
            var to = setTimeout(function(){
              console.warn('[EntryForm] Marketo timed out');
              resolve();
            }, MARKETO_SUBMIT_TIMEOUT_MS);
            try {
              var dataObj = fdToObj(formData);
              var mktoVals = {};
              var fields = (config.marketo && config.marketo.fields) || {};
              Object.keys(fields).forEach(function(mk){
                var spec = fields[mk];
                if (typeof spec === 'function') mktoVals[mk] = spec(dataObj, api);
                else if (typeof spec === 'string') mktoVals[mk] = formData.get(spec) || '';
                else mktoVals[mk] = spec;
              });
              mktoFormEl.onSuccess(function(){ clearTimeout(to); resolve(); return false; });
              mktoFormEl.setValues(mktoVals);
              mktoFormEl.submit();
            } catch (e) {
              console.warn('[EntryForm] Marketo submit error:', e);
              clearTimeout(to); resolve();
            }
          });
        })
        .then(function(){
          form.reset();
          shadow.querySelectorAll('.file-input-label').forEach(function(l){
            var g = l.closest('[data-field]');
            if (g) {
              var fn = g.getAttribute('data-field');
              var ph = fieldDefs[fn] && fieldDefs[fn].placeholder;
              l.textContent = (typeof ph === 'function' ? ph() : ph) || 'ファイルを選択';
              l.style.fontWeight = '';
            }
          });
          window.location.href = config.successUrl;
        })
        .catch(function(error){
          submitting = false;
          console.error('[EntryForm] submission error:', error);
          handleSubmitError(error, formData);
          setSubmitting(false);
        });
    });

    function setSubmitting(b){
      form.querySelectorAll('input, button, select').forEach(function(i){ i.disabled = b; });
      sbmtBtn.disabled = b;
      sbmtBtn.textContent = b ? '送信中...' : 'エントリー';
    }
    function fdToObj(fd){ var o={}; fd.forEach(function(v,k){o[k]=v;}); return o; }

    function handleSubmitError(error, formData) {
      var dataObj = fdToObj(formData);
      var isBlocking = !error.status && (error.name === 'TypeError' || error.name === 'TimeoutError');
      var msg;
      if (isBlocking) {
        msg = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
      } else {
        msg = 'システムエラーが発生しました。';
        if (error.data) for (var k in error.data) msg += '\n・' + error.data[k];
      }
      try { alert(msg); } catch(e){}
      if (isBlocking) showMailtoFallback(dataObj);
      logError(error, { formType: config.formType, formData: formData, errorLogEndpoint: config.errorLogEndpoint });
    }

    function showMailtoFallback(dataObj) {
      if (shadow.querySelector('[data-mailto-fallback]')) return;
      var fb = config.emailFallback || {};
      var to = fb.to || FALLBACK_EMAIL;
      var subj, body;
      try {
        subj = (typeof fb.subject === 'function') ? fb.subject(dataObj, api) : (fb.subject || ('採用応募 (フォームエラー)'));
        body = (typeof fb.body === 'function') ? fb.body(dataObj, api) : (fb.body || defaultEmailBody(dataObj));
      } catch(e) {
        subj = '採用応募 (フォームエラー)'; body = defaultEmailBody(dataObj);
      }
      var div = document.createElement('div');
      div.setAttribute('data-mailto-fallback', '1');
      div.style.cssText = 'margin:20px 0;padding:15px;background:#fff3cd;border:1px solid #ffeeba;color:#856404;border-radius:4px;';
      div.innerHTML =
        '<p style="margin-bottom:10px;font-weight:bold;">送信できませんでした。</p>' +
        '<p>1．別の端末から再度お試しください。</p>' +
        '<p>2．解決しない場合は、お手数ですが、' + escHtml(to) + '宛に、必要書類を添付の上直接メールをお送りください。</p>' +
        '<p style="margin-top:5px;">※以下のボタンからもメールソフトを起動できます。</p>' +
        '<a href="mailto:' + escHtml(to) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) + '" style="display:inline-block;margin-top:3px;padding:10px 20px;background:#d9534f;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">メールで応募する</a>';
      form.parentNode.prepend(div);
      div.scrollIntoView({ behavior:'smooth', block:'center', inline:'nearest' });
    }

    function defaultEmailBody(dataObj){
      var lines = [];
      Object.keys(dataObj).forEach(function(k){
        if (k === 'privacyPolicy' || k === 'privacyPolicyTimestamp') return;
        var def = fieldDefs[k];
        var label = def && def.label ? def.label : k;
        var v = dataObj[k];
        if (v instanceof File) { if (v.size === 0) return; v = '(添付：' + v.name + ')'; }
        if (v) lines.push('■' + label + '\n' + v);
      });
      return '採用担当者様\n\nフォーム送信時にエラーが発生したため、メールにて応募いたします。\n\n' +
             '--------------------------------------------------\n' +
             lines.join('\n\n') + '\n' +
             '--------------------------------------------------\n\n' +
             '※必要書類を添付いたしました。\nご確認のほどよろしくお願いいたします。';
    }
  }

  // ============================================================
  // EXPORT
  // ============================================================
  global.EntryForm = {
    create: create,
    FIELD_CATALOG: FIELD_CATALOG,
    OCCUPATIONS: OCCUPATIONS,
    RECORD_TYPES: RECORD_TYPES,
    version: VERSION
  };
})(typeof window !== 'undefined' ? window : this);
