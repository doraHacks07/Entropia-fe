/**
 * In-memory store for transfer records and wallet events.
 * Replace with database (e.g. Prisma, Drizzle) in production.
 */

import type { TransferRecord, SensitiveTransferRecord, WalletConnectPayload } from "./api-types"

const transfers: TransferRecord[] = []
let lastWalletEvent: (WalletConnectPayload & { id: string; timestamp: string }) | null = null
const sensitiveTransfers: SensitiveTransferRecord[] = []

function generateId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function createTransfer(data: Omit<TransferRecord, "id" | "timestamp">): TransferRecord {
  const record: TransferRecord = {
    ...data,
    id: generateId(),
    timestamp: new Date().toISOString(),
  }
  transfers.push(record)
  return record
}

export function createSensitiveTransfer(
  data: Omit<SensitiveTransferRecord, "id" | "timestamp">
): SensitiveTransferRecord {
  const record: SensitiveTransferRecord = {
    ...data,
    id: generateId(),
    timestamp: new Date().toISOString(),
  }
  sensitiveTransfers.push(record)
  return record
}

export function getTransfers(): TransferRecord[] {
  return [...transfers].reverse()
}

export function getSensitiveTransfers(): SensitiveTransferRecord[] {
  return [...sensitiveTransfers].reverse()
}

export function saveWalletEvent(payload: WalletConnectPayload): { id: string; timestamp: string } {
  const id = `evt_${Date.now()}`
  const timestamp = payload.connectedAt ?? payload.createdAt ?? new Date().toISOString()
  lastWalletEvent = { ...payload, id, timestamp }
  return { id, timestamp }
}

export function getLastWalletEvent() {
  return lastWalletEvent
}
