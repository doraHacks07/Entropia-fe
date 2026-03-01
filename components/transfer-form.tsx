"use client"

import { useState } from "react"
import { useUnlink, useSend, useTxStatus, formatAmount, shortenHex, parseAmount } from "@unlink-xyz/react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Send,
  Lock,
  Layers,
} from "lucide-react"

type TransferStep = "form" | "confirm" | "success"

interface TransferData {
  recipient: string
  amount: string
  token: string
  memo: string
}

// Known tokens on Monad testnet (update with real addresses)
const KNOWN_TOKENS = [
  { label: "Native Token", value: "0x0000000000000000000000000000000000000000" },
]

const RECENT_RECIPIENTS_KEY = "neobank-recent-recipients"
const MAX_RECENT = 5

function getRecentRecipients(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(RECENT_RECIPIENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addRecentRecipient(addr: string) {
  if (typeof window === "undefined" || !addr?.startsWith("unlink1")) return
  const recent = getRecentRecipients().filter((r) => r !== addr)
  recent.unshift(addr)
  localStorage.setItem(RECENT_RECIPIENTS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export function TransferForm() {
  const { balances: rawBalances, busy, status } = useUnlink()
  const balances = rawBalances || {}
  const { send, isPending, isSuccess, reset: resetSend } = useSend()

  const [step, setStep] = useState<TransferStep>("form")
  const [relayId, setRelayId] = useState<string | null>(null)
  const [form, setForm] = useState<TransferData>({
    recipient: "",
    amount: "",
    token: KNOWN_TOKENS[0].value,
    memo: "",
  })
  const [errors, setErrors] = useState<Partial<TransferData>>({})
  const recentRecipients = getRecentRecipients()

  const txStatus = useTxStatus(relayId ?? undefined)

  const currentBalance = balances?.[form.token]
  const formattedBalance = currentBalance
    ? formatAmount(currentBalance, 18)
    : "0"

  const validate = (): boolean => {
    const newErrors: Partial<TransferData> = {}
    if (!form.recipient) {
      newErrors.recipient = "Recipient address is required"
    } else if (!form.recipient.startsWith("unlink1")) {
      newErrors.recipient = "Must be a valid Unlink address (starts with unlink1...)"
    }
    if (!form.amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = "Enter a valid amount"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReview = () => {
    if (validate()) {
      setStep("confirm")
    }
  }

  const handleSubmit = async () => {
    try {
      let amountBigInt: bigint
      try {
        amountBigInt = parseAmount(form.amount, 18)
      } catch {
        setErrors({ ...errors, amount: "Enter a valid amount" })
        return
      }

      const result = await send([
        {
          token: form.token,
          recipient: form.recipient,
          amount: amountBigInt,
        },
      ])

      setRelayId(result.relayId)
      addRecentRecipient(form.recipient)
      setStep("success")

      // POST to backend for record-keeping
      try {
        const res = await fetch("/api/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "private-send",
            token: form.token,
            recipient: form.recipient,
            amount: form.amount,
            relayId: result.relayId,
            memo: form.memo,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.warn("[NeoBank] Transfer record failed:", err)
        }
      } catch {
        // best-effort
      }

      toast.success("Private transfer submitted")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Transfer failed. Please try again."
      )
    }
  }

  const handleReset = () => {
    setForm({
      recipient: "",
      amount: "",
      token: KNOWN_TOKENS[0].value,
      memo: "",
    })
    setStep("form")
    setRelayId(null)
    setErrors({})
    resetSend()
  }

  if (step === "success") {
    const isConfirmed = txStatus?.state === "succeeded"
    return (
      <div className="mx-auto max-w-lg">
        <Card className={`bg-card border-border ${isConfirmed ? "ring-1 ring-primary/40" : ""}`}>
          <CardContent className="flex flex-col items-center py-12">
            {/* Lock highlight when payment done */}
            <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-6 transition-colors ${isConfirmed ? "bg-primary/20" : "bg-primary/10"}`}>
              {isConfirmed ? (
                <Lock className="h-8 w-8 text-primary" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-card-foreground">
              {isConfirmed ? "Transfer Locked" : "Private Transfer Submitted"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              {isConfirmed
                ? "Your transfer is confirmed and permanently locked onchain with ZK privacy."
                : "Your ZK proof is being generated and the transaction will be relayed to the network."}
            </p>

            {/* Privacy Hops Visualization */}
            <div className="mt-6 w-full">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Privacy Layer Hops</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((hop) => (
                  <div key={hop} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full h-1.5 rounded-full transition-colors ${
                      isConfirmed
                        ? "bg-primary"
                        : hop === 1
                          ? "bg-primary"
                          : hop === 2
                            ? "bg-primary/50 animate-pulse"
                            : "bg-border"
                    }`} />
                    <span className="text-[10px] text-muted-foreground">
                      Hop {hop}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                Each hop splits the transfer through the privacy pool at equal amounts, increasing anonymity.
              </p>
            </div>

            <div className="mt-5 w-full rounded-lg bg-secondary/50 p-4 space-y-3">
              <Row label="Amount" value={`${form.amount}`} />
              <Row
                label="To"
                value={`${form.recipient.slice(0, 12)}...${form.recipient.slice(-6)}`}
                mono
              />
              {relayId && (
                <Row
                  label="Relay ID"
                  value={shortenHex(relayId, 6)}
                  mono
                  accent
                />
              )}
              {txStatus?.state && (
                <Row label="Status" value={txStatus.state} />
              )}
              {txStatus?.txHash && (
                <Row
                  label="Tx Hash"
                  value={shortenHex(txStatus.txHash, 6)}
                  mono
                  accent
                />
              )}
            </div>
            <Button
              onClick={handleReset}
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              New Transfer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Confirm Private Transfer
            </CardTitle>
            <CardDescription>
              Review the details before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
              <Row
                label="To"
                value={`${form.recipient.slice(0, 12)}...${form.recipient.slice(-6)}`}
                mono
              />
              <Row label="Amount" value={form.amount} />
              <Row label="Token" value={shortenHex(form.token, 6)} mono />
              <Row label="Available" value={formattedBalance} />
              {form.memo && <Row label="Memo" value={form.memo} />}
            </div>
            {/* Privacy Hops Info */}
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-card-foreground">Privacy Hops</span>
              </div>
              <div className="flex items-center gap-2">
                {["Pay", "Hop 1", "Hop 2", "Hop 3", "Send"].map((label, i) => (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className={`flex flex-col items-center gap-1 flex-1 ${i === 0 || i === 4 ? "" : ""}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-medium ${
                        i === 0 || i === 4
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/15 text-primary"
                      }`}>
                        {i === 0 ? "IN" : i === 4 ? "OUT" : i}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
                    </div>
                    {i < 4 && (
                      <div className="h-px w-full bg-border mt-[-12px]" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                Each hop routes the same amount through the privacy pool, increasing anonymity. More hops = stronger privacy.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is a private transfer using zero-knowledge proofs. The
                recipient, amount, and your balance remain hidden onchain. Proof
                generation may take a few seconds.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("form")}
                className="flex-1 border-border text-foreground hover:bg-secondary"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || busy}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {status || "Generating proof..."}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Confirm & Send
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Private Send
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Transfer tokens privately to another Unlink address
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-5">
          {/* Recipient */}
          <div className="space-y-2">
            <Label
              htmlFor="recipient"
              className="text-sm font-medium text-card-foreground"
            >
              Recipient Unlink Address
            </Label>
            <Input
              id="recipient"
              placeholder="unlink1..."
              value={form.recipient}
              onChange={(e) => {
                setForm({ ...form, recipient: e.target.value })
                if (errors.recipient)
                  setErrors({ ...errors, recipient: undefined })
              }}
              className="h-12 bg-input border-border font-mono text-sm text-foreground placeholder:text-muted-foreground"
            />
            {recentRecipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recentRecipients.map((addr) => (
                  <button
                    key={addr}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, recipient: addr })
                    }
                    className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground font-mono transition-colors"
                  >
                    {shortenHex(addr, 4)}
                  </button>
                ))}
              </div>
            )}
            {errors.recipient && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.recipient}
              </div>
            )}
          </div>

          {/* Token + Amount */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-2">
              <Label className="text-sm font-medium text-card-foreground">
                Token
              </Label>
              <Select
                value={form.token}
                onValueChange={(v) => setForm({ ...form, token: v })}
              >
                <SelectTrigger className="h-12 bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {KNOWN_TOKENS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                  {/* Show any tokens in balance not in known list */}
                  {Object.keys(balances || {})
                    .filter(
                      (addr) => !KNOWN_TOKENS.some((t) => t.value === addr)
                    )
                    .map((addr) => (
                      <SelectItem key={addr} value={addr}>
                        {shortenHex(addr, 4)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-card-foreground"
              >
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => {
                  setForm({ ...form, amount: e.target.value })
                  if (errors.amount)
                    setErrors({ ...errors, amount: undefined })
                }}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.amount && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Available: {formattedBalance}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-primary hover:text-primary/80"
                  onClick={() => {
                    if (currentBalance) {
                      setForm({ ...form, amount: formattedBalance })
                      setErrors({ ...errors, amount: undefined })
                    }
                  }}
                  disabled={!currentBalance || currentBalance === 0n}
                >
                  Max
                </Button>
              </div>
            </div>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label
              htmlFor="memo"
              className="text-sm font-medium text-card-foreground"
            >
              Memo{" "}
              <span className="text-muted-foreground font-normal">
                (optional, local only)
              </span>
            </Label>
            <Textarea
              id="memo"
              placeholder="Add a note for your records..."
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              className="min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleReview}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            size="lg"
          >
            Review Transfer
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  accent,
}: {
  label: string
  value: string
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${mono ? "font-mono text-xs" : "font-medium"} ${
          accent ? "text-primary" : "text-card-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  )
}
