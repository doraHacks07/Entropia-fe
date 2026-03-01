"use client"

import { useEffect, useMemo, useState } from "react"
import { useUnlink, parseAmount, shortenHex } from "@unlink-xyz/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Copy, Loader2 } from "lucide-react"
import type { BackendPaymentStatusResponse, PaymentMode } from "@/lib/api-types"
import { getPaymentStatus, initiatePayment, verifyPayment } from "@/lib/backend-payments"
import { upsertBackendTxRecord } from "@/lib/backend-tx-store"

interface BackendPaymentFormData {
  vendorAddress: string
  amountUi: string
  mode: PaymentMode
  hopCount: number
}

const FINAL_STATES = new Set(["COMPLETED", "FAILED"])

export function BackendPaymentForm() {
  const { activeAccount } = useUnlink()
  const [form, setForm] = useState<BackendPaymentFormData>({
    vendorAddress: "",
    amountUi: "",
    mode: "fast",
    hopCount: 3,
  })
  const [submitting, setSubmitting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [tx, setTx] = useState<{
    internalTxId: string
    depositAddress: string
    estimatedFee: string
    amountAtomic: string
    mode: PaymentMode
    vendorAddress: string
  } | null>(null)
  const [status, setStatus] = useState<BackendPaymentStatusResponse | null>(null)
  const [verifyState, setVerifyState] = useState<"idle" | "verified" | "not_found" | "error">("idle")

  const senderId = activeAccount?.address ?? ""

  const canSubmit = useMemo(() => {
    return senderId.length > 0 && form.vendorAddress.length > 0 && form.amountUi.length > 0
  }, [form.amountUi, form.vendorAddress, senderId])

  useEffect(() => {
    if (!tx?.internalTxId) return

    let alive = true
    const poll = async () => {
      try {
        setStatusLoading(true)
        const next = await getPaymentStatus(tx.internalTxId)
        if (!alive) return
        setStatus(next)
        upsertBackendTxRecord({
          internalTxId: next.internal_tx_id,
          vendorAddress: tx.vendorAddress,
          amountAtomic: tx.amountAtomic,
          mode: tx.mode,
          status: next.status,
          finalTxHash: next.final_tx_hash,
          createdAt: new Date().toISOString(),
          updatedAt: next.updated_at,
        })
        if (
          next.status === "COMPLETED" &&
          next.final_tx_hash &&
          verifyState === "idle"
        ) {
          try {
            const verify = await verifyPayment(next.final_tx_hash)
            if (!alive) return
            setVerifyState(verify.verified ? "verified" : "not_found")
          } catch {
            if (!alive) return
            setVerifyState("error")
          }
        }
      } catch (error) {
        if (!alive) return
        const message = error instanceof Error ? error.message : "Failed to read status"
        toast.error(message)
      } finally {
        if (alive) setStatusLoading(false)
      }
    }

    poll().catch(() => undefined)
    const interval = setInterval(() => {
      if (status && FINAL_STATES.has(status.status)) return
      poll().catch(() => undefined)
    }, 4000)

    return () => {
      alive = false
      clearInterval(interval)
    }
  }, [status, tx, verifyState])

  const handleInitiate = async () => {
    if (!canSubmit) return
    try {
      setSubmitting(true)
      if (!/^0x[a-fA-F0-9]{40}$/.test(form.vendorAddress)) {
        toast.error("Vendor must be a valid EVM address (0x...)")
        return
      }
      let atomicAmount: bigint
      try {
        atomicAmount = parseAmount(form.amountUi, 18)
      } catch {
        toast.error("Enter a valid amount")
        return
      }

      const response = await initiatePayment({
        sender_unlink_id: senderId,
        vendor_unlink_id: form.vendorAddress,
        amount: atomicAmount.toString(),
        mode: form.mode,
        hop_count: form.mode === "delayed" ? form.hopCount : undefined,
      })
      upsertBackendTxRecord({
        internalTxId: response.internal_tx_id,
        vendorAddress: form.vendorAddress,
        amountAtomic: atomicAmount.toString(),
        mode: form.mode,
        status: "INITIATED",
        finalTxHash: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      setTx({
        internalTxId: response.internal_tx_id,
        depositAddress: response.deposit_address,
        estimatedFee: response.estimated_fee,
        amountAtomic: atomicAmount.toString(),
        mode: form.mode,
        vendorAddress: form.vendorAddress,
      })
      setStatus(null)
      setVerifyState("idle")
      toast.success("Payment initiated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment")
    } finally {
      setSubmitting(false)
    }
  }

  const copyDepositAddress = async () => {
    if (!tx?.depositAddress) return
    await navigator.clipboard.writeText(tx.depositAddress)
    toast.success("Deposit address copied")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Backend Orchestrated Payment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Initiate Fast/Delayed MON payments through backend routing engine.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Initiate Payment</CardTitle>
          <CardDescription>
            Sender comes from your active Unlink account. Vendor is EVM address in this phase. Amount is MON in wei.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sender (active account)</Label>
            <Input value={senderId || "No active account"} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorAddress">Vendor Address (0x...)</Label>
            <Input
              id="vendorAddress"
              placeholder="0x..."
              value={form.vendorAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, vendorAddress: e.target.value.trim() }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountUi">Amount (MON)</Label>
              <Input
                id="amountUi"
                type="number"
                step="any"
                placeholder="0.0"
                value={form.amountUi}
                onChange={(e) => setForm((prev) => ({ ...prev, amountUi: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={form.mode}
                onValueChange={(v: PaymentMode) => setForm((prev) => ({ ...prev, mode: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.mode === "delayed" && (
            <div className="space-y-2">
              <Label htmlFor="hopCount">Hop Count</Label>
              <Input
                id="hopCount"
                type="number"
                min={1}
                max={8}
                value={form.hopCount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    hopCount: Math.min(8, Math.max(1, Number(e.target.value || 1))),
                  }))
                }
              />
            </div>
          )}

          <Button
            onClick={handleInitiate}
            disabled={!canSubmit || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initiating...
              </>
            ) : (
              "Initiate Payment"
            )}
          </Button>
        </CardContent>
      </Card>

      {tx && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Transaction Tracking</CardTitle>
            <CardDescription>Track backend status and verify final transaction hash.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Internal Tx ID" value={tx.internalTxId} mono />
            <div className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2">
              <span className="text-sm text-muted-foreground">Deposit Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{shortenHex(tx.depositAddress, 6)}</span>
                <Button type="button" size="icon" variant="ghost" onClick={copyDepositAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Row label="Estimated Fee (wei)" value={tx.estimatedFee} mono />
            <div className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2">
              <span className="text-sm text-muted-foreground">Backend Status</span>
              <div className="flex items-center gap-2">
                {statusLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                <Badge variant="outline">{status?.status ?? "PENDING"}</Badge>
              </div>
            </div>
            {status?.final_tx_hash && <Row label="Final Tx Hash" value={status.final_tx_hash} mono />}
            {status?.error && <Row label="Error" value={status.error} />}
            {status?.status === "COMPLETED" && (
              <Row
                label="Verify"
                value={
                  verifyState === "verified"
                    ? "verified"
                    : verifyState === "not_found"
                      ? "not_found"
                      : verifyState === "error"
                        ? "verification_error"
                        : "pending"
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs text-card-foreground" : "text-sm text-card-foreground"}>
        {value}
      </span>
    </div>
  )
}
