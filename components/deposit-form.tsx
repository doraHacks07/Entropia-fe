"use client"

import { useState } from "react"
import { useDeposit, shortenHex } from "@unlink-xyz/react"
import { useMetaMask } from "@/lib/wallet-context"
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
import { toast } from "sonner"
import {
  ArrowDownToLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Wallet,
} from "lucide-react"

type DepositStep = "connect" | "form" | "confirm" | "success"

const TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"

export function DepositForm() {
  const {
    publicAddress,
    isMetaMaskConnected,
    isConnecting,
    connectMetaMask,
    getEthereum,
  } = useMetaMask()
  const { deposit, isPending, reset: resetDeposit } = useDeposit()

  const [step, setStep] = useState<DepositStep>(
    isMetaMaskConnected ? "form" : "connect"
  )
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [txHash, setTxHash] = useState("")

  const handleConnect = async () => {
    await connectMetaMask()
    setStep("form")
  }

  const validate = (): boolean => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount")
      return false
    }
    setError("")
    return true
  }

  const handleReview = () => {
    if (validate()) setStep("confirm")
  }

  const handleSubmit = async () => {
    if (!publicAddress) return
    const ethereum = getEthereum()
    if (!ethereum) {
      toast.error("MetaMask not found")
      return
    }

    try {
      const decimals = 18
      const parts = amount.split(".")
      const whole = parts[0]
      const frac = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals)
      const amountBigInt = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(frac)

      const depositResult = await deposit([
        {
          token: TOKEN_ADDRESS,
          amount: amountBigInt,
          depositor: publicAddress,
        },
      ])

      // Submit deposit transaction via MetaMask
      const hash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: depositResult.to,
            data: depositResult.calldata,
            from: publicAddress,
          },
        ],
      })

      setTxHash(hash as string)
      setStep("success")
      toast.success("Deposit submitted to network")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Deposit failed. Please try again."
      )
    }
  }

  const handleReset = () => {
    setAmount("")
    setError("")
    setTxHash("")
    setStep(isMetaMaskConnected ? "form" : "connect")
    resetDeposit()
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
              Deposit Submitted
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Your tokens are being shielded into your private wallet. This
              may take a few minutes to confirm.
            </p>
            <div className="mt-6 w-full rounded-lg bg-secondary/50 p-4 space-y-3">
              <Row label="Amount" value={amount} />
              <Row
                label="From"
                value={publicAddress ? shortenHex(publicAddress, 6) : ""}
                mono
              />
              {txHash && (
                <Row
                  label="Tx Hash"
                  value={shortenHex(txHash, 6)}
                  mono
                  accent
                />
              )}
            </div>
            <Button
              onClick={handleReset}
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              New Deposit
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
              Confirm Deposit
            </CardTitle>
            <CardDescription>
              This will shield your tokens into your private wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
              <Row
                label="From (Public)"
                value={publicAddress ? shortenHex(publicAddress, 8) : ""}
                mono
              />
              <Row label="Amount" value={amount} />
              <Row label="Destination" value="Your Private Wallet" />
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                MetaMask will ask you to sign a transaction. This moves tokens
                from your public address into the Unlink privacy pool. Once
                confirmed, your balance will be shielded.
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
                disabled={isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Deposit & Shield
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "connect" || !isMetaMaskConnected) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Deposit
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Shield tokens from a public wallet into your private account
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-5">
              <Wallet className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Connect MetaMask
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
              Connect your public wallet to deposit tokens into your private
              Unlink wallet.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="mt-6 w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Deposit
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Shield tokens from your public wallet into your private account
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-5">
          <div className="rounded-lg bg-secondary/50 p-3 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm text-card-foreground font-mono">
              {publicAddress ? shortenHex(publicAddress, 8) : ""}
            </span>
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="d-amount"
              className="text-sm font-medium text-card-foreground"
            >
              Amount to Deposit
            </Label>
            <Input
              id="d-amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (error) setError("")
              }}
              className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deposits move tokens from your public MetaMask wallet into the
              Unlink privacy pool. After confirmation, the tokens appear in
              your private balance.
            </p>
          </div>

          <Button
            onClick={handleReview}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            size="lg"
          >
            Review Deposit
            <ArrowDownToLine className="ml-2 h-4 w-4" />
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
