"use client"

const ONBOARDING_KEY = "neobank-onboarding-complete"
const WELCOME_SEEN_KEY = "neobank-welcome-seen"

export function setOnboardingComplete() {
  if (typeof window !== "undefined") {
    localStorage.setItem(ONBOARDING_KEY, "true")
    localStorage.removeItem(WELCOME_SEEN_KEY) // Show welcome on first dashboard visit
  }
}

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(ONBOARDING_KEY) === "true"
}

export function setWelcomeSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(WELCOME_SEEN_KEY, "true")
  }
}

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(WELCOME_SEEN_KEY) === "true"
}

export function clearOnboarding() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ONBOARDING_KEY)
    localStorage.removeItem(WELCOME_SEEN_KEY)
  }
}

