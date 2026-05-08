(function() {
    // ============================================================
    // 1. CONTAINER SETUP
    // ============================================================
    const oldDiv = document.getElementById("for_form");
    if (!oldDiv) {
        console.error("Target div #for_form not found! Aborting form setup.");
        return; // FIX #5: stop execution if target is missing (was a crash)
    }

    const newDivElement = document.createElement("div");
    newDivElement.id = "entry_form-container";
    // FIX #25: preserve any classes Studio applied to the original div
    if (oldDiv.className) {
        newDivElement.className = oldDiv.className;
    }
    oldDiv.replaceWith(newDivElement);

    const container = newDivElement;
    // FIX #16: removed dead `if (!container)` check — createElement never returns null

    const shadow = container.attachShadow({ mode: 'open' });

    // ============================================================
    // 2. STYLES (UNCHANGED — same CSS, same look)
    // ============================================================
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
        input:focus-visible, select:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    `;
    shadow.appendChild(styleElement);

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

    // ============================================================
    // 3. FORM HTML (FIX #17: removed unused enctype="multipart/form-data")
    // ============================================================
    const formElement = document.createElement('div');
    formElement.innerHTML = `
        <form id="entry_entryForm" novalidate accept-charset="utf-8" class="notranslate">
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
            <button type="submit" id="entry_submitBtn" class="submit-btn">申し込み</button>
        </form>
    `;
    shadow.appendChild(formElement);

    // ============================================================
    // 4. ELEMENT REFERENCES
    // ============================================================
    const sbmtBtn = shadow.getElementById('entry_submitBtn');
    const form = shadow.getElementById('entry_entryForm');
    const privacyPolicyCheckbox = shadow.getElementById('entry_privacyPolicy');
    const privacyPolicyTimestampField = shadow.getElementById('entry_privacyPolicyTimestamp');

    // ============================================================
    // 5. MARKETO HANDLING — DECOUPLED, FIRE-AND-FORGET
    // FIX #1: button is NO LONGER gated on Marketo loading.
    //         Users with adblockers can still submit normally.
    // FIX #20: bounded retry — never polls forever.
    // ============================================================
    let mktoFormEl = null;
    let marketoLoadAttempts = 0;
    const MARKETO_MAX_ATTEMPTS = 50; // ~5 seconds total

    function initializeMarketoLogicWhenReady() {
        if (typeof MktoForms2 !== "undefined") {
            try {
                MktoForms2.whenReady(function(mktoForm) {
                    // FIX #9 note: if multiple Marketo forms exist on the page,
                    // this still captures whichever loads last (matching old behavior).
                    // To target a specific form, replace with:
                    //   if (mktoForm.getId() === YOUR_FORM_ID) mktoFormEl = mktoForm;
                    mktoFormEl = mktoForm;
                });
            } catch (e) {
                console.warn("Marketo whenReady failed (non-blocking):", e);
            }
        } else if (marketoLoadAttempts < MARKETO_MAX_ATTEMPTS) {
            marketoLoadAttempts++;
            setTimeout(initializeMarketoLogicWhenReady, 100);
        } else {
            console.warn("Marketo did not load. Form will submit without Marketo.");
        }
    }
    initializeMarketoLogicWhenReady();

    // ============================================================
    // 6. URL PARAMETERS & PATH
    // ============================================================
    const occupations = {
        "is": "インサイドセールス",
        "fs": "フィールドセールス",
        "fs_expert": "フィールドセールス・エクスパート",
        "jw_sales": "Japan Wingセールス",
        "jw_instructor": "Japan Wing講師",
        "c_entry": "DXコンサルタント・エントリーレベル",
        "c": "DXコンサルタント",
        "c_expert": "DXコンサルタント・エクスパート",
        "ds": "データサイエンティスト",
        "cf": "コーポレートファンクション",
        "designer": "Brand / UIUX Designer（ジュニア〜ミドル）"
    };

    const recordTypes = {
        "h": "中途本社レコードタイプ",
        "c": "中途コンサルレコードタイプ",
        "j": "JapanWingレコードタイプ",
        "honsya": "中途本社レコードタイプ",
        "konsaru": "中途コンサルレコードタイプ",
        "japanwing": "JapanWingレコードタイプ",
        "honsha": "中途本社レコードタイプ",
        "consult": "中途コンサルレコードタイプ",
        "jw": "JapanWingレコードタイプ",
        "designer": "中途本社レコードタイプ"
    };

    let occupation = "";
    let recordType = "中途コンサルレコードタイプ";

    // FIX #18: !== instead of !=
    if (window.location.search !== "") {
        const params = new URLSearchParams(window.location.search);
        // FIX #13: removed phantom 2nd argument to URLSearchParams.get()
        const occupationParam = params.get("occupation");
        if (occupationParam) {
            // FIX #19: renamed misleading `referrer` to `occupationKey`
            const occupationKey = occupationParam.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(occupations, occupationKey)) {
                occupation = occupations[occupationKey];
                if (occupation === "Brand / UIUX Designer（ジュニア〜ミドル）") {
                    window.location.href = "https://recruit.gl-navi.co.jp/";
                    return; // FIX #7: stop running form setup during redirect race
                }
            }
        }
    }

    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && Object.prototype.hasOwnProperty.call(recordTypes, lastSegment)) {
        recordType = recordTypes[lastSegment];
    }

    // ============================================================
    // 7. PRIVACY POLICY TIMESTAMP
    // ============================================================
    privacyPolicyCheckbox.addEventListener('change', function() {
        if (this.checked) {
            privacyPolicyTimestampField.value = new Date().toISOString();
        } else {
            privacyPolicyTimestampField.value = '';
        }
    });

    // ============================================================
    // 8. SUBMISSION STATE (FIX #3: hoisted out of the submit handler
    //                       so the dedup flag actually works)
    // ============================================================
    let isSubmissionInProgress = false;
    let fallbackShown = false; // prevents duplicate fallback divs across retries

    function setFormSubmitting(isSubmitting) {
        const allInputs = form.querySelectorAll('input, button');
        allInputs.forEach(el => { el.disabled = isSubmitting; });
        sbmtBtn.disabled = isSubmitting;
        sbmtBtn.textContent = isSubmitting ? '送信中...' : '申し込み';
    }

    // ============================================================
    // 9. NETWORK HELPERS
    // Adds AbortController-based timeout so fetch never hangs forever
    // (another potential cause of "stuck at Submitting...").
    // ============================================================
    async function fetchWithRetry(url, options, retries = 3, timeoutMs = 30000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
        } catch (err) {
            clearTimeout(timeoutId);
            if (retries > 0) {
                await new Promise(res => setTimeout(res, 1000));
                return fetchWithRetry(url, options, retries - 1, timeoutMs);
            }
            throw err;
        }
    }

    // FIX #2: Marketo is fire-and-forget. Wrapped in try/catch so any
    // sync error (undefined mktoFormEl, missing fields, etc.) is contained
    // and CANNOT bubble up into the Pipedream success chain.
    function submitToMarketoSafely(formData) {
        if (!mktoFormEl) {
            console.warn("Marketo form not loaded; skipping Marketo submission.");
            return;
        }
        try {
            mktoFormEl.setValues({
                'LastName': formData.get('lastName'),
                'FirstName': formData.get('firstName'),
                'Email': formData.get('email'),
                'Phone': formData.get('phone'),
                'praivacyPolicy': formData.get('privacyPolicy') !== null ? "yes" : "no", // intentional typo per your note
                'recordtype': '応募者_中途'
            });
            mktoFormEl.onSuccess(function() {
                return false; // suppress Marketo's default redirect
            });
            mktoFormEl.submit();
        } catch (e) {
            console.warn("Marketo submission failed (non-blocking):", e);
        }
    }

    // ============================================================
    // 10. FORM SUBMISSION HANDLER
    // ============================================================
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // FIX #3: now actually prevents double-submits
        if (isSubmissionInProgress) return;

        clearAllErrors();

        let isValid = true;
        isValid = validateRequiredField('entry_lastName', 'entry_lastNameError') && isValid;
        isValid = validateRequiredField('entry_firstName', 'entry_firstNameError') && isValid;
        isValid = validateEmail() && isValid;
        isValid = validateEmailConfirmation() && isValid;
        isValid = validatePhone() && isValid;
        isValid = validateCheckbox('entry_privacyPolicy', 'entry_privacyPolicyError') && isValid;

        if (!isValid) return;

        // FIX #14: safety net — set timestamp at submit time if missing
        if (privacyPolicyCheckbox.checked && !privacyPolicyTimestampField.value) {
            privacyPolicyTimestampField.value = new Date().toISOString();
        }

        if (typeof gtag === 'function') {
            gtag('event', 'form_submit_attempt', {
                'event_category': 'Application',
                'event_label': 'New Grad Form'
            });
        }

        isSubmissionInProgress = true;

        const formData = new FormData(form);
        if (recordType) formData.set("recordType", recordType);
        if (occupation) formData.set("desiredOccupation", occupation);

        setFormSubmitting(true);

        // ========================================================
        // PRIMARY: Pipedream (Salesforce). This is the source of truth.
        // FIX #2: Marketo is fired AFTER Pipedream success but is
        //         fire-and-forget — its errors cannot fail this chain.
        // ========================================================
        fetchWithRetry('https://eomm9l0t6di5coc.m.pipedream.net', {
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
            // Fire Marketo without awaiting — errors here cannot reach .catch()
            submitToMarketoSafely(formData);
            // Brief grace period so Marketo's XHR can flush before navigation cancels it
            return new Promise(resolve => setTimeout(resolve, 500));
        })
        .then(() => {
            isSubmissionInProgress = false;
            form.reset();
            setFormSubmitting(false);
            window.location.href = "https://recruit.gl-navi.co.jp/apply/successful";
        })
        .catch(error => {
            isSubmissionInProgress = false;
            console.error('Submission Error:', error);

            const fallbackEmail = "saiyou@gl-navi.co.jp";
            const subject = encodeURIComponent("中途採用応募 (フォームエラー)");
            const rawBody = `採用担当者様

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
            const body = encodeURIComponent(rawBody);

            // FIX #8: tighter detection. Only match the unmistakable "fetch
            // never reached the server" signature, not generic TypeErrors.
            // (Marketo errors won't reach here anymore due to FIX #2, but
            // this is defense-in-depth.)
            const isBlockingIssue =
                !error.status &&
                error.name === 'TypeError' &&
                /(failed to fetch|networkerror|load failed|fetch)/i.test(error.message || '');

            let userMessage;
            if (isBlockingIssue) {
                userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
            } else {
                userMessage = 'システムエラーが発生しました。';
                // Handle both string and object error.data safely
                if (error.data) {
                    if (typeof error.data === 'string') {
                        userMessage += '\n' + error.data;
                    } else if (typeof error.data === 'object') {
                        for (const k in error.data) {
                            if (Object.prototype.hasOwnProperty.call(error.data, k)) {
                                userMessage += "\n・" + error.data[k];
                            }
                        }
                    }
                }
            }

            alert(userMessage);

            if (isBlockingIssue && !fallbackShown) {
                showFallbackUI(fallbackEmail, subject, body);
                fallbackShown = true;
            }

            // ========================================================
            // ERROR LOGGING (FIX #22: redact PII before sending)
            // ========================================================
            const formPayload = {};
            formData.forEach((value, key) => {
                if (value instanceof File) {
                    formPayload[key] = { filename: value.name, size: value.size, type: value.type };
                } else if (key === 'email' || key === 'email_confirmation') {
                    const v = String(value);
                    const at = v.lastIndexOf('@');
                    formPayload[key] = at > 0 ? '***@' + v.substring(at + 1) : '***';
                } else if (key === 'phone') {
                    const digits = String(value).replace(/\D/g, '');
                    formPayload[key] = digits.length > 4 ? '***' + digits.slice(-4) : '***';
                } else if (key === 'lastName' || key === 'firstName') {
                    const s = String(value);
                    formPayload[key] = s.length > 0 ? s[0] + '***' : '';
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
            }).catch(e => {
                console.warn("Could not send error log:", e);
            });

            setFormSubmitting(false);
        });
    });

    // ============================================================
    // 11. FALLBACK UI (FIX #24: DOM API, not innerHTML w/ user data)
    // ============================================================
    function showFallbackUI(fallbackEmail, subject, body) {
        const formContainer = form.parentNode;

        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.cssText = 'margin: 20px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';

        const title = document.createElement('p');
        title.style.cssText = 'margin-bottom:10px; font-weight:bold;';
        title.textContent = '送信できませんでした。';
        fallbackDiv.appendChild(title);

        const step1 = document.createElement('p');
        step1.textContent = '1．別の端末から再度お試しください。';
        fallbackDiv.appendChild(step1);

        const step2 = document.createElement('p');
        step2.textContent = '2．解決しない場合は、お手数ですが、saiyou@gl-navi.co.jp宛に、直接メールをお送りください。';
        fallbackDiv.appendChild(step2);

        const note = document.createElement('p');
        note.style.cssText = 'margin-top:5px;';
        note.textContent = '※以下のボタンからもメールソフトを起動できます。';
        fallbackDiv.appendChild(note);

        const link = document.createElement('a');
        link.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
        link.style.cssText = 'display:inline-block; margin-top: 3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;';
        link.textContent = 'メールで応募する';
        fallbackDiv.appendChild(link);

        formContainer.prepend(fallbackDiv);
        fallbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    // ============================================================
    // 12. REAL-TIME VALIDATION
    // FIX #4: use input.id (arrow function `this` does NOT refer to
    //         the iterated element).
    // FIX #15: use 'change' for checkbox; 'blur' for text inputs.
    // ============================================================
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.id === 'entry_email_confirmation') {
            input.addEventListener('input', function() {
                if (shadow.getElementById('entry_email').value) {
                    validateEmailConfirmation();
                }
            });
        }
        if (input.id === 'entry_privacyPolicy') {
            input.addEventListener('change', function() {
                validateCheckbox(this.id, 'entry_privacyPolicyError');
            });
        } else {
            input.addEventListener('blur', function() {
                if (this.id === 'entry_email') {
                    validateEmail();
                } else if (this.id === 'entry_email_confirmation') {
                    validateEmailConfirmation();
                } else if (this.id === 'entry_phone') {
                    validatePhone();
                } else if (this.required) {
                    validateRequiredField(this.id, this.id + 'Error');
                }
            });
        }
    });

    // ============================================================
    // 13. VALIDATION FUNCTIONS
    // FIX #11: single (Salesforce-strict) regex — same effective behavior
    //          as the old "must pass both" logic, but cleaner.
    // FIX #12: get label text via for-attribute lookup (no fragile
    //          previousElementSibling + dead replace('*', '')).
    // ============================================================
    const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^(\+?[0-9\s\-\(\)]{8,20})$/;

    function getLabelTextFor(field) {
        const label = shadow.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.trim() : '';
    }

    function validateRequiredField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        const labelText = getLabelTextFor(field);
        if (!field.value.trim()) {
            showError(errorId, `${labelText}を入力してください`);
            return false;
        } else if (field.value.length > 255) {
            showError(errorId, `${labelText}を255文字以内で入力してください`);
            return false;
        } else {
            hideError(errorId);
            return true;
        }
    }

    function validateEmail() {
        const email = shadow.getElementById('entry_email');
        if (!email.value.trim()) {
            showError('entry_emailError', 'Eメールを入力してください');
            return false;
        } else if (email.value.length > 255) {
            showError('entry_emailError', 'Eメールを255文字以内で入力してください');
            return false;
        } else if (!EMAIL_REGEX.test(email.value)) {
            showError('entry_emailError', '有効なメールアドレスを入力してください');
            return false;
        } else {
            hideError('entry_emailError');
            return true;
        }
    }

    // FIX #10: no longer calls validateEmail() — no side effects on email field
    function validateEmailConfirmation() {
        const email = shadow.getElementById('entry_email');
        const emailConfirmation = shadow.getElementById('entry_email_confirmation');

        if (!emailConfirmation.value.trim()) {
            showError('entry_emailConfirmationError', 'Eメールを再入力してください');
            return false;
        } else if (emailConfirmation.value.length > 255) {
            showError('entry_emailConfirmationError', 'Eメールを255文字以内で入力してください');
            return false;
        } else if (!EMAIL_REGEX.test(emailConfirmation.value)) {
            showError('entry_emailConfirmationError', '有効なメールアドレスを入力してください');
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
        } else if (!PHONE_REGEX.test(phone.value)) {
            showError('entry_phoneError', '有効な電話番号を入力してください');
            return false;
        } else {
            hideError('entry_phoneError');
            return true;
        }
    }

    function validateCheckbox(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        if (!field.checked) {
            showError(errorId, 'プライバシーポリシーに同意する必要があります');
            return false;
        } else {
            hideError(errorId);
            return true;
        }
    }

    function showError(errorId, message) {
        const errorElement = shadow.getElementById(errorId);
        if (!errorElement) return;
        errorElement.textContent = message;
        errorElement.setAttribute('style', 'display: block !important;');
        errorElement.setAttribute('aria-hidden', 'false');
    }

    function hideError(errorId) {
        const errorElement = shadow.getElementById(errorId);
        if (!errorElement) return;
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
