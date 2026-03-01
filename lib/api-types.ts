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
