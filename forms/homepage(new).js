(function () {
    // Closure state shared between callbacks
    const state = { applicantType: null };
    let validateDesiredOccupation; // set inside onInit

    window.GLNForm.init({
        formId: 'homepage',
        pipedreamEndpoint: 'https://eo4oramamadwsus.m.pipedream.net',
        submitButtonText: 'エントリー',
        gaEventLabel: 'New Grad Form',

        // Override the default `select` color (master uses #333; original homepage uses placeholder color)
        extraCSS: `
            select { color: var(--placeholder-color); }
            select:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(0, 120, 215, 0.2);
                border-color: var(--primary-color);
            }
        `,

        fieldsHTML: `
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
                        <option value="Brand / UIUX Designer(ジュニア〜ミドル）">・Brand / UIUX Designer（ジュニア〜ミドル）</option>
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
                    <div class="error-message" id="entry_resumeError">履歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
                <div class="form-group" id="CVContainer">
                    <label for="entry_CV" id="entry_CVLabel">職務経歴書</label>
                    <div class="file-input-container">
                        <label for="entry_CV" class="file-input-label" id="entry_CVfileName">ファイルを選択</label>
                        <input type="file" id="entry_CV" name="CV" class="file-input">
                    </div>
                    <div class="error-message" id="entry_CVError">職務経歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
                <div class="form-group" id="gradYearContainer" style="display:none;">
                    <label for="entry_graduationYear" id="entry_GradYearLabel">卒業年度 (学生の方のみ)</label>
                    <input type="number" id="entry_graduationYear" name="graduationYear" placeholder="2023">
                    <div class="error-message" id="entry_graduationYearError">卒業年度を入力してください</div>
                </div>
            </div>
        `,

        onInit: function (api) {
            const sh = api.shadow;
            const desired       = sh.getElementById('entry_desiredOccupation');
            const resumeInput   = sh.getElementById('entry_resume');
            const resumeLabel   = sh.getElementById('entry_resumeLabel');
            const CVInput       = sh.getElementById('entry_CV');
            const CVLabel       = sh.getElementById('entry_CVLabel');
            const CVContainer   = sh.getElementById('CVContainer');
            const gradYear      = sh.getElementById('entry_graduationYear');
            const gradYearLabel = sh.getElementById('entry_GradYearLabel');
            const gradYearWrap  = sh.getElementById('gradYearContainer');

            gradYear.placeholder = new Date().getFullYear() - 3;

            validateDesiredOccupation = function () {
                if (!desired.value) {
                    api.showError('entry_desiredOccupationError', '応募職種を選択してください');
                    return false;
                }
                api.hideError('entry_desiredOccupationError');
                return true;
            };

            desired.addEventListener('change', function () {
                if (!validateDesiredOccupation()) return;

                if (this.value === '新卒・第二新卒 オープンポジション') {
                    state.applicantType = '応募者_新卒';

                    CVContainer.style.display = 'none';
                    CVLabel.className = '';
                    CVInput.required = false;
                    CVInput.ariaRequired = false;

                    gradYearWrap.style.display = '';
                    gradYearLabel.className = 'required-label';
                    gradYear.required = true;
                    gradYear.ariaRequired = true;

                    resumeInput.required = false;
                    resumeInput.ariaRequired = false;
                    resumeLabel.className = '';
                } else {
                    state.applicantType = '応募者_中途';

                    CVContainer.style.display = '';
                    CVLabel.className = 'required-label';
                    CVInput.required = true;
                    CVInput.ariaRequired = true;

                    gradYearWrap.style.display = 'none';
                    gradYearLabel.className = '';
                    gradYear.required = false;
                    gradYear.ariaRequired = false;
                    gradYear.value = '';

                    resumeInput.required = true;
                    resumeInput.ariaRequired = true;
                    resumeLabel.className = 'required-label';
                }
            });

            api.attachFileDisplay('entry_resume', 'entry_fileName', input => {
                api.validateFile(input, 'entry_resumeError');
            });
            api.attachFileDisplay('entry_CV', 'entry_CVfileName', input => {
                api.validateFile(input, 'entry_CVError');
            });
        },

        customValidations: function (api) {
            let v = true;
            v = validateDesiredOccupation() && v;
            v = api.validateFile(api.shadow.getElementById('entry_resume'), 'entry_resumeError') && v;
            v = api.validateFile(api.shadow.getElementById('entry_CV'),     'entry_CVError')     && v;
            v = api.validateGraduationYear() && v;
            return v;
        },

        onFieldBlur: function (input, api) {
            if (input.id === 'entry_resume') { api.validateFile(input, 'entry_resumeError'); return true; }
            if (input.id === 'entry_CV')     { api.validateFile(input, 'entry_CVError');     return true; }
            return false;
        },

        onSubmitSuccess: function (api) {
            api.shadow.getElementById('entry_fileName').textContent = '選択されていません';
            api.shadow.getElementById('entry_CVfileName').textContent = '選択されていません';
        },

        // Marketo recordtype is dynamic (depends on selected occupation)
        getMarketoRecordType: function () {
            return state.applicantType || '応募者_中途';
        },
        getMarketoValues: function (formData) {
            return { 'graduation': formData.get('graduationYear') };
        },

        getErrorEmail: function (formData) {
            const isNewGrad = state.applicantType === '応募者_新卒';
            if (isNewGrad) {
                return {
                    subject: '新卒採用応募 (フォームエラー)',
                    body:
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

■応募職種
${formData.get('desiredOccupation')}
--------------------------------------------------
                  
※履歴書を添付いたしました。
ご確認のほどよろしくお願いいたします。`
                };
            }
            return {
                subject: '中途採用応募 (フォームエラー)',
                body:
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
ご確認のほどよろしくお願いいたします。`
            };
        }
    });
})();
