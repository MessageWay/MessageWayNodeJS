import got from 'got'
import { SendInput, SendManuallyInput, SendAutomaticInput, VerifyRequest, StatusRequest, StatusResponse, MessageError, SendRequest, SendResponse, MessengerProvider, BalanceResponse } from './types'
export { SendInput, SendManuallyInput as SendManuallyInput, SendAutomaticInput, VerifyRequest, StatusRequest, StatusResponse, MessageError as OTPError }
export { MessageMethod as OTPMethod, MessageStatus as OTPStatus } from './types'

const MESSAGE_WAY_HOST = 'https://api.msgway.com'

/**
 * Check whether an error is a MessageWay standard error or not<br>
 * These objects have two fields: `code` and `message`
 * @param error The error object to check
 * @returns `error` is a standard MessageWay error
 */
export function isMessageWayError(error: any): error is MessageError {
  return !!(error && error.code && error.message && error.constructor === Object)
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
    private readonly language = 'fa-IR') {
    this.sendSMS = this.sendSMS.bind(this)
    this.sendIVR = this.sendIVR.bind(this)
    this.sendGapMessage = this.sendGapMessage.bind(this)
    this.verify = this.verify.bind(this)
    this.getStatus = this.getStatus.bind(this)
    this.getBalance = this.getBalance.bind(this)
  }

  private request<T>(path: string, body: object): Promise<T> {
    let language = this.language

    if ('language' in body) {
      language = (body as any).language
      delete (body as any).language
    }

    return got(MESSAGE_WAY_HOST + path, {
      headers: {
        'accept-language': language,
        'content-type': 'application/json',
        apiKey: this.apiKey
      },
      method: 'post',
      responseType: 'text',
      body: JSON.stringify(body),
    })
      .then(response => {
        let result: { status?: any, error?: any }
        try {
          result = JSON.parse(response.body)
        } catch (err) {
          return Promise.reject(err)
        }
        if (result.error) {
          return Promise.reject(result)
        }
        delete result.status
        delete result.error
        return result as T
      })
      .catch((error: any) => {
        if (error.response) {
          try { error = JSON.parse(error.response.body) } catch (error) { }
        }
        if (error.status === 'error' && isMessageWayError(error.error)) {
          return Promise.reject(error.error)
        }
        return Promise.reject(error)
      })
  }

  private send(method: SendRequest['method'], options: SendInput<IsManual>): Promise<string> {
    const body = {
      method,
      ...options,
    } as SendRequest

    return this.request<SendResponse>('/send', body)
      .then(result => result.referenceID)
  }
  /**
   * Send OTP Code via SMS
   * @param options Send options
   * @returns Reference ID
   */
  sendSMS(options: SendInput<IsManual>): Promise<string> {
    return this.send('sms', options)
  }
  /**
   * Send OTP Code via IVR (Interactive voice response)
   * @param options Send options
   * @returns Reference ID
   */
  sendIVR(options: SendInput<IsManual>): Promise<string> {
    return this.send('ivr', options)
  }
  /**
   * Send OTP Code via Gap Messenger ([gap.im](https://gap.im))
   * @returns Reference ID
   */
  sendGapMessage(options: SendInput<IsManual>): Promise<string> {
    return this.send('messenger', { ...options, provider: MessengerProvider.Gap })
  }

  /**
   * Send OTP Code via WhatsApp Messenger ([whatsapp.com](https://www.whatsapp.com))
   * @returns Reference ID
   */
  sendWhatsAppMessage(options: SendInput<IsManual>): Promise<string> {
    return this.send('messenger', { ...options, provider: MessengerProvider.WhatsApp })
  }

  /**
   * Verify the user entered code.
   * @returns If the code is correct the promise resolves.
   */
  verify(options: VerifyRequest): Promise<void> {
    return this.request<void>('/otp/verify', options)
      .then(() => { })
  }

  /**
   * Get status of the sent OTP.
   * @param referenceID
   */
  getStatus(options: StatusRequest): Promise<StatusResponse> {
    return this.request<StatusResponse>('/status', options)
  }

  /**
   * Get account balance.
   * @returns A promise that resolves to the account balance as a number.
   * @author amirmm4d
   */
  getBalance(): Promise<number> {
    return this.request<BalanceResponse>('/balance/get', {})
      .then(result => result.balance)
  }
}
