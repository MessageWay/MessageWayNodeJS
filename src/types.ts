interface RequestOptions {
  language?: string
}

/** Message Sending type */
export type MessageMethod = 'sms' | 'ivr' | 'messenger'

/**
 * Message Status types
 * 'pending': Message not yet sent
 * 'operatorDelivered': Message sent to operator and waiting for delivery
 * 'sent': User received Message
 * 'seen': Message is seen by user (in messenger mode)
 * 'notDelivered': Message not delivered by operator
 * 'failed': Message failed to be delivered to operator
 */
export type MessageStatus = 'pending' | 'sent' | 'seen' | 'operatorDelivered' | 'notDelivered' | 'failed'

export enum MessengerProvider {
  /** from WhatsApp Messenger */
  WhatsApp = 1,
  /** from Gap Messenger (https://gap.im) */
  Gap = 2
}

export interface MessageError {
  code: number
  message: string
}

export interface SendInputCommon {
  templateID?: number
  countryCode?: number
  mobile: string
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
  length: number
}

export type SendInput<IsManual extends boolean> = IsManual extends true ? SendManuallyInput : SendAutomaticInput

/** @ignore */
export interface SendRequest {
  code: string
  countryCode?: number
  expireTime?: number
  length: number
  method: MessageMethod
  mobile: string
  params?: string[]
  provider?: number
  templateID?: number
}

/** @ignore */
export interface SendResponse {
  referenceID: string
}

export interface VerifyRequest {
  /** The user mobile number country code */
  countryCode?: number
  /** The user mobile number */
  mobile: string
  /** The code that user entered */
  otp: string
}

export interface StatusRequest {
  OTPReferenceID: string
}

export interface StatusResponse {
  /** Message Send method (sms, ivr, ...) */
  MessageMethod: MessageMethod
  /** Message status text (pending, sent, ...) */
  MessageStatus: MessageStatus
  /** Is OTP verified */
  OTPVerified: boolean
}

export interface BalanceResponse {
  balance: number
}
