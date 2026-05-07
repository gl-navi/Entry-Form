EntryForm.create({
  endpoint: 'https://eo82mc181i1aie2.m.pipedream.net',
  successUrl: 'https://recruit.gl-navi.co.jp/register/successful',
  formType: 'newgrad-register',
  layout: [
    ['lastName', 'firstName'],
    ['email', 'emailConfirmation'],
    ['phone', 'graduationYear']
  ],
  marketo: { fields: {
    LastName: 'lastName', FirstName: 'firstName', Email: 'email', Phone: 'phone',
    graduation: 'graduationYear',
    praivacyPolicy: function(d){ return d.privacyPolicy ? 'yes' : 'no'; },
    recordtype: function(){ return '応募者_新卒'; }
  }},
  emailFallback: { subject: function(){ return '新卒登録 (フォームエラー)'; } }
});
