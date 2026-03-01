"use client"

import { UnlinkProvider, useUnlink } from "@unlink-xyz/react"
import { MetaMaskProvider } from "@/lib/wallet-context"

function UnlinkAwareMetaMaskProvider({ children }: { children: React.ReactNode }) {
  const { chainId } = useUnlink()
  return (
    <MetaMaskProvider targetChainId={chainId ?? undefined}>
      {children}
    </MetaMaskProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UnlinkProvider chain="monad-testnet" autoSync={false}>
      <UnlinkAwareMetaMaskProvider>{children}</UnlinkAwareMetaMaskProvider>
    </UnlinkProvider>
  )
}
