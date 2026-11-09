/** Supported languages: 'fa', 'en', and 'fa-IR' (mapped to 'fa' for backward compatibility with v1) */
export type Language = 'fa' | 'en' | 'fa-IR'

export interface RequestOptions {
  language?: Language
}

/** Message Sending type */
export type MessageMethod = 'sms' | 'ivr' | 'smart' | 'messenger'

/** Delivery methods returned by the status API. */
export type OTPMethod = 'sms' | 'ivr' | 'messenger' | 'email'

/**
 * Message Status types
 * 'pending': Message not yet sent
 * 'operatorDelivered': Message sent to operator and waiting for delivery
 * 'sent': Message sent
 * 'delivered': Message delivered to the recipient
 * 'seen': Message is seen by user (in messenger mode)
 * 'notDelivered': Message not delivered by operator
 * 'failed': Message failed to be delivered to operator
 */
export type MessageStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'seen'
  | 'operatorDelivered'
  | 'notDelivered'
  | 'failed'

export enum SMSProvider {
  Magfa = 1,
  Atieh = 2,
  Asiatech = 3,
  Armaghan = 5,
}

export enum MessengerProvider {
  /** @deprecated WhatsApp is not listed in the current API documentation. */
  WhatsApp = 1,
  /** from Gap Messenger (https://gap.im) */
  Gap = 2,
  IGap = 8,
  Eitaa = 9,
  Bale = 10,
  Rubika = 12,
}

export interface MessageError {
  code: number | string
  message: string
  traceID?: string
}

export class MessageWayHttpError extends Error {
  readonly status: number
  readonly statusText: string
  readonly response: any

  constructor(status: number, statusText: string, message: string, response?: any) {
    super(message)
    this.name = 'MessageWayHttpError'
    this.status = status
    this.statusText = statusText
    this.response = response
    if (response !== undefined) {
      this.cause = response
    }
  }
}

export interface SendInputCommon extends RequestOptions {
  templateID: number
  countryCode?: number
  mobile: string
  /** Optional custom OTP; 4 to 12 numeric characters. */
  code?: string
  /** Length of an automatically generated OTP. */
  length?: number
  /** SMS auto-retrieval hash containing English letters and digits, optionally prefixed with #. */
  hash?: string
  /** Up to 10 parameters, each at most 40 characters; URLs are not accepted. */
  params?: string[]
  /**
   * OTP expiration duration (in seconds)
   */
  expireTime?: number
}

export interface SendManuallyInput extends SendInputCommon {
  code: string
}

export interface SendAutomaticInput extends SendInputCommon {
  length?: number
}

export type SendInput<IsManual extends boolean> = IsManual extends true
  ? SendManuallyInput
  : SendAutomaticInput

export type SendRequest = SendInputCommon &
  (
    | { method: 'sms'; provider?: SMSProvider }
    | { method: 'messenger'; provider?: MessengerProvider }
    | { method: 'ivr' | 'smart'; provider?: never }
  )

export interface SendResponse {
  referenceID: string
}

export interface VerifyRequestCommon extends RequestOptions {
  /** The user mobile number country code */
  countryCode?: number
  /** The user mobile number */
  mobile: string
}

export type VerifyRequest = VerifyRequestCommon &
  (
    | {
        /** The code that user entered */
        OTP: string
        /** @deprecated Use `OTP` instead. */
        otp?: string
      }
    | {
        /**
         * The code that user entered (for backward compatibility with v1)
         * @deprecated Use `OTP` instead.
         */
        otp: string
        /** The code that user entered */
        OTP?: string
      }
  )

/** Successful verification has no response payload. */
export type VerifyResponse = void

export interface StatusRequest extends RequestOptions {
  OTPReferenceID: string
}

export interface StatusResponse {
  /** Message Send method (sms, ivr, ...) */
  OTPMethod: OTPMethod
  /** Message status text (pending, sent, ...) */
  OTPStatus: MessageStatus
  /** Is OTP verified */
  OTPVerified: boolean
}

export interface TemplateRequest extends RequestOptions {
  templateID: number
}

export interface TemplateResponse {
  data: {
    template: string
  }
}

export interface BalanceRequest extends RequestOptions {}

export interface BalanceResponse {
  data: {
    balance: number
  }
}
