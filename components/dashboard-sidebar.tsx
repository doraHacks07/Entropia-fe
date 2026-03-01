"use client"

import { useState } from "react"
import { useUnlink } from "@unlink-xyz/react"
import { clearOnboarding } from "@/lib/onboarding"
import { NeoBankLogo } from "@/components/neobank-logo"
import { WalletStatusBadge } from "@/components/wallet-status-badge"
import { useMetaMask } from "@/lib/wallet-context"
import { cn, truncateAddress } from "@/lib/utils"
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
import { ThemeToggle } from "@/components/theme-toggle"

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
  { id: "transfer", label: "Transfer", icon: ArrowUpDown },
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

  const zkAddress = activeAccount?.address ?? ""
  const shortAddress = zkAddress ? truncateAddress(zkAddress, 12, 6) : "Loading..."

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
          "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 overflow-hidden",
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
          <div className="mx-4 mb-4 space-y-3 min-w-0 overflow-hidden">
            <div className="rounded-lg border border-border bg-secondary/50 p-3 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  Private Wallet
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 min-w-0">
                <span className="flex-1 min-w-0 truncate text-sm font-mono text-foreground">
                  {shortAddress}
                </span>
                <button
                  onClick={copyAddress}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
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

        {/* Theme & Disconnect */}
        <div className="border-t border-border p-2 space-y-1">
          <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "justify-between px-2")}>
            {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
            <ThemeToggle />
          </div>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    clearOnboarding()
                    window.location.href = "/connect?reset=1"
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
                window.location.href = "/connect?reset=1"
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
