"use client"

import { useUnlink, encodeAddress, shortenHex } from "@unlink-xyz/react"
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
import { Copy, Check, Shield, Bell, Globe, Key, Users, Download } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function SettingsView() {
  const {
    activeAccount,
    activeAccountIndex,
    accounts,
    chainId,
    exportMnemonic,
    clearWallet,
    createAccount,
    switchAccount,
    busy,
  } = useUnlink()
  const { publicAddress, isMetaMaskConnected } = useMetaMask()

  const [copied, setCopied] = useState(false)
  const [showingMnemonic, setShowingMnemonic] = useState(false)
  const [mnemonic, setMnemonic] = useState("")

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

  const handleCreateAccount = async () => {
    try {
      await createAccount()
      toast.success("New account created")
    } catch {
      toast.error("Failed to create account")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your wallet, accounts, and privacy preferences
        </p>
      </div>

      {/* Private Wallet Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">
            Private Wallet
          </CardTitle>
          <CardDescription>Your Unlink shielded wallet details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                Unlink Address
              </p>
              <p className="font-mono text-sm text-card-foreground truncate">
                {zkAddress}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAddress}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Chain ID</span>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {chainId || "Monad Testnet"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm text-card-foreground">Active</span>
            </div>
          </div>
          {isMetaMaskConnected && publicAddress && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                MetaMask (Deposits)
              </span>
              <span className="text-sm font-mono text-card-foreground">
                {shortenHex(publicAddress, 6)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accounts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-card-foreground">
              Accounts
            </CardTitle>
          </div>
          <CardDescription>
            Manage multiple private accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts?.map((acct, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                i === activeAccountIndex
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary/50 hover:bg-secondary"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  Account #{i + 1}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {shortenHex((acct as unknown as { address?: string }).address || `0x${"0".repeat(8)}account${i}`, 8)}
                </p>
              </div>
              {i === activeAccountIndex ? (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">
                  Active
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchAccount(i)}
                  disabled={busy}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  Switch
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleCreateAccount}
            disabled={busy}
            className="w-full border-border text-muted-foreground hover:text-foreground"
          >
            Create New Account
          </Button>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-card-foreground">
              Backup & Recovery
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showingMnemonic && mnemonic ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {mnemonic.split(" ").map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right">
                      {i + 1}.
                    </span>
                    <span className="text-xs font-mono text-card-foreground">
                      {word}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowingMnemonic(false)
                  setMnemonic("")
                }}
                className="w-full border-border text-muted-foreground"
              >
                Hide Recovery Phrase
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleExportMnemonic}
              disabled={busy}
              className="w-full border-border text-muted-foreground hover:text-foreground gap-2"
            >
              <Download className="h-4 w-4" />
              Export Recovery Phrase
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-card-foreground">
              Privacy
            </CardTitle>
          </div>
          <CardDescription>
            Control your onchain privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingToggle
            label="Auto-sync balances"
            description="Automatically sync private balances in the background"
            defaultChecked={true}
          />
          <SettingToggle
            label="Hide balance on dashboard"
            description="Mask your balance for screen sharing"
            defaultChecked={false}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-card-foreground">
              Notifications
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingToggle
            label="Transaction confirmations"
            description="Get notified when transactions are confirmed"
            defaultChecked={true}
          />
          <SettingToggle
            label="Incoming deposits"
            description="Alert when tokens are deposited"
            defaultChecked={true}
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-destructive" />
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => clearWallet()}
            className="w-full"
          >
            Clear Wallet & Data
          </Button>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Make sure you have backed up your recovery phrase before clearing.
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
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium text-card-foreground">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}
