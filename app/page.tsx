"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUnlink } from "@unlink-xyz/react"
import { ConnectWallet } from "@/components/connect-wallet"
import { isOnboardingComplete, clearOnboarding } from "@/lib/onboarding"

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ready, walletExists, activeAccount, clearWallet } = useUnlink()
  const [mounted, setMounted] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClearAll = async () => {
    setClearing(true)
    clearOnboarding()
    await clearWallet()
    setClearing(false)
    window.location.href = "/"
  }

  useEffect(() => {
    if (!mounted) return
    if (searchParams.get("reset") === "1" || searchParams.get("fresh") === "1") {
      clearOnboarding()
      clearWallet().then(() => {
        window.location.href = "/"
      })
      return
    }
    if (ready && walletExists && activeAccount && isOnboardingComplete()) {
      router.replace("/dashboard")
    }
  }, [mounted, ready, walletExists, activeAccount, searchParams, router])

  if (mounted && (searchParams.get("reset") === "1" || searchParams.get("fresh") === "1")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="text-sm text-muted-foreground">Clearing data...</p>
      </div>
    )
  }

  if (mounted && ready && walletExists && activeAccount && isOnboardingComplete()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        <a href="/?reset=1" className="text-xs text-muted-foreground hover:text-foreground underline">
          Not you? Start fresh
        </a>
      </div>
    )
  }

  if (mounted && ready && walletExists && activeAccount && !isOnboardingComplete()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-6 px-6">
        <p className="text-sm text-muted-foreground text-center max-w-md">
          We detected an existing wallet that wasn&apos;t set up through this app. Clear it to start fresh.
        </p>
        <button
          onClick={handleClearAll}
          disabled={clearing}
          className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium disabled:opacity-50"
        >
          {clearing ? "Clearing..." : "Clear wallet and start fresh"}
        </button>
        <a href="/?reset=1" className="text-xs text-muted-foreground hover:text-foreground underline">
          Force sign out
        </a>
      </div>
    )
  }

  return <ConnectWallet />
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <LandingContent />
    </Suspense>
  )
}
