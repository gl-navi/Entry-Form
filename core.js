/**
 * GLN Form Master — common form library
 * Usage:
 *   <script src=".../master.js"></script>
 *   <script src=".../forms/<form>.js"></script>
 *
 * Each form-specific config calls window.GLNForm.init({...}).
 */
(function () {
    'use strict';

    // ============================================================
    // Constants
    // ============================================================

    const DEFAULT_FILE_FORMATS = [
        { ext: '.pdf',  mime: 'application/pdf' },
        { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { ext: '.xls',  mime: 'application/vnd.ms-excel' },
        { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { ext: '.doc',  mime: 'application/msword' }
    ];

    const ERROR_LOG_ENDPOINT  = 'https://eoimhkgidqcxp6a.m.pipedream.net';
    const FALLBACK_EMAIL      = 'saiyou@gl-navi.co.jp';
    const DEFAULT_SUCCESS_URL = 'https://recruit.gl-navi.co.jp/apply/successful';
    const PRIVACY_POLICY_URL  = 'https://recruit.gl-navi.co.jp/privacypolicy';

    // ============================================================
    // CSS
    // ============================================================

    const BASE_CSS = `
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
            margin-bottom: 20px;
            row-gap: 20px; column-gap: 25px;
            align-items: flex-start;
        }
        .form-group {
            flex: 1 1 250px;
            margin-bottom: 15px;
            display: flex; flex-direction: column;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #ffffff;
        }
        .required-label::after {
            content: "*";
            color: var(--error-color);
            margin-left: 4px;
        }
        input, select {
            width: 100%;
            padding: 10px 12px;
            border: var(--input-border);
            border-radius: 4px;
            background-color: var(--input-bg);
            transition: background-color 0.3s ease, border-color 0.3s ease;
            font-size: 16px;
            font-family: var(--font-family);
            font-weight: bold;
            line-height: 1.5;
        }
        select { color: #333; }
        input:focus, select:focus {
            background: #dddddd !important;
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
        }
        input:hover, input:focus:hover { background: #EEEEEE !important; }
        input::placeholder {
            opacity: 0.5; color: var(--placeholder-color);
            font-weight: bold; font-family: var(--font-family);
        }
        input::-webkit-input-placeholder {
            opacity: 0.5; color: var(--placeholder-color);
            font-weight: bold; font-family: var(--font-family);
        }
        input::-moz-placeholder {
            opacity: 0.5; color: var(--placeholder-color);
            font-weight: bold; font-family: var(--font-family);
        }

        /* ----- Tooltip ----- */
        .label-with-tooltip {
            display: flex; align-items: center;
            gap: 8px; margin-bottom: 8px;
        }
        .label-with-tooltip > label { margin-bottom: 0; }
        .tooltip-icon {
            position: relative;
            display: inline-flex;
            align-items: center; justify-content: center;
            width: 15px; height: 15px;
            background-color: #95aaaf; color: white;
            border-radius: 50%;
            font-size: 15.4px; font-weight: bold;
            user-select: none;
        }
        .tooltip-icon::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 125%; left: 50%;
            transform: translateX(calc(-50% + 50px));
            background-color: #333; color: #fff;
            padding: 8px 12px; border-radius: 4px;
            font-size: 14px; font-weight: normal;
            white-space: nowrap;
            z-index: 10;
            visibility: hidden; opacity: 0;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            pointer-events: none;
        }
        .tooltip-icon::before {
            content: '';
            position: absolute;
            bottom: 125%; left: 50%;
            transform: translateX(-50%) translateY(100%);
            border-width: 5px; border-style: solid;
            border-color: #333 transparent transparent transparent;
            visibility: hidden; opacity: 0;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 11;
            pointer-events: none;
        }
        .tooltip-icon:hover::after,
        .tooltip-icon:hover::before { visibility: visible; opacity: 1; }

        /* ----- File input ----- */
        .file-input-container {
            position: relative; overflow: hidden;
            display: inline-block; width: 100%;
        }
        .file-input-label {
            display: flex; align-items: center; justify-content: center;
            padding: 10px 20px;
            border: var(--input-border); border-radius: 4px;
            background-color: var(--input-bg);
            color: var(--placeholder-color);
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            text-align: center;
            width: 100%;
            user-select: none;
            margin: 0;
            height: 47.2px;
        }
        .file-input-label:hover  { background-color: #005a9e; }
        .file-input-label:active { transform: translateY(1px); }
        .file-input {
            position: absolute; left: 0; top: 0;
            opacity: 0; cursor: pointer;
            width: 100%; height: 100%; z-index: 1;
        }
        .file-name {
            margin-top: 8px;
            font-size: 14px;
            color: #ffffff;
            font-weight: normal;
            word-break: break-all;
        }

        /* ----- Checkbox / Privacy Policy ----- */
        .checkbox-group {
            display: flex; align-items: center; justify-content: center;
            margin: 50px 0 40px 0;
            flex-wrap: nowrap;
        }
        .checkbox-input {
            width: auto;
            margin-right: 10px;
            transform: scale(1.5);
            transform-origin: 50% 60%;
            cursor: pointer;
        }
        #entry_privacyPolicyLabel { margin: 0; }
        #entry_privacy_policy_link,
        #entry_privacy_policy_link:visited {
            color: #44D8F1;
            text-decoration: underline;
            transition: color 0.2s;
        }
        #entry_privacy_policy_link:hover { color: #7ae5ff; }
        #entry_privacy_policy_link:focus {
            outline: 2px solid #44D8F1;
            outline-offset: 2px;
        }
        #entry_privacyPolicyError { text-align: center; }

        /* ----- Submit button ----- */
        .submit-btn {
            background: linear-gradient(106deg, #49fff1 0%, #0062e9 100%);
            transition: transform 0.4s cubic-bezier(.4,.4,0,1), background 0.3s;
            color: white; font-weight: bold;
            border: none;
            padding: 24px 24px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            display: block;
            margin: 30px auto 0;
            width: 100%;
            max-width: 300px;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .submit-btn:hover { transform: scale(1.05, 1.05); }
        .submit-btn:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(73, 255, 241, 0.5);
        }
        .submit-btn:disabled {
            background: linear-gradient(106deg, #b9e6e0 0%, #99b7d4 100%);
            cursor: not-allowed;
            transform: none;
        }

        /* ----- Errors / a11y ----- */
        .error-message {
            color: var(--error-color);
            font-size: 14px;
            margin-top: 5px;
            display: none;
            font-weight: 500;
        }
        input:focus-visible, select:focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: 1px;
        }
    `;

    const MEDIA_QUERY_CSS = `
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
        @media (-ms-high-contrast: active), (-ms-high-contrast: none) {
            .submit-btn { background: #0062e9; }
        }
    `;

    // ============================================================
    // Public API
    // ============================================================

    window.GLNForm = { init: initForm };

    function initForm(config) {
        config = config || {};
        if (!config.pipedreamEndpoint) {
            console.error('GLNForm: config.pipedreamEndpoint is required.');
            return;
        }

        // ----- DOM setup -----
        const oldDiv = document.getElementById('for_form');
        if (!oldDiv) {
            console.error('Target div #for_form not found!');
            return;
        }
        const container = document.createElement('div');
        container.id = 'entry_form-container';
        oldDiv.replaceWith(container);

        const shadow = container.attachShadow({ mode: 'open' });

        // ----- CSS -----
        const styleEl = document.createElement('style');
        styleEl.textContent = BASE_CSS + (config.extraCSS || '');
        shadow.appendChild(styleEl);

        const mqEl = document.createElement('style');
        mqEl.textContent = MEDIA_QUERY_CSS;
        container.appendChild(mqEl);

        // ----- Form HTML -----
        const submitText = config.submitButtonText || 'エントリー';
        const wrap = document.createElement('div');
        wrap.innerHTML = buildFormHTML(config, submitText);
        shadow.appendChild(wrap);

        const form    = shadow.getElementById('entry_entryForm');
        const sbmtBtn = shadow.getElementById('entry_submitBtn');

        // ----- Marketo init -----
        sbmtBtn.disabled = true;
        sbmtBtn.textContent = '読込中...';
        let mktoFormEl;

        (function awaitMarketo() {
            if (typeof MktoForms2 !== 'undefined') {
                MktoForms2.whenReady(function (mktoForm) {
                    mktoFormEl = mktoForm;
                    sbmtBtn.disabled = false;
                    sbmtBtn.textContent = submitText;
                });
            } else {
                console.log('MktoForms2 not found yet. Retrying in 100ms...');
                setTimeout(awaitMarketo, 100);
            }
        })();

        // ----- Privacy policy timestamp -----
        const privacyCb = shadow.getElementById('entry_privacyPolicy');
        const privacyTs = shadow.getElementById('entry_privacyPolicyTimestamp');
        privacyCb.addEventListener('change', function () {
            privacyTs.value = this.checked ? new Date().toISOString() : '';
        });

        // ============================================================
        // Validation helpers
        // ============================================================

        function showError(errorId, message) {
            const el = shadow.getElementById(errorId);
            if (!el) return;
            if (message !== undefined) el.textContent = message;
            el.setAttribute('style', 'display: block !important;');
            el.setAttribute('aria-hidden', 'false');
        }
        function hideError(errorId) {
            const el = shadow.getElementById(errorId);
            if (!el) return;
            el.setAttribute('style', 'display: none !important;');
            el.setAttribute('aria-hidden', 'true');
        }
        function clearAllErrors() {
            shadow.querySelectorAll('.error-message').forEach(el => {
                el.setAttribute('style', 'display: none !important;');
                el.setAttribute('aria-hidden', 'true');
            });
        }
        function getLabelText(field) {
            const sib = field.previousElementSibling;
            return sib ? sib.textContent.replace('*', '') : '';
        }

        function validateRequiredField(fieldId, errorId) {
            const field = shadow.getElementById(fieldId);
            if (!field) return true;
            const label = getLabelText(field);
            if (!field.value.trim()) {
                showError(errorId, `${label}を入力してください`);
                return false;
            }
            if (field.value.length > 255) {
                showError(errorId, `${label}を255文字以内で入力してください`);
                return false;
            }
            hideError(errorId);
            return true;
        }

        function validateOptionalField(fieldId, errorId) {
            const field = shadow.getElementById(fieldId);
            if (!field) return true;
            const label = getLabelText(field);
            if (field.value.trim() && field.value.length > 255) {
                showError(errorId, `${label}を255文字以内で入力してください`);
                return false;
            }
            hideError(errorId);
            return true;
        }

        function validateEmail() {
            const email = shadow.getElementById('entry_email');
            const re1 = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            const re2 = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
            if (!email.value.trim()) {
                showError('entry_emailError', 'Eメールを入力してください');
                return false;
            }
            if (email.value.length > 255) {
                showError('entry_emailError', 'Eメールを255文字以内で入力してください');
                return false;
            }
            if (!re1.test(email.value) || !re2.test(email.value)) {
                showError('entry_emailError', '有効なメールアドレスを入力してください');
                return false;
            }
            hideError('entry_emailError');
            return true;
        }

        function validateEmailConfirmation() {
            const email = shadow.getElementById('entry_email');
            const conf  = shadow.getElementById('entry_email_confirmation');
            if (!conf.value.trim()) {
                showError('entry_emailConfirmationError', 'Eメールを再入力してください');
                return false;
            }
            if (conf.value.length > 255) {
                showError('entry_emailConfirmationError', 'Eメールを255文字以内で入力してください');
                return false;
            }
            if (!validateEmail()) {
                showError('entry_emailConfirmationError', '有効なメールアドレスを入力してください');
                return false;
            }
            if (email.value !== conf.value) {
                showError('entry_emailConfirmationError', '一致するメールアドレスを入力してください');
                return false;
            }
            hideError('entry_emailConfirmationError');
            return true;
        }

        function validatePhone() {
            const phone = shadow.getElementById('entry_phone');
            if (!phone) return true;
            const re1 = /^([0-9()+. \t-])+(\s?(x|ext|extension)\s?([0-9()])+)?$/;
            const re2 = /^(\+?[0-9\s\-\(\)]{8,20})$/;
            const digits = phone.value.replace(/[^0-9]/g, '');
            if (!phone.value.trim()) {
                showError('entry_phoneError', '電話番号を入力してください');
                return false;
            }
            if (phone.value.length > 255) {
                showError('entry_phoneError', '電話番号を255文字以内で入力してください');
                return false;
            }
            if (digits.length < 8 || !re1.test(phone.value) || !re2.test(phone.value)) {
                showError('entry_phoneError', '有効な電話番号を入力してください');
                return false;
            }
            hideError('entry_phoneError');
            return true;
        }

        function validateGraduationYear() {
            const field   = shadow.getElementById('entry_graduationYear');
            const errorId = 'entry_graduationYearError';
            if (!field) return true;
            if (!field.required) { hideError(errorId); return true; }
            const v = field.value.trim();
            if (!v) {
                showError(errorId, '卒業年度を入力してください');
                return false;
            }
            if (!/^\d+$/.test(v)) {
                showError(errorId, '有効な卒業年度を整数で入力してください');
                return false;
            }
            const yr = parseInt(v, 10);
            const cy = new Date().getFullYear();
            if (yr < 1950 || yr > cy + 10) {
                showError(errorId, '有効な卒業年度を入力してください');
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

        // Generic file validator. Skips ALL validation if input is not required (matches Form 5 behavior).
        function validateFile(fileInput, errorId, options) {
            options = options || {};
            const maxSize    = options.maxSize       || 10 * 1024 * 1024;
            const formats    = options.allowedFormats || DEFAULT_FILE_FORMATS;
            const requiredMsg = options.requiredMessage || 'ファイルをアップロードしてください';
            const sizeMsg    = options.maxSizeMessage  || `ファイルサイズは${maxSize / 1024 / 1024}MB以下にしてください`;
            const formatMsg  = options.formatMessage   || '許可されているファイル形式：PDF、Excel、Word形式のみ';

            if (!fileInput.required) { hideError(errorId); return true; }

            if (!fileInput.files || fileInput.files.length === 0) {
                showError(errorId, requiredMsg);
                return false;
            }
            const file = fileInput.files[0];
            if (file.size === 0) {
                showError(errorId, 'ファイルが空です。有効なファイルをアップロードしてください');
                return false;
            }
            if (file.size > maxSize) {
                showError(errorId, sizeMsg);
                return false;
            }
            const fname = file.name.toLowerCase();
            const isValid = formats.some(f => fname.endsWith(f.ext) || file.type === f.mime);
            if (!isValid) {
                showError(errorId, formatMsg);
                return false;
            }
            hideError(errorId);
            return true;
        }

        // Helper for "show selected filename" pattern
        function attachFileDisplay(inputId, displayId, validatorFn) {
            const input   = shadow.getElementById(inputId);
            const display = shadow.getElementById(displayId);
            if (!input || !display) return;
            input.addEventListener('change', function () {
                if (this.files.length > 0) {
                    display.textContent = this.files[0].name;
                    display.style.fontWeight = 'bold';
                    if (validatorFn) validatorFn(this);
                } else {
                    display.textContent = '選択されていません';
                }
            });
        }

        // ============================================================
        // API exposed to config callbacks
        // ============================================================

        const api = {
            shadow, container, form, config,
            DEFAULT_FILE_FORMATS,
            showError, hideError, clearAllErrors,
            validateRequiredField, validateOptionalField,
            validateEmail, validateEmailConfirmation,
            validatePhone, validateGraduationYear,
            validateCheckbox, validateFile,
            attachFileDisplay
        };

        if (typeof config.onInit === 'function') config.onInit(api);

        // ============================================================
        // Submission
        // ============================================================

        let isSubmitting = false;

        function setFormSubmitting(submitting) {
            form.querySelectorAll('input, button, select').forEach(el => {
                el.disabled = submitting;
            });
            sbmtBtn.disabled = submitting;
            sbmtBtn.textContent = submitting ? '送信中...' : submitText;
        }

        const fetchWithRetry = async (url, options, retries = 3) => {
            try {
                return await fetch(url, options);
            } catch (err) {
                if (retries > 0) {
                    console.log(`Retrying... attempts left: ${retries}`);
                    await new Promise(r => setTimeout(r, 1000));
                    return fetchWithRetry(url, options, retries - 1);
                }
                throw err;
            }
        };

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (isSubmitting) return;

            clearAllErrors();

            let isValid = true;
            isValid = validateRequiredField('entry_lastName',  'entry_lastNameError')  && isValid;
            isValid = validateRequiredField('entry_firstName', 'entry_firstNameError') && isValid;
            isValid = validateEmail() && isValid;
            isValid = validateEmailConfirmation() && isValid;
            isValid = validatePhone() && isValid;

            if (typeof config.customValidations === 'function') {
                isValid = config.customValidations(api) && isValid;
            }

            isValid = validateCheckbox('entry_privacyPolicy', 'entry_privacyPolicyError') && isValid;

            if (!isValid) return;

            // GA4
            if (typeof gtag === 'function') {
                gtag('event', 'form_submit_attempt', {
                    'event_category': 'Application',
                    'event_label': config.gaEventLabel || 'Form'
                });
            }

            isSubmitting = true;
            const formData = new FormData(form);

            if (typeof config.onBeforeSubmit === 'function') {
                config.onBeforeSubmit(formData, api);
            }

            // Rename file uploads to safe names (avoid mojibake)
            for (const [key, value] of [...formData.entries()]) {
                if (value instanceof File && value.name) {
                    const ext = value.name.split('.').pop();
                    const safeName = `upload-${Date.now()}.${ext}`;
                    formData.set(key, new File([value], safeName, { type: value.type }));
                }
            }

            setFormSubmitting(true);

            fetchWithRetry(config.pipedreamEndpoint, { method: 'POST', body: formData })
                .then(response => {
                    if (!response.ok) {
                        return response.json().catch(() => response.text()).then(errorData => {
                            const error = new Error(response.statusText || 'Request failed');
                            error.status = response.status;
                            error.data = errorData;
                            throw error;
                        });
                    }
                    return submitToMarketo(formData);
                })
                .then(() => {
                    isSubmitting = false;
                    form.reset();
                    if (typeof config.onSubmitSuccess === 'function') config.onSubmitSuccess(api);
                    setFormSubmitting(false);
                    window.location.href = config.successUrl || DEFAULT_SUCCESS_URL;
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    handleSubmitError(error, formData);
                    isSubmitting = false;
                    setFormSubmitting(false);
                });
        });

        function submitToMarketo(formData) {
            return new Promise(resolve => {
                const timeoutId = setTimeout(() => {
                    console.warn('Marketo submission timed out, proceeding to redirect.');
                    resolve();
                }, 3000);

                if (!mktoFormEl) { clearTimeout(timeoutId); resolve(); return; }

                mktoFormEl.onSuccess(function () {
                    clearTimeout(timeoutId);
                    resolve();
                    return false; // prevent Marketo's default redirect
                });

                const baseValues = {
                    'LastName':       formData.get('lastName'),
                    'FirstName':      formData.get('firstName'),
                    'Email':          formData.get('email'),
                    'Phone':          formData.get('phone'),
                    'praivacyPolicy': formData.get('privacyPolicy') !== null ? 'yes' : 'no'
                };

                let recordType = config.marketoRecordType;
                if (typeof config.getMarketoRecordType === 'function') {
                    recordType = config.getMarketoRecordType(formData, api);
                }
                if (recordType) baseValues.recordtype = recordType;

                const extra = typeof config.getMarketoValues === 'function'
                    ? (config.getMarketoValues(formData, api) || {})
                    : {};

                mktoFormEl.setValues(Object.assign({}, baseValues, extra));
                mktoFormEl.submit();
            });
        }

        function handleSubmitError(error, formData) {
            const emailInfo = typeof config.getErrorEmail === 'function'
                ? config.getErrorEmail(formData)
                : { subject: '応募 (フォームエラー)', body: defaultErrorEmailBody(formData) };

            const subject = encodeURIComponent(emailInfo.subject);
            const body    = encodeURIComponent(emailInfo.body);

            let userMessage = '';
            let isBlocking  = false;

            if (!error.status && error.name === 'TypeError') {
                isBlocking = true;
                userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
            } else {
                userMessage = 'システムエラーが発生しました。';
                if (error.data) {
                    for (let x in error.data) userMessage += '\n・' + error.data[x];
                }
            }

            alert(userMessage);
            if (isBlocking) showFallbackUI(subject, body);
            logError(error, formData);
        }

        function showFallbackUI(subject, body) {
            const div = document.createElement('div');
            div.style.cssText = 'margin: 20px 0; margin-bottom: 10px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';
            div.innerHTML = `
                <p style="margin-bottom:10px; font-weight:bold;">送信できませんでした。</p>
                <p>1．別の端末から再度お試しください。</p>
                <p>2．解決しない場合は、お手数ですが、${FALLBACK_EMAIL}宛に、直接メールをお送りください。</p>
                <p style="margin-top:5px;">※以下のボタンからもメールソフトを起動できます。</p>
                <a href="mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}"
                   style="display:inline-block; margin-top: 3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;">
                   メールで応募する
                </a>
            `;
            form.parentNode.prepend(div);
            div.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }

        function logError(error, formData) {
            const payload = {};
            formData.forEach((value, key) => {
                payload[key] = value instanceof File
                    ? { filename: value.name, size: value.size, type: value.type }
                    : value;
            });
            const debugData = {
                meta: {
                    formId: config.formId || '',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    screen: `${window.screen.width}x${window.screen.height}`
                },
                error: {
                    name: error.name || 'Unknown',
                    message: error.message || 'No message',
                    status: error.status || 0,
                    stack: error.stack || ''
                },
                formSubmission: payload
            };
            fetch(ERROR_LOG_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debugData),
                keepalive: true
            }).catch(e => console.warn('Could not send error log:', e));
        }

        function defaultErrorEmailBody(formData) {
            return `採用担当者様

フォーム送信時にエラーが発生したため、メールにて応募いたします。

--------------------------------------------------
■氏名
${formData.get('lastName')} ${formData.get('firstName')}

■電話番号
${formData.get('phone')}

■Email
${formData.get('email')}
--------------------------------------------------

ご確認のほどよろしくお願いいたします。`;
        }

        // ============================================================
        // Real-time validation (blur)
        // ============================================================
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', function () {
                // Let config handle field-specific cases first; return true to skip default
                if (typeof config.onFieldBlur === 'function') {
                    if (config.onFieldBlur(this, api) === true) return;
                }
                if (this.id === 'entry_email')                  validateEmail();
                else if (this.id === 'entry_email_confirmation') validateEmailConfirmation();
                else if (this.id === 'entry_phone')              validatePhone();
                else if (this.id === 'entry_graduationYear')     validateGraduationYear();
                else if (this.id === 'entry_privacyPolicy')      validateCheckbox(this.id, 'entry_privacyPolicyError');
                else if (this.required)                          validateRequiredField(this.id, this.id + 'Error');
            });
        });
    }

    // ============================================================
    // Form HTML builder
    // ============================================================

    function buildFormHTML(config, submitText) {
        const emailLabel = config.emailTooltip
            ? `<div class="label-with-tooltip">
                   <label for="entry_email" class="required-label">Eメール</label>
                   <span class="tooltip-icon" data-tooltip="${escapeAttr(config.emailTooltip)}">i</span>
               </div>`
            : `<label for="entry_email" class="required-label">Eメール</label>`;

        return `
            <form id="entry_entryForm" novalidate enctype="multipart/form-data" accept-charset="utf-8" class="notranslate">
                <div class="form-row">
                    <div class="form-group">
                        <label for="entry_lastName" class="required-label">姓</label>
                        <input type="text" id="entry_lastName" name="lastName" required aria-required="true" placeholder="山田">
                        <div class="error-message" id="entry_lastNameError">姓を入力してください</div>
                    </div>
                    <div class="form-group">
                        <label for="entry_firstName" class="required-label">名</label>
                        <input type="text" id="entry_firstName" name="firstName" required aria-required="true" placeholder="太郎">
                        <div class="error-message" id="entry_firstNameError">名を入力してください</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        ${emailLabel}
                        <input type="email" id="entry_email" name="email" required aria-required="true" placeholder="mail@example.com">
                        <div class="error-message" id="entry_emailError">有効なメールアドレスを入力してください</div>
                    </div>
                    <div class="form-group">
                        <label for="entry_email_confirmation" class="required-label">Eメール (再入力)</label>
                        <input type="email" id="entry_email_confirmation" name="email_confirmation" required aria-required="true" placeholder="mail@example.com">
                        <div class="error-message" id="entry_emailConfirmationError">一致するメールアドレスを入力してください</div>
                    </div>
                </div>
                ${config.fieldsHTML || ''}
                <div class="checkbox-group">
                    <input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true">
                    <label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">
                        採用選考に関する<a target="_blank" href="${PRIVACY_POLICY_URL}" id="entry_privacy_policy_link" data-has-link="true" rel="noopener">プライバシーポリシー</a>に同意する
                    </label>
                </div>
                <div class="error-message" id="entry_privacyPolicyError">プライバシーポリシーに同意する必要があります</div>
                <input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">
                <button type="submit" id="entry_submitBtn" class="submit-btn">${submitText}</button>
            </form>
        `;
    }

    function escapeAttr(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        }[c]));
    }
})();
