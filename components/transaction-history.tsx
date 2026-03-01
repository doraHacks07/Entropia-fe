"use client"

import { useMemo, useState } from "react"
import { useUnlinkHistory, formatAmount, shortenHex } from "@unlink-xyz/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  RefreshCw,
  Loader2,
  ShieldAlert,
} from "lucide-react"
import { readBackendTxRecords } from "@/lib/backend-tx-store"

type FilterType = "all" | "send" | "deposit" | "withdraw"

export function TransactionHistory() {
  const { history, loading, error, refresh } = useUnlinkHistory()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const backendRecords = useMemo(() => readBackendTxRecords(), [])

  const filtered = (history || []).filter((entry) => {
    const matchesSearch =
      search === "" ||
      entry.kind.toLowerCase().includes(search.toLowerCase()) ||
      entry.id.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === "all" || entry.kind === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Transaction History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your private onchain activity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "send", "deposit", "withdraw"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }
            >
              <span className="capitalize">{f}</span>
            </Button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {/* Transactions */}
      {backendRecords.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Backend Orchestrated Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {backendRecords.map((record) => (
              <div
                key={record.internalTxId}
                className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {record.mode === "fast" ? "Fast" : "Delayed"} payment
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {shortenHex(record.internalTxId, 6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-card-foreground">{record.amountAtomic}</p>
                  <Badge className="text-[10px] h-5 mt-1" variant="outline">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No transactions found
            </div>
          )}

          {!loading &&
            filtered.map((entry) => {
              const isSend = entry.kind === "send"
              const isWithdraw = entry.kind === "withdraw"
              const isOutgoing = isSend || isWithdraw

              const statusColors: Record<string, string> = {
                succeeded: "bg-primary/10 text-primary hover:bg-primary/10",
                pending: "bg-secondary text-muted-foreground",
                failed: "bg-destructive/10 text-destructive hover:bg-destructive/10",
              }

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isOutgoing ? "bg-destructive/10" : "bg-primary/10"
                      }`}
                    >
                      {isWithdraw ? (
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                      ) : isOutgoing ? (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-card-foreground capitalize">
                          {entry.kind}
                        </p>
                        {isWithdraw && (
                          <Badge
                            variant="outline"
                            className="h-5 text-[10px] border-primary/30 text-primary"
                          >
                            Public
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {shortenHex(entry.id, 6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.amounts.map(({ token, delta }, i) => (
                      <p
                        key={i}
                        className={`text-sm font-medium font-mono ${
                          delta < 0n
                            ? "text-destructive"
                            : "text-primary"
                        }`}
                      >
                        {delta < 0n ? "-" : "+"}
                        {formatAmount(delta < 0n ? -delta : delta, 18)}{" "}
                        <span className="text-xs text-muted-foreground">
                          {shortenHex(token, 3)}
                        </span>
                      </p>
                    ))}
                    <Badge
                      className={`text-[10px] h-5 mt-1 ${
                        statusColors[entry.status] || statusColors.pending
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
  )
}
