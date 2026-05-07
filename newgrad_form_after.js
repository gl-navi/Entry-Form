(function() {
    // ============================================================
    // INIT & SAFETY
    // ============================================================
    const oldDiv = document.getElementById("for_form");
    if (!oldDiv) {
        console.error("Target div not found!");
        return; // FIX #4: actually stop instead of crashing on the next line
    }

    const newDivElement = document.createElement("div");
    newDivElement.id = "entry_form-container";
    oldDiv.replaceWith(newDivElement);

    const container = newDivElement;
    const shadow = container.attachShadow({ mode: 'open' });

    // ============================================================
    // STATE (hoisted so it survives across retries / catch blocks)
    // ============================================================
    let mktoFormEl = null;
    let mktoBlocked = false;
    let mktoSuccessHandler = null;       // FIX #6: register onSuccess only once
    let isSubmitting = false;            // FIX #21: double-submit guard
    let fallbackShown = false;           // FIX #13: hoisted out of catch

    // ============================================================
    // STYLES (unchanged)
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
    // FORM HTML
    // ============================================================
    const formElement = document.createElement('div');
    formElement.id = 'entry_form-wrapper'; // FIX #14: explicit ID instead of relying on parentNode
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
                    <label for="entry_school" class="required-label">学校名</label>
                    <input type="text" id="entry_school" name="school" required aria-required="true" placeholder="○○大学、○○大学院">
                    <div class="error-message" id="entry_schoolError">学校名を入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_department">学部名</label>
                    <input type="text" id="entry_department" name="department" placeholder="○○学部">
                    <div class="error-message" id="entry_departmentError">学部名を入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_faculty">学科名</label>
                    <input type="text" id="entry_faculty" name="faculty" placeholder="○○学科">
                    <div class="error-message" id="entry_facultyError">学科名を入力してください</div>
                </div>
                <div class="form-group">
                    <label for="entry_graduationYear" class="required-label">卒業年度</label>
                    <input type="number" id="entry_graduationYear" name="graduationYear" required aria-required="true" placeholder="2023">
                    <div class="error-message" id="entry_graduationYearError">卒業年度を入力してください</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_eventDate" class="required-label">説明会参加日</label>
                    <input type="date" id="entry_eventDate" name="eventDate" required aria-required="true">
                    <div class="error-message" id="entry_eventDateError"></div>
                </div>
                <div class="form-group">
                    <!-- FIX: comment file is required - aria-required corrected to true -->
                    <label for="entry_comment" class="required-label">説明会感想文</label>
                    <div class="file-input-container">
                        <label for="entry_comment" class="file-input-label" id="entry_commentfileName">ファイルを選択</label>
                        <input type="file" id="entry_comment" name="comment" class="file-input" required aria-required="true">
                    </div>
                    <div class="error-message" id="entry_commentError">感想文をアップロードしてください（PDF、TXT、Word形式、5MB以下）</div>
                </div>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="entry_privacyPolicy" name="privacyPolicy" class="checkbox-input" required aria-required="true">
                <label for="entry_privacyPolicy" id="entry_privacyPolicyLabel">
                    採用選考に関する
                    <a target="_blank" href="https://recruit.gl-navi.co.jp/privacypolicy" id="entry_privacy_policy_link" data-has-link="true" rel="noopener noreferrer">プライバシーポリシー</a>に同意する
                </label>
            </div>
            <div class="error-message" id="entry_privacyPolicyError">プライバシーポリシーに同意する必要があります</div>
            <input type="hidden" id="entry_privacyPolicyTimestamp" name="privacyPolicyTimestamp" value="">
            <button type="submit" id="entry_submitBtn" class="submit-btn">エントリー</button>
        </form>
    `;
    shadow.appendChild(formElement);

    // ============================================================
    // ELEMENT REFERENCES
    // ============================================================
    const form = shadow.getElementById('entry_entryForm');
    const sbmtBtn = shadow.getElementById('entry_submitBtn');
    const resumeInput = shadow.getElementById('entry_resume');
    const fileNameDisplay = shadow.getElementById('entry_fileName');
    const commentInput = shadow.getElementById('entry_comment');
    const commentFileNameDisplay = shadow.getElementById('entry_commentfileName');
    const graduationYearInput = shadow.getElementById('entry_graduationYear');
    const privacyPolicyCheckbox = shadow.getElementById('entry_privacyPolicy');
    const privacyPolicyTimestampField = shadow.getElementById('entry_privacyPolicyTimestamp');

    // FIX #16: explicit string coercion
    const nextYear = new Date().getFullYear() - 3;
    graduationYearInput.placeholder = String(nextYear);

    // ============================================================
    // MARKETO LOADER — non-blocking
    // FIX #3, #22: max wait, never disable submit, swallow load errors
    // ============================================================
    const MAX_MKTO_WAIT_MS = 8000;
    const MKTO_SUBMIT_GRACE_MS = 1500; // give Marketo this long to fire its request before we navigate away
    const mktoStart = Date.now();

    function initializeMarketoLogicWhenReady() {
        if (typeof MktoForms2 !== "undefined") {
            try {
                MktoForms2.whenReady(function(mktoForm) {
                    mktoFormEl = mktoForm;
                    // FIX #6: register onSuccess ONCE here, dispatch via closure variable
                    try {
                        mktoFormEl.onSuccess(function() {
                            if (typeof mktoSuccessHandler === 'function') {
                                const fn = mktoSuccessHandler;
                                mktoSuccessHandler = null;
                                fn();
                            }
                            return false; // always prevent Marketo's default redirect
                        });
                    } catch (e) {
                        console.warn("Marketo onSuccess registration failed:", e);
                        mktoBlocked = true;
                    }
                    console.log("Marketo form ready.");
                });
            } catch (e) {
                console.warn("MktoForms2.whenReady threw:", e);
                mktoBlocked = true;
            }
            return;
        }
        if (Date.now() - mktoStart >= MAX_MKTO_WAIT_MS) {
            console.warn("Marketo did not load in time — Marketo submission will be skipped for this session.");
            mktoBlocked = true;
            return;
        }
        setTimeout(initializeMarketoLogicWhenReady, 200);
    }
    initializeMarketoLogicWhenReady();

    // ============================================================
    // FILE INPUT HANDLERS
    // ============================================================
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

    commentInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            commentFileNameDisplay.textContent = this.files[0].name;
            commentFileNameDisplay.style.fontWeight = "bold";
            validateCommentFile(this);
        } else {
            commentFileNameDisplay.textContent = '選択されていません';
            hideError('entry_commentError');
        }
    });

    privacyPolicyCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // NOTE: this is UX-only. The authoritative timestamp must be set server-side
            // in Pipedream when it receives the request — the client value is editable.
            privacyPolicyTimestampField.value = new Date().toISOString();
        } else {
            privacyPolicyTimestampField.value = '';
        }
    });

    // ============================================================
    // UTILITIES
    // ============================================================
    function setFormSubmitting(submitting) {
        isSubmitting = submitting;
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(input => { input.disabled = submitting; });
        sbmtBtn.disabled = submitting;
        sbmtBtn.textContent = submitting ? '送信中...' : 'エントリー';
    }

    // FIX #2, #12: AbortController timeout, don't retry hard failures
    const fetchWithRetry = async (url, options, retries = 2, timeoutMs = 20000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            // TypeError = network/adblocker block, AbortError = our timeout. Both are terminal.
            const isHardFailure = err.name === 'TypeError' || err.name === 'AbortError';
            if (retries > 0 && !isHardFailure) {
                console.log(`Retrying... attempts left: ${retries}`);
                await new Promise(r => setTimeout(r, 1000));
                return fetchWithRetry(url, options, retries - 1, timeoutMs);
            }
            throw err;
        }
    };

    // FIX #11: safer file rename with extension whitelist
    function renameFileSafely(file, key, allowedExts) {
        const dot = file.name.lastIndexOf('.');
        const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : '';
        const safeExt = allowedExts.includes(ext) ? ext : 'bin';
        const rand = Math.random().toString(36).slice(2, 8);
        return `upload-${key}-${Date.now()}-${rand}.${safeExt}`;
    }

    // Marketo: best-effort, never blocks. Always resolves.
    function submitToMarketo(formData) {
        return new Promise((resolve) => {
            if (mktoBlocked || !mktoFormEl) {
                console.log("Skipping Marketo (not loaded or blocked).");
                return resolve();
            }
            const timeoutId = setTimeout(() => {
                console.warn("Marketo grace period elapsed, proceeding to redirect.");
                mktoSuccessHandler = null;
                resolve();
            }, MKTO_SUBMIT_GRACE_MS);

            mktoSuccessHandler = function() {
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
                    'praivacyPolicy': formData.get('privacyPolicy') !== null ? "yes" : "no",
                    'recordtype': '応募者_新卒'
                });
                mktoFormEl.submit();
            } catch (e) {
                clearTimeout(timeoutId);
                mktoSuccessHandler = null;
                console.warn("Marketo submit threw:", e);
                resolve(); // never let Marketo fail the user flow
            }
        });
    }

    // ============================================================
    // SUBMIT HANDLER
    // ============================================================
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // FIX #21: prevent double submit
        if (isSubmitting) return;

        // FIX #17: track ALL attempts (not just valid ones)
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
        isValid = validateRequiredField('entry_school', 'entry_schoolError') && isValid;
        isValid = validateOptionalField('entry_department', 'entry_departmentError') && isValid;
        isValid = validateOptionalField('entry_faculty', 'entry_facultyError') && isValid;
        isValid = validateGraduationYear() && isValid;
        isValid = validateFile(resumeInput) && isValid;
        isValid = validateEventDate() && isValid;
        isValid = validateCommentFile(commentInput) && isValid;
        isValid = validateCheckbox('entry_privacyPolicy', 'entry_privacyPolicyError') && isValid;

        if (!isValid) return;

        if (typeof gtag === 'function') {
            gtag('event', 'form_submit_valid', {
                'event_category': 'Application',
                'event_label': 'New Grad Form'
            });
        }

        // Build FormData with safe file names
        const formData = new FormData(form);
        const ALLOWED_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'text'];
        for (const [key, value] of [...formData.entries()]) {
            if (value instanceof File) {
                const safeName = renameFileSafely(value, key, ALLOWED_EXTS);
                formData.set(key, new File([value], safeName, { type: value.type }));
            }
        }

        setFormSubmitting(true);

        // 1) Pipedream — primary, the one that creates the SF record
        fetchWithRetry('https://eomqvyxkj6pt9w5.m.pipedream.net', {
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
            // 2) Marketo — best-effort, never blocks
            return submitToMarketo(formData);
        })
        .then(() => {
            // FIX #18: don't re-enable button — we're navigating away
            form.reset();
            window.location.href = "https://recruit.gl-navi.co.jp/apply/successful";
        })
        .catch(error => {
            console.error('Submission Error:', error);
            handleSubmissionError(error, formData);
            setFormSubmitting(false);
        });
    });

    // ============================================================
    // ERROR HANDLER (separated for readability)
    // ============================================================
    function handleSubmissionError(error, formData) {
        const fallbackEmail = "saiyou@gl-navi.co.jp";
        const subject = encodeURIComponent("新卒採用応募 (フォームエラー)");
        const rawBody =
`採用担当者様

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

■学校名
${formData.get('school')}

■学部名
${formData.get('department')}

■学科名
${formData.get('faculty')}

■説明会参加日
${formData.get('eventDate')}
--------------------------------------------------

※履歴書・ポートフォリオを添付いたしました。
ご確認のほどよろしくお願いいたします。`;
        const body = encodeURIComponent(rawBody);

        let userMessage = '';
        let isBlockingIssue = false;

        // Detect adblocker / network block / our own timeout
        if ((!error.status || error.status === 0) &&
            (error.name === 'TypeError' || error.name === 'AbortError')) {
            isBlockingIssue = true;
            userMessage = '【通信エラー】\nセキュリティソフトや広告ブロック機能により、送信がブロックされた可能性があります。\n\nお手数ですが、このままメールでの応募に切り替えていただけますか？';
        } else {
            userMessage = 'システムエラーが発生しました。';
            if (error.data && typeof error.data === 'object') {
                for (let x in error.data) {
                    userMessage += "\n・" + error.data[x];
                }
            }
        }

        alert(userMessage);

        // FIX #19: build fallback UI with createElement (no innerHTML with interpolation)
        // FIX #13: fallbackShown is module-scoped, so retry doesn't duplicate it
        if (isBlockingIssue && !fallbackShown) {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.style.cssText = 'margin: 20px 0 20px 0; margin-bottom: 10px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; color: #856404; border-radius: 4px;';

            const p1 = document.createElement('p');
            p1.style.cssText = 'margin-bottom:10px; font-weight:bold;';
            p1.textContent = '送信できませんでした。';

            const p2 = document.createElement('p');
            p2.textContent = '1．別の端末から再度お試しください。';

            const p3 = document.createElement('p');
            p3.textContent = '2．解決しない場合は、お手数ですが、saiyou@gl-navi.co.jp宛に、履歴書を添付の上直接メールをお送りください。';

            const p4 = document.createElement('p');
            p4.style.cssText = 'margin-top:5px;';
            p4.textContent = '※以下のボタンからもメールソフトを起動できます。';

            const link = document.createElement('a');
            link.setAttribute('href', `mailto:${fallbackEmail}?subject=${subject}&body=${body}`);
            link.setAttribute('rel', 'noopener noreferrer'); // FIX #20
            link.style.cssText = 'display:inline-block; margin-top: 3px; padding:10px 20px; background:#d9534f; color:white; text-decoration:none; border-radius:4px; font-weight:bold;';
            link.textContent = 'メールで応募する';

            fallbackDiv.append(p1, p2, p3, p4, link);
            formElement.prepend(fallbackDiv); // FIX #14: explicit reference
            fallbackShown = true;
            fallbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }

        // Debug logger to second Pipedream
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
                screen: `${window.screen.width}x${window.screen.height}`,
                mktoLoaded: !!mktoFormEl,        // helps diagnose Marketo blocking in #1
                mktoBlocked: mktoBlocked,
                msSincePageLoad: Date.now() - mktoStart
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
        }).catch(e => { console.warn("Could not send error log:", e); });
    }

    // ============================================================
    // REAL-TIME VALIDATION (blur)
    // FIX #10: file inputs validate on change only, not blur
    // ============================================================
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
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
            } else if (this.id === 'entry_department' || this.id === 'entry_faculty') {
                validateOptionalField(this.id, this.id + 'Error');
            } else if (this.id === 'entry_resume' || this.id === 'entry_comment') {
                return; // file inputs validate on change
            } else if (this.id === 'entry_eventDate') {
                validateEventDate();
            } else if (this.required) {
                validateRequiredField(this.id, this.id + 'Error');
            }
        });
    });

    // ============================================================
    // VALIDATION FUNCTIONS
    // ============================================================

    // FIX #9: robust label lookup (no more previousElementSibling fragility)
    function getLabelText(fieldId) {
        const label = shadow.querySelector(`label[for="${fieldId}"]`);
        return label ? label.textContent.replace('*', '').trim() : 'フィールド';
    }

    function validateRequiredField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        const labelText = getLabelText(fieldId);
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

    function validateOptionalField(fieldId, errorId) {
        const field = shadow.getElementById(fieldId);
        const labelText = getLabelText(fieldId);
        if (field.value.trim() && field.value.length > 255) {
            showError(errorId, `${labelText}を255文字以内で入力してください`);
            return false;
        } else {
            hideError(errorId);
            return true;
        }
    }

    // FIX #7: single (stricter, Salesforce-compatible) regex - Marketo accepts a superset
    // FIX #8: pure helper, no DOM side effects
    const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    function isValidEmailFormat(value) {
        return EMAIL_REGEX.test(value);
    }

    function validateEmail() {
        const email = shadow.getElementById('entry_email');
        if (!email.value.trim()) {
            showError('entry_emailError', 'Eメールを入力してください');
            return false;
        } else if (email.value.length > 255) {
            showError('entry_emailError', 'Eメールを255文字以内で入力してください');
            return false;
        } else if (!isValidEmailFormat(email.value)) {
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
        } else if (!isValidEmailFormat(emailConfirmation.value)) {
            // FIX #8: pure check, doesn't disturb the email field's error state
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
        } else if (!phoneRegex_Marketo.test(phone.value) || !phoneRegex_Salesforce.test(phone.value)) {
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

    function validateFile(fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) {
            showError('entry_resumeError', '履歴書をアップロードしてください');
            return false;
        }
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
            showError('entry_resumeError', 'ファイルが空です。有効なファイルをアップロードしてください');
            return false;
        }
        if (fileSize > maxSize) {
            showError('entry_resumeError', 'ファイルサイズは10MB以下にしてください');
            return false;
        }
        const fileMimeType = file.type;
        const isValidFormat = allowedFormats.some(format =>
            fileName.endsWith(format.ext) || fileMimeType === format.mime
        );
        if (!isValidFormat) {
            console.debug('Resume validation failed:', { filename: fileName, size: fileSize, type: file.type });
            showError('entry_resumeError', '許可されているファイル形式：PDF、Excel、Word形式のみ');
            return false;
        }
        hideError('entry_resumeError');
        return true;
    }

    // FIX #1: REQUIRED comment file. All errors point to entry_commentError.
    function validateCommentFile(fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) {
            showError('entry_commentError', '感想文をアップロードしてください（PDF、TXT、Word形式、5MB以下）');
            return false;
        }
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        const fileSize = file.size;
        const maxSize = 5 * 1024 * 1024;
        const allowedFormats = [
            { ext: '.pdf', mime: 'application/pdf' },
            { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { ext: '.doc', mime: 'application/msword' },
            { ext: '.txt', mime: 'text/plain' },
            { ext: '.text', mime: 'text/plain' }
        ];
        if (fileSize === 0) {
            showError('entry_commentError', 'ファイルが空です。有効なファイルをアップロードしてください');
            return false;
        }
        if (fileSize > maxSize) {
            showError('entry_commentError', 'ファイルサイズは5MB以下にしてください');
            return false;
        }
        const fileMimeType = file.type;
        const isTextFile = (fileName.endsWith('.txt') || fileName.endsWith('.text')) &&
                           (fileMimeType === '' || fileMimeType.startsWith('text/'));
        const isValidFormat = allowedFormats.some(format =>
            fileName.endsWith(format.ext) || fileMimeType === format.mime
        ) || isTextFile;
        if (!isValidFormat) {
            console.debug('Comment validation failed:', { filename: fileName, size: fileSize, type: file.type });
            showError('entry_commentError', '許可されているファイル形式：PDF、Text、Word形式のみ');
            return false;
        }
        hideError('entry_commentError');
        return true;
    }

    function validateEventDate() {
        const eventDate = shadow.getElementById('entry_eventDate');
        if (!eventDate.value) {
            showError('entry_eventDateError', '説明会参加日を入力してください');
            return false;
        } else {
            hideError('entry_eventDateError');
            return true;
        }
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
