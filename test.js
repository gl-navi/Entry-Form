EntryForm.create({
  endpoint: 'https://eo2yx6wet8n3rr7.m.pipedream.net',
  successUrl: 'https://recruit.gl-navi.co.jp/apply/successful',
  formType: 'midcareer-apply',
  layout: [
    ['lastName', 'firstName'],
    ['email', 'emailConfirmation'],
    ['phone', 'resume'],
    ['cv']
  ],
  queryParams: {
    desiredOccupation: { queryParam: 'occupation', transform: 'lowercase', mapping: EntryForm.OCCUPATIONS },
    recordType: { queryParam: 'rt', pathSegment: true, transform: 'lowercase', mapping: EntryForm.RECORD_TYPES, default: '中途コンサルレコードタイプ' },
    sourcePlatform: { queryParam: 'source', transform: 'lowercase' }
  },
  marketo: { fields: {
    LastName: 'lastName', FirstName: 'firstName', Email: 'email', Phone: 'phone',
    praivacyPolicy: function(d){ return d.privacyPolicy ? 'yes' : 'no'; },
    recordtype: function(){ return '応募者_中途'; }
  }},
  emailFallback: { subject: function(){ return '中途採用応募 (フォームエラー)'; } }
});
