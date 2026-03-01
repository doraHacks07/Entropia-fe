"use client"

import { useState } from "react"
import { useUnlink } from "@unlink-xyz/react"
import { NeoBankLogo } from "@/components/neobank-logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  LayoutDashboard,
  ArrowUpDown,
  ShieldAlert,
  ArrowDownToLine,
  Clock,
  Play,
  Settings,
  LogOut,
  Copy,
  Check,
} from "lucide-react"
import { cn, truncateAddress } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

type View = "dashboard" | "transfer" | "sensitive" | "deposit" | "history" | "architecture" | "simulation" | "settings"

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
  // { id: "architecture", label: "Architecture", icon: GitBranch }, // commented out for production
  { id: "simulation", label: "How it works", icon: Play },
  { id: "settings", label: "Settings", icon: Settings },
]

interface MobileHeaderProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function MobileHeader({ currentView, onViewChange }: MobileHeaderProps) {
  const { activeAccount } = useUnlink()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const zkAddress = activeAccount?.address ?? ""
  const truncated = zkAddress ? truncateAddress(zkAddress, 14, 8) : "Loading..."

  const copyAddress = () => {
    if (zkAddress) {
      navigator.clipboard.writeText(zkAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
      <NeoBankLogo size="sm" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 bg-sidebar border-border p-0"
        >
          <div className="flex flex-col h-full">
            <div className="px-4 py-5 border-b border-border">
              <NeoBankLogo size="sm" />
              <button
                onClick={copyAddress}
                className="mt-3 flex items-center gap-1.5 text-sm font-mono text-foreground hover:text-primary transition-colors"
              >
                {truncated}
                {copied ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navItems.map((item) => {
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
            <div className="border-t border-border p-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                  window.location.href = "/connect?reset=1"
                }}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </header>
  )
}
