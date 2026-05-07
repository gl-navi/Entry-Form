(function () {
    const commentFileOptions = {
        maxSize: 5 * 1024 * 1024,
        allowedFormats: [
            { ext: '.pdf',  mime: 'application/pdf' },
            { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { ext: '.doc',  mime: 'application/msword' },
            { ext: '.txt',  mime: 'text/plain' },
            { ext: '.text', mime: 'text/plain' }
        ],
        requiredMessage: '感想文をアップロードしてください（PDF、TXT、Word形式、5MB以下）',
        formatMessage:   '許可されているファイル形式：PDF、Text、Word形式のみ',
        maxSizeMessage:  'ファイルサイズは5MB以下にしてください'
    };

    window.GLNForm.init({
        formId: 'newgrad-apply',
        pipedreamEndpoint: 'https://eokp1inwxznfu01.m.pipedream.net',
        submitButtonText: 'エントリー',
        gaEventLabel: 'New Grad Form',
        emailTooltip: 'ご登録の媒体と同じメールアドレスをご記入ください',

        fieldsHTML: `
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
                    <label for="entry_comment" class="required-label">説明会感想文</label>
                    <div class="file-input-container">
                        <label for="entry_comment" class="file-input-label" id="entry_commentfileName">ファイルを選択</label>
                        <input type="file" id="entry_comment" name="comment" class="file-input" required aria-required="true">
                    </div>
                    <div class="error-message" id="entry_commentError">感想文をアップロードしてください（PDF、TXT、Word形式、5MB以下）</div>
                </div>
            </div>
        `,

        onInit: function (api) {
            api.shadow.getElementById('entry_graduationYear').placeholder = new Date().getFullYear() - 3;

            api.attachFileDisplay('entry_resume', 'entry_fileName', input => {
                api.validateFile(input, 'entry_resumeError');
            });
            api.attachFileDisplay('entry_comment', 'entry_commentfileName', input => {
                api.validateFile(input, 'entry_commentError', commentFileOptions);
            });
        },

        customValidations: function (api) {
            let v = true;
            v = api.validateRequiredField('entry_school',   'entry_schoolError')   && v;
            v = api.validateOptionalField('entry_department','entry_departmentError') && v;
            v = api.validateOptionalField('entry_faculty',  'entry_facultyError')  && v;
            v = api.validateGraduationYear() && v;
            v = api.validateFile(api.shadow.getElementById('entry_resume'),  'entry_resumeError') && v;
            v = api.validateRequiredField('entry_eventDate','entry_eventDateError') && v;
            v = api.validateFile(api.shadow.getElementById('entry_comment'), 'entry_commentError', commentFileOptions) && v;
            return v;
        },

        onFieldBlur: function (input, api) {
            if (input.id === 'entry_resume')  { api.validateFile(input, 'entry_resumeError');  return true; }
            if (input.id === 'entry_comment') { api.validateFile(input, 'entry_commentError', commentFileOptions); return true; }
            if (input.id === 'entry_eventDate') { api.validateRequiredField(input.id, 'entry_eventDateError'); return true; }
            if (input.id === 'entry_department' || input.id === 'entry_faculty') {
                api.validateOptionalField(input.id, input.id + 'Error');
                return true;
            }
            return false;
        },

        onSubmitSuccess: function (api) {
            api.shadow.getElementById('entry_fileName').textContent = '選択されていません';
            api.shadow.getElementById('entry_commentfileName').textContent = '選択されていません';
        },

        marketoRecordType: '応募者_新卒',
        getMarketoValues: function (formData) {
            return { 'graduation': formData.get('graduationYear') };
        },

        getErrorEmail: function (formData) {
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
ご確認のほどよろしくお願いいたします。`
            };
        }
    });
})();
