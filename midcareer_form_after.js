(function () {
    'use strict';

    // === CONFIG — change PIPEDREAM_URL here to test failures ===
    const PIPEDREAM_URL = 'https://eo1jbij8tb2xgqu.m.pipedream.net';
    const ERROR_LOG_URL = 'https://eoimhkgidqcxp6a.m.pipedream.net';
    const FETCH_TIMEOUT_MS = 10000;
    const FETCH_MAX_RETRIES = 1;
    const MARKETO_MAX_WAIT_MS = 8000;
    const FALLBACK_EMAIL = 'saiyou@gl-navi.co.jp';
    const SUCCESS_REDIRECT_URL = 'https://recruit.gl-navi.co.jp/apply/successful';

    // === DOM Bootstrap (now actually aborts if target is missing) ===
    const oldDiv = document.getElementById("for_form");
    if (!oldDiv) {
        console.error("Target div 'for_form' not found. Aborting form initialization.");
        return;
    }

    const newDivElement = document.createElement("div");
    newDivElement.id = "entry_form-container";
    oldDiv.replaceWith(newDivElement);
    const container = newDivElement;
    const shadow = container.attachShadow({ mode: 'open' });

    // === Styles (unchanged) ===
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
        #entry_entryForm { font-family: var(--font-family) !important; font-weight: bold !important; }
        .form-row { display: flex; flex-wrap: wrap; margin-bottom: 20px; row-gap: 20px; column-gap: 25px; align-items: flex-start; }
        .form-group { flex: 1 1 250px; margin-bottom: 15px; display: flex; flex-direction: column; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #ffffff; }
        .required-label::after { content: "*"; color: var(--error-color); margin-left: 4px; }
        input, select { width: 100%; padding: 10px 12px; border: var(--input-border); border-radius: 4px; background-color: var(--input-bg); transition: background-color 0.3s ease, border-color 0.3s ease; font-size: 16px; font-family: var(--font-family); font-weight: bold; line-height: 1.5; }
        select { color: #333; }
        input:focus { background: #dddddd !important; outline: none; box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2); }
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
        .submit-btn:hover { transform: scale(1.05); }
        .submit-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(73, 255, 241, 0.5); }
        .submit-btn:disabled { background: linear-gradient(106deg, #b9e6e0 0%, #99b7d4 100%); cursor: not-allowed; transform: none; }
        .error-message { color: var(--error-color); font-size: 14px; margin-top: 5px; display: none; font-weight: 500; }
        input:focus-visible, select:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    `;
    shadow.appendChild(styleElement);

    // === Media query (unchanged) ===
    const mediaQuery = document.createElement('style');
    mediaQuery.textContent = `
        @media (min-width: 1139px) { #entry_form-container { max-width: 600px; width: 100%; } }
        @media (min-width: 704px) and (max-width: 1139px) { #entry_form-container { width: 100%; } #form_text { font-size: 16px; } }
        @media (max-width: 704px) and (min-width: 541px) { #entry_form-container { width: 300px; } #form_text { font-size: 12px; } }
        @media (max-width: 540px) { #entry_form-container { width: 100%; } .submit-btn { width: 100%; } }
        @media (hover: none) { .submit-btn:hover { transform: none; } }
        @media (-ms-high-contrast: active), (-ms-high-contrast: none) { .submit-btn { background: #0062e9; } }
    `;
    container.appendChild(mediaQuery);

    // === Form HTML (unchanged) ===
    const formElement = document.createElement('div');
    formElement.innerHTML = `
        <form id="entry_entryForm" novalidate enctype="multipart/form-data" accept-charset="utf-8" class="notranslate">
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_lastName" class="required-label">姓</label>
                    <input type="text" id="entry_lastName" name="lastName" required aria-required="true" placeholder="山田">
                    <div class="error-message" id="entry_lastNameError">姓を入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_firstName" class="required-label">名</label>
                    <input type="text" id="entry_firstName" name="firstName" required aria-required="true" placeholder="太郎/花子">
                    <div class="error-message" id="entry_firstNameError">名を入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_email" class="required-label">Eメール</label>
                    <input type="email" id="entry_email" name="email" required aria-required="true" placeholder="mail@example.com">
                    <div class="error-message" id="entry_emailError">有効なメールアドレスを入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_email_confirmation" class="required-label">Eメール (再入力)</label>
                    <input type="email" id="entry_email_confirmation" name="email_confirmation" required aria-required="true" placeholder="mail@example.com">
                    <div class="error-message" id="entry_emailConfirmationError">一致するメールアドレスを入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_phone" class="required-label">電話番号</label>
                    <input type="tel" id="entry_phone" name="phone" required aria-required="true" placeholder="090-1234-5678">
                    <div class="error-message" id="entry_phoneError">有効な電話番号を入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_resume" class="required-label">履歴書</label>
                    <div class="file-input-container">
                        <label for="entry_resume" class="file-input-label" id="entry_fileName">ファイルを選択</label>
                        <input type="file" id="entry_resume" name="resume" class="file-input" required aria-required="true">
                    </div>
                    <div class="error-message" id="entry_resumeError">履歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_CV" class="required-label">職務経歴書</label>
                    <div class="file-input-container">
                        <label for="entry_CV" class="file-input-label" id="entry_CVfileName">ファイルを選択</label>
                        <input type="file" id="entry_CV" name="CV" class="file-input" required aria-required="true">
                    </div>
                    <div class="error-message" id="entry_CVError">職務経歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
                <div class="form-group"></div>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true">
                <label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">
                採用選考に関する<a target="_blank" href="https://recruit.gl-navi.co.jp/privacypolicy" id="entry_privacy_policy_link" data-has-link="true" rel="noopener">プライバシーポリシー</a>に同意する
                </label>
            </div>
            <div class="error-message" id="entry_privacyPolicyError">プライバシーポリシーに同意する必要があります</div>
            <input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">
            <button type="submit" id="entry_submitBtn" class="submit-btn">エントリー</button>
        </form>
    `;
    shadow.appendChild(formElement);

    // === Marketo: background load with HARD timeout (no infinite loop) ===
    let mktoFormEl = null;
    const marketoStartedAt = Date.now();
    function pollForMarketo() {
        if (typeof MktoForms2 !== "undefined") {
            try {
                MktoForms2.whenReady(function (mktoForm) { mktoFormEl = mktoForm; });
            } catch (e) {
                console.warn("MktoForms2.whenReady threw:", e && e.name);
            }
            return;
        }
        if (Date.now() - marketoStartedAt > MARKETO_MAX_WAIT_MS) {
            console.warn("Marketo did not load within " + MARKETO_MAX_WAIT_MS + "ms; submissions will skip Marketo.");
            return;
        }
        setTimeout(pollForMarketo, 100);
    }
    pollForMarketo();

    // === Element refs ===
    const form = shadow.getElementById('entry_entryForm');
    const sbmtBtn = shadow.getElementById('entry_submitBtn');
    const resumeInput = shadow.getElementById('entry_resume');
    const fileNameDisplay = shadow.getElementById('entry_fileName');
    const CVInput = shadow.getElementById('entry_CV');
    const CVFileNameDisplay = shadow.getElementById('entry_CVfileName');
    const privacyPolicyCheckbox = shadow.getElementById('entry_privacyPolicy');
    const privacyPolicyTimestampField = shadow.getElementById('entry_privacyPolicyTimestamp');
    // NOTE: Submit button is NEVER initially disabled. It is fully usable even if Marketo never loads.

    // === URL Param Parsing ===
    const occupations = {
        "is": "インサイドセールス", "fs": "フィールドセールス", "fs_expert": "フィールドセールス・エクスパート",
        "jw_sales": "Japan Wingセールス", "jw_instructor": "Japan Wing講師",
        "c_entry": "DXコンサルタント・エントリーレベル", "c": "DXコンサルタント", "c_expert": "DXコンサルタント・エクスパート",
        "ds": "データサイエンティスト", "cf": "コーポレートファンクション",
        "designer": "Brand / UIUX Designer（ジュニア〜ミドル）"
    };
    const recordTypes = {
        "hq": "中途本社レコードタイプ", "consultant": "中途コンサルレコードタイプ", "con": "中途コンサルレコードタイプ",
        "honsya": "中途本社レコードタイプ", "konsaru": "中途コンサルレコードタイプ", "japanwing": "JapanWingレコードタイプ",
        "honsha": "中途本社レコードタイプ", "consult": "中途コンサルレコードタイプ", "jw": "JapanWingレコードタイプ",
        "designer": "中途本社レコードタイプ"
    };
    let occupation = "";
    let recordType = "中途コンサルレコードタイプ"; // Intentional default; overridden by URL path/query when present.
    let sourcePlatform = "";

    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && Object.prototype.hasOwnProperty.call(recordTypes, lastSegment)) {
        recordType = recordTypes[lastSegment];
    }

    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const occVal = params.get("occupation");
        if (occVal) {
            const key = occVal.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(occupations, key)) occupation = occupations[key];
        }
        sourcePlatform = (params.get("source") || "").toLowerCase();
        const rt = params.get("rt");
        if (rt) {
            const key = rt.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(recordTypes, key)) recordType = recordTypes[key];
        }
    }

    // === Persistent state across retries (was previously reset in catch) ===
    let fallbackShown = false;

    // === Field-label lookup (replaces fragile previousElementSibling) ===
    const FIELD_LABELS = {
        entry_lastName: '姓', entry_firstName: '名',
        entry_email: 'Eメール', entry_email_confirmation: 'Eメール (再入力)',
        entry_phone: '電話番号', entry_resume: '履歴書', entry_CV: '職務経歴書'
    };

    // === File handlers ===
    function attachFileHandler(input, displayElem, errorId) {
        input.addEventListener('change', function () {
            if (this.files.length > 0) {
                displayElem.textContent = this.files[0].name;
                displayElem.style.fontWeight = "bold";
                validateFile(this, errorId);
            } else {
                displayElem.textContent = 'ファイルを選択';
                displayElem.style.fontWeight = '';
                hideError(errorId);
            }
        });
    }
    attachFileHandler(resumeInput, fileNameDisplay, 'entry_resumeError');
    attachFileHandler(CVInput, CVFileNameDisplay, 'entry_CVError');

    privacyPolicyCheckbox.addEventListener('change', function () {
        privacyPolicyTimestampField.value = this.checked ? new Date().toISOString() : '';
    });

    // === Submit ===
    form.addEventListener('submit', function (event) {
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
                    'event_category': 'Application', 'event_label': 'New Grad Form'
                });
            } catch (e) { /* GA must never block submission */ }
        }

        const formData = new FormData(form);
        if (recordType) formData.set("recordType", recordType);
        if (occupation) formData.set("desiredOccupation", occupation);
        if (sourcePlatform) formData.set("sourcePlatform", sourcePlatform);

        // Rename uploaded files - unique counter prevents collisions when both files share a timestamp
        let fileCounter = 0;
        for (const [key, value] of [...formData.entries()]) {
            if (value instanceof File) {
                const dotIdx = value.name.lastIndexOf('.');
                const ext = (dotIdx > 0 && dotIdx < value.name.length - 1) ? value.name.substring(dotIdx + 1) : 'bin';
                const safeName = `upload-${Date.now()}-${fileCounter++}.${ext}`;
                formData.set(key, new File([value], safeName, { type: value.type }));
            }
        }

        setFormSubmitting(true);

        // Marketo: fire-and-forget. Throwing/blocking here MUST NOT affect the redirect.
        submitToMarketoSafe(formData);

        // Pipedream: critical path
        submitToPipedream(formData)
            .then(function () {
                form.reset();
                fileNameDisplay.textContent = 'ファイルを選択';
                fileNameDisplay.style.fontWeight = '';
                CVFileNameDisplay.textContent = 'ファイルを選択';
                CVFileNameDisplay.style.fontWeight = '';
                privacyPolicyTimestampField.value = '';
                window.location.href = SUCCESS_REDIRECT_URL;
            })
            .catch(function (error) { handleSubmissionError(error, formData); });
    });

    function setFormSubmitting(isSubmitting) {
        form.querySelectorAll('input, button').forEach(function (el) { el.disabled = isSubmitting; });
        sbmtBtn.disabled = isSubmitting;
        sbmtBtn.textContent = isSubmitting ? '送信中...' : 'エントリー';
    }

    function submitToMarketoSafe(formData) {
        if (!mktoFormEl) {
            console.log("Marketo unavailable; skipping Marketo submission.");
            return;
        }
        try {
            mktoFormEl.onSuccess(function () { return false; }); // prevent Marketo's redirect
            mktoFormEl.setValues({
                'LastName': formData.get('lastName'),
                'FirstName': formData.get('firstName'),
                'Email': formData.get('email'),
                'Phone': formData.get('phone'),
                'praivacyPolicy': formData.get('privacyPolicy') !== null ? "yes" : "no",
                'recordtype': '応募者_中途'
            });
            mktoFormEl.submit();
        } catch (e) {
            console.warn("Marketo submit threw (ignored):", e && e.name);
        }
    }

    async function submitToPipedream(formData) {
        for (let attempt = 0; attempt <= FETCH_MAX_RETRIES; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
            try {
                const response = await fetch(PIPEDREAM_URL, {
                    method: 'POST', body: formData, signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    let errorData = null;
                    try { errorData = await response.json(); }
                    catch (_) { try { errorData = await response.text(); } catch (_) { /* ignore */ } }
                    const error = new Error(response.statusText || 'Request failed');
                    error.status = response.status;
                    error.data = errorData;
                    throw error;
                }
                return;
            } catch (err) {
                clearTimeout(timeoutId);
                if (err.status) throw err;            // server-side error: do not retry
                if (attempt === FETCH_MAX_RETRIES) throw err;
                console.log(`Pipedream attempt ${attempt + 1} failed (${err.name}). Retrying...`);
                await new Promise(function (res) { setTimeout(res, 1000); });
            }
        }
    }

    function handleSubmissionError(error, formData) {
        console.error('Submission Error:', error.name, error.message, error.status || '');
        const isBlocking = !error.status && (error.name === 'TypeError' || error.name === 'AbortError');

        let userMessage;
        if (isBlocking) {
            userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
        } else {
            userMessage = 'システムエラーが発生しました。';
            if (error.data && typeof error.data === 'object') {
                for (const x in error.data) {
                    if (Object.prototype.hasOwnProperty.call(error.data, x)) {
                        userMessage += '\n・' + error.data[x];
                    }
                }
            }
        }

        if (isBlocking && !fallbackShown) {
            showFallbackUI(formData);
            fallbackShown = true;
        }
        alert(userMessage);
        sendErrorLog(error, formData);
        setFormSubmitting(false);
    }

    function showFallbackUI(formData) {
        const subject = encodeURIComponent('中途採用応募 (フォームエラー)');
        const lines = [
            '採用担当者様', '',
            'フォーム送信時にエラーが発生したため、メールにて応募いたします。', '',
            '--------------------------------------------------',
            '■氏名', (formData.get('lastName') || '') + ' ' + (formData.get('firstName') || ''), '',
            '■電話番号', formData.get('phone') || '', '',
            '■Email', formData.get('email') || '',
            '--------------------------------------------------', '',
            '※履歴書・ポートフォリオを添付いたしました。', 'ご確認のほどよろしくお願いいたします。'
        ];
        const body = encodeURIComponent(lines.join('\n'));
        let mailtoUrl = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
        if (mailtoUrl.length > 1900) mailtoUrl = `mailto:${FALLBACK_EMAIL}?subject=${subject}`;

        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.cssText = 'margin: 20px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';

        const heading = document.createElement('p');
        heading.style.cssText = 'margin-bottom:10px; font-weight:bold;';
        heading.textContent = '送信できませんでした。';
        fallbackDiv.appendChild(heading);

        const p1 = document.createElement('p'); p1.textContent = '1．別の端末から再度お試しください。'; fallbackDiv.appendChild(p1);
        const p2 = document.createElement('p'); p2.textContent = '2．解決しない場合は、お手数ですが、' + FALLBACK_EMAIL + '宛に、履歴書を添付の上直接メールをお送りください。'; fallbackDiv.appendChild(p2);
        const p3 = document.createElement('p'); p3.style.marginTop = '5px'; p3.textContent = '※以下のボタンからもメールソフトを起動できます。'; fallbackDiv.appendChild(p3);

        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.textContent = 'メールで応募する';
        link.style.cssText = 'display:inline-block; margin-top:3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;';
        fallbackDiv.appendChild(link);

        if (form.parentNode) {
            form.parentNode.prepend(fallbackDiv);
            fallbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    }

    function sendErrorLog(error, formData) {
        // Anonymize PII before sending to debug endpoint
        function tag(v) { return v ? '[' + String(v).length + 'chars]' : '[empty]'; }
        const PII_KEYS = ['email', 'email_confirmation', 'phone', 'lastName', 'firstName'];
        const formPayload = {};
        formData.forEach(function (value, key) {
            if (value instanceof File) {
                formPayload[key] = { filename: value.name, size: value.size, type: value.type };
            } else if (PII_KEYS.indexOf(key) !== -1) {
                formPayload[key] = tag(value);
            } else {
                formPayload[key] = value;
            }
        });

        const debugData = {
            meta: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                screen: window.screen.width + 'x' + window.screen.height
            },
            error: {
                name: error.name || 'Unknown',
                message: error.message || 'No message',
                status: error.status || 0,
                stack: (error.stack || '').slice(0, 500)
            },
            formSubmission: formPayload
        };

        try {
            fetch(ERROR_LOG_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debugData),
                keepalive: true
            }).catch(function (e) { console.warn("Error log delivery failed (likely also blocked):", e && e.name); });
        } catch (e) {
            console.warn("Error log threw synchronously:", e && e.name);
        }
    }

    // === Real-time validation ===
    form.querySelectorAll('input, select').forEach(function (input) {
        input.addEventListener('blur', function () {
            switch (this.id) {
                case 'entry_email': validateEmail(); break;
                case 'entry_email_confirmation': validateEmailConfirmation(); break;
                case 'entry_phone': validatePhone(); break;
                case 'entry_resume': validateFile(this, 'entry_resumeError'); break;
                case 'entry_CV': validateFile(this, 'entry_CVError'); break;
                default:
                    if (this.required) validateRequiredField(this.id, this.id + 'Error');
            }
        });
    });

    // === Validators ===
    function validateRequiredField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        const label = FIELD_LABELS[fieldId] || '';
        if (!field.value.trim()) { showError(errorId, label + 'を入力してください'); return false; }
        if (field.value.length > 255) { showError(errorId, label + 'を255文字以内で入力してください'); return false; }
        hideError(errorId); return true;
    }

    function validateEmail() {
        const email = shadow.getElementById('entry_email');
        const emailRegex_Marketo = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const emailRegex_Salesforce = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        if (!email.value.trim()) { showError('entry_emailError', 'Eメールを入力してください'); return false; }
        if (email.value.length > 255) { showError('entry_emailError', 'Eメールを255文字以内で入力してください'); return false; }
        if (!emailRegex_Marketo.test(email.value) || !emailRegex_Salesforce.test(email.value)) { showError('entry_emailError', '有効なメールアドレスを入力してください'); return false; }
        hideError('entry_emailError'); return true;
    }

    function validateEmailConfirmation() {
        const email = shadow.getElementById('entry_email');
        const emailConfirmation = shadow.getElementById('entry_email_confirmation');
        if (!emailConfirmation.value.trim()) { showError('entry_emailConfirmationError', 'Eメールを再入力してください'); return false; }
        if (emailConfirmation.value.length > 255) { showError('entry_emailConfirmationError', 'Eメールを255文字以内で入力してください'); return false; }
        if (email.value !== emailConfirmation.value) { showError('entry_emailConfirmationError', '一致するメールアドレスを入力してください'); return false; }
        hideError('entry_emailConfirmationError'); return true;
    }

    function validatePhone() {
        const phone = shadow.getElementById('entry_phone');
        const phoneRegex_Marketo = /^([0-9()+. \t-])+(\s?(x|ext|extension)\s?([0-9()])+)?$/;
        const phoneRegex_Salesforce = /^(\+?[0-9\s\-\(\)]{8,20})$/;
        const digitsOnly = phone.value.replace(/[^0-9]/g, '');
        if (!phone.value.trim()) { showError('entry_phoneError', '電話番号を入力してください'); return false; }
        if (phone.value.length > 255) { showError('entry_phoneError', '電話番号を255文字以内で入力してください'); return false; }
        if (digitsOnly.length < 8) { showError('entry_phoneError', '有効な電話番号を入力してください'); return false; }
        if (!phoneRegex_Marketo.test(phone.value) || !phoneRegex_Salesforce.test(phone.value)) { showError('entry_phoneError', '有効な電話番号を入力してください'); return false; }
        hideError('entry_phoneError'); return true;
    }

    function validateFile(fileInput, errorId) {
        if (fileInput.required && (!fileInput.files || fileInput.files.length === 0)) {
            showError(errorId); return false;
        }
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileName = file.name.toLowerCase();
            const fileSize = file.size;
            const maxSize = 10 * 1024 * 1024;
            const allowedFormats = [
                { ext: '.pdf', mime: 'application/pdf' },
                { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
                { ext: '.xls', mime: 'application/vnd.ms-excel' },
                { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
                { ext: '.doc', mime: 'application/msword' }
            ];
            if (fileSize === 0) { showError(errorId, 'ファイルが空です。有効なファイルをアップロードしてください'); return false; }
            if (fileSize > maxSize) { showError(errorId, 'ファイルサイズは10MB以下にしてください'); return false; }
            const isValidFormat = allowedFormats.some(function (f) { return fileName.endsWith(f.ext) || file.type === f.mime; });
            if (!isValidFormat) { showError(errorId, '許可されているファイル形式：PDF、Excel、Word形式のみ'); return false; }
            hideError(errorId);
        }
        return true;
    }

    function validateCheckbox(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        if (!field.checked) { showError(errorId, 'プライバシーポリシーに同意する必要があります'); return false; }
        hideError(errorId); return true;
    }

    function showError(errorId, message) {
        const el = shadow.getElementById(errorId);
        if (!el) return;
        if (message) el.textContent = message;
        el.style.setProperty('display', 'block', 'important');
        el.setAttribute('aria-hidden', 'false');
    }
    function hideError(errorId) {
        const el = shadow.getElementById(errorId);
        if (!el) return;
        el.style.setProperty('display', 'none', 'important');
        el.setAttribute('aria-hidden', 'true');
    }
    function clearAllErrors() {
        shadow.querySelectorAll('.error-message').forEach(function (el) {
            el.style.setProperty('display', 'none', 'important');
            el.setAttribute('aria-hidden', 'true');
        });
    }
})();
