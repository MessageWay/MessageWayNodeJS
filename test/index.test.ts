import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test'
import {
  MessageWay,
  isMessageWayError,
  SMSProvider,
  MessengerProvider,
  MessageWayHttpError,
} from '../src/index'

describe('isMessageWayError', () => {
  it('identifies standard MessageWay error objects with numeric code', () => {
    expect(isMessageWayError({ code: 10321, message: 'Invalid OTP' })).toBe(true)
  })

  it('identifies standard MessageWay error objects with string code', () => {
    expect(isMessageWayError({ code: 'ERR_TIMEOUT', message: 'Timeout' })).toBe(true)
  })

  it('returns false for non-error values', () => {
    expect(isMessageWayError(null)).toBe(false)
    expect(isMessageWayError(undefined)).toBe(false)
    expect(isMessageWayError('string error')).toBe(false)
    expect(isMessageWayError(123)).toBe(false)
    expect(isMessageWayError({})).toBe(false)
    expect(isMessageWayError({ code: 100 })).toBe(false)
    expect(isMessageWayError({ message: 'only message' })).toBe(false)
  })
})

describe('MessageWay SDK', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('initializes with default options', () => {
    const client = new MessageWay('test-api-key')
    expect(client).toBeInstanceOf(MessageWay)
  })

  it('sends SMS and returns referenceID', async () => {
    const mockResponse = {
      status: 'success',
      referenceID: 'ref-123456',
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const ref = await client.sendSMS({
      mobile: '09120000000',
      templateID: 10,
      provider: SMSProvider.Magfa,
      params: ['1234'],
    })

    expect(ref).toBe('ref-123456')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.msgway.com/send')
    expect(init.method).toBe('post')
    expect(init.headers).toEqual({
      'accept-language': 'fa',
      'content-type': 'application/json',
      apiKey: 'test-api-key',
    })

    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      mobile: '09120000000',
      templateID: 10,
      provider: 1,
      params: ['1234'],
      method: 'sms',
    })
  })

  it('sends IVR message and returns referenceID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success', referenceID: 'ref-ivr' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const ref = await client.sendIVR({
      mobile: '09120000000',
      templateID: 10,
    })

    expect(ref).toBe('ref-ivr')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.method).toBe('ivr')
  })

  it('sends Smart message and returns referenceID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success', referenceID: 'ref-smart' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const ref = await client.sendSmart({
      mobile: '09120000000',
      templateID: 10,
    })

    expect(ref).toBe('ref-smart')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.method).toBe('smart')
  })

  it('sends Messenger message via Gap', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success', referenceID: 'ref-gap' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const ref = await client.sendGapMessage({
      mobile: '09120000000',
      templateID: 10,
    })

    expect(ref).toBe('ref-gap')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.method).toBe('messenger')
    expect(body.provider).toBe(MessengerProvider.Gap)
  })

  it('verifies user OTP', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    await expect(client.verify({ mobile: '09120000000', OTP: '1234' })).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.msgway.com/otp/verify')
    const body = JSON.parse(init.body)
    expect(body).toEqual({ mobile: '09120000000', OTP: '1234' })
  })

  it('supports legacy lowercase otp property in verify', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    await expect(client.verify({ mobile: '09120000000', otp: '1234' })).resolves.toBeUndefined()

    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body).toEqual({ mobile: '09120000000', OTP: '1234' })
  })

  it('normalizes fa-IR language to fa in request headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key', false, 'fa-IR')
    await client.getBalance()

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['accept-language']).toBe('fa')
  })

  it('retrieves message status', async () => {
    const statusData = {
      status: 'success',
      OTPMethod: 'sms',
      OTPStatus: 'delivered',
      OTPVerified: true,
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(statusData)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const res = await client.getStatus({ OTPReferenceID: 'ref-123' })

    expect(res).toEqual({
      OTPMethod: 'sms',
      OTPStatus: 'delivered',
      OTPVerified: true,
    })
  })

  it('fetches template details', async () => {
    const mockData = {
      status: 'success',
      data: { template: 'Your code is [code]' },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockData)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const res = await client.getTemplate({ templateID: 42 })

    expect(res).toEqual({
      data: { template: 'Your code is [code]' },
    })
  })

  it('retrieves account balance', async () => {
    const mockData = {
      status: 'success',
      data: { balance: 500000 },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockData)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const res = await client.getBalance()

    expect(res).toEqual({
      data: { balance: 500000 },
    })
  })

  it('supports per-request language override', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key', false, 'fa')
    await client.verify({ mobile: '09120000000', OTP: '1234', language: 'en' })

    const init = fetchMock.mock.calls[0][1]
    expect(init.headers['accept-language']).toBe('en')
    const body = JSON.parse(init.body)
    expect(body.language).toBeUndefined()
  })

  it('rejects with MessageError on API error payload', async () => {
    const errorPayload = {
      status: 'error',
      error: {
        code: 10401,
        message: 'Invalid mobile number',
      },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(errorPayload)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')

    await expect(client.sendSMS({ mobile: 'invalid', templateID: 1 })).rejects.toEqual({
      code: 10401,
      message: 'Invalid mobile number',
    })
  })

  it('rejects on HTTP error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Internal server error'),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    await expect(client.getBalance()).rejects.toThrow(
      'Request failed with status code 500 (Internal Server Error)',
    )
  })

  it('sends message via generic send() method', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(JSON.stringify({ status: 'success', referenceID: 'ref-generic' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    const res = await client.send({
      method: 'sms',
      mobile: '09120000000',
      templateID: 10,
    })

    expect(res).toEqual({ referenceID: 'ref-generic' })
  })

  it('serializes optional fields (countryCode, expireTime, hash, code)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success', referenceID: 'ref-opt' })),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key', true)
    await client.sendSMS({
      countryCode: 98,
      mobile: '9120000000',
      templateID: 10,
      code: '1234',
      expireTime: 300,
      hash: 'abc123',
    })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toEqual({
      method: 'sms',
      countryCode: 98,
      mobile: '9120000000',
      templateID: 10,
      code: '1234',
      expireTime: 300,
      hash: 'abc123',
    })
  })

  it('rejects when response body is not valid JSON and status is 200', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('not-json'),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    await expect(client.getBalance()).rejects.toThrow()
  })

  it('rejects when response body is not an object', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('null'),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    await expect(client.getBalance()).rejects.toThrow('Invalid response from MessageWay')
  })

  it('rejects with Error instance preserving response and cause when error is not standard MessageWay error', async () => {
    const rawError = {
      status: 'error',
      error: 'non-standard error format',
      customCode: 999,
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(rawError)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    try {
      await client.getBalance()
      expect.unreachable('Should have rejected')
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('non-standard error format')
      expect(err.response).toEqual(rawError)
      expect(err.cause).toEqual(rawError)
    }
  })

  it('rejects with MessageWayHttpError preserving raw response and status on HTTP error with JSON body', async () => {
    const rawPayload = { message: 'API key is inactive', details: { reason: 'expired' } }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve(JSON.stringify(rawPayload)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    try {
      await client.getBalance()
      expect.unreachable('Should have rejected')
    } catch (err: any) {
      expect(err).toBeInstanceOf(MessageWayHttpError)
      expect(err.message).toBe('API key is inactive')
      expect(err.status).toBe(401)
      expect(err.statusText).toBe('Unauthorized')
      expect(err.response).toEqual(rawPayload)
      expect(err.cause).toEqual(rawPayload)
    }
  })

  it('rejects with MessageWayHttpError preserving raw text on HTTP error with non-JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: () => Promise.resolve('<html>502 Bad Gateway</html>'),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    try {
      await client.getBalance()
      expect.unreachable('Should have rejected')
    } catch (err: any) {
      expect(err).toBeInstanceOf(MessageWayHttpError)
      expect(err.status).toBe(502)
      expect(err.response).toBe('<html>502 Bad Gateway</html>')
    }
  })

  it('rejects with MessageError on HTTP error status with standard MessageWay error payload', async () => {
    const errorPayload = {
      status: 'error',
      error: {
        code: 40001,
        message: 'apiKey not found',
      },
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: () => Promise.resolve(JSON.stringify(errorPayload)),
    })
    globalThis.fetch = fetchMock

    const client = new MessageWay('test-api-key')
    await expect(client.getBalance()).rejects.toEqual({
      code: 40001,
      message: 'apiKey not found',
    })
  })
})

const liveApiKey = process.env.API_KEY
const liveMobile = process.env.TEST_PHONE_NUMBER
const liveTemplateID = Number(process.env.TEMPLATE_ID) || 3

describe.runIf(Boolean(liveApiKey && liveMobile))('Live API integration', () => {
  const client = new MessageWay(liveApiKey!, false)

  it('retrieves account balance', async () => {
    const res = await client.getBalance()
    expect(res).toHaveProperty('data.balance')
    expect(typeof res.data.balance).toBe('number')
    expect(res.data.balance).toBeGreaterThanOrEqual(0)
  })

  it('fetches existing template details', async () => {
    const res = await client.getTemplate({ templateID: liveTemplateID })
    expect(res).toHaveProperty('data.template')
    expect(typeof res.data.template).toBe('string')
  })

  it('rejects on non-existent template', async () => {
    await expect(client.getTemplate({ templateID: 999999 })).rejects.toSatisfy(isMessageWayError)
  })

  it('rejects with MessageWay error on invalid API key', async () => {
    const badClient = new MessageWay('bad-api-key')
    await expect(badClient.getBalance()).rejects.toSatisfy(isMessageWayError)
  })

  it('sends SMS and checks status live', async () => {
    const ref = await client.sendSMS({
      mobile: liveMobile!,
      templateID: liveTemplateID,
      length: 4,
    })

    expect(typeof ref).toBe('string')
    expect(ref.length).toBeGreaterThan(0)
    const status = await client.getStatus({ OTPReferenceID: ref })
    expect(status).toHaveProperty('OTPStatus')
    expect(status.OTPMethod).toBe('sms')
  })

  it('sends SMS with custom code in manual mode', async () => {
    const manualClient = new MessageWay(liveApiKey!, true)
    const ref = await manualClient.sendSMS({
      mobile: liveMobile!,
      templateID: liveTemplateID,
      code: '5432',
    })

    expect(typeof ref).toBe('string')
    expect(ref.length).toBeGreaterThan(0)
  })

  it('sends Smart message', async () => {
    const ref = await client.sendSmart({
      mobile: liveMobile!,
      templateID: liveTemplateID,
      length: 4,
    })

    expect(typeof ref).toBe('string')
    const status = await client.getStatus({ OTPReferenceID: ref })
    expect(status).toHaveProperty('OTPStatus')
  })

  it('sends Gap message', async () => {
    const ref = await client.sendGapMessage({
      mobile: liveMobile!,
      templateID: liveTemplateID,
      length: 4,
    })

    expect(typeof ref).toBe('string')
    const status = await client.getStatus({ OTPReferenceID: ref })
    expect(status).toHaveProperty('OTPStatus')
    expect(status.OTPMethod).toBe('messenger')
  })

  it('rejects verification on invalid OTP', async () => {
    await expect(client.verify({ mobile: liveMobile!, OTP: '000000' })).rejects.toSatisfy(
      isMessageWayError,
    )
  })
})
