"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUnlink } from "@unlink-xyz/react"
import { DashboardShell } from "@/components/dashboard-shell"
import { WelcomeOverlay } from "@/components/welcome-overlay"
import { isOnboardingComplete, hasSeenWelcome, clearOnboarding } from "@/lib/onboarding"

export default function DashboardPage() {
  const router = useRouter()
  const { ready, walletExists, activeAccount } = useUnlink()
  const [mounted, setMounted] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const onboardingComplete = isOnboardingComplete()
    if (ready && (!walletExists || !activeAccount || !onboardingComplete)) {
      clearOnboarding()
      router.replace("/")
    } else if (ready && walletExists && activeAccount && onboardingComplete && !hasSeenWelcome()) {
      setShowWelcome(true)
    }
  }, [mounted, ready, walletExists, activeAccount, router])

  if (!mounted || !ready || !walletExists || !activeAccount || !isOnboardingComplete()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  return (
    <>
      <DashboardShell />
      {showWelcome && (
        <WelcomeOverlay onDismiss={() => setShowWelcome(false)} />
      )}
    </>
  )
}
