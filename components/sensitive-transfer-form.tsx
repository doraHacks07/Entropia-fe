"use client"

import { useState } from "react"
import { useUnlink, useWithdraw, useTxStatus, formatAmount, shortenHex } from "@unlink-xyz/react"
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
import { toast } from "sonner"
import {
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowUpRight,
  Lock,
} from "lucide-react"

type WithdrawStep = "form" | "confirm" | "success"

interface WithdrawData {
  recipient: string
  amount: string
  token: string
  purpose: string
}

const KNOWN_TOKENS = [
  { label: "Native Token", value: "0x0000000000000000000000000000000000000000" },
]

export function SensitiveTransferForm() {
  const { balances: rawBalances, busy, status } = useUnlink()
  const balances = rawBalances || {}
  const {
    withdraw,
    isPending,
    reset: resetWithdraw,
  } = useWithdraw()

  const [step, setStep] = useState<WithdrawStep>("form")
  const [relayId, setRelayId] = useState<string | null>(null)
  const [form, setForm] = useState<WithdrawData>({
    recipient: "",
    amount: "",
    token: KNOWN_TOKENS[0].value,
    purpose: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof WithdrawData, string>>>({})

  const txStatus = useTxStatus(relayId ?? undefined)

  const currentBalance = balances?.[form.token]
  const formattedBalance = currentBalance
    ? formatAmount(currentBalance, 18)
    : "0"

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof WithdrawData, string>> = {}
    if (!form.recipient) {
      newErrors.recipient = "Recipient address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(form.recipient)) {
      newErrors.recipient = "Must be a valid Ethereum address (0x...)"
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
    if (validate()) setStep("confirm")
  }

  const handleSubmit = async () => {
    try {
      const decimals = 18
      const parts = form.amount.split(".")
      const whole = parts[0]
      const frac = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals)
      const amountBigInt = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(frac)

      const result = await withdraw([
        {
          token: form.token,
          recipient: form.recipient,
          amount: amountBigInt,
        },
      ])

      setRelayId(result.relayId)
      setStep("success")

      // POST to backend
      try {
        await fetch("/api/transfer/sensitive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "withdrawal",
            token: form.token,
            recipient: form.recipient,
            amount: form.amount,
            relayId: result.relayId,
            purpose: form.purpose,
          }),
        })
      } catch {
        // best-effort
      }

      toast.success("Withdrawal submitted")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Withdrawal failed. Please try again."
      )
    }
  }

  const handleReset = () => {
    setForm({
      recipient: "",
      amount: "",
      token: KNOWN_TOKENS[0].value,
      purpose: "",
    })
    setStep("form")
    setRelayId(null)
    setErrors({})
    resetWithdraw()
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">
              Withdrawal Submitted
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Your funds are being unshielded and sent to the public address. ZK proof verification may take a moment.
            </p>
            <div className="mt-6 w-full rounded-lg bg-secondary/50 p-4 space-y-3">
              <Row label="Amount" value={form.amount} />
              <Row
                label="To"
                value={shortenHex(form.recipient, 6)}
                mono
              />
              {relayId && (
                <Row label="Relay ID" value={shortenHex(relayId, 6)} mono accent />
              )}
              {txStatus?.state && <Row label="Status" value={txStatus.state} />}
              {txStatus?.txHash && (
                <Row label="Tx Hash" value={shortenHex(txStatus.txHash, 6)} mono accent />
              )}
            </div>
            <Button
              onClick={handleReset}
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              New Withdrawal
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
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-card-foreground">
                Confirm Withdrawal
              </CardTitle>
            </div>
            <CardDescription>
              Review carefully. This moves funds from your private wallet to a
              public address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
              <Row
                label="To (Public)"
                value={shortenHex(form.recipient, 8)}
                mono
              />
              <Row label="Amount" value={form.amount} />
              <Row label="Token" value={shortenHex(form.token, 6)} mono />
              <Row label="Available" value={formattedBalance} />
              {form.purpose && <Row label="Purpose" value={form.purpose} />}
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Withdrawals move tokens from your private shielded balance to a
                public Ethereum address. The recipient address and amount will
                be visible onchain. Once submitted, this cannot be reversed.
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
                    <Lock className="mr-2 h-4 w-4" />
                    Confirm Withdrawal
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
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Withdraw
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Move tokens from your private wallet to a public Ethereum address
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-5">
          {/* Recipient */}
          <div className="space-y-2">
            <Label
              htmlFor="w-recipient"
              className="text-sm font-medium text-card-foreground"
            >
              Recipient Public Address
            </Label>
            <Input
              id="w-recipient"
              placeholder="0x..."
              value={form.recipient}
              onChange={(e) => {
                setForm({ ...form, recipient: e.target.value })
                if (errors.recipient)
                  setErrors({ ...errors, recipient: undefined })
              }}
              className="h-12 bg-input border-border font-mono text-sm text-foreground placeholder:text-muted-foreground"
            />
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
                htmlFor="w-amount"
                className="text-sm font-medium text-card-foreground"
              >
                Amount
              </Label>
              <Input
                id="w-amount"
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
              <p className="text-xs text-muted-foreground">
                Available: {formattedBalance}
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">
              Purpose{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select
              value={form.purpose}
              onValueChange={(v) => setForm({ ...form, purpose: v })}
            >
              <SelectTrigger className="h-12 bg-input border-border text-foreground">
                <SelectValue placeholder="Select purpose..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Withdrawals unshield your tokens back to a public Ethereum
              address. The withdrawal amount and recipient will be visible
              onchain, but your remaining private balance stays hidden.
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleReview}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            size="lg"
          >
            Review Withdrawal
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
