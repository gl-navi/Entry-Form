(function() {
    'use strict';

    // ====================
    // Configuration
    // ====================
    const PIPEDREAM_URL = 'https://sdfds.m.sdfsd.net';
    // TODO: Move this to a non-Pipedream domain (self-hosted, Sentry, etc.)
    // so adblockers can't blind you to the very errors you're trying to debug.
    const ERROR_LOGGER_URL = 'https://eoimhkgidqcxp6a.m.pipedream.net';
    const SUCCESS_REDIRECT_URL = 'https://recruit.gl-navi.co.jp/apply/successful';
    const FALLBACK_EMAIL = 'saiyou@gl-navi.co.jp';
    const FETCH_TIMEOUT_MS = 15000;
    const MKTO_LOAD_MAX_ATTEMPTS = 50;        // 50 * 100ms = 5s max wait
    const MKTO_LOAD_INTERVAL_MS = 100;
    const MAX_MAILTO_BODY_LENGTH = 1500;       // mailto URL safety

    // ====================
    // DOM Setup (with proper null guard)
    // ====================
    const oldDiv = document.getElementById('for_form');
    if (!oldDiv) {
        console.error('Target div not found!');
        return; // FIX: actually stop execution to prevent TypeError
    }

    const container = document.createElement('div');
    container.id = 'entry_form-container';
    oldDiv.replaceWith(container);
    // FIX: removed dead `if (!container)` check (it can never be null)

    const shadow = container.attachShadow({ mode: 'open' });

    // ====================
    // Styles
    // ====================
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        :host {
            --input-bg: rgb(161, 239, 255);
            --input-border: 2px solid #FFFFFF;
            --font-family: 'Zen Kaku Gothic New', sans-serif;
            --primary-color: #0078d7;
            --placeholder-color: #283593;
            --error-color: #ff9090;
            --success-color: #388e3c;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        #entry_entryForm {
            font-family: var(--font-family) !important;
            font-weight: bold !important;
        }
        .form-row {
            display: flex; flex-wrap: wrap;
            margin-bottom: 20px; row-gap: 20px; column-gap: 25px;
            align-items: flex-start;
        }
        .form-group {
            flex: 1 1 250px; margin-bottom: 15px;
            display: flex; flex-direction: column;
        }
        label {
            display: block; margin-bottom: 8px;
            font-weight: 600; color: #ffffff;
        }
        .required-label::after {
            content: "*"; color: var(--error-color); margin-left: 4px;
        }

        input, select {
            width: 100%; padding: 10px 12px;
            border: var(--input-border); border-radius: 4px;
            background-color: var(--input-bg);
            transition: background-color 0.3s ease, border-color 0.3s ease;
            font-size: 16px; font-family: var(--font-family); font-weight: bold;
            line-height: 1.5;
        }
        select { color: #333; }

        /* FIX: hover and focus separated so focus ring stays visible on hover */
        input:hover { background-color: #EEEEEE; }
        input:focus {
            background-color: #dddddd;
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
        }
        input:focus:hover {
            background-color: #EEEEEE;
            box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
        }

        input::placeholder {
            opacity: 0.5; color: var(--placeholder-color);
            font-weight: bold; font-family: var(--font-family);
        }

        .file-input-container {
            position: relative; overflow: hidden;
            display: inline-block; width: 100%;
        }
        .file-input-label {
            display: flex; align-items: center; justify-content: center;
            padding: 10px 20px; border: var(--input-border); border-radius: 4px;
            background-color: var(--input-bg); color: var(--placeholder-color);
            cursor: pointer; transition: background-color 0.2s, transform 0.1s;
            text-align: center; width: 100%; user-select: none;
            margin: 0; height: 47.2px;
        }
        .file-input-label:hover { background-color: #005a9e; }
        .file-input-label:active { transform: translateY(1px); }
        .file-input {
            position: absolute; left: 0; top: 0;
            opacity: 0; cursor: pointer;
            width: 100%; height: 100%; z-index: 1;
        }
        .file-name {
            margin-top: 8px; font-size: 14px;
            color: #ffffff; font-weight: normal;
            word-break: break-all;
        }

        .checkbox-group {
            display: flex; align-items: center; justify-content: center;
            margin: 50px 0 40px 0; flex-wrap: nowrap;
        }
        .checkbox-input {
            width: auto; margin-right: 10px;
            transform: scale(1.5); transform-origin: 50% 60%;
            cursor: pointer;
        }
        #entry_privacyPolicyLabel { margin: 0; }
        #entry_privacy_policy_link, #entry_privacy_policy_link:visited {
            color: #44D8F1; text-decoration: underline;
            transition: color 0.2s;
        }
        #entry_privacy_policy_link:hover { color: #7ae5ff; }
        #entry_privacy_policy_link:focus {
            outline: 2px solid #44D8F1; outline-offset: 2px;
        }
        #entry_privacyPolicyError { text-align: center; }

        .submit-btn {
            background: linear-gradient(106deg, #49fff1 0%, #0062e9 100%);
            transition: transform 0.4s cubic-bezier(.4,.4,0,1), background 0.3s;
            color: white; font-weight: bold; border: none;
            padding: 24px 24px; font-size: 16px;
            border-radius: 4px; cursor: pointer;
            display: block; margin: 30px auto 0;
            width: 100%; max-width: 300px;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        /* FIX: simplified scale(1.05) */
        .submit-btn:hover { transform: scale(1.05); }
        .submit-btn:focus {
            outline: none; box-shadow: 0 0 0 3px rgba(73, 255, 241, 0.5);
        }
        .submit-btn:disabled {
            background: linear-gradient(106deg, #b9e6e0 0%, #99b7d4 100%);
            cursor: not-allowed; transform: none;
        }

        .error-message {
            color: var(--error-color); font-size: 14px;
            margin-top: 5px; display: none; font-weight: 500;
        }
        /* FIX: visibility via class, not setAttribute('style', ...) overwriting */
        .error-message.is-visible { display: block; }

        /* Form-level fallback / error UI */
        .form-fallback {
            margin: 0 0 20px 0; padding: 15px;
            background: #fff3cd; border: 1px solid #ffeeba;
            color: #856404; border-radius: 4px;
        }
        .form-fallback p { margin-bottom: 10px; }
        .form-fallback .fallback-title { font-weight: bold; }
        .form-fallback a.mailto-btn {
            display: inline-block; margin-top: 3px; padding: 10px 20px;
            background: #d9534f; color: white; text-decoration: none;
            border-radius: 4px; font-weight: bold;
        }

        input:focus-visible, select:focus-visible {
            outline: 2px solid var(--primary-color); outline-offset: 1px;
        }
    `;
    shadow.appendChild(styleElement);

    const mediaQuery = document.createElement('style');
    mediaQuery.textContent = `
        @media (min-width: 1139px) {
            #entry_form-container { max-width: 600px; width: 100%; }
        }
        @media (min-width: 704px) and (max-width: 1139px) {
            #entry_form-container { width: 100%; }
            #form_text { font-size: 16px; }
        }
        @media (max-width: 704px) and (min-width: 541px) {
            #entry_form-container { width: 300px; }
            #form_text { font-size: 12px; }
        }
        @media (max-width: 540px) {
            #entry_form-container { width: 100%; }
            .submit-btn { width: 100%; }
        }
        @media (hover: none) {
            .submit-btn:hover { transform: none; }
        }
    `;
    container.appendChild(mediaQuery);

    // ====================
    // Form HTML
    // ====================
    const formElement = document.createElement('div');
    formElement.innerHTML = `
        <form id="entry_entryForm" novalidate enctype="multipart/form-data" accept-charset="utf-8" class="notranslate">
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_lastName" class="required-label">姓</label>
                    <input type="text" id="entry_lastName" name="lastName" required aria-required="true" placeholder="山田" autocomplete="family-name">
                    <div class="error-message" id="entry_lastNameError" aria-hidden="true">姓を入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_firstName" class="required-label">名</label>
                    <input type="text" id="entry_firstName" name="firstName" required aria-required="true" placeholder="太郎" autocomplete="given-name">
                    <div class="error-message" id="entry_firstNameError" aria-hidden="true">名を入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_email" class="required-label">Eメール</label>
                    <input type="email" id="entry_email" name="email" required aria-required="true" placeholder="mail@example.com" autocomplete="email">
                    <div class="error-message" id="entry_emailError" aria-hidden="true">有効なメールアドレスを入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_email_confirmation" class="required-label">Eメール (再入力)</label>
                    <input type="email" id="entry_email_confirmation" name="email_confirmation" required aria-required="true" placeholder="mail@example.com" autocomplete="email">
                    <div class="error-message" id="entry_emailConfirmationError" aria-hidden="true">一致するメールアドレスを入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_phone" class="required-label">電話番号</label>
                    <input type="tel" id="entry_phone" name="phone" required aria-required="true" placeholder="090-1234-5678" autocomplete="tel">
                    <div class="error-message" id="entry_phoneError" aria-hidden="true">有効な電話番号を入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_resume" class="required-label">履歴書</label>
                    <div class="file-input-container">
                        <label for="entry_resume" class="file-input-label" id="entry_fileName">ファイルを選択</label>
                        <input type="file" id="entry_resume" name="resume" class="file-input" required aria-required="true" accept=".pdf,.xlsx,.xls,.docx,.doc">
                    </div>
                    <div class="error-message" id="entry_resumeError" aria-hidden="true">履歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_CV" class="required-label">職務経歴書</label>
                    <div class="file-input-container">
                        <label for="entry_CV" class="file-input-label" id="entry_CVfileName">ファイルを選択</label>
                        <input type="file" id="entry_CV" name="CV" class="file-input" required aria-required="true" accept=".pdf,.xlsx,.xls,.docx,.doc">
                    </div>
                    <div class="error-message" id="entry_CVError" aria-hidden="true">職務経歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
                <div class="form-group"></div>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true">
                <label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">
                    採用選考に関する<a target="_blank" href="https://recruit.gl-navi.co.jp/privacypolicy" id="entry_privacy_policy_link" data-has-link="true" rel="noopener">プライバシーポリシー</a>に同意する
                </label>
            </div>
            <div class="error-message" id="entry_privacyPolicyError" aria-hidden="true">プライバシーポリシーに同意する必要があります</div>
            <input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">
            <button type="submit" id="entry_submitBtn" class="submit-btn">エントリー</button>
        </form>
    `;
    shadow.appendChild(formElement);

    // ====================
    // Element References
    // ====================
    const form = shadow.getElementById('entry_entryForm');
    const sbmtBtn = shadow.getElementById('entry_submitBtn');
    const resumeInput = shadow.getElementById('entry_resume');
    const fileNameDisplay = shadow.getElementById('entry_fileName');
    const CVInput = shadow.getElementById('entry_CV');
    const CVFileNameDisplay = shadow.getElementById('entry_CVfileName');
    const privacyPolicyCheckbox = shadow.getElementById('entry_privacyPolicy');
    const privacyPolicyTimestampField = shadow.getElementById('entry_privacyPolicyTimestamp');

    // FIX: Submit button is enabled IMMEDIATELY. Marketo no longer gates the form.

    // ====================
    // Marketo Integration (DECOUPLED / FIRE-AND-FORGET)
    // ====================
    let mktoFormEl = null;
    let mktoLoadAttempts = 0;

    function initializeMarketoLogicWhenReady() {
        if (typeof MktoForms2 !== 'undefined') {
            try {
                MktoForms2.whenReady(function(mktoForm) {
                    mktoFormEl = mktoForm;
                });
            } catch (e) {
                console.warn('Marketo whenReady failed; continuing without Marketo.');
            }
            return;
        }
        // FIX: bounded retry - no more infinite loop if MktoForms2 never loads
        if (mktoLoadAttempts++ < MKTO_LOAD_MAX_ATTEMPTS) {
            setTimeout(initializeMarketoLogicWhenReady, MKTO_LOAD_INTERVAL_MS);
        } else {
            console.warn('Marketo did not load within timeout. Submitting to Pipedream only.');
        }
    }
    initializeMarketoLogicWhenReady();

    // FIX: never throws, never blocks, never rejects the success flow.
    function submitToMarketoFireAndForget(formData) {
        if (!mktoFormEl) return; // Marketo never loaded - skip silently
        try {
            mktoFormEl.setValues({
                'LastName': formData.get('lastName'),
                'FirstName': formData.get('firstName'),
                'Email': formData.get('email'),
                'Phone': formData.get('phone'),
                'praivacyPolicy': formData.get('privacyPolicy') !== null ? 'yes' : 'no',
                'recordtype': '応募者_中途'
            });
            mktoFormEl.submit();
        } catch (e) {
            // Never propagate Marketo failures to the user
            console.warn('Marketo submit failed; ignoring.');
        }
    }

    // ====================
    // URL Parameters / Record Type
    // ====================
    const occupations = {
        'is': 'インサイドセールス',
        'fs': 'フィールドセールス',
        'fs_expert': 'フィールドセールス・エクスパート',
        'jw_sales': 'Japan Wingセールス',
        'jw_instructor': 'Japan Wing講師',
        'c_entry': 'DXコンサルタント・エントリーレベル',
        'c': 'DXコンサルタント',
        'c_expert': 'DXコンサルタント・エクスパート',
        'ds': 'データサイエンティスト',
        'cf': 'コーポレートファンクション',
        'designer': 'Brand / UIUX Designer（ジュニア〜ミドル）'
    };
    const recordTypes = {
        'hq': '中途本社レコードタイプ',
        'consultant': '中途コンサルレコードタイプ',
        'con': '中途コンサルレコードタイプ',
        'honsya': '中途本社レコードタイプ',
        'konsaru': '中途コンサルレコードタイプ',
        'japanwing': 'JapanWingレコードタイプ',
        'honsha': '中途本社レコードタイプ',
        'consult': '中途コンサルレコードタイプ',
        'jw': 'JapanWingレコードタイプ',
        'designer': '中途本社レコードタイプ'
    };

    let occupation = '';
    let recordType = '中途コンサルレコードタイプ'; // default fallback
    let sourcePlatform = '';

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && Object.prototype.hasOwnProperty.call(recordTypes, lastSegment)) {
        recordType = recordTypes[lastSegment];
    }

    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);

        // FIX: removed bogus 2nd argument to params.get()
        const occupationParam = params.get('occupation');
        if (occupationParam) {
            const key = occupationParam.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(occupations, key)) {
                occupation = occupations[key];
            }
        }

        sourcePlatform = (params.get('source') || '').toLowerCase();

        const rt = params.get('rt');
        if (rt) {
            const key = rt.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(recordTypes, key)) {
                recordType = recordTypes[key];
            }
        }
    }

    // ====================
    // File Input Display
    // ====================
    resumeInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileNameDisplay.textContent = this.files[0].name;
            fileNameDisplay.style.fontWeight = 'bold';
            validateFile(this, 'entry_resumeError');
        } else {
            fileNameDisplay.textContent = '選択されていません';
            hideError('entry_resumeError');
        }
    });

    CVInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            CVFileNameDisplay.textContent = this.files[0].name;
            CVFileNameDisplay.style.fontWeight = 'bold';
            validateFile(this, 'entry_CVError');
        } else {
            CVFileNameDisplay.textContent = '選択されていません';
            hideError('entry_CVError');
        }
    });

    privacyPolicyCheckbox.addEventListener('change', function() {
        privacyPolicyTimestampField.value = this.checked ? new Date().toISOString() : '';
    });

    // ====================
    // Form State Helpers (extracted - no longer redefined per submit)
    // ====================
    function setFormSubmitting(isSubmitting) {
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(function(input) { input.disabled = isSubmitting; });
        sbmtBtn.disabled = isSubmitting;
        sbmtBtn.textContent = isSubmitting ? '送信中...' : 'エントリー';
    }

    // ====================
    // Submit Handler
    // ====================
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearAllErrors();

        let isValid = true;
        isValid = validateRequiredField('entry_lastName', 'entry_lastNameError') && isValid;
        isValid = validateRequiredField('entry_firstName', 'entry_firstNameError') && isValid;
        isValid = validateEmail() && isValid;
        isValid = validateEmailConfirmation() && isValid;
        isValid = validatePhone() && isValid;
        isValid = validateFile(resumeInput, 'entry_resumeError') && isValid;
        isValid = validateFile(CVInput, 'entry_CVError') && isValid;
        isValid = validateCheckbox('entry_privacyPolicy', 'entry_privacyPolicyError') && isValid;

        if (!isValid) return;

        if (typeof gtag === 'function') {
            try {
                gtag('event', 'form_submit_attempt', {
                    'event_category': 'Application',
                    'event_label': 'New Grad Form'
                });
            } catch (e) { /* ignore */ }
        }

        const formData = new FormData(form);
        if (recordType) formData.set('recordType', recordType);
        if (occupation) formData.set('desiredOccupation', occupation);
        if (sourcePlatform) formData.set('sourcePlatform', sourcePlatform);

        // FIX: file naming - use index for uniqueness, handle no-extension case
        let fileIdx = 0;
        for (const [key, value] of [...formData.entries()]) {
            if (value instanceof File) {
                const lastDot = value.name.lastIndexOf('.');
                const ext = (lastDot > -1 && lastDot < value.name.length - 1)
                    ? value.name.substring(lastDot + 1).toLowerCase()
                    : 'bin';
                const safeName = `upload-${key}-${Date.now()}-${fileIdx++}.${ext}`;
                formData.set(key, new File([value], safeName, { type: value.type }));
            }
        }

        setFormSubmitting(true);

        // FIX: Marketo fired in parallel, NEVER awaited, NEVER blocks success
        submitToMarketoFireAndForget(formData);

        // Pipedream is the SOLE gating submission. Success or failure is decided here.
        fetchWithRetry(PIPEDREAM_URL, { method: 'POST', body: formData })
            .then(function(response) {
                if (!response.ok) {
                    return response.json().catch(function() { return response.text(); })
                        .then(function(errorData) {
                            const error = new Error(response.statusText || 'Request failed');
                            error.status = response.status;
                            error.data = errorData;
                            throw error;
                        });
                }
                handleSubmissionSuccess();
            })
            .catch(function(error) {
                handleSubmissionError(error, formData);
            });
    });

    // ====================
    // Submission Outcome Handlers
    // ====================
    function handleSubmissionSuccess() {
        form.reset();
        fileNameDisplay.textContent = '選択されていません';
        CVFileNameDisplay.textContent = '選択されていません';
        privacyPolicyTimestampField.value = ''; // FIX: reset() doesn't fire change event
        setFormSubmitting(false);
        window.location.href = SUCCESS_REDIRECT_URL;
    }

    function handleSubmissionError(error, formData) {
        // FIX: no PII in console
        console.error('Submission error:', error.name, error.status || '');

        // AbortError = our own timeout fired; treat the same as network block
        const isNetworkBlock = !error.status &&
            (error.name === 'TypeError' || error.name === 'AbortError');

        let userMessage;
        if (isNetworkBlock) {
            userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能、もしくはネットワーク状況により送信ができませんでした。\n\nお手数ですが、メールでの応募に切り替えていただけますか？';
        } else {
            userMessage = 'システムエラーが発生しました。';
            if (error.data && typeof error.data === 'object') {
                for (const x in error.data) {
                    if (Object.prototype.hasOwnProperty.call(error.data, x)) {
                        userMessage += '\n・' + String(error.data[x]);
                    }
                }
            } else if (typeof error.data === 'string' && error.data) {
                userMessage += '\n' + error.data;
            }
        }

        // FIX: replaced blocking alert() with inline UI
        showSubmissionError(userMessage, isNetworkBlock, formData);
        logErrorToBackend(error, formData);
        setFormSubmitting(false);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showSubmissionError(message, isNetworkBlock, formData) {
        // FIX: remove existing fallback so we don't stack copies on repeated retries
        const existing = shadow.querySelector('.form-fallback');
        if (existing) existing.remove();

        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'form-fallback';
        fallbackDiv.setAttribute('role', 'alert');
        fallbackDiv.setAttribute('aria-live', 'assertive');

        if (isNetworkBlock) {
            const subject = encodeURIComponent('中途採用応募 (フォームエラー)');
            const lastName = formData.get('lastName') || '';
            const firstName = formData.get('firstName') || '';
            const phone = formData.get('phone') || '';
            const email = formData.get('email') || '';

            // FIX: clean indentation - no more leading whitespace in email body
            let rawBody = [
                '採用担当者様',
                '',
                'フォーム送信時にエラーが発生したため、メールにて応募いたします。',
                '',
                '--------------------------------------------------',
                '■氏名',
                lastName + ' ' + firstName,
                '',
                '■電話番号',
                phone,
                '',
                '■Email',
                email,
                '--------------------------------------------------',
                '',
                '※履歴書・職務経歴書を添付いたしました。',
                'ご確認のほどよろしくお願いいたします。'
            ].join('\n');

            // FIX: cap mailto length so browsers don't silently truncate
            if (rawBody.length > MAX_MAILTO_BODY_LENGTH) {
                rawBody = rawBody.substring(0, MAX_MAILTO_BODY_LENGTH);
            }
            const body = encodeURIComponent(rawBody);

            fallbackDiv.innerHTML =
                '<p class="fallback-title">送信できませんでした。</p>' +
                '<p>1．別の端末から再度お試しください。</p>' +
                '<p>2．解決しない場合は、お手数ですが、' + escapeHtml(FALLBACK_EMAIL) +
                '宛に、履歴書を添付の上直接メールをお送りください。</p>' +
                '<p>※以下のボタンからもメールソフトを起動できます。</p>' +
                '<a class="mailto-btn" href="mailto:' + encodeURIComponent(FALLBACK_EMAIL) +
                '?subject=' + subject + '&body=' + body + '">メールで応募する</a>';
        } else {
            const escaped = escapeHtml(message).replace(/\n/g, '<br>');
            fallbackDiv.innerHTML = '<p class="fallback-title">' + escaped + '</p>';
        }

        const formContainer = form.parentNode;
        formContainer.prepend(fallbackDiv);
        try {
            fallbackDiv.scrollIntoView({
                behavior: 'smooth', block: 'center', inline: 'nearest'
            });
        } catch (e) { /* older browsers */ }
    }

    // ====================
    // Error Logger - PII-stripped, resilient delivery
    // ====================
    function logErrorToBackend(error, formData) {
        // FIX: log structure, not values - no PII transmitted
        const fileMetadata = [];
        const fieldStructure = [];
        formData.forEach(function(value, key) {
            if (value instanceof File) {
                fileMetadata.push({ field: key, size: value.size, type: value.type });
            } else {
                fieldStructure.push({
                    field: key,
                    hasValue: !!value,
                    length: typeof value === 'string' ? value.length : 0
                });
            }
        });

        const debugData = {
            meta: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                screen: window.screen.width + 'x' + window.screen.height,
                marketoLoaded: !!mktoFormEl
            },
            error: {
                name: error.name || 'Unknown',
                message: (error.message || '').substring(0, 500),
                status: error.status || 0,
                stack: (error.stack || '').substring(0, 1000)
            },
            formStructure: { fields: fieldStructure, files: fileMetadata }
        };

        const payload = JSON.stringify(debugData);

        // FIX: sendBeacon is more resilient (survives unload, lower priority)
        let beaconSent = false;
        try {
            const blob = new Blob([payload], { type: 'application/json' });
            beaconSent = navigator.sendBeacon(ERROR_LOGGER_URL, blob);
        } catch (e) { beaconSent = false; }

        if (!beaconSent) {
            try {
                fetch(ERROR_LOGGER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(function() { /* ignore */ });
            } catch (e) { /* ignore */ }
        }

        // FIX: GA event as alternative observability channel
        // (different domain than Pipedream - might survive when Pipedream is blocked)
        if (typeof gtag === 'function') {
            try {
                gtag('event', 'form_submit_error', {
                    'event_category': 'Application',
                    'event_label': (error.name || 'Unknown') + ': ' +
                                   (error.message || '').substring(0, 100),
                    'error_status': error.status || 0
                });
            } catch (e) { /* ignore */ }
        }
    }

    // ====================
    // Fetch with retry + per-attempt timeout
    // ====================
    async function fetchWithRetry(url, options, retries = 2) {
        const controller = new AbortController();
        const timeoutId = setTimeout(function() { controller.abort(); }, FETCH_TIMEOUT_MS);
        try {
            const merged = Object.assign({}, options, { signal: controller.signal });
            const response = await fetch(url, merged);
            clearTimeout(timeoutId);
            return response;
        } catch (err) {
            clearTimeout(timeoutId);
            // FIX: only retry on TypeError (transient network errors).
            // AbortError = our own timeout = server is slow, retrying won't help quickly.
            if (retries > 0 && err.name === 'TypeError') {
                console.log('Retrying... attempts left:', retries);
                await new Promise(function(res) { setTimeout(res, 1000); });
                return fetchWithRetry(url, options, retries - 1);
            }
            throw err;
        }
    }

    // ====================
    // Real-time validation
    // ====================
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (this.id === 'entry_email') validateEmail();
            else if (this.id === 'entry_email_confirmation') validateEmailConfirmation();
            else if (this.id === 'entry_phone') validatePhone();
            else if (this.id === 'entry_resume') validateFile(this, 'entry_resumeError');
            else if (this.id === 'entry_CV') validateFile(this, 'entry_CVError');
            else if (this.required) validateRequiredField(this.id, this.id + 'Error');
        });
    });

    // ====================
    // Validators
    // ====================
    // FIX: robust label lookup - works for any field structure, not just text inputs
    function getFieldLabelText(field) {
        const label = shadow.querySelector('label[for="' + field.id + '"].required-label')
                   || shadow.querySelector('label[for="' + field.id + '"]');
        return label ? label.textContent.replace('*', '').trim() : (field.name || field.id);
    }

    function validateRequiredField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        if (!field) return true;
        const labelText = getFieldLabelText(field);

        if (!field.value.trim()) {
            showError(errorId, labelText + 'を入力してください');
            return false;
        }
        if (field.value.length > 255) {
            showError(errorId, labelText + 'を255文字以内で入力してください');
            return false;
        }
        hideError(errorId);
        return true;
    }

    function validateEmail() {
        const email = shadow.getElementById('entry_email');
        const emailRegex_Marketo = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const emailRegex_Salesforce = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

        if (!email.value.trim()) {
            showError('entry_emailError', 'Eメールを入力してください');
            return false;
        }
        if (email.value.length > 255) {
            showError('entry_emailError', 'Eメールを255文字以内で入力してください');
            return false;
        }
        if (!emailRegex_Marketo.test(email.value) || !emailRegex_Salesforce.test(email.value)) {
            showError('entry_emailError', '有効なメールアドレスを入力してください');
            return false;
        }
        hideError('entry_emailError');
        return true;
    }

    function validateEmailConfirmation() {
        const email = shadow.getElementById('entry_email');
        const emailConfirmation = shadow.getElementById('entry_email_confirmation');

        if (!emailConfirmation.value.trim()) {
            showError('entry_emailConfirmationError', 'Eメールを再入力してください');
            return false;
        }
        if (emailConfirmation.value.length > 255) {
            showError('entry_emailConfirmationError', 'Eメールを255文字以内で入力してください');
            return false;
        }
        if (!validateEmail()) {
            showError('entry_emailConfirmationError', '有効なメールアドレスを入力してください');
            return false;
        }
        if (email.value !== emailConfirmation.value) {
            showError('entry_emailConfirmationError', '一致するメールアドレスを入力してください');
            return false;
        }
        hideError('entry_emailConfirmationError');
        return true;
    }

    function validatePhone() {
        const phone = shadow.getElementById('entry_phone');
        const phoneRegex_Marketo = /^([0-9()+. \t-])+(\s?(x|ext|extension)\s?([0-9()])+)?$/;
        const phoneRegex_Salesforce = /^(\+?[0-9\s\-\(\)]{8,20})$/;
        const digitsOnly = phone.value.replace(/[^0-9]/g, '');

        if (!phone.value.trim()) {
            showError('entry_phoneError', '電話番号を入力してください');
            return false;
        }
        if (phone.value.length > 255) {
            showError('entry_phoneError', '電話番号を255文字以内で入力してください');
            return false;
        }
        if (digitsOnly.length < 8) {
            showError('entry_phoneError', '有効な電話番号を入力してください');
            return false;
        }
        if (!phoneRegex_Marketo.test(phone.value) || !phoneRegex_Salesforce.test(phone.value)) {
            showError('entry_phoneError', '有効な電話番号を入力してください');
            return false;
        }
        hideError('entry_phoneError');
        return true;
    }

    function validateFile(fileInput, errorId) {
        if (fileInput.required && (!fileInput.files || fileInput.files.length === 0)) {
            showError(errorId);
            return false;
        }
        if (!fileInput.files || fileInput.files.length === 0) return true;

        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        const fileSize = file.size;
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedFormats = [
            { ext: '.pdf', mime: 'application/pdf' },
            { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            { ext: '.xls', mime: 'application/vnd.ms-excel' },
            { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { ext: '.doc', mime: 'application/msword' }
        ];

        if (fileSize === 0) {
            showError(errorId, 'ファイルが空です。有効なファイルをアップロードしてください');
            return false;
        }
        if (fileSize > maxSize) {
            showError(errorId, 'ファイルサイズは10MB以下にしてください');
            return false;
        }
        const isValidFormat = allowedFormats.some(function(format) {
            return fileName.endsWith(format.ext) || file.type === format.mime;
        });
        if (!isValidFormat) {
            showError(errorId, '許可されているファイル形式：PDF、Excel、Word形式のみ');
            return false;
        }
        hideError(errorId);
        return true;
    }

    function validateCheckbox(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        if (!field.checked) {
            showError(errorId, 'プライバシーポリシーに同意する必要があります');
            return false;
        }
        hideError(errorId);
        return true;
    }

    // ====================
    // Error display via class toggle (FIX: no more setAttribute('style') overwrite)
    // ====================
    function showError(errorId, message) {
        const errorElement = shadow.getElementById(errorId);
        if (!errorElement) return;
        if (message) errorElement.textContent = message;
        errorElement.classList.add('is-visible');
        errorElement.setAttribute('aria-hidden', 'false');
    }

    function hideError(errorId) {
        const errorElement = shadow.getElementById(errorId);
        if (!errorElement) return;
        errorElement.classList.remove('is-visible');
        errorElement.setAttribute('aria-hidden', 'true');
    }

    function clearAllErrors() {
        shadow.querySelectorAll('.error-message').forEach(function(error) {
            error.classList.remove('is-visible');
            error.setAttribute('aria-hidden', 'true');
        });
    }

})();
