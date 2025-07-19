![messageWay](logo.png)
# MessageWay NodeJS SDK

A NodeJS SDK for the MessageWay API.

## Documents
[Full documentation is here.](https://messageway.github.io/MessageWayNodeJS)

## Install
```bash
npm i messageway
```

## Send Message Via **WhatsApp Messenger**
```js
const { MessageWay } = require('messageway')
const message = new MessageWay(API_KEY)

message.sendWhatsAppMessage({
  mobile: '09333333333',
  templateID: 12,
  params: ['Foo'],
  length: 4,
})
.then(referenceID => {
  console.log(referenceID)
})
.catch(error => {
  console.error(error)
})
```

## Send Message Via **SMS**
```js
const { MessageWay } = require('messageway')
const message = new MessageWay(API_KEY)

message.sendSMS({
  mobile: '09333333333',
  templateID: 12,
  params: ['Foo'],
  length: 4,
  expireTime: 120,
})
.then(referenceID => {
  console.log(referenceID)
})
.catch(error => {
  console.error(error)
})
```

## Verify OTP Code
```js
const { MessageWay, isMessageWayError } = require('messageway')
const otp = new MessageWay(API_KEY)

otp.verify({
  mobile: '09333333333',
  otp: '3305',
})
.then(() => {
  console.log('Code is correct!')
})
.catch(error => {
  // handle Error
  if (isMessageWayError(error)) {
    console.log(`Error ${error.code}: ${error.message}`)
  } else {
    // unknown error
    console.error(error)
  }
})
```

## Use async functions
```js
async function getStatus() {
  try {
    const result = await otp.getStatus({ OTPReferenceID: '1628960593121007556' })
    console.log('Method: ' + result.OTPMethod)
    console.log('Status: ' + result.OTPStatus)
    console.log('Verified: ' + result.OTPVerified)
  } catch (error) {
    if (isMessageWayError(error)) {
      console.log(`Error ${error.code}: ${error.message}`)
    } else {
      console.error(error)
    }
  }
}

getStatus()
```

## Get Balance

```js
const { MessageWay } = require('messageway')
const message = new MessageWay(API_KEY)

message.getBalance()
  .then(balanceInfo => {
    console.log('Balance info:', balanceInfo)
  })
  .catch(error => {
    console.error('Error while fetching balance:', error)
  })
```