"use client"

import { useUnlink, encodeAddress, shortenHex } from "@unlink-xyz/react"
import { setWelcomeSeen } from "@/lib/onboarding"
import { NeoBankLogo } from "@/components/neobank-logo"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowDownToLine, Shield, Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface WelcomeOverlayProps {
  onDismiss: () => void
}

export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const { activeAccount } = useUnlink()
  const [copied, setCopied] = useState(false)

  let zkAddress = ""
  try {
    if (activeAccount?.masterPublicKey) {
      zkAddress = encodeAddress(activeAccount.masterPublicKey)
    }
  } catch {
    // masterPublicKey may not be available yet
  }

  const copyAddress = () => {
    if (zkAddress) {
      navigator.clipboard.writeText(zkAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Address copied")
    }
  }

  const handleGetStarted = () => {
    setWelcomeSeen()
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <NeoBankLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to NeoBank
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Your private ZK wallet is ready. All balances and transactions are shielded onchain.
          </p>

          {/* Your address */}
          <div className="mt-6 w-full rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Your private address
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-foreground truncate flex-1 text-left">
                {zkAddress ? shortenHex(zkAddress, 8) : "Loading..."}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAddress}
                disabled={!zkAddress}
                className="shrink-0 h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground text-left">
              Use this for receiving private transfers. Export from Settings if needed.
            </p>
          </div>

          {/* Next steps */}
          <div className="mt-6 w-full text-left space-y-3">
            <p className="text-sm font-medium text-foreground">Next steps</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3">
                <Wallet className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Connect MetaMask</p>
                  <p className="text-xs text-muted-foreground">
                    Link your existing wallet to deposit funds into your private balance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3">
                <ArrowDownToLine className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Deposit</p>
                  <p className="text-xs text-muted-foreground">
                    Go to Deposit in the sidebar to move funds from MetaMask into your private wallet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Back up your phrase</p>
                  <p className="text-xs text-muted-foreground">
                    Export your recovery phrase in Settings and store it safely
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGetStarted}
            className="mt-8 w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}
