<div dir="rtl">

<p align="center">
  <img src="logo.png" alt="MessageWay Logo" width="180" />
</p>

# ‏کتابخانه نودجی‌اس راه‌پیام ⁦(MessageWay NodeJS SDK)⁩

<p align="center">
  <a href="https://www.npmjs.com/package/messageway"><img src="https://img.shields.io/npm/v/messageway.svg" alt="npm version" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/messageway.svg" alt="Node.js version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://viteplus.dev"><img src="https://img.shields.io/badge/Built%20with-Vite%2B-purple.svg" alt="Built with Vite+" /></a>
</p>

‏کتابخانه رسمی و مدرن ⁦Node.js⁩ برای اتصال به سرویس پیام‌رسانی و ارسال کدهای یکبارمصرف ⁦(OTP)⁩ در سامانه [راه‌پیام ⁦(MessageWay)⁩](https://msgway.com).

### ‏ویژگی‌های کلیدی

- ‏**بدون هیچ وابستگی جانبی ⁦(Zero-dependency)⁩:** استفاده مستقیم از `fetch` بومی نودجی‌اس (نسخه ۱۸ به بالا).
- ‏**پشتیبانی دوگانه از ماژول‌ها:** قابل استفاده هم در پروژه‌های مدرن ⁦**ESM**⁩ (`import`) و هم در پروژه‌های ⁦**CommonJS**⁩ (`require`).
- ‏**پشتیبانی کامل از ⁦TypeScript⁩:** دارای تایپ‌های دقیق برای همه درخواست‌ها، پاسخ‌ها، وضعیت‌ها و ارائه‌دهندگان سرویس.
- ‏**پشتیبانی از تمام مسیرهای ارسال:** پیامک ⁦(SMS)⁩، تماس صوتی ⁦(IVR)⁩، ارسال هوشمند ⁦(Smart)⁩ و پیام‌رسان‌های بومی (گپ، ایتا، بله، روبیکا و آی‌گپ).
- ‏**مدیریت ساختاریافته خطاها:** تفکیک خودکار خطاهای سمت وب‌سرویس از خطاهای شبکه به کمک تابع `isMessageWayError`.
- ‏**ابزار توسعه پرسرعت:** توسعه داده شده و بهینه‌شده تحت ابزار مدرن ⁦**Vite+**⁩.

---

## ‏فهرست مطالب

- ‏[پیش‌نیازها](#پیش‌نیازها)
- ‏[نصب](#نصب)
- ‏[شروع سریع](#شروع-سریع)
- ‏[راه‌اندازی کلاینت و تنظیمات](#راه‌اندازی-کلاینت-و-تنظیمات)
  - ‏[حالت کد خودکار در برابر کد دستی](#حالت-کد-خودکار-در-برابر-کد-دستی)
- ‏[راهنمای متدها و کاربردها](#راهنمای-متدها-و-کاربردها)
  - ‏[۱. ارسال پیامک ⁦(SMS)⁩](#۱-ارسال-پیامک-sms)
  - ‏[۲. ارسال از طریق پیام‌رسان‌ها](#۲-ارسال-از-طریق-پیام‌رسان‌ها)
  - ‏[۳. ارسال با تماس صوتی ⁦(IVR)⁩](#۳-ارسال-با-تماس-صوتی-ivr)
  - ‏[۴. ارسال هوشمند ⁦(Smart)⁩](#۴-ارسال-هوشمند-smart)
  - ‏[۵. متد عمومی ارسال (`send`)](#۵-متد-عمومی-ارسال-send)
  - ‏[۶. بررسی وضعیت پیام (`getStatus`)](#۶-بررسی-وضعیت-پیام-getstatus)
  - ‏[۷. اعتبارسنجی کد یکبارمصرف (`verify`)](#۷-اعتبارسنجی-کد-یکبارمصرف-verify)
  - ‏[۸. مشاهده متن قالب (`getTemplate`)](#۸-مشاهده-متن-قالب-gettemplate)
  - ‏[۹. استعلام موجودی حساب (`getBalance`)](#۹-استعلام-موجودی-حساب-getbalance)
- ‏[جدول خلاصه متدهای ⁦SDK⁩](#جدول-خلاصه-متدهای-sdk)
- ‏[ثوابت و ارائه‌دهندگان ⁦(Enums)⁩](#ثوابت-و-ارائه‌دهندگان-enums)
- ‏[مدیریت خطاها](#مدیریت-خطاها)
- ‏[دستورات توسعه](#دستورات-توسعه)
- ‏[مجوز](#مجوز)

---

## ‏پیش‌نیازها

- ‏**⁦Node.js⁩ نسخه ۱۸ یا بالاتر** (به دلیل استفاده از `fetch` استاندارد داخلی).

---

## ‏نصب

‏با استفاده از پکیج‌منیجر مورد نظر خود، کتابخانه را نصب کنید:

<div dir="ltr">

```bash
# با npm
npm install messageway
```

</div>

---

## ‏شروع سریع

### ‏استفاده در ⁦TypeScript / ES Modules⁩

<div dir="ltr">

```typescript
import { MessageWay, SMSProvider } from 'messageway'

// ساخت نمونه با کلید دسترسی (API Key)
const client = new MessageWay('YOUR_API_KEY')

async function sendOtp() {
  try {
    const referenceID = await client.sendSMS({
      mobile: '09120000000',
      templateID: 10,
      params: ['1234'],
      provider: SMSProvider.Magfa,
      expireTime: 120, // اعتبار ۲ دقیقه
    })

    console.log('پیام با موفقیت ارسال شد. شناسه رهگیری:', referenceID)
  } catch (error) {
    console.error('خطا در ارسال:', error)
  }
}

sendOtp()
```

</div>

### ‏استفاده در ⁦CommonJS⁩ (روش سنتی نودجی‌اس)

<div dir="ltr">

```javascript
const { MessageWay, MessengerProvider, isMessageWayError } = require('messageway')

const client = new MessageWay('YOUR_API_KEY')

client
  .sendMessenger({
    mobile: '09120000000',
    templateID: 12,
    provider: MessengerProvider.Gap,
    params: ['کد ورود'],
  })
  .then((referenceID) => {
    console.log('ارسال شد. شناسه پیگیری:', referenceID)
  })
  .catch((err) => {
    if (isMessageWayError(err)) {
      console.error(`خطای وب‌سرویس راه‌پیام [${err.code}]: ${err.message}`)
    } else {
      console.error('خطای غیرمنتظره:', err)
    }
  })
```

</div>

---

## ‏راه‌اندازی کلاینت و تنظیمات

‏کلاس اصلی `MessageWay` هنگام ساخت ۳ ورودی می‌پذیرد:

<div dir="ltr">

```typescript
const client = new MessageWay(apiKey, manual, language)
```

</div>

| پارامتر    | نوع              |   پیش‌فرض   |                                                                   توضیحات |
| :--------- | :--------------- | :--------: | ------------------------------------------------------------------------: |
| `apiKey`   | `string`         | _(اجباری)_ | ‏کلید دسترسی دریافت شده از پنل راه‌پیام ⁦([msgway.com](https://msgway.com))⁩. |
| `manual`   | `boolean`        |  `false`   |                     ‏آیا کد ⁦OTP⁩ را خودتان می‌سازید یا سامانه راه‌پیام بسازد؟ |
| `language` | `'fa'` \| `'en'` |   `'fa'`   |                             ‏زبان پیام‌های خطای وب‌سرویس (فارسی یا انگلیسی). |

---

### ‏حالت کد خودکار در برابر کد دستی

‏سامانه راه‌پیام از دو الگو برای کدهای ورود پشتیبانی می‌کند:

#### ‏۱. حالت خودکار (`manual: false`) - پیش‌فرض

‏در این حالت، سامانه راه‌پیام کد تصادفی را می‌سازد و برای کاربر می‌فرستد. شما فقط طول کد را با `length` تعیین می‌کنید و بعداً از طریق متد `verify` صحت کد وارد شده توسط کاربر را استعلام می‌کنید.

<div dir="ltr">

```typescript
const client = new MessageWay(API_KEY, false)

const ref = await client.sendSMS({
  mobile: '09120000000',
  templateID: 10,
  length: 5, // طول کد ۵ رقم باشد
})
```

</div>

#### ‏۲. حالت دستی (`manual: true`)

‏اگر ترجیح می‌دهید کد در سرور خودتان تولید و اعتبارسنجی شود، این پارامتر را `true` بگذارید. در این حالت به جای `length`، فیلد `code` را ارسال می‌کنید.

<div dir="ltr">

```typescript
const client = new MessageWay<true>(API_KEY, true)

const ref = await client.sendSMS({
  mobile: '09120000000',
  templateID: 10,
  code: '84920', // کدی که سیستم شما تولید کرده است
})
```

</div>

---

## ‏راهنمای متدها و کاربردها

‏همه متدهای ارسال خروجی را به صورت رشته شناسه رهگیری (`referenceID`) برمی‌گردانند.

### ‏۱. ارسال پیامک ⁦(SMS)⁩

‏برای ارسال پیام کوتاه به همراه امکان انتخاب سرشماره و اپراتور ارسال‌کننده:

<div dir="ltr">

```typescript
import { MessageWay, SMSProvider } from 'messageway'

const client = new MessageWay(API_KEY)

const ref = await client.sendSMS({
  mobile: '09120000000',
  templateID: 10,
  provider: SMSProvider.Magfa, // مگفا، آتیه، آسیاتک، ارمغان
  params: ['علی'], // متغیرهای قالب (تا ۱۰ مورد)
  length: 4, // طول کد در حالت خودکار
  expireTime: 120, // انقضا به ثانیه (اختیاری)
  hash: '#AB12cd', // کد هش برای خواندن خودکار پیامک در اندروید (اختیاری)
  countryCode: 98, // پیش‌شماره کشور (پیش‌فرض ایران ۹۸ است)
})
```

</div>

---

### ‏۲. ارسال از طریق پیام‌رسان‌ها

‏برای ارسال پیام در پیام‌رسان‌های ایرانی با نرخ ارزان‌تر و تحویل سریع:

<div dir="ltr">

```typescript
import { MessageWay, MessengerProvider } from 'messageway'

const client = new MessageWay(API_KEY)

const ref = await client.sendMessenger({
  mobile: '09120000000',
  templateID: 12,
  provider: MessengerProvider.Bale, // گپ، ایتا، بله، روبیکا، آی‌گپ
  params: ['۱۲۳۴'],
  length: 4,
})

// میان‌بر ویژه برای ارسال مستقیم در پیام‌رسان گپ:
const gapRef = await client.sendGapMessage({
  mobile: '09120000000',
  templateID: 12,
  length: 4,
})
```

</div>

---

### ‏۳. ارسال با تماس صوتی ⁦(IVR)⁩

‏در مواقعی که پیامک به دست کاربر نرسیده یا کاربر خط ثابت دارد، راه‌پیام با شماره کاربر تماس گرفته و کد را برایش قرائت می‌کند:

<div dir="ltr">

```typescript
const ref = await client.sendIVR({
  mobile: '09120000000',
  templateID: 10,
  length: 4,
})
```

</div>

---

### ‏۴. ارسال هوشمند ⁦(Smart)⁩

‏موتور ارسال هوشمند راه‌پیام به طور خودکار بهترین، سریع‌ترین و در دسترس‌ترین مسیر تحویل پیام را انتخاب می‌کند:

<div dir="ltr">

```typescript
const ref = await client.sendSmart({
  mobile: '09120000000',
  templateID: 10,
  length: 4,
})
```

</div>

---

### ‏۵. متد عمومی ارسال (`send`)

‏در صورت نیاز به ارسال مستقیم با ساختار خام وب‌سرویس:

<div dir="ltr">

```typescript
const response = await client.send({
  method: 'sms',
  mobile: '09120000000',
  templateID: 10,
  length: 4,
})

console.log(response.referenceID)
```

</div>

---

### ‏۶. بررسی وضعیت پیام (`getStatus`)

‏با در دست داشتن شناسه پیگیری پیام، می‌توانید وضعیت تحویل و روش ارسال آن را بررسی کنید:

<div dir="ltr">

```typescript
const status = await client.getStatus({
  OTPReferenceID: '1628160593121007556',
})

console.log('روش ارسال:', status.OTPMethod) // sms | ivr | messenger | email
console.log('وضعیت تحویل:', status.OTPStatus) // pending | delivered | seen | ...
console.log('آیا تایید شده؟', status.OTPVerified) // true / false
```

</div>

---

### ‏۷. اعتبارسنجی کد یکبارمصرف (`verify`)

‏هنگامی که از حالت تولید خودکار کد استفاده کرده‌اید، می‌توانید کد ارائه‌شده توسط کاربر را مستقیماً از طریق راه‌پیام تایید نمایید:

<div dir="ltr">

```typescript
try {
  await client.verify({
    mobile: '09120000000',
    OTP: '58291', // یا otp برای سازگاری با نسخه ۱
    countryCode: 98, // اختیاری
  })

  console.log('کد صحیح است و اعتبارسنجی شد.')
} catch (error) {
  if (isMessageWayError(error)) {
    console.log(`کد نامعتبر است یا منقضی شده: ${error.message} (کد: ${error.code})`)
  }
}
```

</div>

> ‏**نکته:** اعتبارسنجی کدهای دستی (`manual: true`) باید در سیستم خودتان انجام شود و این متد برای آنها کاربرد ندارد.

---

### ‏۸. مشاهده متن قالب (`getTemplate`)

‏برای دریافت متن و مشخصات قالبی که از قبل در پنل راه‌پیام ثبت کرده‌اید:

<div dir="ltr">

```typescript
const result = await client.getTemplate({ templateID: 12 })
console.log('متن قالب:', result.data.template)
```

</div>

---

### ‏۹. استعلام موجودی حساب (`getBalance`)

‏برای بررسی میزان اعتبار ریالی باقی‌مانده در حساب:

<div dir="ltr">

```typescript
const balanceInfo = await client.getBalance()
console.log('موجودی باقی‌مانده (ریال):', balanceInfo.data.balance)
```

</div>

---

## ‏جدول خلاصه متدهای ⁦SDK⁩

| نام متد در SDK            |     اندپوینت API     |                                       شرح عملکرد | نوع خروجی                   |
| :------------------------ | :------------------: | -----------------------------------------------: | :-------------------------- |
| `send(options)`           |     `POST /send`     |                    ‏ارسال مستقیم با مشخص کردن روش | `Promise<SendResponse>`     |
| `sendSMS(options)`        |     `POST /send`     |      ‏ارسال پیامک تلفن همراه (برگشت شناسه پیگیری) | `Promise<string>`           |
| `sendMessenger(options)`  |     `POST /send`     |   ‏ارسال در پیام‌رسان‌های بومی (برگشت شناسه پیگیری) | `Promise<string>`           |
| `sendGapMessage(options)` |     `POST /send`     | ‏ارسال مستقیم در پیام‌رسان گپ (برگشت شناسه پیگیری) | `Promise<string>`           |
| `sendIVR(options)`        |     `POST /send`     |     ‏ارسال از طریق تماس صوتی (برگشت شناسه پیگیری) | `Promise<string>`           |
| `sendSmart(options)`      |     `POST /send`     |  ‏ارسال از طریق موتور هوشمند (برگشت شناسه پیگیری) | `Promise<string>`           |
| `verify(options)`         |  `POST /otp/verify`  |                         ‏تایید کد یکبارمصرف کاربر | `Promise<void>`             |
| `getStatus(options)`      |    `POST /status`    |                          ‏استعلام وضعیت تحویل پیام | `Promise<StatusResponse>`   |
| `getTemplate(options)`    | `POST /template/get` |                             ‏دریافت متن قالب پیام | `Promise<TemplateResponse>` |
| `getBalance(options?)`    | `POST /balance/get`  |                        ‏دریافت موجودی حساب کاربری | `Promise<BalanceResponse>`  |

---

## ‏ثوابت و ارائه‌دهندگان ⁦(Enums)⁩

‏همه این تایپ‌ها و شمارنده‌ها از پکیج قابل ایمپورت هستند:

### ‏اپراتورهای پیامک (`SMSProvider`)

<div dir="ltr">

```typescript
import { SMSProvider } from 'messageway'

// SMSProvider.Magfa    = 1 (مگفا)
// SMSProvider.Atieh    = 2 (آتیه داده‌پرداز)
// SMSProvider.Asiatech = 3 (آسیاتک)
// SMSProvider.Armaghan = 5 (ارمغان راه طلایی)
```

</div>

### ‏پیام‌رسان‌ها (`MessengerProvider`)

<div dir="ltr">

```typescript
import { MessengerProvider } from 'messageway'

// MessengerProvider.Gap    = 2  (گپ)
// MessengerProvider.IGap   = 8  (آی‌گپ)
// MessengerProvider.Eitaa  = 9  (ایتا)
// MessengerProvider.Bale   = 10 (بله)
// MessengerProvider.Rubika = 12 (روبیکا)
```

</div>

### ‏وضعیت‌های پیام (`MessageStatus`)

| مقدار وضعیت           |                            شرح عملکرد |
| :-------------------- | ------------------------------------: |
| `'pending'`           |                           ‏در صف ارسال |
| `'operatorDelivered'` |             ‏تحویل داده شده به اپراتور |
| `'sent'`              |                             ‏ارسال شده |
| `'delivered'`         | ‏با موفقیت به گوشی کاربر تحویل داده شد |
| `'seen'`              | ‏پیام توسط کاربر در پیام‌رسان مشاهده شد |
| `'notDelivered'`      |                ‏عدم تحویل توسط اپراتور |
| `'failed'`            |                       ‏ناموفق در ارسال |

---

## ‏مدیریت خطاها

‏هنگامی که وب‌سرویس راه‌پیام پاسخی حاوی خطا بازگرداند، کتابخانه آن را به صورت یک شیء استاندارد `MessageError` ریجکت می‌کند:

<div dir="ltr">

```typescript
export interface MessageError {
  code: number | string // کد عددی یا متنی خطا
  message: string // شرح خطای فارسی یا انگلیسی
  traceID?: string // شناسه رهگیری درخواست جهت پیگیری با پشتیبانی
}
```

</div>

‏با استفاده از تابع گارد نوع `isMessageWayError` می‌توانید خطاهای سامانه را از قطعی اینترنت و خطاهای غیرمنتظره تفکیک کنید:

<div dir="ltr">

```typescript
import { MessageWay, isMessageWayError } from 'messageway'

const client = new MessageWay('YOUR_API_KEY')

try {
  await client.sendSMS({ mobile: '09120000000', templateID: 9999 })
} catch (error) {
  if (isMessageWayError(error)) {
    // خطای برگشتی از سمت سرور راه‌پیام
    console.error(`کد خطا: ${error.code}`)
    console.error(`پیام خطا: ${error.message}`)
    if (error.traceID) {
      console.error(`شناسه پیگیری پشتیبانی: ${error.traceID}`)
    }
  } else {
    // خطای شبکه، تایم‌اوت یا پاسخ‌های HTTP غیرمنتظره
    console.error('پیام خطا:', error.message)
    if (error.status) {
      console.error(`کد وضعیت HTTP: ${error.status}`)
    }
    if (error.response) {
      console.error('دیتای خام پاسخ سرور:', error.response)
    }
  }
}
```

</div>

### ‏تغییر زبان خطای یک درخواست خاص

‏حتی اگر زبان پیش‌فرض کلاینت را فارسی گذاشته باشید، در هر فراخوانی می‌توانید زبان خطا را تغییر دهید:

<div dir="ltr">

```typescript
await client.verify({
  mobile: '09120000000',
  OTP: '1234',
  language: 'en', // متن پیام خطا در صورت اشتباه بودن انگلیسی برگردد
})
```

</div>

---

## ‏دستورات توسعه

‏اسکریپت‌های زیر برای توسعه، تست و بررسی کیفیت کد در دسترس هستند:

<div dir="ltr">

```bash
# بیلد کتابخانه با Vite+ / tsdown
pnpm run build

# اجرای آزمون‌ها (Vitest)
pnpm test

# بررسی فرمت، لینت و تایپ‌ها
pnpm run check

# اصلاح خودکار خطاهای فرمت و کد
pnpm run check:fix
```

</div>

---

## ‏مجوز

‏این پروژه تحت مجوز ⁦[MIT](LICENSE)⁩ منتشر شده است.

</div>
