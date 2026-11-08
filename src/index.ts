import type {
  SendInput,
  VerifyRequest,
  VerifyResponse,
  StatusRequest,
  StatusResponse,
  MessageError,
  SendRequest,
  SendResponse,
  TemplateRequest,
  TemplateResponse,
  BalanceRequest,
  BalanceResponse,
  Language,
  RequestOptions,
  MessageStatus,
} from './types'
import { SMSProvider, MessengerProvider } from './types'

export * from './types'
export type { MessageError as OTPError, MessageStatus as OTPStatus }

const MESSAGE_WAY_HOST = 'https://api.msgway.com'

/**
 * Check whether an error is a MessageWay standard error or not<br>
 * These objects have two fields: `code` and `message`
 * @param error The error object to check
 * @returns `error` is a standard MessageWay error
 */
export function isMessageWayError(error: any): error is MessageError {
  return !!(
    error &&
    typeof error === 'object' &&
    (typeof error.code === 'number' || typeof error.code === 'string') &&
    typeof error.message === 'string'
  )
}

export class MessageWay<IsManual extends boolean = false> {
  /**
   * @param apiKey Your API key in MsgWay.com.
   * @param manual Generate OTP code automatically or you gonna to enter it manually. <br>Default is `false`.
   * @param language Target language for showing error messages.
   */
  constructor(
    private readonly apiKey: string,
    manual: IsManual = false as IsManual,
    private readonly language: Language = 'fa',
  ) {
    this.send = this.send.bind(this)
    this.sendSMS = this.sendSMS.bind(this)
    this.sendIVR = this.sendIVR.bind(this)
    this.sendSmart = this.sendSmart.bind(this)
    this.sendMessenger = this.sendMessenger.bind(this)
    this.sendGapMessage = this.sendGapMessage.bind(this)
    this.sendWhatsAppMessage = this.sendWhatsAppMessage.bind(this)
    this.verify = this.verify.bind(this)
    this.getStatus = this.getStatus.bind(this)
    this.getTemplate = this.getTemplate.bind(this)
    this.getBalance = this.getBalance.bind(this)
  }

  private request<T>(path: string, body: RequestOptions): Promise<T> {
    const { language = this.language, ...requestBody } = body

    return fetch(MESSAGE_WAY_HOST + path, {
      headers: {
        'accept-language': language,
        'content-type': 'application/json',
        apiKey: this.apiKey,
      },
      method: 'post',
      body: JSON.stringify(requestBody),
    })
      .then(async (response) => {
        const responseBody = await response.text()
        let result: { status?: string; error?: MessageError }
        try {
          result = JSON.parse(responseBody)
        } catch (err) {
          if (!response.ok) {
            throw new Error(
              `Request failed with status code ${response.status} (${response.statusText})`,
            )
          }
          return Promise.reject(err)
        }
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response from MessageWay')
        }
        if (!response.ok || result.status === 'error') {
          return Promise.reject(result)
        }
        delete result.status
        delete result.error
        return result as T
      })
      .catch((error: any) => {
        if (error && error.status === 'error' && isMessageWayError(error.error)) {
          return Promise.reject(error.error)
        }
        return Promise.reject(error)
      })
  }

  /** Send a message using any documented method and its supported provider. */
  send(options: SendRequest): Promise<SendResponse> {
    return this.request<SendResponse>('/send', options)
  }

  /**
   * Send OTP Code via SMS
   * @param options Send options
   * @returns Reference ID
   */
  sendSMS(options: SendInput<IsManual> & { provider?: SMSProvider }): Promise<string> {
    return this.send({ ...options, method: 'sms' }).then((result) => result.referenceID)
  }

  /**
   * Send OTP Code via IVR (Interactive voice response)
   * @param options Send options
   * @returns Reference ID
   */
  sendIVR(options: SendInput<IsManual>): Promise<string> {
    return this.send({ ...options, method: 'ivr' }).then((result) => result.referenceID)
  }

  /** Send a message using smart delivery. Returns the reference ID. */
  sendSmart(options: SendInput<IsManual>): Promise<string> {
    return this.send({ ...options, method: 'smart' }).then((result) => result.referenceID)
  }

  /** Send via a documented messenger provider. Returns the reference ID. */
  sendMessenger(options: SendInput<IsManual> & { provider?: MessengerProvider }): Promise<string> {
    return this.send({ ...options, method: 'messenger' }).then((result) => result.referenceID)
  }

  /**
   * Send OTP Code via Gap Messenger ([gap.im](https://gap.im))
   * @returns Reference ID
   */
  sendGapMessage(options: SendInput<IsManual>): Promise<string> {
    return this.sendMessenger({ ...options, provider: MessengerProvider.Gap })
  }

  /**
   * Send OTP Code via WhatsApp Messenger ([whatsapp.com](https://www.whatsapp.com))
   * @returns Reference ID
   * @deprecated WhatsApp is not listed in the current API documentation. Use sendMessenger with a documented provider.
   */
  sendWhatsAppMessage(options: SendInput<IsManual>): Promise<string> {
    return this.sendMessenger({
      ...options,
      provider: MessengerProvider.WhatsApp,
    })
  }

  /**
   * Verify a user-entered OTP generated by MessageWay. Custom codes cannot be verified here.
   * @returns If the code is correct the promise resolves.
   */
  verify(options: VerifyRequest): Promise<VerifyResponse> {
    return this.request<VerifyResponse>('/otp/verify', options).then(() => {})
  }

  /**
   * Get status of the sent OTP.
   * @param options The OTP reference ID and optional response language.
   */
  getStatus(options: StatusRequest): Promise<StatusResponse> {
    return this.request<StatusResponse>('/status', options)
  }

  /** Get the text of a template. The response contains data.template. */
  getTemplate(options: TemplateRequest): Promise<TemplateResponse> {
    return this.request<TemplateResponse>('/template/get', options)
  }

  /**
   * Get account balance.
   * @returns A response containing the account balance in data.balance.
   */
  getBalance(options: BalanceRequest = {}): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/balance/get', options)
  }
}
