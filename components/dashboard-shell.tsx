"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DepositForm } from "@/components/deposit-form"
import { TransferForm } from "@/components/transfer-form"
import { BackendPaymentForm } from "@/components/backend-payment-form"
import { SensitiveTransferForm } from "@/components/sensitive-transfer-form"
import { TransactionHistory } from "@/components/transaction-history"
import { SettingsView } from "@/components/settings-view"
// import { ArchitectureFlow } from "@/components/architecture-flow"
import { TransferSimulation } from "@/components/transfer-simulation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBackendPaymentFlow } from "@/lib/backend-payments"

type View = "dashboard" | "transfer" | "sensitive" | "deposit" | "history" | "architecture" | "simulation" | "settings"

export function DashboardShell() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const backendPaymentFlow = useBackendPaymentFlow()

  return (
    <div className="flex h-screen bg-transparent relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <main className="p-6 lg:p-8">
            {currentView === "dashboard" && <DashboardOverview />}
            {currentView === "deposit" && <DepositForm />}
            {currentView === "transfer" && (backendPaymentFlow ? <BackendPaymentForm /> : <TransferForm />)}
            {currentView === "sensitive" && <SensitiveTransferForm />}
            {currentView === "history" && <TransactionHistory />}
            {/* Architecture - commented out for production
            {currentView === "architecture" && <ArchitectureFlow />}
            */}
            {currentView === "simulation" && <TransferSimulation />}
            {currentView === "settings" && <SettingsView />}
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
