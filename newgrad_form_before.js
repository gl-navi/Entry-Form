(function() {
    const oldDiv = document.getElementById("for_form");
    if (!oldDiv) {
        console.error("Target div not found!");
        return;
    }

    const newDivElement = document.createElement("div");
    newDivElement.id = "entry_form-container";
    oldDiv.replaceWith(newDivElement);

    const container = newDivElement;
    const shadow = container.attachShadow({ mode: 'open' });

    // ===== MODULE-SCOPED FLAGS =====
    let isSubmissionInProgress = false;
    let fallbackShown = false;
    let mktoFormEl = null;

    // Add styles
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

        .label-with-tooltip { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .label-with-tooltip > label { margin-bottom: 0; }
        .tooltip-icon {
            position: relative; display: inline-flex; align-items: center; justify-content: center;
            width: 15px; height: 15px; background-color: #95aaaf; color: white; border-radius: 50%;
            font-size: 15.4px; font-weight: bold; user-select: none;
        }
        
        .tooltip-icon::after {
            content: attr(data-tooltip);
            position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%);
            background-color: #333; color: #fff; padding: 8px 12px; border-radius: 4px;
            font-size: 14px; font-weight: normal; white-space: normal; max-width: 240px; width: max-content;
            z-index: 10; visibility: hidden; opacity: 0;
            transition: opacity 0.3s ease, visibility 0.3s ease; pointer-events: none;
        }
        .tooltip-icon::before {
            content: ''; position: absolute; bottom: 125%; left: 50%;
            transform: translateX(-50%) translateY(100%);
            border-width: 5px; border-style: solid; border-color: #333 transparent transparent transparent;
            visibility: hidden; opacity: 0;
            transition: opacity 0.3s ease, visibility 0.3s ease; z-index: 11; pointer-events: none;
        }
        .tooltip-icon:hover::after, .tooltip-icon:hover::before { visibility: visible; opacity: 1; }

        input, select {
            width: 100%; padding: 10px 12px; border: var(--input-border); border-radius: 4px;
            background-color: var(--input-bg); transition: background-color 0.3s ease, border-color 0.3s ease;
            font-size: 16px; font-family: var(--font-family); font-weight: bold; line-height: 1.5;
        }
        input:focus, select:focus { background: #dddddd !important; outline: none; box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2); }
        input:hover, input:focus:hover { background: #EEEEEE !important; }
        input::placeholder { opacity: 0.5; color: var(--placeholder-color); font-weight: bold; font-family: var(--font-family); }
        input::-webkit-input-placeholder { opacity: 0.5; color: var(--placeholder-color); font-weight: bold; font-family: var(--font-family); }
        input::-moz-placeholder { opacity: 0.5; color: var(--placeholder-color); font-weight: bold; font-family: var(--font-family); }

        .checkbox-group { display: flex; align-items: center; justify-content: center; margin: 50px 0 40px 0; flex-wrap: nowrap; }
        .checkbox-input { width: auto; margin-right: 10px; transform: scale(1.5); transform-origin: 50% 60%; cursor: pointer; }
        #entry_privacyPolicyLabel { margin: 0; }
        #entry_privacy_policy_link, #entry_privacy_policy_link:visited { color: #44D8F1; text-decoration: underline; transition: color 0.2s; }
        #entry_privacy_policy_link:hover { color: #7ae5ff; }
        #entry_privacy_policy_link:focus { outline: 2px solid #44D8F1; outline-offset: 2px; }
        #entry_privacyPolicyError { text-align: center; }

        .submit-btn {
            background: linear-gradient(106deg, #49fff1 0%, #0062e9 100%);
            transition: transform 0.4s cubic-bezier(.4,.4,0,1), background 0.3s;
            color: white; font-weight: bold; border: none; padding: 24px 24px;
            font-size: 16px; border-radius: 4px; cursor: pointer; display: block;
            margin: 30px auto 0; width: 100%; max-width: 300px;
            text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
        }
        .submit-btn:hover { transform: scale(1.05, 1.05); }
        .submit-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(73, 255, 241, 0.5); }
        .submit-btn:disabled { background: linear-gradient(106deg, #b9e6e0 0%, #99b7d4 100%); cursor: not-allowed; transform: none; }

        .error-message { color: var(--error-color); font-size: 14px; margin-top: 5px; display: none; font-weight: 500; }
        input:focus-visible, select:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    `;
    shadow.appendChild(styleElement);

    // Media queries
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
                    <input type="text" id="entry_firstName" name="firstName" required aria-required="true" placeholder="太郎">
                    <div class="error-message" id="entry_firstNameError">名を入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <div class="label-with-tooltip">
                        <label for="entry_email" class="required-label">Eメール</label>
                        <span class="tooltip-icon" data-tooltip="ご登録の媒体と同じメールアドレスをご記入ください">i</span>
                    </div>
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
                    <label for="entry_graduationYear" class="required-label">卒業年度</label>
                    <input type="number" id="entry_graduationYear" name="graduationYear" required aria-required="true" placeholder="2023">
                    <div class="error-message" id="entry_graduationYearError">卒業年度を入力してください</div>
                </div>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true" aria-describedby="entry_privacyPolicyError">
                <label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">
                    採用選考に関する<a target="_blank" href="https://recruit.gl-navi.co.jp/privacypolicy" id="entry_privacy_policy_link" data-has-link="true" rel="noopener noreferrer">プライバシーポリシー</a>に同意する
                </label>
            </div>
            <div class="error-message" id="entry_privacyPolicyError">プライバシーポリシーに同意する必要があります</div>
            <input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">
            <button type="submit" id="entry_submitBtn" class="submit-btn">申し込み</button>
        </form>
    `;
    shadow.appendChild(formElement);

    // ===== Submit button setup =====
    const sbmtBtn = shadow.getElementById('entry_submitBtn');
    sbmtBtn.disabled = true;
    sbmtBtn.textContent = '読込中...';

    // =====  Marketo wait with hard timeout =====
    const MKTO_MAX_WAIT_MS = 5000;
    const mktoStartTime = Date.now();

    function enableSubmitButton() {
        sbmtBtn.disabled = false;
        sbmtBtn.textContent = '申し込み';
    }

    function initializeMarketoLogicWhenReady() {
        if (typeof MktoForms2 !== "undefined") {
            try {
                MktoForms2.whenReady(function(mktoForm) {
                    mktoFormEl = mktoForm;
                    enableSubmitButton();
                });
            } catch (e) {
                console.warn("MktoForms2.whenReady threw:", e);
                mktoFormEl = null;
                enableSubmitButton();
            }
        } else if (Date.now() - mktoStartTime > MKTO_MAX_WAIT_MS) {
            // Marketo likely blocked by adblocker — proceed without it
            console.warn("Marketo unavailable after timeout. Continuing without it.");
            mktoFormEl = null;
            enableSubmitButton();
        } else {
            setTimeout(initializeMarketoLogicWhenReady, 100);
        }
    }
    initializeMarketoLogicWhenReady();

    // ===== Element refs =====
    const form = shadow.getElementById('entry_entryForm');
    const graduationYearPlaceholder = shadow.getElementById('entry_graduationYear');
    const privacyPolicyCheckbox = shadow.getElementById('entry_privacyPolicy');
    const privacyPolicyTimestampField = shadow.getElementById('entry_privacyPolicyTimestamp');

    // Default graduation year (intentional)
    const nextYear = new Date().getFullYear() - 3;
    graduationYearPlaceholder.placeholder = nextYear;

    privacyPolicyCheckbox.addEventListener('change', function() {
        if (this.checked) {
            privacyPolicyTimestampField.value = new Date().toISOString();
        } else {
            privacyPolicyTimestampField.value = '';
        }
    });

    function setFormSubmitting(isSubmitting) {
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(input => { input.disabled = isSubmitting; });
        sbmtBtn.disabled = isSubmitting;
        sbmtBtn.textContent = isSubmitting ? '送信中...' : '申し込み';
    }

    // ===== fetch with timeout, no retry on TypeError/AbortError =====
    const fetchWithRetry = async (url, options, retries = 1, timeoutMs = 15000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            // Don't retry on adblocker (TypeError) or timeout (AbortError) — won't recover
            if (retries > 0 && err.name !== 'TypeError' && err.name !== 'AbortError') {
                console.log(`Retrying... attempts left: ${retries}`);
                await new Promise(res => setTimeout(res, 1000));
                return fetchWithRetry(url, options, retries - 1, timeoutMs);
            }
            throw err;
        }
    };

    // ===== Submit handler =====
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (isSubmissionInProgress) return;

        if (typeof gtag === 'function') {
            gtag('event', 'form_submit_attempt', {
                'event_category': 'Application',
                'event_label': 'New Grad Form'
            });
        }

        clearAllErrors();

        let isValid = true;
        isValid = validateRequiredField('entry_lastName', 'entry_lastNameError') && isValid;
        isValid = validateRequiredField('entry_firstName', 'entry_firstNameError') && isValid;
        isValid = validateEmail() && isValid;
        isValid = validateEmailConfirmation() && isValid;
        isValid = validatePhone() && isValid;
        isValid = validateGraduationYear() && isValid;
        isValid = validateCheckbox('entry_privacyPolicy', 'entry_privacyPolicyError') && isValid;

        if (!isValid) return;

        // timestamp is set on submit if checkbox is checked
        if (privacyPolicyCheckbox.checked && !privacyPolicyTimestampField.value) {
            privacyPolicyTimestampField.value = new Date().toISOString();
        }

        isSubmissionInProgress = true;
        const formData = new FormData(form);
        setFormSubmitting(true);

        fetchWithRetry('https://eoblqo00j4o8lwv.m.pipedream.net', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().catch(() => response.text()).then(errorData => {
                    const error = new Error(response.statusText || 'Request failed');
                    error.status = response.status;
                    error.data = errorData;
                    throw error;
                });
            }

            // ===== Marketo submission with null check + try/catch =====
            return new Promise((resolve) => {
                if (!mktoFormEl) {
                    console.warn("Marketo not available, skipping Marketo submission.");
                    return resolve();
                }

                const timeoutId = setTimeout(() => {
                    console.warn("Marketo submission timed out, proceeding to redirect.");
                    resolve();
                }, 3000);

                try {
                    mktoFormEl.onSuccess(function() {
                        clearTimeout(timeoutId);
                        resolve();
                        return false;
                    });

                    mktoFormEl.setValues({
                        'LastName': formData.get('lastName'),
                        'FirstName': formData.get('firstName'),
                        'Email': formData.get('email'),
                        'Phone': formData.get('phone'),
                        'graduation': formData.get('graduationYear'),
                        'praivacyPolicy': formData.get('privacyPolicy') !== null ? "yes" : "no",
                        'recordtype': '応募者_新卒'
                    });

                    mktoFormEl.submit();
                } catch (e) {
                    console.warn("Marketo submit threw, proceeding anyway:", e);
                    clearTimeout(timeoutId);
                    resolve();
                }
            });
        })
        .then(() => {
            form.reset();
            setFormSubmitting(false);
            isSubmissionInProgress = false;
            window.location.href = "https://recruit.gl-navi.co.jp/apply/successful";
        })
        .catch(error => {
            console.error('Submission Error:', error);

            const fallbackEmail = "saiyou@gl-navi.co.jp";
            const subject = encodeURIComponent("新卒採用説明会申し込み (フォームエラー)");
            const rawBody =
`採用担当者様

フォーム送信時にエラーが発生したため、メールにて説明会に応募いたします。

--------------------------------------------------
■氏名
${formData.get('lastName')} ${formData.get('firstName')}

■電話番号
${formData.get('phone')}

■Email
${formData.get('email')}

■卒業年度
${formData.get('graduationYear')}
--------------------------------------------------

ご確認のほどよろしくお願いいたします。`;
            const body = encodeURIComponent(rawBody);

            let userMessage = '';
            let isBlockingIssue = false;

            // Detect adblocker / network block / timeout
            if (!error.status && (error.name === 'TypeError' || error.name === 'AbortError')) {
                isBlockingIssue = true;
                userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
            } else {
                userMessage = 'システムエラーが発生しました。';
                //  Object.values instead of for...in
                if (error.data && typeof error.data === 'object') {
                    Object.values(error.data).forEach(v => {
                        userMessage += "\n・" + v;
                    });
                } else if (typeof error.data === 'string') {
                    userMessage += "\n" + error.data;
                }
            }

            alert(userMessage);

            // fallbackShown is module-scoped so it can't double-render
            if (isBlockingIssue && !fallbackShown) {
                const formContainer = form.parentNode;

                const fallbackDiv = document.createElement('div');
                fallbackDiv.style.cssText = 'margin: 20px 0 20px 0; margin-bottom: 10px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';
                fallbackDiv.innerHTML = `
                    <p style="margin-bottom:10px; font-weight:bold;">送信できませんでした。</p>
                    <p>1．別の端末から再度お試しください。</p>
                    <p>2．解決しない場合は、お手数ですが、saiyou@gl-navi.co.jp宛に、直接メールをお送りください。</p>
                    <p style="margin-top:5px;">※以下のボタンからもメールソフトを起動できます。</p>
                    <a href="mailto:${fallbackEmail}?subject=${subject}&body=${body}"
                       style="display:inline-block; margin-top: 3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;">
                       メールで応募する
                    </a>
                `;

                formContainer.prepend(fallbackDiv);
                fallbackShown = true;
                fallbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }

            // Log error to debug endpoint
            try {
                const formPayload = {};
                formData.forEach((value, key) => {
                    if (value instanceof File) {
                        formPayload[key] = { filename: value.name, size: value.size, type: value.type };
                    } else {
                        formPayload[key] = value;
                    }
                });

                const debugData = {
                    meta: {
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
                    formSubmission: formPayload
                };

                fetch("https://eoimhkgidqcxp6a.m.pipedream.net", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(debugData),
                    keepalive: true
                }).catch(e => console.warn("Could not send error log:", e));
            } catch (e) {
                console.warn("Error log construction failed:", e);
            }

            setFormSubmitting(false);
            isSubmissionInProgress = false;
        });
    });

    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.id === 'entry_email_confirmation') {
            input.addEventListener('input', function() {
                if (shadow.getElementById('entry_email').value) {
                    validateEmailConfirmation();
                }
            });
        }

        input.addEventListener('blur', function() {
            if (this.id === 'entry_email') {
                validateEmail();
            } else if (this.id === 'entry_email_confirmation') {
                validateEmailConfirmation();
            } else if (this.id === 'entry_phone') {
                validatePhone();
            } else if (this.id === 'entry_graduationYear') {
                validateGraduationYear();
            } else if (this.id === 'entry_privacyPolicy') {
                validateCheckbox(this.id, 'entry_privacyPolicyError');
            } else if (this.required) {
                validateRequiredField(this.id, this.id + 'Error');
            }
        });
    });

    // ===== Validation functions =====
    function validateRequiredField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        if (!field.value.trim()) {
            showError(errorId, `${field.previousElementSibling.textContent.replace('*', '')}を入力してください`);
            return false;
        } else if (field.value.length > 255) {
            showError(errorId, `${field.previousElementSibling.textContent.replace('*', '')}を255文字以内で入力してください`);
            return false;
        } else {
            hideError(errorId);
            return true;
        }
    }

    function validateEmail() {
        const email = shadow.getElementById('entry_email');
        const emailRegex_Marketo = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const emailRegex_Salesforce = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

        if (!email.value.trim()) {
            showError('entry_emailError', 'Eメールを入力してください');
            return false;
        } else if (email.value.length > 255) {
            showError('entry_emailError', 'Eメールを255文字以内で入力してください');
            return false;
        }

        else if (!emailRegex_Marketo.test(email.value) && !emailRegex_Salesforce.test(email.value)) {
            showError('entry_emailError', '有効なメールアドレスを入力してください');
            return false;
        } else {
            hideError('entry_emailError');
            return true;
        }
    }

    function validateEmailConfirmation() {
        const email = shadow.getElementById('entry_email');
        const emailConfirmation = shadow.getElementById('entry_email_confirmation');

        if (!emailConfirmation.value.trim()) {
            showError('entry_emailConfirmationError', 'Eメールを再入力してください');
            return false;
        } else if (emailConfirmation.value.length > 255) {
            showError('entry_emailConfirmationError', 'Eメールを255文字以内で入力してください');
            return false;
        } else if (email.value !== emailConfirmation.value) {
            showError('entry_emailConfirmationError', '一致するメールアドレスを入力してください');
            return false;
        } else {
            hideError('entry_emailConfirmationError');
            return true;
        }
    }

    function validatePhone() {
        const phone = shadow.getElementById('entry_phone');
        const phoneRegex_Marketo = /^([0-9()+. \t-])+(\s?(x|ext|extension)\s?([0-9()])+)?$/;
        const phoneRegex_Salesforce = /^(\+?[0-9\s\-\(\)]{8,20})$/;
        const digitsOnly = phone.value.replace(/[^0-9]/g, '');

        if (!phone.value.trim()) {
            showError('entry_phoneError', '電話番号を入力してください');
            return false;
        } else if (phone.value.length > 255) {
            showError('entry_phoneError', '電話番号を255文字以内で入力してください');
            return false;
        } else if (digitsOnly.length < 8) {
            showError('entry_phoneError', '有効な電話番号を入力してください');
            return false;
        }
        else if (!phoneRegex_Marketo.test(phone.value) && !phoneRegex_Salesforce.test(phone.value)) {
            showError('entry_phoneError', '有効な電話番号を入力してください');
            return false;
        } else {
            hideError('entry_phoneError');
            return true;
        }
    }

    function validateGraduationYear() {
        const graduationYear = shadow.getElementById('entry_graduationYear');
        const currentYear = new Date().getFullYear();
        const yearValue = graduationYear.value.trim();

        if (!yearValue) {
            showError('entry_graduationYearError', '卒業年度を入力してください');
            return false;
        } else if (!/^\d+$/.test(yearValue)) {
            showError('entry_graduationYearError', '有効な卒業年度を整数で入力してください');
            return false;
        }

        const yearInt = parseInt(yearValue, 10);
        if (yearInt < 1950 || yearInt > currentYear + 10) {
            showError('entry_graduationYearError', '有効な卒業年度を入力してください');
            return false;
        }

        hideError('entry_graduationYearError');
        return true;
    }

    function validateCheckbox(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        if (!field.checked) {
            showError(errorId, `プライバシーポリシーに同意する必要があります`);
            return false;
        } else {
            hideError(errorId);
            return true;
        }
    }

    function showError(errorId, message) {
        const errorElement = shadow.getElementById(errorId);
        errorElement.textContent = message;
        errorElement.setAttribute('style', 'display: block !important;');
        errorElement.setAttribute('aria-hidden', 'false');
    }

    function hideError(errorId) {
        const errorElement = shadow.getElementById(errorId);
        errorElement.setAttribute('style', 'display: none !important;');
        errorElement.setAttribute('aria-hidden', 'true');
    }

    function clearAllErrors() {
        const errors = shadow.querySelectorAll('.error-message');
        errors.forEach(error => {
            error.setAttribute('style', 'display: none !important;');
            error.setAttribute('aria-hidden', 'true');
        });
    }
})();
