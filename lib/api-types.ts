/**
 * Shared API types for NeoBank backend integration.
 * Used by wallet connect, transfer, and sensitive transfer endpoints.
 */

export type WalletEventType = "metamask-connect" | "unlink-wallet-created" | "wallet-linked"

export interface WalletConnectPayload {
  type?: WalletEventType
  /** MetaMask public address (0x...) */
  metamaskAddress?: string
  /** Unlink private address (unlink1...) - when available */
  unlinkAddress?: string
  /** Chain ID as hex string */
  chainId?: string
  /** Native balance in wei (hex) - optional */
  balanceHex?: string
  /** Timestamp */
  connectedAt?: string
  createdAt?: string
}

export interface TransferRecord {
  id: string
  type: "private-send"
  token: string
  recipient: string
  amount: string
  relayId: string | null
  memo?: string
  timestamp: string
}

export interface SensitiveTransferRecord {
  id: string
  type: "withdrawal"
  token: string
  recipient: string
  amount: string
  relayId: string | null
  purpose?: string
  privacyLevel?: "standard" | "enhanced" | "maximum"
  encryptedMemo?: boolean
  memo?: string
  timestamp: string
}

export type PaymentMode = "fast" | "delayed"

export type BackendTxStatus =
  | "INITIATED"
  | "AWAITING_DEPOSIT"
  | "CONFIRMING"
  | "ROUTING"
  | "SETTLING"
  | "COMPLETED"
  | "FAILED"

export interface InitiatePaymentRequest {
  sender_unlink_id: string
  vendor_unlink_id: string
  amount: string
  mode: PaymentMode
  hop_count?: number
}

export interface InitiatePaymentResponse {
  internal_tx_id: string
  deposit_address: string
  estimated_fee: string
}

export interface BackendPaymentStatusResponse {
  internal_tx_id: string
  status: BackendTxStatus
  final_tx_hash: string | null
  updated_at: string
  error?: string
}

export interface BackendVerifyResponse {
  verified: boolean
  tx_hash?: string
  status?: "not_found"
}
