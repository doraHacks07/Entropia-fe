import type {
  BackendPaymentStatusResponse,
  BackendVerifyResponse,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
} from "@/lib/api-types"

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.trim()
  if (!raw) {
    return "http://localhost:3000"
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw
}

function withApi(path: string): string {
  return `${baseUrl()}${path}`
}

async function readErrorMessage(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`
  try {
    const body = (await res.json()) as { error?: string; message?: string }
    return body.error || body.message || fallback
  } catch {
    return fallback
  }
}

export async function initiatePayment(
  payload: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> {
  const res = await fetch(withApi("/api/initiate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  return (await res.json()) as InitiatePaymentResponse
}

export async function getPaymentStatus(
  internalTxId: string
): Promise<BackendPaymentStatusResponse> {
  const res = await fetch(withApi(`/api/status/${internalTxId}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  return (await res.json()) as BackendPaymentStatusResponse
}

export async function verifyPayment(txHash: string): Promise<BackendVerifyResponse> {
  const res = await fetch(withApi(`/api/verify/${txHash}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (res.status === 404) {
    return { verified: false, status: "not_found" }
  }
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  return (await res.json()) as BackendVerifyResponse
}

export function useBackendPaymentFlow(): boolean {
  return (process.env.NEXT_PUBLIC_PAYMENT_FLOW ?? "backend") === "backend"
}
