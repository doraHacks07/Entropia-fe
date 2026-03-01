"use client"

import { UnlinkProvider, useUnlink } from "@unlink-xyz/react"
import { MetaMaskProvider } from "@/lib/wallet-context"
import { ConnectWallet } from "@/components/connect-wallet"
import { DashboardShell } from "@/components/dashboard-shell"

function AppContent() {
  const { ready, walletExists, activeAccount } = useUnlink()

  // Not ready or no wallet/account => onboarding
  if (!ready || !walletExists || !activeAccount) {
    return <ConnectWallet />
  }

  return <DashboardShell />
}

export default function Page() {
  return (
    <UnlinkProvider chain="monad-testnet" autoSync>
      <MetaMaskProvider>
        <AppContent />
      </MetaMaskProvider>
    </UnlinkProvider>
  )
}
