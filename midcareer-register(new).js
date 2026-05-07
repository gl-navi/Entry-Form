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
        "h":         "中途本社レコードタイプ",
        "c":         "中途コンサルレコードタイプ",
        "j":         "JapanWingレコードタイプ",
        "honsya":    "中途本社レコードタイプ",
        "konsaru":   "中途コンサルレコードタイプ",
        "japanwing": "JapanWingレコードタイプ",
        "honsha":    "中途本社レコードタイプ",
        "consult":   "中途コンサルレコードタイプ",
        "jw":        "JapanWingレコードタイプ",
        "designer":  "中途本社レコードタイプ"
    };

    let occupation = "";
    let recordType = "中途コンサルレコードタイプ"; // default

    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const occParam = params.get("occupation");
        if (occParam) {
            const ref = occParam.toLowerCase();
            if (occupations[ref]) {
                occupation = occupations[ref];
                if (occupation === "Brand / UIUX Designer（ジュニア〜ミドル）") {
                    window.location.href = "https://recruit.gl-navi.co.jp/";
                    return;
                }
            }
        }
    }

    const segs = window.location.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1];
    if (recordTypes[last]) recordType = recordTypes[last];

    window.GLNForm.init({
        formId: 'midcareer-register',
        pipedreamEndpoint: 'https://eomm9l0t6di5coc.m.pipedream.net',
        submitButtonText: '申し込み',
        gaEventLabel: 'New Grad Form',

        fieldsHTML: `
            <div class="form-row">
                <div class="form-group">
                    <label for="entry_phone" class="required-label">電話番号</label>
                    <input type="tel" id="entry_phone" name="phone" required aria-required="true" placeholder="090-1234-5678">
                    <div class="error-message" id="entry_phoneError">有効な電話番号を入力してください</div>
                </div>
                <div class="form-group"></div>
            </div>
        `,

        onBeforeSubmit: function (formData) {
            if (recordType) formData.set('recordType', recordType);
            if (occupation) formData.set('desiredOccupation', occupation);
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

ご確認のほどよろしくお願いいたします。`
            };
        }
    });
})();
