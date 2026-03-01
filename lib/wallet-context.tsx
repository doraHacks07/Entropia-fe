"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

const MONAD_TESTNET_CHAIN_ID = 10143
const MONAD_TESTNET_RPC = "https://testnet-rpc.monad.xyz"

function log(_step: string, _data?: object) {
  // Debug logging disabled for production
}

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
  balance: bigint | null
  error: string | null
}

interface MetaMaskContextType extends MetaMaskState {
  connectMetaMask: () => Promise<void>
  disconnectMetaMask: () => void
  switchToMonadTestnet: () => Promise<void>
  clearError: () => void
  getEthereum: () => EthereumProvider | undefined
  isWrongNetwork: boolean
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

function parseChainId(chainIdHex: string | null): number | null {
  if (!chainIdHex) return null
  return parseInt(chainIdHex, 16)
}

function parseHexToBigInt(hex: string): bigint {
  if (hex.startsWith("0x")) return BigInt(hex)
  return BigInt("0x" + hex)
}

export function MetaMaskProvider({
  children,
  targetChainId,
}: {
  children: ReactNode
  targetChainId?: number
}) {
  const effectiveChainId = targetChainId ?? MONAD_TESTNET_CHAIN_ID

  const [state, setState] = useState<MetaMaskState>({
    publicAddress: null,
    isMetaMaskConnected: false,
    isConnecting: false,
    chainId: null,
    balance: null,
    error: null,
  })

  const getEthereum = useCallback((): EthereumProvider | undefined => {
    if (typeof window === "undefined") return undefined
    const win = window as unknown as {
      ethereum?: EthereumProvider & { providers?: EthereumProvider[]; isMetaMask?: boolean }
    }
    const eth = win.ethereum
    if (!eth) return undefined
    // When multiple wallets are installed, ethereum can be a multiplexer; find MetaMask
    if (eth.providers?.length) {
      const metamask = eth.providers.find((p) => (p as { isMetaMask?: boolean }).isMetaMask)
      return (metamask ?? eth) as EthereumProvider
    }
    return eth as EthereumProvider
  }, [])

  const getEthereumWithRetry = useCallback(
    async (maxAttempts = 10): Promise<EthereumProvider | undefined> => {
      for (let i = 0; i < maxAttempts; i++) {
        const eth = getEthereum()
        if (eth) return eth
        await new Promise((r) => setTimeout(r, 200))
      }
      return undefined
    },
    [getEthereum]
  )

  const fetchBalance = useCallback(async () => {
    const ethereum = getEthereum()
    if (!ethereum || !state.publicAddress) return
    try {
      const hexBalance = (await ethereum.request({
        method: "eth_getBalance",
        params: [state.publicAddress, "latest"],
      })) as string
      setState((prev) => ({ ...prev, balance: parseHexToBigInt(hexBalance) }))
    } catch {
      setState((prev) => ({ ...prev, balance: null }))
    }
  }, [getEthereum, state.publicAddress])

  const switchToMonadTestnet = useCallback(async (): Promise<boolean> => {
    const ethereum = getEthereum()
    if (!ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask not found",
      }))
      return false
    }
    setState((prev) => ({ ...prev, error: null }))
    try {
      const chainIdHex = "0x" + effectiveChainId.toString(16)
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      })
      return true
    } catch (err) {
      const e = err as { code?: number }
      if (e?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + effectiveChainId.toString(16),
                chainName: "Monad Testnet",
                nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
                rpcUrls: [MONAD_TESTNET_RPC],
                blockExplorerUrls: [
                  "https://testnet.monadvision.com",
                  "https://testnet.monadscan.com",
                ],
              },
            ],
          })
          return true
        } catch {
          setState((prev) => ({
            ...prev,
            error: "Failed to add Monad Testnet",
          }))
          return false
        }
      } else if (e?.code === 4001) {
        setState((prev) => ({
          ...prev,
          error: "Switch rejected",
        }))
        return false
      } else {
        setState((prev) => ({
          ...prev,
          error: "Failed to switch network",
        }))
        return false
      }
    }
  }, [getEthereum, effectiveChainId])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const connectMetaMask = useCallback(async () => {
    log("1. connectMetaMask called")
    const ethereum = await getEthereumWithRetry()
    log("2. getEthereumWithRetry result", { found: !!ethereum })
    if (!ethereum) {
      log("2a. MetaMask NOT found - showing error")
      setState((prev) => ({
        ...prev,
        error:
          "MetaMask not detected. Please refresh the page after installing MetaMask, or ensure it's enabled for this site.",
      }))
      return
    }
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))
    log("3. Requesting accounts (MetaMask popup should appear)")
    try {
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]
      log("4. Accounts received", { count: accounts.length, first: accounts[0]?.slice(0, 10) + "..." })

      const chainIdHex = (await ethereum.request({
        method: "eth_chainId",
      })) as string
      log("5. Current chainId", { chainIdHex, effectiveChainId })

      const currentChainId = parseChainId(chainIdHex)
      if (currentChainId !== effectiveChainId) {
        log("6. Wrong network - attempting switch")
        const switched = await switchToMonadTestnet()
        log("6a. Switch result", { switched })
        if (!switched) {
          const newChainIdHex = (await ethereum.request({
            method: "eth_chainId",
          })) as string
          log("6b. Switch failed - staying connected but showing wrong network error")
          setState((prev) => ({
            ...prev,
            publicAddress: accounts[0],
            isMetaMaskConnected: true,
            isConnecting: false,
            chainId: newChainIdHex,
            balance: null,
            error: "Wrong network. Please switch to Monad Testnet.",
          }))
          return
        }
      }

      const finalChainId = (await ethereum.request({
        method: "eth_chainId",
      })) as string
      log("7. Final chainId", { finalChainId })

      log("8. Fetching balance")
      const hexBalance = (await ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })) as string

      log("9. POSTing to /api/wallet/connect")
      try {
        await fetch("/api/wallet/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "metamask-connect",
            metamaskAddress: accounts[0],
            chainId: finalChainId,
            balanceHex: hexBalance,
            connectedAt: new Date().toISOString(),
          }),
        })
        log("9a. API call completed")
      } catch (apiErr) {
        log("9b. API call failed (non-fatal)", apiErr)
      }

      log("10. Setting connected state")
      setState((prev) => ({
        ...prev,
        publicAddress: accounts[0],
        isMetaMaskConnected: true,
        isConnecting: false,
        chainId: finalChainId,
        balance: parseHexToBigInt(hexBalance),
        error: null,
      }))
      log("11. CONNECTION COMPLETE", {
        address: accounts[0],
        chainId: finalChainId,
        balance: hexBalance,
      })
    } catch (err) {
      const e = err as { code?: number; message?: string }
      log("ERROR in connectMetaMask", { code: e?.code, message: e?.message, err })
      if (e?.code === 4001) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Connection rejected",
        }))
      } else {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Failed to connect. Please try again.",
        }))
      }
    }
  }, [getEthereumWithRetry, effectiveChainId, switchToMonadTestnet])

  const disconnectMetaMask = useCallback(() => {
    setState({
      publicAddress: null,
      isMetaMaskConnected: false,
      isConnecting: false,
      chainId: null,
      balance: null,
      error: null,
    })
  }, [])

  const currentChainId = parseChainId(state.chainId)
  const isWrongNetwork =
    state.isMetaMaskConnected &&
    currentChainId !== null &&
    currentChainId !== effectiveChainId

  useEffect(() => {
    const ethereum = getEthereum()
    if (!ethereum) return
    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        disconnectMetaMask()
      } else {
        setState((prev) => ({ ...prev, publicAddress: accs[0], balance: null }))
      }
    }
    const handleChainChanged = (chainId: unknown) => {
      setState((prev) => ({
        ...prev,
        chainId: chainId as string,
        balance: null,
      }))
    }
    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [getEthereum, disconnectMetaMask])

  useEffect(() => {
    if (state.isMetaMaskConnected && state.publicAddress) {
      fetchBalance()
    }
  }, [state.isMetaMaskConnected, state.publicAddress, state.chainId, fetchBalance])

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
      value={{
        ...state,
        connectMetaMask,
        disconnectMetaMask,
        switchToMonadTestnet,
        clearError,
        getEthereum,
        isWrongNetwork,
      }}
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
