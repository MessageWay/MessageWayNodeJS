import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MessageWay, isMessageWayError, SMSProvider, MessengerProvider } from '../src/index'

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
})

const liveApiKey = process.env.API_KEY
const liveMobile = process.env.TEST_PHONE_NUMBER

describe.runIf(Boolean(liveApiKey && liveMobile))('Live API integration', () => {
  const client = new MessageWay(liveApiKey!, false)

  it('sends SMS and checks status live', async () => {
    const ref = await client.sendSMS({
      mobile: liveMobile!,
      templateID: 12,
      length: 4,
      params: ['test'],
    })

    expect(typeof ref).toBe('string')
    const status = await client.getStatus({ OTPReferenceID: ref })
    expect(status).toHaveProperty('OTPStatus')
  })
})
