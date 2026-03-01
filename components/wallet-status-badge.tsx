"use client"

import { formatAmount, shortenHex } from "@unlink-xyz/react"
import { useMetaMask } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, Copy, Check, RefreshCw, LogOut } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function WalletStatusBadge() {
  const {
    publicAddress,
    isMetaMaskConnected,
    balance,
    isWrongNetwork,
    switchToMonadTestnet,
    disconnectMetaMask,
  } = useMetaMask()
  const [copied, setCopied] = useState(false)

  if (!isMetaMaskConnected || !publicAddress) return null

  const copyAddress = () => {
    navigator.clipboard.writeText(publicAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Address copied")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-border text-foreground hover:bg-secondary font-normal h-9"
        >
          <Wallet className="h-4 w-4 shrink-0" />
          <span className="font-mono text-xs truncate">
            {shortenHex(publicAddress, 6)}
          </span>
          {balance !== null && (
            <span className="text-muted-foreground text-xs ml-auto">
              {formatAmount(balance, 18)} MON
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground">Connected with MetaMask</p>
          <button
            onClick={copyAddress}
            className="mt-1 flex items-center gap-2 font-mono text-sm text-foreground hover:text-primary transition-colors"
          >
            {publicAddress}
            {copied ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
          {balance !== null && (
            <p className="mt-2 text-sm text-foreground">
              Balance: {formatAmount(balance, 18)} MON
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        {isWrongNetwork && (
          <>
            <DropdownMenuItem onClick={() => switchToMonadTestnet()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Switch to Monad Testnet
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={() => disconnectMetaMask()}
          variant="destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
