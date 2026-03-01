"use client"

import { useState } from "react"
import { useUnlink } from "@unlink-xyz/react"
import { NeoBankLogo } from "@/components/neobank-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  Lock,
  Eye,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  KeyRound,
  Plus,
  Download,
} from "lucide-react"
import { toast } from "sonner"

type OnboardStep = "landing" | "creating" | "mnemonic" | "importing" | "creating-account"

export function ConnectWallet() {
  const { ready, walletExists, activeAccount, createWallet, importWallet, createAccount, busy, status } =
    useUnlink()

  const [step, setStep] = useState<OnboardStep>("landing")
  const [mnemonic, setMnemonic] = useState("")
  const [importMnemonic, setImportMnemonic] = useState("")
  const [importError, setImportError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCreateWallet = async () => {
    setStep("creating")
    try {
      const result = await createWallet()
      setMnemonic(result.mnemonic)
      setStep("mnemonic")
      // POST to backend
      try {
        await fetch("/api/wallet/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "unlink-wallet-created",
            createdAt: new Date().toISOString(),
          }),
        })
      } catch {
        // best-effort
      }
    } catch {
      toast.error("Failed to create wallet. Please try again.")
      setStep("landing")
    }
  }

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      setImportError("Please enter your recovery phrase")
      return
    }
    const words = importMnemonic.trim().split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      setImportError("Recovery phrase must be 12 or 24 words")
      return
    }
    setImportError("")
    setStep("creating")
    try {
      await importWallet(importMnemonic.trim())
      toast.success("Wallet imported successfully")
    } catch {
      toast.error("Invalid recovery phrase")
      setStep("importing")
    }
  }

  const handleCreateAccount = async () => {
    setStep("creating-account")
    try {
      await createAccount()
    } catch {
      toast.error("Failed to create account")
      setStep("landing")
    }
  }

  const copyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <NeoBankLogo size="lg" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Initializing privacy engine...</span>
          </div>
        </div>
      </div>
    )
  }

  // Wallet exists but no active account
  if (walletExists && !activeAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="flex flex-col items-center py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-5">
              <Plus className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">Create Your Account</h2>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
              Your wallet is ready. Create a private account to start transacting.
            </p>
            {busy && (
              <p className="mt-3 text-xs text-muted-foreground">{status || "Working..."}</p>
            )}
            <Button
              onClick={handleCreateAccount}
              disabled={busy}
              className="mt-6 w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show mnemonic backup screen
  if (step === "mnemonic" && mnemonic) {
    const words = mnemonic.split(" ")
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Back Up Your Recovery Phrase</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Write these words down and store them somewhere safe. This is the only way to recover your wallet.
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-2">
                {words.map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5"
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <span className="text-sm font-mono text-card-foreground">{word}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={copyMnemonic}
                className="mt-4 w-full border-border text-foreground hover:bg-secondary gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </Button>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Never share your recovery phrase. Anyone with these words can access your funds. NeoBank will never ask for your phrase.
                </p>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={busy}
                className="mt-5 w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    {"I've Saved My Phrase"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Creating state
  if (step === "creating" || step === "creating-account") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {status || (step === "creating" ? "Creating your private wallet..." : "Creating account...")}
          </p>
        </div>
      </div>
    )
  }

  // Import wallet screen
  if (step === "importing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Download className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Import Wallet</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Enter your 12 or 24-word recovery phrase to restore your Unlink wallet.
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mnemonic" className="text-sm font-medium text-card-foreground">
                  Recovery Phrase
                </Label>
                <textarea
                  id="mnemonic"
                  rows={4}
                  placeholder="Enter your 12 or 24 word recovery phrase..."
                  value={importMnemonic}
                  onChange={(e) => {
                    setImportMnemonic(e.target.value)
                    if (importError) setImportError("")
                  }}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {importError && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {importError}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your recovery phrase is processed locally and never sent to any server.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("landing")}
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  Back
                </Button>
                <Button
                  onClick={handleImportWallet}
                  disabled={busy}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import Wallet"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Landing: no wallet yet
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <NeoBankLogo />
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Powered by Unlink Protocol
          </span>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg">
          {/* Hero text */}
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
              Your financial life,
              <br />
              <span className="text-primary">private.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
              Self-custodial onchain banking with zero-knowledge privacy. Your keys, your assets, invisible to everyone else.
            </p>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Get Started
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a new private wallet or import an existing one
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCreateWallet}
                disabled={busy}
                className="w-full h-14 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 gap-3"
                size="lg"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create New Wallet
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep("importing")}
                disabled={busy}
                className="w-full h-14 text-base font-medium border-border text-foreground hover:bg-secondary gap-3"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Import Existing Wallet
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="Self-Custodial"
              description="You hold your keys. Always."
            />
            <FeatureCard
              icon={Lock}
              title="Zero-Knowledge"
              description="ZK proofs for every transfer."
            />
            <FeatureCard
              icon={Eye}
              title="Fully Private"
              description="Balances hidden onchain."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground border-t border-border">
        NeoBank Protocol v1.0 &middot; Powered by Unlink &middot; All transfers are private onchain
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-sm font-medium text-card-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
