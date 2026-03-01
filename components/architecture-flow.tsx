"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  ArrowDown,
  Shield,
  Lock,
  Layers,
  Wallet,
  Send,
  Eye,
  EyeOff,
  User,
} from "lucide-react"

/**
 * Frontend Architecture Flow Diagram
 * 
 * Visualizes the NeoBank flow:
 * 
 * Onboarding -> Create/Import Wallet -> Create Account
 *     |
 *     v
 * Dashboard (Bank Sheet)
 *   - Bank Amount: **** (hidden)  
 *   - Account Details
 *   - Private Balances (ZK-shielded)
 *     |
 *     v
 * Transfer Flow:
 *   Pay [amount] -> HOPS (1,2,3) -> Increasing Privacy Layer
 *   Each Hop -> Same Amount routed through privacy pool
 *     |
 *     v
 * Send -> POST /api/transfer
 *   - Highlight & Lock once payment done
 *   - Lock icon visible on confirmed transactions
 */

export function ArchitectureFlow() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Architecture Flow
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How NeoBank processes private transactions end-to-end
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="space-y-4">
        {/* Step 1: Onboarding */}
        <FlowStep
          number={1}
          title="Onboarding"
          icon={User}
          description="User creates or imports an Unlink wallet. A BIP-39 mnemonic is generated locally, never sent to any server."
          details={[
            "createWallet() generates mnemonic",
            "importWallet(phrase) restores existing",
            "createAccount() initializes first private account",
          ]}
        />

        <FlowArrow />

        {/* Step 2: Dashboard / Bank Sheet */}
        <FlowStep
          number={2}
          title="Bank Sheet"
          icon={EyeOff}
          description="Dashboard shows private balances fetched via ZK sync. Amounts can be masked (****) for screen sharing."
          details={[
            "useUnlinkBalances() - real-time ZK balances",
            "Bank Amount: **** (toggle hide/show)",
            "Account details + multi-account support",
            "useUnlinkHistory() - private tx history",
          ]}
          accent
        />

        <FlowArrow />

        {/* Step 3: Transfer with Hops */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Transfer (Privacy Hops)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Each hop routes the same amount through the privacy pool
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hops Visualization */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                {/* Pay Input */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-primary">PAY</span>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                {/* Hop 1 */}
                <HopNode number={1} active />

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                {/* Hop 2 */}
                <HopNode number={2} active />

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                {/* Hop 3 */}
                <HopNode number={3} active />

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                {/* Send Output */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                    <Send className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-primary">SEND</span>
                </div>
              </div>

              {/* Privacy scale */}
              <div className="mt-4 relative">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary rounded-full" />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">Low Privacy</span>
                  <span className="text-[10px] text-primary font-medium">Increasing Privacy Layer</span>
                  <span className="text-[10px] text-muted-foreground">Max Privacy</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs font-medium text-card-foreground">Each Hop</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Routes the same amount through the ZK privacy pool
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs font-medium text-card-foreground">POST /api/transfer</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Backend records the relay ID for tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <FlowArrow />

        {/* Step 4: Lock & Confirm */}
        <FlowStep
          number={4}
          title="Lock & Confirm"
          icon={Lock}
          description="Once payment is done, the transfer is highlighted and locked. The lock icon confirms the ZK proof was verified onchain."
          details={[
            "Highlight & lock once payment done",
            "useTxStatus(relayId) tracks confirmation",
            "Lock icon replaces checkmark on success",
            "POST /api/transfer/sensitive for withdrawals",
          ]}
          locked
        />
      </div>

      {/* Data Flow Summary */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">
            Data Flow Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryItem
              title="Client-Side (Unlink SDK)"
              items={[
                "Wallet create/import",
                "Balance sync via ZK",
                "Proof generation",
                "Transaction relay",
              ]}
            />
            <SummaryItem
              title="Backend API (POST)"
              items={[
                "/api/wallet/connect",
                "/api/transfer",
                "/api/transfer/sensitive",
                "Record-keeping only",
              ]}
            />
            <SummaryItem
              title="Onchain (Private)"
              items={[
                "Deposits shield tokens",
                "Sends are ZK-private",
                "Withdrawals unshield",
                "Balances never visible",
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FlowStep({
  number,
  title,
  icon: Icon,
  description,
  details,
  accent,
  locked,
}: {
  number: number
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  details: string[]
  accent?: boolean
  locked?: boolean
}) {
  return (
    <Card className={`bg-card border-border ${locked ? "ring-1 ring-primary/30" : ""}`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 text-sm font-bold ${
            locked ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground"
          }`}>
            {number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
              {locked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Secured
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {details.map((d) => (
                <span
                  key={d}
                  className="inline-block text-[10px] px-2 py-1 rounded-md bg-secondary text-muted-foreground font-mono"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-1">
      <ArrowDown className="h-5 w-5 text-primary/50" />
    </div>
  )
}

function HopNode({ number, active }: { number: number; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
        active
          ? "border-primary/40 bg-primary/10"
          : "border-border bg-secondary"
      }`}>
        <Layers className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <span className="text-[10px] text-muted-foreground">Hop {number}</span>
    </div>
  )
}

function SummaryItem({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <p className="text-xs font-medium text-card-foreground mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <span className="text-primary mt-0.5">{">"}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
