(function() {
    // FIX #8: early return if target not found
    const oldDiv = document.getElementById("for_form");
    if (!oldDiv) {
        console.error("Target div not found!");
        return;
    }

    const newDivElement = document.createElement("div");
    newDivElement.id = "entry_form-container";
    oldDiv.replaceWith(newDivElement);

    const container = newDivElement;
    // FIX #9: removed useless null check (createElement never returns null)

    // Create shadow DOM
    const shadow = container.attachShadow({ mode: 'open' });

    // ===== Styles (unchanged from original) =====
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
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
            row-gap: 20px;
            column-gap: 25px;
            align-items: flex-start;
        }

        .form-group {
            flex: 1 1 250px;
            margin-bottom: 15px;
            display: flex;
            flex-direction: column;
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

        select { color: var(--placeholder-color); }

        input:focus {
            background: #dddddd !important;
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
        }
        select:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
            border-color: var(--primary-color);
        }

        input:hover, input:focus:hover { background: #EEEEEE !important; }

        input::placeholder {
            opacity: 0.5;
            color: var(--placeholder-color);
            font-weight: bold;
            font-family: var(--font-family);
        }
        input::-webkit-input-placeholder {
            opacity: 0.5;
            color: var(--placeholder-color);
            font-weight: bold;
            font-family: var(--font-family);
        }
        input::-moz-placeholder {
            opacity: 0.5;
            color: var(--placeholder-color);
            font-weight: bold;
            font-family: var(--font-family);
        }

        .file-input-container {
            position: relative;
            overflow: hidden;
            display: inline-block;
            width: 100%;
        }

        .file-input-label {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            border: var(--input-border);
            border-radius: 4px;
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
        .file-input-label:hover { background-color: #005a9e; }
        .file-input-label:active { transform: translateY(1px); }

        .file-input {
            position: absolute;
            left: 0; top: 0;
            opacity: 0;
            cursor: pointer;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .file-name {
            margin-top: 8px;
            font-size: 14px;
            color: #ffffff;
            font-weight: normal;
            word-break: break-all;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            justify-content: center;
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

        #entry_privacy_policy_link, #entry_privacy_policy_link:visited {
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

        .submit-btn {
            background: linear-gradient(106deg, #49fff1 0%, #0062e9 100%);
            transition: transform 0.4s cubic-bezier(.4,.4,0,1), background 0.3s;
            color: white;
            font-weight: bold;
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
        @media (-ms-high-contrast: active), (-ms-high-contrast: none) {
            .submit-btn { background: #0062e9; }
        }
    `;
    container.appendChild(mediaQuery);

    // ===== Form HTML (unchanged) =====
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
                    <label for="entry_desiredOccupation" class="required-label">応募職種</label>
                    <select id="entry_desiredOccupation" name="desiredOccupation" required aria-required="true">
                        <option value="">ご希望の職種を選択してください</option>
                        <option value="新卒・第二新卒 オープンポジション">・新卒・第二新卒: オープンポジション</option>
                        <option value="インサイドセールス">・インサイドセールス</option>
                        <option value="フィールドセールス">・フィールドセールス</option>
                        <option value="フィールドセールス・エキスパート">・フィールドセールス・エキスパート</option>
                        <option value="DXコンサルタント・エントリーレベル">・DXコンサルタント・エントリーレベル</option>
                        <option value="DXコンサルタント">・DXコンサルタント</option>
                        <option value="DXコンサルタント・エキスパート">・DXコンサルタント・エキスパート</option>
                        <option value="データサイエンティスト">・データサイエンティスト</option>
                        <option value="コーポレートファンクション">・コーポレートファンクション</option>
                        <option value="Brand / UIUX Designer(ジュニア〜ミドル)">・Brand / UIUX Designer(ジュニア〜ミドル)</option>
                    </select>
                    <div class="error-message" id="entry_desiredOccupationError">応募職種を選択してください</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="entry_resume" class="required-label" id="entry_resumeLabel">履歴書</label>
                    <div class="file-input-container">
                        <label for="entry_resume" class="file-input-label" id="entry_fileName">ファイルを選択</label>
                        <input type="file" id="entry_resume" name="resume" class="file-input" required aria-required="true">
                    </div>
                    <div class="error-message" id="entry_resumeError">履歴書をアップロードしてください(PDF、Excel、Word形式、10MB以下)</div>
                </div>
                <div class="form-group" id="CVContainer">
                    <label for="entry_CV" id="entry_CVLabel">職務経歴書 (中途の方のみ)</label>
                    <div class="file-input-container">
                        <label for="entry_CV" class="file-input-label" id="entry_CVfileName">ファイルを選択</label>
                        <input type="file" id="entry_CV" name="CV" class="file-input">
                    </div>
                    <div class="error-message" id="entry_CVError">職務経歴書をアップロードしてください(PDF、Excel、Word形式、10MB以下)</div>
                </div>
                <div class="form-group" id="gradYearContainer" style="display:none;">
                    <label for="entry_graduationYear" id="entry_GradYearLabel">卒業年度 (学生の方のみ)</label>
                    <input type="number" id="entry_graduationYear" name="graduationYear" placeholder="2023">
                    <div class="error-message" id="entry_graduationYearError">卒業年度を入力してください</div>
                </div>
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true">
                <label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">採用選考に関する<a target="_blank" href="https://recruit.gl-navi.co.jp/privacypolicy" id="entry_privacy_policy_link" data-has-link="true" rel="noopener">プライバシーポリシー</a>に同意する
                </label>
            </div>
            <div class="error-message" id="entry_privacyPolicyError">プライバシーポリシーに同意する必要があります</div>

            <input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">

            <button type="submit" id="entry_submitBtn" class="submit-btn">エントリー</button>
        </form>
    `;
    shadow.appendChild(formElement);

    // ===== Element references =====
    const sbmtBtn = shadow.getElementById('entry_submitBtn');
    const form = shadow.getElementById('entry_entryForm');
    const resumeInput = shadow.getElementById('entry_resume');
    const fileNameDisplay = shadow.getElementById('entry_fileName');
    const resumeLabel = shadow.getElementById("entry_resumeLabel");
    const CVInput = shadow.getElementById('entry_CV');
    const CVFileNameDisplay = shadow.getElementById('entry_CVfileName');
    const privacyPolicyCheckbox = shadow.getElementById('entry_privacyPolicy');
    const privacyPolicyTimestampField = shadow.getElementById('entry_privacyPolicyTimestamp');
    const desiredOccupation = shadow.getElementById("entry_desiredOccupation");
    const CVLabel = shadow.getElementById("entry_CVLabel");
    const gradYear = shadow.getElementById("entry_graduationYear");
    const gradYearLabel = shadow.getElementById("entry_GradYearLabel");
    const gradYearContainer = shadow.getElementById("gradYearContainer");
    const CVContainer = shadow.getElementById("CVContainer");

    // FIX #23: clearer name (was misleadingly called "nextYear")
    const placeholderGradYear = new Date().getFullYear() + 1;
    gradYear.placeholder = placeholderGradYear;

    let applicantType;

    // ===== Marketo loading (FIXES #1, #2, #4, #12) =====
    sbmtBtn.disabled = true;
    sbmtBtn.textContent = '読込中...';
    let mktoFormEl = null;
    let mktoLoadAttempts = 0;
    const MAX_MKTO_ATTEMPTS = 50; // ~5s before giving up
    let mktoSuccessResolver = null; // FIX #12: shared slot for current submission

    function enableSubmitButton() {
        // Only flip text if still in loading state (don't override "送信中..." mid-submit)
        if (sbmtBtn.textContent === '読込中...') {
            sbmtBtn.disabled = false;
            sbmtBtn.textContent = 'エントリー';
        }
    }

    function initializeMarketoLogicWhenReady() {
        if (typeof MktoForms2 !== "undefined") {
            try {
                MktoForms2.whenReady(function(mktoForm) {
                    mktoFormEl = mktoForm;
                    // FIX #12: register onSuccess ONCE (not per-submission)
                    try {
                        mktoFormEl.onSuccess(function() {
                            if (mktoSuccessResolver) {
                                const r = mktoSuccessResolver;
                                mktoSuccessResolver = null;
                                r();
                            }
                            return false; // Always prevent Marketo's default redirect
                        });
                    } catch (e) {
                        console.warn("Could not register Marketo onSuccess:", e);
                    }
                    enableSubmitButton();
                });
            } catch (e) {
                console.warn("Marketo whenReady failed:", e);
                enableSubmitButton(); // FIX #1: don't block user if Marketo crashes
            }
        } else if (mktoLoadAttempts < MAX_MKTO_ATTEMPTS) {
            // FIX #2: bounded retry
            mktoLoadAttempts++;
            setTimeout(initializeMarketoLogicWhenReady, 100);
        } else {
            // FIX #1: enable button even if Marketo never loads (adblocker case)
            console.warn("MktoForms2 didn't load after " + MAX_MKTO_ATTEMPTS + " attempts. Proceeding without Marketo.");
            enableSubmitButton();
        }
    }
    initializeMarketoLogicWhenReady();

    // FIX #5: try to flush any error reports stored from previous failed sessions
    flushStoredErrors();

    function flushStoredErrors() {
        try {
            const stored = localStorage.getItem('entry_form_errors_v1');
            if (!stored) return;
            const errors = JSON.parse(stored);
            if (!Array.isArray(errors) || errors.length === 0) {
                localStorage.removeItem('entry_form_errors_v1');
                return;
            }
            errors.forEach(errData => {
                fetch("https://eoimhkgidqcxp6a.m.pipedream.net", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errData),
                    keepalive: true
                }).catch(() => { /* still blocked, give up silently */ });
            });
            // Clear regardless to prevent unbounded growth
            localStorage.removeItem('entry_form_errors_v1');
        } catch (e) {
            console.warn("flushStoredErrors error:", e);
        }
    }

    // ===== Occupation change handler =====
    desiredOccupation.addEventListener("change", function () {
        if (validateDesiredOccupation()) {
            // FIX: use === instead of ==
            if (this.value === "新卒・第二新卒 オープンポジション") {
                applicantType = '応募者_新卒';

                CVContainer.style.display = "none";
                CVLabel.className = "";
                CVInput.required = false;
                CVInput.removeAttribute('aria-required'); // FIX #26

                gradYearContainer.style.display = "";
                gradYearLabel.className = "required-label";
                gradYear.required = true;
                gradYear.setAttribute('aria-required', 'true'); // FIX #26

                resumeInput.required = false;
                resumeInput.removeAttribute('aria-required'); // FIX #26
                resumeLabel.className = "";
            } else {
                applicantType = '応募者_中途';

                CVContainer.style.display = "";
                CVLabel.className = "required-label";
                CVInput.required = true;
                CVInput.setAttribute('aria-required', 'true'); // FIX #26

                gradYearContainer.style.display = "none";
                gradYearLabel.className = "";
                gradYear.required = false;
                gradYear.removeAttribute('aria-required'); // FIX #26
                gradYear.value = "";

                resumeInput.required = true;
                resumeInput.setAttribute('aria-required', 'true'); // FIX #26
                resumeLabel.className = "required-label";
            }
        }
    });

    // ===== File name displays =====
    resumeInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileNameDisplay.textContent = this.files[0].name;
            fileNameDisplay.style.fontWeight = "bold";
            validateFile(this);
        } else {
            fileNameDisplay.textContent = '選択されていません';
            hideError('entry_resumeError');
        }
    });

    CVInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            CVFileNameDisplay.textContent = this.files[0].name;
            CVFileNameDisplay.style.fontWeight = "bold";
            validateCVFile(this);
        } else {
            CVFileNameDisplay.textContent = '選択されていません';
            hideError('entry_CVError');
        }
    });

    privacyPolicyCheckbox.addEventListener('change', function() {
        if (this.checked) {
            privacyPolicyTimestampField.value = new Date().toISOString();
        } else {
            privacyPolicyTimestampField.value = '';
        }
    });

    // FIX #13: fallback flag in outer scope so it persists across multiple errors
    let fallbackShown = false;

    // ===== Form submission =====
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearAllErrors();

        let isValid = true;
        isValid = validateRequiredField('entry_lastName', 'entry_lastNameError') && isValid;
        isValid = validateRequiredField('entry_firstName', 'entry_firstNameError') && isValid;
        isValid = validateEmail() && isValid;
        isValid = validateEmailConfirmation() && isValid;
        isValid = validatePhone() && isValid;
        isValid = validateDesiredOccupation() && isValid;
        isValid = validateFile(resumeInput) && isValid;
        isValid = validateCVFile(CVInput) && isValid;
        isValid = validateGraduationYear() && isValid;
        isValid = validateCheckbox('entry_privacyPolicy', 'entry_privacyPolicyError') && isValid;

        function setFormSubmitting(isSubmitting) {
            const allInputs = form.querySelectorAll('input, button, select');
            allInputs.forEach(el => { el.disabled = isSubmitting; });
            sbmtBtn.disabled = isSubmitting;
            sbmtBtn.textContent = isSubmitting ? '送信中...' : 'エントリー';
        }

        if (!isValid) return;

        if (typeof gtag === 'function') {
            gtag('event', 'form_submit_attempt', {
                'event_category': 'Application',
                'event_label': 'New Grad Form'
            });
        }

        // Build form data with safe filenames
        const formData = new FormData(form);
        for (const [key, value] of [...formData.entries()]) {
            if (value instanceof File) {
                // FIX #18: skip empty file slots (input not filled in)
                if (value.size === 0 || !value.name) {
                    formData.delete(key);
                    continue;
                }
                // FIX #19: handle files without extensions (no dot, or starts with dot)
                const lastDot = value.name.lastIndexOf('.');
                const ext = lastDot > 0 ? value.name.substring(lastDot) : '';
                // FIX #20: include the field key to avoid collisions in same millisecond
                const safeName = `upload-${key}-${Date.now()}${ext}`;
                formData.set(key, new File([value], safeName, { type: value.type }));
            }
        }

        setFormSubmitting(true);

        // FIX #21: per-request timeout via AbortController
        const fetchWithRetry = async (url, options, retries = 3, timeoutMs = 60000) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(timeoutId);
                return response;
            } catch (err) {
                clearTimeout(timeoutId);
                if (retries > 0) {
                    console.log(`Retrying... attempts left: ${retries}`);
                    await new Promise(res => setTimeout(res, 1000));
                    return fetchWithRetry(url, options, retries - 1, timeoutMs);
                }
                throw err;
            }
        };

        // 1. Submit to Pipedream
        fetchWithRetry('https://eo4oramamadwsus.m.pipedream.net', {
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
            // FIX #3, #4: Marketo cannot fail or block the success path
            return submitToMarketoSafely(formData);
        })
        .then(() => {
            // FIX #7: removed undeclared isSubmissionInProgress reference
            // FIX #10, #11: reset to initial HTML defaults
            resetFormToInitialState();
            setFormSubmitting(false);
            window.location.href = "https://recruit.gl-navi.co.jp/apply/successful";
        })
        .catch(error => {
            console.error('Submission Error:', error);

            const fallbackEmail = "saiyou@gl-navi.co.jp";
            let subject = encodeURIComponent("中途採用応募 (フォームエラー)");
            let rawBody =
`採用担当者様

フォーム送信時にエラーが発生したため、メールにて応募いたします。

--------------------------------------------------
■氏名
${formData.get('lastName')} ${formData.get('firstName')}

■電話番号
${formData.get('phone')}

■Email
${formData.get('email')}

■応募職種
${formData.get('desiredOccupation')}
--------------------------------------------------

※履歴書・ポートフォリオを添付いたしました。
ご確認のほどよろしくお願いいたします。`;
            if (applicantType === '応募者_新卒') {
                subject = encodeURIComponent("新卒採用応募 (フォームエラー)");
                rawBody = `採用担当者様

フォーム送信時にエラーが発生したため、メールにて応募いたします。

--------------------------------------------------
■氏名
${formData.get('lastName')} ${formData.get('firstName')}

■電話番号
${formData.get('phone')}

■Email
${formData.get('email')}

■卒業年度
${formData.get('graduationYear')}

■応募職種
${formData.get('desiredOccupation')}
--------------------------------------------------

※履歴書を添付いたしました。
ご確認のほどよろしくお願いいたします。`;
            }
            const body = encodeURIComponent(rawBody);

            let userMessage = '';
            let isBlockingIssue = false;

            // Detect adblocker / network block. AbortError = our timeout (treated as network issue too).
            if (!error.status && (error.name === 'TypeError' || error.name === 'AbortError')) {
                isBlockingIssue = true;
                userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
            } else {
                userMessage = 'システムエラーが発生しました。';
                if (error.data) {
                    for (let x in error.data) {
                        userMessage += "\n・" + error.data[x];
                    }
                }
            }

            alert(userMessage);

            // FIX #13: fallbackShown is in outer scope, so duplicate UIs no longer stack
            if (isBlockingIssue && !fallbackShown) {
                const formContainer = form.parentNode;

                const fallbackDiv = document.createElement('div');
                fallbackDiv.style.cssText = 'margin: 20px 0 20px 0; margin-bottom: 10px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';
                fallbackDiv.innerHTML = `
                    <p style="margin-bottom:10px; font-weight:bold;">送信できませんでした。</p>
                    <p>1．別の端末から再度お試しください。</p>
                    <p>2．解決しない場合は、お手数ですが、saiyou@gl-navi.co.jp宛に、履歴書を添付の上直接メールをお送りください。</p>
                    <p style="margin-top:5px;">※以下のボタンからもメールソフトを起動できます。</p>
                    <a href="mailto:${fallbackEmail}?subject=${subject}&body=${body}"
                    style="display:inline-block; margin-top: 3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;">
                    メールで応募する
                    </a>
                `;

                formContainer.prepend(fallbackDiv);
                fallbackShown = true;
                fallbackDiv.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }

            logError(error, formData);
            setFormSubmitting(false);
        });
    });

    // FIX #3, #4: Marketo wrapped so it CAN'T break or block the Pipedream success path.
    // This Promise NEVER rejects; it always resolves.
    function submitToMarketoSafely(formData) {
        return new Promise((resolve) => {
            try {
                if (!mktoFormEl || typeof mktoFormEl.submit !== 'function') {
                    console.warn("Marketo form not available, skipping Marketo submission.");
                    resolve();
                    return;
                }

                const timeoutId = setTimeout(() => {
                    if (mktoSuccessResolver) mktoSuccessResolver = null;
                    console.warn("Marketo submission timed out, proceeding anyway.");
                    resolve();
                }, 3000);

                mktoSuccessResolver = function() {
                    clearTimeout(timeoutId);
                    resolve();
                };

                try {
                    mktoFormEl.setValues({
                        'LastName': formData.get('lastName'),
                        'FirstName': formData.get('firstName'),
                        'Email': formData.get('email'),
                        'Phone': formData.get('phone'),
                        'graduation': formData.get('graduationYear'),
                        // NOTE: typo 'praivacyPolicy' is intentional per requirements
                        'praivacyPolicy': formData.get('privacyPolicy') !== null ? "yes" : "no",
                        'recordtype': applicantType
                    });
                    mktoFormEl.submit();
                } catch (mktoErr) {
                    console.warn("Marketo submission threw, ignoring:", mktoErr);
                    clearTimeout(timeoutId);
                    mktoSuccessResolver = null;
                    resolve();
                }
            } catch (outerErr) {
                console.warn("Unexpected error in submitToMarketoSafely:", outerErr);
                resolve();
            }
        });
    }

    // FIX #5, #22: error logger with truncated stack + localStorage backup
    function logError(error, formData) {
        const formPayload = {};
        formData.forEach((value, key) => {
            if (value instanceof File) {
                formPayload[key] = {
                    filename: value.name,
                    size: value.size,
                    type: value.type
                };
            } else {
                formPayload[key] = value;
            }
        });

        // FIX #22: cap stack length so total body stays well under keepalive's 64KB
        const stackTrace = (error.stack || '').substring(0, 8000);

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
                stack: stackTrace
            },
            formSubmission: formPayload
        };

        fetch("https://eoimhkgidqcxp6a.m.pipedream.net", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(debugData),
            keepalive: true
        }).catch(e => {
            console.warn("Could not send error log, attempting localStorage backup:", e);
            // FIX #5: persist error so a later page load can attempt to flush it
            try {
                const stored = localStorage.getItem('entry_form_errors_v1');
                let errors = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(errors)) errors = [];
                errors.push(debugData);
                if (errors.length > 5) errors = errors.slice(-5); // cap size
                localStorage.setItem('entry_form_errors_v1', JSON.stringify(errors));
            } catch (storageErr) {
                console.warn("localStorage backup also failed:", storageErr);
            }
        });
    }

    // FIX #10, #11: reset to initial HTML defaults (not last-used state)
    function resetFormToInitialState() {
        form.reset();
        fileNameDisplay.textContent = '選択されていません';
        fileNameDisplay.style.fontWeight = "";
        CVFileNameDisplay.textContent = '選択されていません';
        CVFileNameDisplay.style.fontWeight = "";

        gradYearContainer.style.display = "none";
        CVContainer.style.display = "";

        resumeInput.required = true;
        resumeInput.setAttribute('aria-required', 'true');
        resumeLabel.className = "required-label";

        CVInput.required = false;
        CVInput.removeAttribute('aria-required');
        CVLabel.className = "";

        gradYear.required = false;
        gradYear.removeAttribute('aria-required');
        gradYearLabel.className = "";

        applicantType = undefined;
    }

    // ===== Real-time validation =====
    const realtimeInputs = form.querySelectorAll('input');
    realtimeInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.id === 'entry_email') {
                validateEmail();
            } else if (this.id === 'entry_email_confirmation') {
                validateEmailConfirmation();
            } else if (this.id === 'entry_phone') {
                validatePhone();
            } else if (this.id === 'entry_privacyPolicy') {
                validateCheckbox(this.id, 'entry_privacyPolicyError');
            } else if (this.id === 'entry_resume') {
                validateFile(this);
            } else if (this.id === 'entry_CV') {
                validateCVFile(this);
            } else if (this.id === 'entry_graduationYear') {
                validateGraduationYear();
            } else if (this.required) {
                validateRequiredField(this.id, this.id + 'Error');
            }
        });
    });

    // ===== Validation helpers =====

    // FIX #16: robust label lookup (uses for=id rather than DOM position)
    // FIX #27: replaceAll instead of single-occurrence replace
    function getLabelTextFor(fieldId) {
        const label = shadow.querySelector(`label[for="${fieldId}"]`);
        return label ? label.textContent.replace(/\*/g, '').trim() : 'この項目';
    }

    function validateRequiredField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        const labelText = getLabelTextFor(fieldId);

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
        const emailRegex_Marketo = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const emailRegex_Salesforce = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

        if (!email.value.trim()) {
            showError('entry_emailError', 'Eメールを入力してください');
            return false;
        } else if (email.value.length > 255) {
            showError('entry_emailError', 'Eメールを255文字以内で入力してください');
            return false;
        } else if (!emailRegex_Marketo.test(email.value) || !emailRegex_Salesforce.test(email.value)) {
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
        } else if (!validateEmail()) {
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
        } else if (!phoneRegex_Marketo.test(phone.value)) {
            showError('entry_phoneError', '有効な電話番号を入力してください');
            return false;
        } else if (!phoneRegex_Salesforce.test(phone.value)) {
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

        if (!graduationYear.required) {
            hideError('entry_graduationYearError');
            return true;
        }

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

    function validateDesiredOccupation() {
        const occ = shadow.getElementById("entry_desiredOccupation");
        if (!occ.value) {
            showError('entry_desiredOccupationError', '応募職種を選択してください');
            return false;
        } else {
            hideError('entry_desiredOccupationError');
            return true;
        }
    }

    // FIX #14: even when the file is not required, if one IS uploaded, validate format/size
    // FIX #15: specific error messages per field (was using generic "ファイルが空です" for CV)
    // FIX #17: unified function takes errorId & label as params (no more hardcoded IDs)
    // FIX #25: removed redundant "if (files && length > 0)" check
    function validateFileInput(fileInput, errorId, fieldLabel) {
        // Case 1: no file uploaded
        if (!fileInput.files || fileInput.files.length === 0) {
            if (fileInput.required) {
                showError(errorId, `${fieldLabel}をアップロードしてください`);
                return false;
            }
            hideError(errorId);
            return true;
        }

        // Case 2: file present — always validate size & format (even if not required)
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

        if (fileSize === 0) {
            showError(errorId, 'ファイルが空です。有効なファイルをアップロードしてください');
            return false;
        }
        if (fileSize > maxSize) {
            showError(errorId, 'ファイルサイズは10MB以下にしてください');
            return false;
        }

        const fileMimeType = file.type;
        const isValidFormat = allowedFormats.some(format =>
            fileName.endsWith(format.ext) || fileMimeType === format.mime
        );

        if (!isValidFormat) {
            console.debug('File validation failed:', {
                filename: fileName, size: fileSize, type: file.type
            });
            showError(errorId, '許可されているファイル形式：PDF、Excel、Word形式のみ');
            return false;
        }

        hideError(errorId);
        return true;
    }

    function validateFile(fileInput) {
        return validateFileInput(fileInput, 'entry_resumeError', '履歴書');
    }

    function validateCVFile(fileInput) {
        return validateFileInput(fileInput, 'entry_CVError', '職務経歴書');
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
