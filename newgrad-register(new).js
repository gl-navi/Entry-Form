(function () {
    window.GLNForm.init({
        formId: 'newgrad-register',
        pipedreamEndpoint: 'https://eoblqo00j4o8lwv.m.pipedream.net',
        submitButtonText: '申し込み',
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
                    <label for="entry_graduationYear" class="required-label">卒業年度</label>
                    <input type="number" id="entry_graduationYear" name="graduationYear" required aria-required="true" placeholder="2023">
                    <div class="error-message" id="entry_graduationYearError">卒業年度を入力してください</div>
                </div>
            </div>
        `,

        onInit: function (api) {
            api.shadow.getElementById('entry_graduationYear').placeholder = new Date().getFullYear() - 3;
        },

        customValidations: function (api) {
            return api.validateGraduationYear();
        },

        marketoRecordType: '応募者_新卒',
        getMarketoValues: function (formData) {
            return { 'graduation': formData.get('graduationYear') };
        },

        getErrorEmail: function (formData) {
            return {
                subject: '新卒採用説明会申し込み (フォームエラー)',
                body:
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
                  
ご確認のほどよろしくお願いいたします。`
            };
        }
    });
})();
