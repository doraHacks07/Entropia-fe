"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

/**
 * Thin wrapper for MetaMask public address.
 * Used only for deposits (funding the Unlink private wallet from a public EOA).
 * All private balance/send/withdraw operations use the Unlink SDK directly.
 */
interface MetaMaskState {
  publicAddress: string | null
  isMetaMaskConnected: boolean
  isConnecting: boolean
  chainId: string | null
}

interface MetaMaskContextType extends MetaMaskState {
  connectMetaMask: () => Promise<void>
  disconnectMetaMask: () => void
  getEthereum: () => EthereumProvider | undefined
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined)

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MetaMaskState>({
    publicAddress: null,
    isMetaMaskConnected: false,
    isConnecting: false,
    chainId: null,
  })

  const getEthereum = useCallback((): EthereumProvider | undefined => {
    if (typeof window !== "undefined") {
      return (
        window as unknown as {
          ethereum?: EthereumProvider
        }
      ).ethereum
    }
    return undefined
  }, [])

  const connectMetaMask = useCallback(async () => {
    const ethereum = getEthereum()
    if (!ethereum) {
      window.open("https://metamask.io/download/", "_blank")
      return
    }
    setState((prev) => ({ ...prev, isConnecting: true }))
    try {
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]
      const chainId = (await ethereum.request({
        method: "eth_chainId",
      })) as string

      // POST wallet info to backend
      try {
        await fetch("/api/wallet/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: accounts[0],
            chainId,
            connectedAt: new Date().toISOString(),
          }),
        })
      } catch {
        // best-effort
      }

      setState({
        publicAddress: accounts[0],
        isMetaMaskConnected: true,
        isConnecting: false,
        chainId,
      })
    } catch {
      setState((prev) => ({ ...prev, isConnecting: false }))
    }
  }, [getEthereum])

  const disconnectMetaMask = useCallback(() => {
    setState({
      publicAddress: null,
      isMetaMaskConnected: false,
      isConnecting: false,
      chainId: null,
    })
  }, [])

  useEffect(() => {
    const ethereum = getEthereum()
    if (!ethereum) return
    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        disconnectMetaMask()
      } else {
        setState((prev) => ({ ...prev, publicAddress: accs[0] }))
      }
    }
    const handleChainChanged = (chainId: unknown) => {
      setState((prev) => ({ ...prev, chainId: chainId as string }))
    }
    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [getEthereum, disconnectMetaMask])

  // Auto-reconnect
  useEffect(() => {
    const ethereum = getEthereum()
    if (!ethereum) return
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const accs = accounts as string[]
        if (accs.length > 0) connectMetaMask()
      })
      .catch(() => {})
  }, [getEthereum, connectMetaMask])

  return (
    <MetaMaskContext.Provider
      value={{ ...state, connectMetaMask, disconnectMetaMask, getEthereum }}
    >
      {children}
    </MetaMaskContext.Provider>
  )
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext)
  if (context === undefined) {
    throw new Error("useMetaMask must be used within a MetaMaskProvider")
  }
  return context
}
