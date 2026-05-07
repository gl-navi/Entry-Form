(function () {
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
        "hq":         "中途本社レコードタイプ",
        "consultant": "中途コンサルレコードタイプ",
        "con":        "中途コンサルレコードタイプ",
        "honsya":     "中途本社レコードタイプ",
        "konsaru":    "中途コンサルレコードタイプ",
        "japanwing":  "JapanWingレコードタイプ",
        "honsha":     "中途本社レコードタイプ",
        "consult":    "中途コンサルレコードタイプ",
        "jw":         "JapanWingレコードタイプ",
        "designer":   "中途本社レコードタイプ"
    };

    let occupation = "";
    let recordType = "中途コンサルレコードタイプ";
    let sourcePlatform = "";

    const segs = window.location.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1];
    if (recordTypes[last]) {
        recordType = recordTypes[last];
        console.log('record type:' + recordType);
    }

    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const occParam = params.get("occupation");
        if (occParam) {
            const ref = occParam.toLowerCase();
            if (occupations[ref]) {
                occupation = occupations[ref];
                console.log('応募職種: ' + occupation);
            }
        }
        sourcePlatform = (params.get('source') || '').toLowerCase();
        console.log('source platform: ' + sourcePlatform);

        const rt = params.get('rt');
        if (rt) {
            const key = rt.toLowerCase();
            if (recordTypes[key]) recordType = recordTypes[key];
            console.log('record type (from query string): ' + recordType);
        }
    }

    window.GLNForm.init({
        formId: 'midcareer-apply',
        pipedreamEndpoint: 'https://eo2yx6wet8n3rr7.m.pipedream.net',
        submitButtonText: 'エントリー',
        gaEventLabel: 'New Grad Form',

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
                    <label for="entry_CV" class="required-label">職務経歴書</label>
                    <div class="file-input-container">
                        <label for="entry_CV" class="file-input-label" id="entry_CVfileName">ファイルを選択</label>
                        <input type="file" id="entry_CV" name="CV" class="file-input" required aria-required="true">
                    </div>
                    <div class="error-message" id="entry_CVError">職務経歴書をアップロードしてください（PDF、Excel、Word形式、10MB以下）</div>
                </div>
                <div class="form-group"></div>
            </div>
        `,

        onInit: function (api) {
            api.attachFileDisplay('entry_resume', 'entry_fileName', input => {
                api.validateFile(input, 'entry_resumeError');
            });
            api.attachFileDisplay('entry_CV', 'entry_CVfileName', input => {
                api.validateFile(input, 'entry_CVError');
            });
        },

        customValidations: function (api) {
            let v = true;
            v = api.validateFile(api.shadow.getElementById('entry_resume'), 'entry_resumeError') && v;
            v = api.validateFile(api.shadow.getElementById('entry_CV'),     'entry_CVError')     && v;
            return v;
        },

        onFieldBlur: function (input, api) {
            if (input.id === 'entry_resume') { api.validateFile(input, 'entry_resumeError'); return true; }
            if (input.id === 'entry_CV')     { api.validateFile(input, 'entry_CVError');     return true; }
            return false;
        },

        onBeforeSubmit: function (formData) {
            if (recordType)     formData.set('recordType',       recordType);
            if (occupation)     formData.set('desiredOccupation', occupation);
            if (sourcePlatform) formData.set('sourcePlatform',    sourcePlatform);
        },

        onSubmitSuccess: function (api) {
            api.shadow.getElementById('entry_fileName').textContent = '選択されていません';
            api.shadow.getElementById('entry_CVfileName').textContent = '選択されていません';
        },

        marketoRecordType: '応募者_中途',

        getErrorEmail: function (formData) {
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
--------------------------------------------------
                  
※履歴書・ポートフォリオを添付いたしました。
ご確認のほどよろしくお願いいたします。`
            };
        }
    });
})();
