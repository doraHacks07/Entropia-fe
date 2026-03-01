"use client"

import { ThemeProvider } from "next-themes"
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <UnlinkProvider chain="monad-testnet" autoSync={false}>
        <UnlinkAwareMetaMaskProvider>{children}</UnlinkAwareMetaMaskProvider>
      </UnlinkProvider>
    </ThemeProvider>
  )
}
