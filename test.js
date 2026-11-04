/*
 * GL Navi — unified entry form (shadow DOM, static asset).
 *
 * Pick the form BEFORE this script loads, on the page:
 *     <div id="for_form"></div>
 *     <script>window.ENTRY_FORM_TYPE = 'newgrad_after';</script>
 *     <script src="https://gl-navi.github.io/Entry-Form/test.js"></script>
 * (or <script src="..." data-form="newgrad_after"></script>,
 *  or, as a last resort, ?form=newgrad_after in the page URL — the two above win if set)
 *
 * ENTRY_FORM_TYPE:
 *     newgrad_before | newgrad_after | midcareer_before | midcareer_after | hp | internship
 *
 * Optional, for testing — window.ENTRY_FORM_OVERRIDES = {
 *     pipedreamUrl, errorLogUrl, successUrl, fallbackEmail
 * }
 */
(function () {
    'use strict';

    // ============================================================
    // SUBMIT DESTINATIONS — every Pipedream URL for every form, in one place.
    // (Pipedream workflow → Salesforce. Edit here only.)
    // ============================================================
    const ENDPOINTS = {
        newgrad_before:   'https://glnavigation.app.n8n.cloud/webhook-test/recruit-newgrad-before',
        newgrad_after:    'https://glnavigation.app.n8n.cloud/webhook-test/recruit-newgrad-after',
        midcareer_before: 'https://glnavigation.app.n8n.cloud/webhook-test/recruit-midcareer-entry',
        midcareer_after:  'https://glnavigation.app.n8n.cloud/webhook-test/recruit-midcareer-casual',
        hp:               'https://glnavigation.app.n8n.cloud/webhook-test/recruit-hp-form',
        internship:       'https://glnavigation.app.n8n.cloud/webhook-test/recruit-internship',
        errorLog:         'https://eoimhkgidqcxp6a.m.pipedream.net' // failure reports, shared by every form
    };

    // ============================================================
    // 0. WHICH FORM?  (fail loudly — never guess a destination)
    // ============================================================
    // Precedence: window.ENTRY_FORM_TYPE > <script data-form> > ?form= in the page URL.
    // (?form= is only honoured if it matches a key in FORMS below.)
    const scriptEl = document.currentScript;
    let queryForm = '';
    try { queryForm = (new URLSearchParams(window.location.search).get('form') || '').trim().toLowerCase(); } catch (e) { /* ignore */ }
    let FORM_TYPE = String(
        window.ENTRY_FORM_TYPE || (scriptEl && scriptEl.dataset && scriptEl.dataset.form) || ''
    ).trim();
    let formSource = FORM_TYPE ? 'global/data-form' : '';
    if (!FORM_TYPE && queryForm) { FORM_TYPE = queryForm; formSource = '?form='; }

        const COMMON = {
        errorLogUrl: ENDPOINTS.errorLog,
        successUrl: 'https://recruit.gl-navi.co.jp/apply/successful',
        fallbackEmail: 'saiyou@gl-navi.co.jp',
        privacyUrl: 'https://recruit.gl-navi.co.jp/privacypolicy'
    };

    // ============================================================
    // 1. FIELD LIBRARY
    //    kind: text | email | emailConfirm | phone | year | date | select | file
    // ============================================================
    const TOOLTIP_EMAIL = 'ご登録の媒体と同じメールアドレスをご記入ください';
    const DOC_FILE = {
        max: 10, maxLabel: '10MB',
        formats: [
            ['.pdf', 'application/pdf'],
            ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            ['.xls', 'application/vnd.ms-excel'],
            ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            ['.doc', 'application/msword']
        ],
        formatMsg: '許可されているファイル形式：PDF、Excel、Word形式のみ'
    };
    const TEXT_FILE = {
        max: 5, maxLabel: '5MB',
        formats: [
            ['.pdf', 'application/pdf'],
            ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            ['.doc', 'application/msword'],
            ['.txt', 'text/plain'],
            ['.text', 'text/plain']
        ],
        textExts: ['.txt', '.text'],
        formatMsg: '許可されているファイル形式：PDF、Text、Word形式のみ'
    };

    const f = {
        lastName:  { name: 'lastName', kind: 'text', label: '姓', placeholder: '山田', required: true },
        firstName: { name: 'firstName', kind: 'text', label: '名', placeholder: '太郎/花子', required: true },
        email: (tooltip) => ({
            name: 'email', kind: 'email', label: 'Eメール', type: 'email', placeholder: 'mail@example.com',
            required: true, emptyMsg: '有効なメールアドレスを入力してください', tooltip: tooltip ? TOOLTIP_EMAIL : ''
        }),
        emailConfirm: {
            name: 'email_confirmation', kind: 'emailConfirm', label: 'Eメール (再入力)', type: 'email',
            placeholder: 'mail@example.com', required: true, errId: 'entry_emailConfirmationError',
            emptyMsg: '一致するメールアドレスを入力してください'
        },
        phone: {
            name: 'phone', kind: 'phone', label: '電話番号', type: 'tel', placeholder: '090-1234-5678',
            required: true, emptyMsg: '有効な電話番号を入力してください'
        },
        resume: {
            name: 'resume', kind: 'file', label: '履歴書', required: true, rule: DOC_FILE,
            nameId: 'entry_fileName', emptyMsg: '履歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）'
        },
        CV: (o) => Object.assign({
            name: 'CV', kind: 'file', label: '職務経歴書', required: true, rule: DOC_FILE,
            nameId: 'entry_CVfileName', emptyMsg: '職務経歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）'
        }, o || {}),
        comment: {
            name: 'comment', kind: 'file', label: '説明会感想文', required: true, rule: TEXT_FILE,
            nameId: 'entry_commentfileName', emptyMsg: '感想文をアップロードしてください（PDF、TXT、Word形式、5MB以下）'
        },
        school: {
            name: 'school', kind: 'text', label: '学校名', placeholder: '○○大学、○○大学院', required: true
        },
        department: { name: 'department', kind: 'text', label: '学部名', placeholder: '○○学部', required: false },
        faculty:    { name: 'faculty', kind: 'text', label: '学科名', placeholder: '○○学科', required: false },
        graduationYear: (o) => Object.assign({
            name: 'graduationYear', kind: 'year', label: '卒業年度', type: 'number', placeholder: '2023',
            required: true, emptyMsg: '卒業年度を入力してください'
        }, o || {}),
        eventDate: {
            name: 'eventDate', kind: 'date', label: '説明会参加日', type: 'date', required: true, emptyMsg: ''
        }
    };

    // ---- shared mail-body helpers (error fallback "mailto:") ----
    const MAIL_RULE = '--------------------------------------------------';
    function mailBody(fd, intro, items, outro) {
        const lines = ['採用担当者様', '', intro, '', MAIL_RULE];
        items.forEach(function (it) { lines.push('■' + it[0], String(fd.get(it[1]) || ''), ''); });
        lines.pop();
        lines.push(MAIL_RULE, '', outro);
        return lines.join('\n');
    }
    const INTRO = 'フォーム送信時にエラーが発生したため、メールにて応募いたします。';
    const NAME = ['氏名', '__name'];     // special: lastName + firstName (handled in mail())
    const IT = { phone: ['電話番号', 'phone'], email: ['Email', 'email'], grad: ['卒業年度', 'graduationYear'],
        school: ['学校名', 'school'], dept: ['学部名', 'department'], fac: ['学科名', 'faculty'],
        event: ['説明会参加日', 'eventDate'], occ: ['応募職種', 'desiredOccupation'] };

    function mail(subject, intro, items, outro) {
        return function (fd) {
            const wrapped = { get: function (k) {
                return k === '__name' ? (fd.get('lastName') || '') + ' ' + (fd.get('firstName') || '') : fd.get(k);
            } };
            return { subject: subject, body: mailBody(wrapped, intro, items, outro) };
        };
    }

    // ============================================================
    // 2. LEGACY URL ROUTING TABLES (mid-career links)
    //    NOTE: before/after intentionally keep their own record-type keys.
    // ============================================================
    const OCCUPATIONS_MID = {
        "is": "インサイドセールス", "fs": "フィールドセールス", "fs_expert": "フィールドセールス・エキスパート",
        "c_entry": "DXコンサルタント・エントリーレベル", "c": "DXコンサルタント", "c_expert": "DXコンサルタント・エキスパート",
        "ds": "データサイエンティスト", "cf": "コーポレートファンクション",
        "designer": "Brand / UIUX Designer（ジュニア〜ミドル）"
    };
    const DESIGNER = "Brand / UIUX Designer（ジュニア〜ミドル）";
    const RECORD_TYPES_MID_BEFORE = {
        "h": "中途本社レコードタイプ", "c": "中途コンサルレコードタイプ", "j": "JapanWingレコードタイプ",
        "honsya": "中途本社レコードタイプ", "konsaru": "中途コンサルレコードタイプ", "japanwing": "JapanWingレコードタイプ",
        "honsha": "中途本社レコードタイプ", "consult": "中途コンサルレコードタイプ", "jw": "JapanWingレコードタイプ",
        "designer": "中途本社レコードタイプ"
    };
    const RECORD_TYPES_MID_AFTER = {
        "hq": "中途本社レコードタイプ", "consultant": "中途コンサルレコードタイプ", "con": "中途コンサルレコードタイプ",
        "honsya": "中途本社レコードタイプ", "konsaru": "中途コンサルレコードタイプ", "japanwing": "JapanWingレコードタイプ",
        "honsha": "中途本社レコードタイプ", "consult": "中途コンサルレコードタイプ", "jw": "JapanWingレコードタイプ",
        "designer": "中途本社レコードタイプ"
    };
    // Frozen (links made before 2026-10). Do NOT add entries; new sources use the exact picklist value.
    const LEGACY_SOURCE_CODES = {
        indeed: "Indeed", rikunavihrtech: "リクナビHRTech", rcc: "RCC", pasona: "パソナ", green: "Green",
        nikkei: "日経", hp: "ホームページ", miraiworks: "みらいワークス", type: "type",
        tokyojf: "東京都Jobfair", other: "その他"
    };

    // ============================================================
    // 3. FORM CONFIGS — everything that differs between forms lives here
    //   pipedreamUrl   Pipedream → Salesforce workflow (source of truth)
    //   submitLabel    button text
    //   rows           field layout (2 per row)
    //   marketo        { recordtype | recordtypeFromApplicant, graduation, when:'before'|'after', waitMs, gate }
    //   net            { retries, timeoutMs, retryNetwork }  (retryNetwork=false → TypeError/Abort are terminal)
    //   gtag           { label, beforeValidation, validEvent }
    //   routing        mid-career URL ?occupation= / last path segment / ?rt= / ?source=
    //   mail           (formData, ctx) -> { subject, body }
    // ============================================================
    const FORMS = {
        // ---------------- 新卒 説明会前 ----------------
        newgrad_before: {
            pipedreamUrl: ENDPOINTS.newgrad_before,
            submitLabel: '申し込み',
            rows: [
                [f.lastName, f.firstName],
                [f.email(true), f.emailConfirm],
                [f.phone, f.graduationYear()]
            ],
            marketo: { recordtype: '応募者_新卒', graduation: true, when: 'after', waitMs: 1500, maxLoadMs: 5000 },
            net: { retries: 1, timeoutMs: 15000, retryNetwork: false },
            gtag: { label: 'New Grad Form' },
            attachNote: false,
            mail: mail('新卒採用説明会申し込み (フォームエラー)',
                'フォーム送信時にエラーが発生したため、メールにて説明会に応募いたします。',
                [NAME, IT.phone, IT.email, IT.grad],
                'ご確認のほどよろしくお願いいたします。')
        },

        // ---------------- 新卒 説明会後 ----------------
        newgrad_after: {
            pipedreamUrl: ENDPOINTS.newgrad_after,
            submitLabel: 'エントリー',
            rows: [
                [f.lastName, f.firstName],
                [f.email(true), f.emailConfirm],
                [f.phone, f.resume],
                [f.school, f.department],
                [f.faculty, f.graduationYear()],
                [f.eventDate, f.comment]
            ],
            marketo: { recordtype: '応募者_新卒', graduation: true, when: 'after', waitMs: 1500, maxLoadMs: 8000 },
            net: { retries: 2, timeoutMs: 20000, retryNetwork: false },
            gtag: { label: 'New Grad Form', beforeValidation: true, validEvent: true },
            attachNote: true,
            mail: mail('新卒採用応募 (フォームエラー)', INTRO,
                [NAME, IT.phone, IT.email, IT.grad, IT.school, IT.dept, IT.fac, IT.event],
                '※履歴書・ポートフォリオを添付いたしました。\nご確認のほどよろしくお願いいたします。')
        },

        // ---------------- 中途 カジュアル面談前 ----------------
        midcareer_before: {
            pipedreamUrl: ENDPOINTS.midcareer_before,
            submitLabel: '申し込み',
            rows: [
                [f.lastName, f.firstName],
                [f.email(false), f.emailConfirm],
                [f.phone]
            ],
            marketo: { recordtype: '応募者_中途', when: 'after', waitMs: 500, maxLoadMs: 5000 },
            net: { retries: 3, timeoutMs: 30000, retryNetwork: true },
            gtag: { label: 'New Grad Form' },
            attachNote: false,
            routing: { occupations: OCCUPATIONS_MID, recordTypes: RECORD_TYPES_MID_BEFORE,
                       defaultRecordType: '中途コンサルレコードタイプ', designerRedirect: 'https://recruit.gl-navi.co.jp/' },
            mail: mail('中途採用応募 (フォームエラー)', INTRO,
                [NAME, IT.phone, IT.email],
                'ご確認のほどよろしくお願いいたします。')
        },

        // ---------------- 中途 カジュアル面談後 ----------------
        midcareer_after: {
            pipedreamUrl: ENDPOINTS.midcareer_after,
            submitLabel: 'エントリー',
            rows: [
                [f.lastName, f.firstName],
                [f.email(false), f.emailConfirm],
                [f.phone, f.resume],
                [f.CV()]
            ],
            marketo: { recordtype: '応募者_中途', when: 'before', waitMs: 0, maxLoadMs: 8000 },
            net: { retries: 1, timeoutMs: 10000, retryNetwork: true },
            gtag: { label: 'New Grad Form' },
            attachNote: true,
            routing: { occupations: OCCUPATIONS_MID, recordTypes: RECORD_TYPES_MID_AFTER,
                       defaultRecordType: '中途コンサルレコードタイプ', rtParam: true, sourceParam: true },
            mail: mail('中途採用応募 (フォームエラー)', INTRO,
                [NAME, IT.phone, IT.email],
                '※履歴書・ポートフォリオを添付いたしました。\nご確認のほどよろしくお願いいたします。')
        },

        // ---------------- ホームページ流入 (新卒・中途) ----------------
        hp: {
            pipedreamUrl: ENDPOINTS.hp,
            submitLabel: 'エントリー',
            rows: [
                [f.lastName, f.firstName],
                [f.email(false), f.emailConfirm],
                [f.phone, {
                    name: 'desiredOccupation', kind: 'select', label: '応募職種', required: true,
                    placeholderOption: 'ご希望の職種を選択してください', emptyMsg: '応募職種を選択してください',
                    options: [
                        '新卒・第二新卒 オープンポジション', 'インサイドセールス', 'フィールドセールス',
                        'フィールドセールス・エキスパート', 'DXコンサルタント・エントリーレベル', 'DXコンサルタント',
                        'DXコンサルタント・エキスパート', 'データサイエンティスト', 'コーポレートファンクション',
                        'Brand / UIUX Designer(ジュニア〜ミドル)'
                    ]
                }],
                [f.resume, f.CV({ required: false, label: '職務経歴書 (中途の方のみ)' })],
                [f.graduationYear({ required: false, label: '卒業年度 (学生の方のみ)', hidden: true })]
            ],
            // 新卒オープンポジション → 履歴書のみ + 卒業年度, それ以外 → 履歴書 + 職務経歴書
            applicant: { newgradValue: '新卒・第二新卒 オープンポジション', newgradType: '応募者_新卒', otherType: '応募者_中途' },
            marketo: { recordtypeFromApplicant: true, graduation: true, when: 'after', waitMs: 3000, maxLoadMs: 5000, gate: true },
            net: { retries: 3, timeoutMs: 60000, retryNetwork: true },
            gtag: { label: 'New Grad Form' },
            attachNote: true,
            storeErrorsLocally: true,
            mail: function (fd, ctx) {
                const newgrad = ctx.applicantType === '応募者_新卒';
                return newgrad
                    ? mail('新卒採用応募 (フォームエラー)', INTRO,
                        [NAME, IT.phone, IT.email, IT.grad, IT.occ],
                        '※履歴書を添付いたしました。\nご確認のほどよろしくお願いいたします。')(fd)
                    : mail('中途採用応募 (フォームエラー)', INTRO,
                        [NAME, IT.phone, IT.email, IT.occ],
                        '※履歴書・ポートフォリオを添付いたしました。\nご確認のほどよろしくお願いいたします。')(fd);
            }
        },

        // ---------------- インターン応募 ----------------
        internship: {
            pipedreamUrl: ENDPOINTS.internship,
            submitLabel: 'エントリー',
            rows: [
                [f.lastName, f.firstName],
                [f.email(false), f.emailConfirm],
                [f.phone, f.resume],
                [f.school, f.department],
                [f.faculty, f.graduationYear()]
            ],
            marketo: { recordtype: '応募者_新卒', graduation: true, when: 'after', waitMs: 1500, maxLoadMs: 8000 },
            net: { retries: 2, timeoutMs: 20000, retryNetwork: false },
            gtag: { label: 'New Grad Form', beforeValidation: true, validEvent: true },
            attachNote: true,
            mail: mail('新卒採用応募 (フォームエラー)', INTRO,
                [NAME, IT.phone, IT.email, IT.grad, IT.school, IT.dept, IT.fac],
                '※履歴書・ポートフォリオを添付いたしました。\nご確認のほどよろしくお願いいたします。')
        }
    };

    const cfg = Object.prototype.hasOwnProperty.call(FORMS, FORM_TYPE) ? FORMS[FORM_TYPE] : null; // own keys only (?form=constructor must not match)
    if (!cfg) {
        console.error('[entry-form] form type is "' + FORM_TYPE + '"' + (formSource ? ' (from ' + formSource + ')' : '') + '. Expected one of: ' +
            Object.keys(FORMS).join(', ') + '. Form not rendered.');
        return;
    }
    const OVR = (window.ENTRY_FORM_OVERRIDES && typeof window.ENTRY_FORM_OVERRIDES === 'object') ? window.ENTRY_FORM_OVERRIDES : {};
    const PIPEDREAM_URL = OVR.pipedreamUrl || cfg.pipedreamUrl;
    const ERROR_URL = OVR.errorLogUrl || COMMON.errorLogUrl;
    const SUCCESS_URL = OVR.successUrl || COMMON.successUrl;
    const FALLBACK_EMAIL = OVR.fallbackEmail || COMMON.fallbackEmail;

    // ============================================================
    // 4. URL ROUTING (mid-career only) — may redirect, so run before touching the DOM
    // ============================================================
    let occupation = '';
    let recordType = '';
    let sourcePlatform = '';
    if (cfg.routing) {
        const R = cfg.routing;
        const own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
        recordType = R.defaultRecordType;
        const segs = window.location.pathname.split('/').filter(Boolean);
        const last = segs[segs.length - 1];
        if (last && own(R.recordTypes, last)) recordType = R.recordTypes[last];
        if (window.location.search) {
            const params = new URLSearchParams(window.location.search);
            const occ = params.get('occupation');
            if (occ && own(R.occupations, occ.toLowerCase())) {
                occupation = R.occupations[occ.toLowerCase()];
                if (R.designerRedirect && occupation === DESIGNER) {
                    window.location.href = R.designerRedirect;
                    return;
                }
            }
            if (R.rtParam) {
                const rt = params.get('rt');
                if (rt && own(R.recordTypes, rt.toLowerCase())) recordType = R.recordTypes[rt.toLowerCase()];
            }
            if (R.sourceParam) {
                const src = (params.get('source') || '').trim().slice(0, 255);
                sourcePlatform = own(LEGACY_SOURCE_CODES, src.toLowerCase()) ? LEGACY_SOURCE_CODES[src.toLowerCase()] : src;
            }
        }
    }

    // ============================================================
    // 5. CONTAINER + SHADOW ROOT
    // ============================================================
    const oldDiv = document.getElementById('for_form');
    if (!oldDiv) {
        console.error('[entry-form] Target div #for_form not found! Aborting form setup.');
        return;
    }
    const containerEl = document.createElement('div');
    containerEl.id = 'entry_form-container';
    if (oldDiv.className) containerEl.className = oldDiv.className;
    oldDiv.replaceWith(containerEl);
    const shadow = containerEl.attachShadow({ mode: 'open' });

    const styleElement = document.createElement('style');
    styleElement.textContent = `:host {
            --input-bg: rgb(161, 239, 255);
            --input-border: 2px solid #FFFFFF;
            --font-family: 'Zen Kaku Gothic New', sans-serif;
            --primary-color: #0078d7;
            --placeholder-color: #283593;
            --error-color: #ff9090;
            --success-color: #388e3c;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        #entry_entryForm { font-family: var(--font-family) !important; font-weight: bold !important; }
        .form-row { display: flex; flex-wrap: wrap; margin-bottom: 20px; row-gap: 20px; column-gap: 25px; align-items: flex-start; }
        .form-group { flex: 1 1 250px; margin-bottom: 15px; display: flex; flex-direction: column; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #ffffff; }
        .required-label::after { content: "*"; color: var(--error-color); margin-left: 4px; }
        .label-with-tooltip { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .label-with-tooltip > label { margin-bottom: 0; }
        .tooltip-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 15px; height: 15px; background-color: #95aaaf; color: white; border-radius: 50%; font-size: 15.4px; font-weight: bold; user-select: none; }
        .tooltip-icon::after { content: attr(data-tooltip); position: absolute; bottom: 125%; left: 50%; transform: translateX(calc(-50% + 50px)); background-color: #333; color: #fff; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: normal; white-space: nowrap; z-index: 10; visibility: hidden; opacity: 0; transition: opacity 0.3s ease, visibility 0.3s ease; pointer-events: none; }
        .tooltip-icon::before { content: ''; position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%) translateY(100%); border-width: 5px; border-style: solid; border-color: #333 transparent transparent transparent; visibility: hidden; opacity: 0; transition: opacity 0.3s ease, visibility 0.3s ease; z-index: 11; pointer-events: none; }
        .tooltip-icon:hover::after, .tooltip-icon:hover::before { visibility: visible; opacity: 1; }
        input, select { width: 100%; padding: 10px 12px; border: var(--input-border); border-radius: 4px; background-color: var(--input-bg); transition: background-color 0.3s ease, border-color 0.3s ease; font-size: 16px; font-family: var(--font-family); font-weight: bold; line-height: 1.5; }
        input:focus, select:focus { background: #dddddd !important; outline: none; box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2); }
        input:hover, input:focus:hover { background: #EEEEEE !important; }
        input::placeholder { opacity: 0.5; color: var(--placeholder-color); font-weight: bold; font-family: var(--font-family); }
        input::-webkit-input-placeholder { opacity: 0.5; color: var(--placeholder-color); font-weight: bold; font-family: var(--font-family); }
        input::-moz-placeholder { opacity: 0.5; color: var(--placeholder-color); font-weight: bold; font-family: var(--font-family); }
        .file-input-container { position: relative; overflow: hidden; display: inline-block; width: 100%; }
        .file-input-label { display: flex; align-items: center; justify-content: center; padding: 10px 20px; border: var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--placeholder-color); cursor: pointer; transition: background-color 0.2s, transform 0.1s; text-align: center; width: 100%; user-select: none; margin: 0; height: 47.2px; }
        .file-input-label:hover { background-color: #005a9e; }
        .file-input-label:active { transform: translateY(1px); }
        .file-input { position: absolute; left: 0; top: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 1; }
        .file-name { margin-top: 8px; font-size: 14px; color: #ffffff; font-weight: normal; word-break: break-all; }
        .checkbox-group { display: flex; align-items: center; justify-content: center; margin: 50px 0 40px 0; flex-wrap: nowrap; }
        .checkbox-input { width: auto; margin-right: 10px; transform: scale(1.5); transform-origin: 50% 60%; cursor: pointer; }
        #entry_privacyPolicyLabel { margin: 0; }
        #entry_privacy_policy_link, #entry_privacy_policy_link:visited { color: #44D8F1; text-decoration: underline; transition: color 0.2s; }
        #entry_privacy_policy_link:hover { color: #7ae5ff; }
        #entry_privacy_policy_link:focus { outline: 2px solid #44D8F1; outline-offset: 2px; }
        #entry_privacyPolicyError { text-align: center; }
        .submit-btn { background: linear-gradient(106deg, #49fff1 0%, #0062e9 100%); transition: transform 0.4s cubic-bezier(.4,.4,0,1), background 0.3s; color: white; font-weight: bold; border: none; padding: 24px 24px; font-size: 16px; border-radius: 4px; cursor: pointer; display: block; margin: 30px auto 0; width: 100%; max-width: 300px; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .submit-btn:hover { transform: scale(1.05, 1.05); }
        .submit-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(73, 255, 241, 0.5); }
        .submit-btn:disabled { background: linear-gradient(106deg, #b9e6e0 0%, #99b7d4 100%); cursor: not-allowed; transform: none; }
        .error-message { color: var(--error-color); font-size: 14px; margin-top: 5px; display: none; font-weight: 500; }
        input:focus-visible, select:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }`;
    shadow.appendChild(styleElement);

    const mediaQuery = document.createElement('style');
    mediaQuery.textContent = `@media (min-width: 1139px) { #entry_form-container { max-width: 600px; width: 100%; } }
        @media (min-width: 704px) and (max-width: 1139px) { #entry_form-container { width: 100%; } #form_text { font-size: 16px; } }
        @media (max-width: 704px) and (min-width: 541px) { #entry_form-container { width: 300px; } #form_text { font-size: 12px; } }
        @media (max-width: 540px) { #entry_form-container { width: 100%; } .submit-btn { width: 100%; } }
        @media (hover: none) { .submit-btn:hover { transform: none; } }
        @media (-ms-high-contrast: active), (-ms-high-contrast: none) { .submit-btn { background: #0062e9; } }`;
    containerEl.appendChild(mediaQuery);

    // ============================================================
    // 6. RENDER (DOM API; no user data ever goes through innerHTML)
    // ============================================================
    const allFields = [];
    cfg.rows.forEach(function (row) { row.forEach(function (s) { allFields.push(s); }); });
    allFields.forEach(function (s) {
        s.id = 'entry_' + s.name;
        s.errId = s.errId || (s.id + 'Error');
    });
    const spec = {};
    allFields.forEach(function (s) { spec[s.name] = s; });
    const hasFiles = allFields.some(function (s) { return s.kind === 'file'; });

    function el(tag, attrs, text) {
        const e = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
        if (text != null) e.textContent = text;
        return e;
    }

    function buildGroup(s) {
        const group = el('div', { 'class': 'form-group' });
        group.id = s.id + 'Group';
        if (s.hidden) group.style.display = 'none';

        const label = el('label', { 'for': s.id }, s.label);
        label.id = s.id + 'Label';
        if (s.required) label.className = 'required-label';

        if (s.tooltip) {
            const wrap = el('div', { 'class': 'label-with-tooltip' });
            wrap.appendChild(label);
            wrap.appendChild(el('span', { 'class': 'tooltip-icon', 'data-tooltip': s.tooltip }, 'i'));
            group.appendChild(wrap);
        } else {
            group.appendChild(label);
        }

        let input;
        if (s.kind === 'file') {
            const box = el('div', { 'class': 'file-input-container' });
            const nameLabel = el('label', { 'for': s.id, 'class': 'file-input-label', id: s.nameId }, 'ファイルを選択');
            input = el('input', { type: 'file', id: s.id, name: s.name, 'class': 'file-input' });
            box.appendChild(nameLabel);
            box.appendChild(input);
            group.appendChild(box);
        } else if (s.kind === 'select') {
            input = el('select', { id: s.id, name: s.name });
            input.appendChild(el('option', { value: '' }, s.placeholderOption));
            s.options.forEach(function (o) {
                const opt = el('option', { value: o }, '・' + o);
                input.appendChild(opt);
            });
            group.appendChild(input);
        } else {
            input = el('input', { type: s.type || 'text', id: s.id, name: s.name });
            if (s.placeholder) input.setAttribute('placeholder', s.placeholder);
            group.appendChild(input);
        }
        if (s.required) { input.required = true; input.setAttribute('aria-required', 'true'); }

        group.appendChild(el('div', { 'class': 'error-message', id: s.errId }, s.emptyMsg || ''));
        return group;
    }

    const formWrapper = el('div', { id: 'entry_form-wrapper' });
    const form = el('form', { id: 'entry_entryForm', novalidate: '', enctype: 'multipart/form-data',
        'accept-charset': 'utf-8', 'class': 'notranslate' });
    cfg.rows.forEach(function (row) {
        const r = el('div', { 'class': 'form-row' });
        row.forEach(function (s) { r.appendChild(buildGroup(s)); });
        form.appendChild(r);
    });

    const checkGroup = el('div', { 'class': 'checkbox-group' });
    const privacyPolicyCheckbox = el('input', { type: 'checkbox', id: 'entry_privacyPolicy', name: 'privacyPolicy',
        'class': 'checkbox-input', 'aria-required': 'true' });
    privacyPolicyCheckbox.required = true;
    const privacyLabel = el('label', { 'for': 'entry_privacyPolicy', id: 'entry_privacyPolicyLabel' }, '採用選考に関する');
    privacyLabel.appendChild(el('a', { target: '_blank', href: COMMON.privacyUrl, id: 'entry_privacy_policy_link',
        'data-has-link': 'true', rel: 'noopener noreferrer' }, 'プライバシーポリシー'));
    privacyLabel.appendChild(document.createTextNode('に同意する'));
    checkGroup.appendChild(privacyPolicyCheckbox);
    checkGroup.appendChild(privacyLabel);
    form.appendChild(checkGroup);
    form.appendChild(el('div', { 'class': 'error-message', id: 'entry_privacyPolicyError' }, 'プライバシーポリシーに同意する必要があります'));
    const privacyPolicyTimestampField = el('input', { type: 'hidden', id: 'entry_privacyPolicyTimestamp',
        name: 'privacyPolicyTimestamp', value: '' });
    form.appendChild(privacyPolicyTimestampField);
    const sbmtBtn = el('button', { type: 'submit', id: 'entry_submitBtn', 'class': 'submit-btn' }, cfg.submitLabel);
    form.appendChild(sbmtBtn);
    formWrapper.appendChild(form);
    shadow.appendChild(formWrapper);

    const $ = function (id) { return shadow.getElementById(id); };

    // graduation-year placeholder: next year
    allFields.forEach(function (s) {
        if (s.kind === 'year') $(s.id).placeholder = String(new Date().getFullYear() + 1);
    });

    // ============================================================
    // 7. ERROR UI HELPERS
    // ============================================================
    function showError(errorId, message) {
        const e = $(errorId);
        if (!e) return;
        if (message) e.textContent = message;
        e.setAttribute('style', 'display: block !important;');
        e.setAttribute('aria-hidden', 'false');
    }
    function hideError(errorId) {
        const e = $(errorId);
        if (!e) return;
        e.setAttribute('style', 'display: none !important;');
        e.setAttribute('aria-hidden', 'true');
    }
    function clearAllErrors() {
        shadow.querySelectorAll('.error-message').forEach(function (e) {
            e.setAttribute('style', 'display: none !important;');
            e.setAttribute('aria-hidden', 'true');
        });
    }

    // ============================================================
    // 8. VALIDATORS (all honour the input's *current* `required`)
    // ============================================================
    const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const PHONE_MARKETO = /^([0-9()+. \t-])+(\s?(x|ext|extension)\s?([0-9()])+)?$/;
    const PHONE_SF = /^(\+?[0-9\s\-\(\)]{8,20})$/;

    function vText(s) {
        const input = $(s.id);
        const v = input.value;
        if (!v.trim()) {
            if (!input.required) { hideError(s.errId); return true; }
            showError(s.errId, s.label + 'を入力してください'); return false;
        }
        if (v.length > 255) { showError(s.errId, s.label + 'を255文字以内で入力してください'); return false; }
        hideError(s.errId); return true;
    }
    function vEmail(s) {
        const v = $(s.id).value;
        if (!v.trim()) { showError(s.errId, 'Eメールを入力してください'); return false; }
        if (v.length > 255) { showError(s.errId, 'Eメールを255文字以内で入力してください'); return false; }
        if (!EMAIL_REGEX.test(v)) { showError(s.errId, '有効なメールアドレスを入力してください'); return false; }
        hideError(s.errId); return true;
    }
    function vEmailConfirm(s) {
        const v = $(s.id).value;
        if (!v.trim()) { showError(s.errId, 'Eメールを再入力してください'); return false; }
        if (v.length > 255) { showError(s.errId, 'Eメールを255文字以内で入力してください'); return false; }
        if (!EMAIL_REGEX.test(v)) { showError(s.errId, '有効なメールアドレスを入力してください'); return false; }
        if ($('entry_email').value !== v) { showError(s.errId, '一致するメールアドレスを入力してください'); return false; }
        hideError(s.errId); return true;
    }
    function vPhone(s) {
        const v = $(s.id).value;
        if (!v.trim()) { showError(s.errId, '電話番号を入力してください'); return false; }
        if (v.length > 255) { showError(s.errId, '電話番号を255文字以内で入力してください'); return false; }
        if (v.replace(/[^0-9]/g, '').length < 8) { showError(s.errId, '有効な電話番号を入力してください'); return false; }
        if (!PHONE_MARKETO.test(v) || !PHONE_SF.test(v)) { showError(s.errId, '有効な電話番号を入力してください'); return false; }
        hideError(s.errId); return true;
    }
    function vYear(s) {
        const input = $(s.id);
        const v = input.value.trim();
        if (!v) {
            if (!input.required) { hideError(s.errId); return true; }
            showError(s.errId, '卒業年度を入力してください'); return false;
        }
        if (!/^\d+$/.test(v)) { showError(s.errId, '有効な卒業年度を整数で入力してください'); return false; }
        const n = parseInt(v, 10);
        if (n < 1950 || n > new Date().getFullYear() + 10) { showError(s.errId, '有効な卒業年度を入力してください'); return false; }
        hideError(s.errId); return true;
    }
    function vDate(s) {
        if (!$(s.id).value) { showError(s.errId, '説明会参加日を入力してください'); return false; }
        hideError(s.errId); return true;
    }
    function vSelect(s) {
        if (!$(s.id).value) { showError(s.errId, s.emptyMsg); return false; }
        hideError(s.errId); return true;
    }
    function vFile(s) {
        const input = $(s.id);
        const rule = s.rule;
        if (!input.files || input.files.length === 0) {
            if (!input.required) { hideError(s.errId); return true; }
            showError(s.errId, s.emptyMsg); return false;
        }
        const file = input.files[0];
        const name = file.name.toLowerCase();
        if (file.size === 0) { showError(s.errId, 'ファイルが空です。有効なファイルをアップロードしてください'); return false; }
        if (file.size > rule.max * 1024 * 1024) { showError(s.errId, 'ファイルサイズは' + rule.maxLabel + '以下にしてください'); return false; }
        const okFormat = rule.formats.some(function (p) { return name.endsWith(p[0]) || file.type === p[1]; }) ||
            (rule.textExts && rule.textExts.some(function (x) { return name.endsWith(x); }) &&
             (file.type === '' || file.type.indexOf('text/') === 0));
        if (!okFormat) { showError(s.errId, rule.formatMsg); return false; }
        hideError(s.errId); return true;
    }
    const VALIDATORS = { text: vText, email: vEmail, emailConfirm: vEmailConfirm, phone: vPhone,
        year: vYear, date: vDate, select: vSelect, file: vFile };

    function validateCheckbox() {
        if (!privacyPolicyCheckbox.checked) { showError('entry_privacyPolicyError', 'プライバシーポリシーに同意する必要があります'); return false; }
        hideError('entry_privacyPolicyError'); return true;
    }
    function validateAll() {
        let ok = true;
        allFields.forEach(function (s) { ok = VALIDATORS[s.kind](s) && ok; });
        return validateCheckbox() && ok;
    }

    // blur validation (files validate on change, not blur)
    allFields.forEach(function (s) {
        if (s.kind === 'file') return;
        $(s.id).addEventListener('blur', function () { VALIDATORS[s.kind](s); });
    });
    privacyPolicyCheckbox.addEventListener('blur', validateCheckbox);
    privacyPolicyCheckbox.addEventListener('change', function () {
        // UX only — the authoritative timestamp must be set server-side in Pipedream.
        privacyPolicyTimestampField.value = this.checked ? new Date().toISOString() : '';
    });
    allFields.forEach(function (s) {
        if (s.kind !== 'file') return;
        const input = $(s.id);
        const display = $(s.nameId);
        input.addEventListener('change', function () {
            if (this.files.length > 0) {
                display.textContent = this.files[0].name;
                display.style.fontWeight = 'bold';
                vFile(s);
            } else {
                display.textContent = '選択されていません';
                display.style.fontWeight = '';
                hideError(s.errId);
            }
        });
    });

    // ============================================================
    // 9. HP: 応募職種 → 新卒 / 中途 switches which fields apply
    // ============================================================
    let applicantType; // '応募者_新卒' | '応募者_中途' (hp only)
    function setApplies(s, on, hideGroup) {
        const input = $(s.id), label = $(s.id + 'Label');
        input.required = on;
        if (on) input.setAttribute('aria-required', 'true'); else input.removeAttribute('aria-required');
        label.className = on ? 'required-label' : '';
        if (hideGroup != null) $(s.id + 'Group').style.display = hideGroup ? 'none' : '';
    }
    if (cfg.applicant) {
        const A = cfg.applicant;
        $('entry_desiredOccupation').addEventListener('change', function () {
            if (!vSelect(spec.desiredOccupation)) return;
            if (this.value === A.newgradValue) {
                applicantType = A.newgradType;
                setApplies(spec.CV, false, true);
                setApplies(spec.graduationYear, true, false);
                setApplies(spec.resume, false);
            } else {
                applicantType = A.otherType;
                setApplies(spec.CV, true, false);
                setApplies(spec.graduationYear, false, true);
                $(spec.graduationYear.id).value = '';
                setApplies(spec.resume, true);
            }
        });
    }
    function resetFormToInitialState() {
        form.reset();
        allFields.forEach(function (s) {
            if (s.kind !== 'file') return;
            $(s.nameId).textContent = 'ファイルを選択';
            $(s.nameId).style.fontWeight = '';
        });
        privacyPolicyTimestampField.value = '';
        if (cfg.applicant) {
            setApplies(spec.resume, true);
            setApplies(spec.CV, false, false);
            setApplies(spec.graduationYear, false, true);
            applicantType = undefined;
        }
    }

    // ============================================================
    // 10. MARKETO (best-effort; can never fail or block the Pipedream path
    //     beyond `waitMs`). Marketo form lives on the host page.
    // ============================================================
    const M = cfg.marketo;
    let mktoFormEl = null;
    let mktoBlocked = false;
    let mktoSuccessResolver = null;
    const mktoStart = Date.now();

    function enableSubmitIfGated() {
        if (M.gate && sbmtBtn.textContent === '読込中...') {
            sbmtBtn.disabled = false;
            sbmtBtn.textContent = cfg.submitLabel;
        }
    }
    if (M.gate) { sbmtBtn.disabled = true; sbmtBtn.textContent = '読込中...'; }

    (function pollForMarketo() {
        if (typeof MktoForms2 !== 'undefined') {
            try {
                MktoForms2.whenReady(function (mktoForm) {
                    mktoFormEl = mktoForm;
                    try {
                        // registered ONCE; always suppress Marketo's own redirect
                        mktoFormEl.onSuccess(function () {
                            if (mktoSuccessResolver) { const r = mktoSuccessResolver; mktoSuccessResolver = null; r(); }
                            return false;
                        });
                    } catch (e) { console.warn('Marketo onSuccess registration failed:', e); }
                    enableSubmitIfGated();
                });
            } catch (e) {
                console.warn('MktoForms2.whenReady failed:', e);
                mktoBlocked = true;
                enableSubmitIfGated();
            }
            return;
        }
        if (Date.now() - mktoStart >= M.maxLoadMs) {
            console.warn('Marketo did not load; submissions will skip Marketo.');
            mktoBlocked = true;
            enableSubmitIfGated();
            return;
        }
        setTimeout(pollForMarketo, 100);
    })();

    // Always resolves, never rejects.
    function submitToMarketo(formData) {
        return new Promise(function (resolve) {
            if (mktoBlocked || !mktoFormEl || typeof mktoFormEl.submit !== 'function') {
                console.warn('Marketo form not available; skipping Marketo submission.');
                return resolve();
            }
            let timer = null;
            if (M.waitMs > 0) {
                timer = setTimeout(function () { mktoSuccessResolver = null; resolve(); }, M.waitMs);
                mktoSuccessResolver = function () { clearTimeout(timer); resolve(); };
            }
            try {
                const values = {
                    'LastName': formData.get('lastName'),
                    'FirstName': formData.get('firstName'),
                    'Email': formData.get('email'),
                    'Phone': formData.get('phone'),
                    'praivacyPolicy': formData.get('privacyPolicy') !== null ? 'yes' : 'no', // typo is intentional (Marketo field name)
                    'recordtype': M.recordtypeFromApplicant ? applicantType : M.recordtype
                };
                if (M.graduation) values['graduation'] = formData.get('graduationYear');
                mktoFormEl.setValues(values);
                mktoFormEl.submit();
            } catch (e) {
                console.warn('Marketo submission threw (ignored):', e);
                if (timer) clearTimeout(timer);
                mktoSuccessResolver = null;
            }
            if (M.waitMs <= 0) resolve();
        });
    }

    // ============================================================
    // 11. NETWORK
    // ============================================================
    async function postToPipedream(formData) {
        const N = cfg.net;
        for (let attempt = 0; ; attempt++) {
            const controller = new AbortController();
            const timer = setTimeout(function () { controller.abort(); }, N.timeoutMs);
            try {
                const response = await fetch(PIPEDREAM_URL, { method: 'POST', body: formData, signal: controller.signal });
                clearTimeout(timer);
                if (!response.ok) {
                    let data = null;
                    try { data = await response.clone().json(); } catch (_) { try { data = await response.text(); } catch (__) { /* ignore */ } }
                    const error = new Error(response.statusText || 'Request failed');
                    error.status = response.status;
                    error.data = data;
                    throw error;
                }
                return response;
            } catch (err) {
                clearTimeout(timer);
                if (err.status) throw err; // server answered: do not retry
                const terminal = !N.retryNetwork && (err.name === 'TypeError' || err.name === 'AbortError');
                if (terminal || attempt >= N.retries) throw err;
                await new Promise(function (r) { setTimeout(r, 1000); });
            }
        }
    }

    // ============================================================
    // 12. SUBMIT
    // ============================================================
    let isSubmitting = false;
    let fallbackShown = false;

    function setFormSubmitting(on) {
        isSubmitting = on;
        form.querySelectorAll('input, button, select').forEach(function (e) { e.disabled = on; });
        sbmtBtn.disabled = on;
        sbmtBtn.textContent = on ? '送信中...' : cfg.submitLabel;
    }

    function track(name) {
        if (typeof gtag !== 'function') return;
        try { gtag('event', name, { 'event_category': 'Application', 'event_label': cfg.gtag.label }); } catch (e) { /* GA must never block */ }
    }

    function buildFormData() {
        const fd = new FormData(form);
        if (recordType) fd.set('recordType', recordType);
        if (occupation) fd.set('desiredOccupation', occupation);
        if (sourcePlatform) fd.set('sourcePlatform', sourcePlatform);
        if (!hasFiles) return fd;
        const ALLOWED = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'text'];
        let n = 0;
        for (const entry of Array.from(fd.entries())) {
            const key = entry[0], value = entry[1];
            if (!(value instanceof File)) continue;
            if (value.size === 0 || !value.name) { fd.delete(key); continue; } // empty optional slot
            const dot = value.name.lastIndexOf('.');
            const ext = dot > 0 ? value.name.slice(dot + 1).toLowerCase() : '';
            const safeExt = ALLOWED.indexOf(ext) >= 0 ? ext : 'bin';
            const safeName = 'upload-' + key + '-' + Date.now() + '-' + (n++) + '-' + Math.random().toString(36).slice(2, 6) + '.' + safeExt;
            fd.set(key, new File([value], safeName, { type: value.type }));
        }
        return fd;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (isSubmitting) return;
        if (cfg.gtag.beforeValidation) track('form_submit_attempt');

        clearAllErrors();
        if (!validateAll()) return;

        if (!cfg.gtag.beforeValidation) track('form_submit_attempt');
        if (cfg.gtag.validEvent) track('form_submit_valid');

        if (privacyPolicyCheckbox.checked && !privacyPolicyTimestampField.value) {
            privacyPolicyTimestampField.value = new Date().toISOString();
        }

        const formData = buildFormData();
        setFormSubmitting(true);

        let marketoDone = Promise.resolve();
        if (M.when === 'before') marketoDone = submitToMarketo(formData); // fire alongside Pipedream

        postToPipedream(formData)
            .then(function () {
                // Pipedream (Salesforce) succeeded → Marketo, then leave
                return M.when === 'before' ? marketoDone : submitToMarketo(formData);
            })
            .then(function () {
                resetFormToInitialState();
                window.location.href = SUCCESS_URL;
            })
            .catch(function (error) {
                console.error('Submission Error:', error);
                handleSubmissionError(error, formData);
                setFormSubmitting(false);
            });
    });

    // ============================================================
    // 13. ERROR HANDLING + FALLBACK UI + ERROR LOG
    // ============================================================
    function handleSubmissionError(error, formData) {
        const isBlocking = !error.status && (error.name === 'TypeError' || error.name === 'AbortError');
        let msg;
        if (isBlocking) {
            msg = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
        } else {
            msg = 'システムエラーが発生しました。';
            if (error.data && typeof error.data === 'object') {
                for (const k in error.data) {
                    if (Object.prototype.hasOwnProperty.call(error.data, k)) msg += '\n・' + error.data[k];
                }
            } else if (typeof error.data === 'string' && error.data) {
                msg += '\n' + error.data;
            }
        }
        if (isBlocking && !fallbackShown) { showFallbackUI(formData); fallbackShown = true; }
        alert(msg);
        sendErrorLog(error, formData);
    }

    function showFallbackUI(formData) {
        const m = cfg.mail(formData, { applicantType: applicantType });
        const subject = encodeURIComponent(m.subject);
        let href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + encodeURIComponent(m.body);
        if (href.length > 1900) href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject; // long bodies break mail clients

        const box = el('div');
        box.style.cssText = 'margin: 20px 0 10px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';
        const p1 = el('p', null, '送信できませんでした。'); p1.style.cssText = 'margin-bottom:10px; font-weight:bold;';
        const p2 = el('p', null, '1．別の端末から再度お試しください。');
        const p3 = el('p', null, '2．解決しない場合は、お手数ですが、' + FALLBACK_EMAIL + '宛に、' +
            (cfg.attachNote ? '履歴書を添付の上' : '') + '直接メールをお送りください。');
        const p4 = el('p', null, '※以下のボタンからもメールソフトを起動できます。'); p4.style.cssText = 'margin-top:5px;';
        const a = el('a', { href: href, rel: 'noopener noreferrer' }, 'メールで応募する');
        a.style.cssText = 'display:inline-block; margin-top: 3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;';
        box.append(p1, p2, p3, p4, a);
        formWrapper.prepend(box);
        box.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    function sendErrorLog(error, formData) {
        const payload = {};
        formData.forEach(function (value, key) {
            if (value instanceof File) payload[key] = { filename: value.name, size: value.size, type: value.type };
            else payload[key] = value;
        });
        const debugData = {
            meta: {
                formType: FORM_TYPE,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                screen: window.screen.width + 'x' + window.screen.height,
                mktoLoaded: !!mktoFormEl,
                mktoBlocked: mktoBlocked
            },
            error: {
                name: error.name || 'Unknown',
                message: error.message || 'No message',
                status: error.status || 0,
                stack: (error.stack || '').slice(0, 8000)
            },
            formSubmission: payload
        };
        try {
            fetch(ERROR_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debugData), keepalive: true
            }).catch(function (e) {
                console.warn('Could not send error log:', e && e.name);
                if (cfg.storeErrorsLocally) storeErrorLocally(debugData);
            });
        } catch (e) { console.warn('Error log threw synchronously:', e && e.name); }
    }

    // HP only: keep unsent reports and retry on next page load.
    const LS_KEY = 'entry_form_errors_v1';
    function storeErrorLocally(data) {
        try {
            let list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
            if (!Array.isArray(list)) list = [];
            list.push(data);
            localStorage.setItem(LS_KEY, JSON.stringify(list.slice(-5)));
        } catch (e) { console.warn('localStorage backup failed:', e); }
    }
    if (cfg.storeErrorsLocally) {
        try {
            const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
            localStorage.removeItem(LS_KEY);
            if (Array.isArray(list)) list.forEach(function (d) {
                fetch(ERROR_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(d), keepalive: true }).catch(function () { /* still blocked */ });
            });
        } catch (e) { console.warn('flush stored errors failed:', e); }
    }
})();
