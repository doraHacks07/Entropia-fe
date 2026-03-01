"use client"

import { useState } from "react"
import { useUnlink, encodeAddress, shortenHex } from "@unlink-xyz/react"
import { clearOnboarding } from "@/lib/onboarding"
import { NeoBankLogo } from "@/components/neobank-logo"
import { WalletStatusBadge } from "@/components/wallet-status-badge"
import { useMetaMask } from "@/lib/wallet-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowUpDown,
  ShieldAlert,
  Clock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ArrowDownToLine,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type View = "dashboard" | "transfer" | "sensitive" | "deposit" | "history" | "architecture" | "settings"

interface DashboardSidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

const navItems: {
  id: View
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { id: "transfer", label: "Send", icon: ArrowUpDown },
  { id: "sensitive", label: "Withdraw", icon: ShieldAlert },
  { id: "history", label: "History", icon: Clock },
  { id: "architecture", label: "Architecture", icon: GitBranch },
  { id: "settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({
  currentView,
  onViewChange,
}: DashboardSidebarProps) {
  const { activeAccount } = useUnlink()
  const { isMetaMaskConnected } = useMetaMask()
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

  let zkAddress = ""
  try {
    if (activeAccount?.masterPublicKey) {
      zkAddress = encodeAddress(activeAccount.masterPublicKey)
    }
  } catch {
    // masterPublicKey may not be available yet
  }
  const shortAddress = zkAddress ? shortenHex(zkAddress, 6) : "Loading..."

  const copyAddress = () => {
    if (zkAddress) {
      navigator.clipboard.writeText(zkAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5">
          {!collapsed && <NeoBankLogo size="sm" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Wallet Info */}
        {!collapsed && (
          <div className="mx-4 mb-4 space-y-3">
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">
                  Private Wallet
                </span>
              </div>
              <button
                onClick={copyAddress}
                className="mt-1.5 flex items-center gap-1.5 text-sm font-mono text-foreground hover:text-primary transition-colors"
              >
                {shortAddress}
                {copied ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
            {isMetaMaskConnected && <WalletStatusBadge />}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id
            const btn = (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "text-primary"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return btn
          })}
        </nav>

        {/* Disconnect */}
        <div className="border-t border-border p-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    clearOnboarding()
                    window.location.href = "/?reset=1"
                  }}
                  className="w-full text-muted-foreground hover:text-destructive"
                  aria-label="Clear wallet"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Clear Wallet & Start Fresh</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                clearOnboarding()
                window.location.href = "/?reset=1"
              }}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Clear Wallet & Start Fresh
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
