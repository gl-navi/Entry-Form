# Recruit Form Assets

HTML / CSS / JS assets used by the **GL Navi recruitment forms**.

## 📋 Form Assets

| # | Form                | CDN Asset                                                                                   | Recruitment Form                                                 | Notes                                         |
| - | ------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| 1 | **新卒採用 — 説明会前**     | [newgrad_form_before.js](https://gl-navi.github.io/Entry-Form/newgrad_form_before.js)       | [説明会フォーム](https://recruit.gl-navi.co.jp/newgrad/register)        | Publicly loads this asset                     |
| 2 | **新卒採用 — 説明会後**     | [newgrad_form_after.js](https://gl-navi.github.io/Entry-Form/newgrad_form_after.js)         | [本選考エントリーフォーム](https://recruit.gl-navi.co.jp/newgrad/entry)      | Publicly loads this asset                     |
| 3 | **中途採用 — カジュアル面談前** | [midcareer_form_before.js](https://gl-navi.github.io/Entry-Form/midcareer_form_before.js)   | [カジュアル面談フォーム](https://recruit.gl-navi.co.jp/mid-career/register) | Not used often anymore                        |
| 4 | **中途採用 — カジュアル面談後** | [midcareer_form_after.js](https://gl-navi.github.io/Entry-Form/midcareer_form_after.js)     | [本選考エントリーフォーム](https://recruit.gl-navi.co.jp/mid-career/entry)   | Publicly loads this asset                     |
| 5 | **ホームページ流入用**       | [HP_form.js](https://gl-navi.github.io/Entry-Form/HP_form.js)                               | [本選考エントリーフォーム](https://recruit.gl-navi.co.jp/apply)              | 新卒・中途どちらも応募可能。Salesforceの応募媒体は自動で「ホームページ」になる  |
| 6 | **インターン応募用**        | [internship_application.js](https://gl-navi.github.io/Entry-Form/internship_application.js) | [インターン応募フォーム](https://recruit.gl-navi.co.jp/apply/intern)        | Salesforceでは新卒レコードタイプで登録され、応募職種は自動で「インターン」になる |

## 🔗 Asset → Form Mapping

### 新卒採用

**説明会前**

* Asset: `newgrad_form_before.js`
* Form: `/newgrad/register`

**説明会後**

* Asset: `newgrad_form_after.js`
* Form: `/newgrad/entry`

### 中途採用

**カジュアル面談前**

* Asset: `midcareer_form_before.js`
* Form: `/mid-career/register`

**カジュアル面談後**

* Asset: `midcareer_form_after.js`
* Form: `/mid-career/entry`

### その他

**ホームページ流入**

* Asset: `HP_form.js`
* Form: `/apply`
* 新卒・中途の両方に対応

**インターン**

* Asset: `internship_application.js`
* Form: `/apply/intern`
* 応募職種を自動的に「インターン」として登録
