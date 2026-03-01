"use client"

import { useUnlink, shortenHex, formatAmount } from "@unlink-xyz/react"
import { clearOnboarding } from "@/lib/onboarding"
import { truncateAddress } from "@/lib/utils"
import { useMetaMask } from "@/lib/wallet-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Shield, Bell, Globe, Key, Download, RefreshCw, LogOut } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function SettingsView() {
  const {
    activeAccount,
    chainId,
    exportMnemonic,
    busy,
  } = useUnlink()
  const {
    publicAddress,
    isMetaMaskConnected,
    balance,
    isWrongNetwork,
    switchToMonadTestnet,
    disconnectMetaMask,
  } = useMetaMask()

  const [copied, setCopied] = useState(false)
  const [showingMnemonic, setShowingMnemonic] = useState(false)
  const [mnemonic, setMnemonic] = useState("")

  const zkAddress = activeAccount?.address ?? ""

  const copyAddress = () => {
    if (zkAddress) {
      navigator.clipboard.writeText(zkAddress)
      setCopied(true)
      toast.success("Address copied")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportMnemonic = async () => {
    try {
      const phrase = await exportMnemonic()
      setMnemonic(phrase)
      setShowingMnemonic(true)
    } catch {
      toast.error("Failed to export mnemonic")
    }
  }

  return (
    <div className="space-y-8 max-w-2xl min-w-0 overflow-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your wallet, accounts, and privacy preferences
        </p>
      </div>

      {/* Private Wallet */}
      <Card className="bg-card/80 border-border/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Private Wallet
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your Unlink shielded wallet details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-4 min-w-0 border border-border/50">
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Unlink Address
              </p>
              <p className="font-mono text-sm text-foreground truncate" title={zkAddress}>
                {zkAddress ? truncateAddress(zkAddress, 14, 8) : "—"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAddress}
              className="shrink-0 h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 px-4 py-3 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Network</p>
              <p className="text-sm font-medium text-foreground">{chainId ? `Chain ${chainId}` : "Monad Testnet"}</p>
            </div>
            <div className="rounded-lg bg-muted/30 px-4 py-3 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium text-foreground">Connected</span>
              </div>
            </div>
          </div>
          {isMetaMaskConnected && publicAddress && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MetaMask (Deposits)</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <span className="text-sm font-mono text-foreground">{shortenHex(publicAddress, 8)}</span>
                </div>
                {balance !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-sm font-semibold text-foreground">{formatAmount(balance, 18)} MON</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {isWrongNetwork && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchToMonadTestnet()}
                    className="border-border text-foreground gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Switch Network
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectMetaMask()}
                  className="border-border/80 text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accounts hidden - Havala architecture: accounts managed via intermediaries, not user-created */}

      {/* Backup & Recovery */}
      <Card className="bg-card/80 border-border/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">Backup & Recovery</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {showingMnemonic && mnemonic ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {mnemonic.split(" ").map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 border border-border/50"
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <span className="text-xs font-mono text-foreground">{word}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowingMnemonic(false)
                  setMnemonic("")
                }}
                className="w-full border-border"
              >
                Hide Recovery Phrase
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleExportMnemonic}
              disabled={busy}
              className="w-full h-11 border-border gap-2 hover:bg-muted/50"
            >
              <Download className="h-4 w-4" />
              Export Recovery Phrase
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Notifications - Combined */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="bg-card/80 border-border/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Privacy</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Onchain privacy settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <SettingToggle label="Auto-sync balances" description="Sync balances in background" defaultChecked={true} />
            <SettingToggle label="Hide balance" description="Mask for screen sharing" defaultChecked={false} />
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Notifications</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Transaction alerts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <SettingToggle label="Confirmations" description="When tx confirms" defaultChecked={true} />
            <SettingToggle label="Incoming deposits" description="New deposit alerts" defaultChecked={true} />
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-card/80 border-destructive/20 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <Globe className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Irreversible actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              clearOnboarding()
              window.location.href = "/?reset=1"
            }}
            className="w-full h-11"
          >
            Clear Wallet & Start Fresh
          </Button>
          <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
            Back up your recovery phrase first. This cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
      <div className="min-w-0 flex-1">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        className="shrink-0 data-[state=checked]:bg-primary"
      />
    </div>
  )
}
