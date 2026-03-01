import type { BackendPaymentStatusResponse, PaymentMode } from "@/lib/api-types"

export interface BackendTxRecord {
  internalTxId: string
  vendorAddress: string
  amountAtomic: string
  mode: PaymentMode
  status: BackendPaymentStatusResponse["status"] | "INITIATED"
  finalTxHash: string | null
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "neobank_backend_txs"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage
}

export function readBackendTxRecords(): BackendTxRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BackendTxRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBackendTxRecords(records: BackendTxRecord[]): void {
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function upsertBackendTxRecord(record: BackendTxRecord): void {
  const records = readBackendTxRecords()
  const idx = records.findIndex((r) => r.internalTxId === record.internalTxId)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.unshift(record)
  }
  writeBackendTxRecords(records.slice(0, 100))
}
