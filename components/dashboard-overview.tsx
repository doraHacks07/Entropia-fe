"use client"

import { useUnlink, useUnlinkBalances, useUnlinkHistory, formatAmount, shortenHex } from "@unlink-xyz/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Wallet,
  Shield,
  Activity,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useRef, useState } from "react"

export function DashboardOverview() {
  const { accounts, activeAccountIndex, balances: directBalances, refresh, busy, status } = useUnlink()
  const [hideBalances, setHideBalances] = useState(false)
  const didInitialSync = useRef(false)

  // Use dedicated hooks -- these always call unconditionally (rules of hooks)
  const balHook = useUnlinkBalances()
  const histHook = useUnlinkHistory()

  // Merge defensively: hook can be present but temporarily empty/stale.
  const balances: Record<string, bigint> = useMemo(() => {
    const fromHook = balHook?.balances ?? {}
    const fromDirect = directBalances ?? {}
    return Object.keys(fromHook).length > 0 ? fromHook : fromDirect
  }, [balHook?.balances, directBalances])
  const balLoading = balHook?.loading ?? false
  const balReady = balHook?.ready ?? true
  const history = histHook?.history || []
  const histLoading = histHook?.loading ?? false
  const refreshHistory = histHook?.refresh || (() => {})

  useEffect(() => {
    if (didInitialSync.current) return
    didInitialSync.current = true
    refresh()
    refreshHistory()
  }, [refresh, refreshHistory])

  // Format balance entries
  const balanceEntries = Object.entries(balances || {}).map(([token, amount]) => ({
    token,
    shortToken: shortenHex(token, 4),
    raw: amount,
    formatted: formatAmount(amount, 18),
  }))

  const totalTokens = balanceEntries.length

  // Last 5 history entries
  const recentHistory = (history || []).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Account #{(activeAccountIndex ?? 0) + 1} &middot; {accounts?.length || 1} account{(accounts?.length || 1) > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHideBalances(!hideBalances)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label={hideBalances ? "Show balances" : "Hide balances"}
          >
            {hideBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refresh(); refreshHistory() }}
            disabled={busy}
            className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      {busy && status && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Token Types"
          value={balReady ? String(totalTokens) : "--"}
          subtitle="In private wallet"
          icon={Wallet}
        />
        <StatCard
          title="Transactions"
          value={String(history?.length || 0)}
          subtitle="Total history"
          icon={TrendingUp}
        />
        <StatCard
          title="Privacy"
          value="ZK-Shielded"
          subtitle="All balances hidden"
          icon={Shield}
        />
        <StatCard
          title="Accounts"
          value={String(accounts?.length || 1)}
          subtitle={`Active: #${(activeAccountIndex ?? 0) + 1}`}
          icon={Activity}
        />
      </div>

      {/* Tokens + History */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Token Holdings */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Private Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {balLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!balLoading && balanceEntries.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tokens yet. Deposit to get started.
              </div>
            )}
            {balanceEntries.map((entry) => (
              <div
                key={entry.token}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    TK
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {entry.shortToken}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {shortenHex(entry.token, 6)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-card-foreground font-mono">
                  {hideBalances ? "****" : entry.formatted}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {histLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!histLoading && recentHistory.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No activity yet. Make your first transaction.
              </div>
            )}
            {recentHistory.map((entry) => {
              const isSend = entry.kind === "send"
              const isWithdraw = entry.kind === "withdraw"
              const isOutgoing = isSend || isWithdraw
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        isOutgoing ? "bg-destructive/10" : "bg-primary/10"
                      }`}
                    >
                      {isOutgoing ? (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground capitalize">
                        {entry.kind}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.amounts.map(({ token, delta }, i) => (
                      <p
                        key={i}
                        className={`text-sm font-medium font-mono ${
                          delta < 0n ? "text-destructive" : "text-primary"
                        }`}
                      >
                        {hideBalances ? "****" : (
                          <>
                            {delta < 0n ? "" : "+"}
                            {formatAmount(delta < 0n ? -delta : delta, 18)}
                          </>
                        )}
                      </p>
                    ))}
                    <Badge
                      className={`text-[10px] h-5 mt-1 ${
                        entry.status === "succeeded"
                          ? "bg-primary/10 text-primary hover:bg-primary/10"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-2xl font-bold text-card-foreground">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
