"use client"

import Link from "next/link"
import { NeoBankLogo } from "@/components/neobank-logo"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Lock,
  Eye,
  ArrowRight,
  Wallet,
  Zap,
  Layers,
  KeyRound,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative font-body">
      {/* Header - Floating pill style */}
      <header className="sticky top-6 z-50 px-6 lg:px-16 mt-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl px-5 py-3 shadow-lg shadow-black/5">
          <Link href="/" className="flex items-center gap-3 group">
            <NeoBankLogo size="lg" />
            <span className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live on Monad
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#overview"
              className="hidden md:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
            >
              Overview
            </a>
            <a
              href="#features"
              className="hidden md:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
            >
              Features
            </a>
            <a
              href="#technology"
              className="hidden lg:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
            >
              Technology
            </a>
            <ThemeToggle />
            <Link href="/connect">
              <Button
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-200"
              >
                Launch App →
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 py-24 lg:px-16 lg:py-36 relative overflow-hidden">
        {/* Decorative gradient orbs - animated */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/25 blur-[120px] pointer-events-none animate-float-subtle" />
        <div className="absolute bottom-1/4 -left-24 w-72 h-72 rounded-full bg-chart-2/20 blur-[100px] pointer-events-none animate-float-subtle" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-chart-3/10 blur-[150px] pointer-events-none animate-float-subtle" style={{ animationDelay: "2s" }} />

        <div className="max-w-4xl relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Onchain Self-Custodial Banking
          </span>
          <h1 className="font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl lg:leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Your financial life,
            <br />
            <span className="font-display bg-gradient-to-r from-primary via-primary to-chart-2 bg-clip-text text-transparent">
              private by design.
            </span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            NeoBank delivers self-custodial banking on Monad with zero-knowledge
            privacy. Your keys, your assets—balances and transfers remain
            invisible onchain.
          </p>
          <div className="mt-12 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link href="/connect" className="group">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] gap-2 transition-all duration-300 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30"
              >
                Get Started
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#overview">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 text-base font-medium border-border/80 text-foreground hover:bg-secondary/80 hover:border-primary/30 transition-all duration-300"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section
        id="overview"
        className="px-6 py-24 lg:px-16 lg:py-32 border-t border-border/50"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            What is NeoBank?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
            NeoBank is a self-custodial banking application built on Monad and
            powered by Unlink. It enables private transfers between shielded
            addresses using zero-knowledge proofs. Connect MetaMask to deposit,
            create a private Unlink wallet for day-to-day use, and transact
            without exposing balances or transaction graphs onchain.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="group rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 hover:border-primary/30 hover:bg-card/60 transition-all duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Self-Custodial
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You hold your keys. Assets remain in your control. No custodians,
                no intermediaries.
              </p>
            </div>
            <div className="group rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 hover:border-primary/30 hover:bg-card/60 transition-all duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Layers className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Onchain & Private
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                All activity settles on Monad. Balances and transfers are
                ZK-shielded via Unlink.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-6 py-24 lg:px-16 lg:py-32 border-t border-border/50 bg-gradient-to-b from-card/30 to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Core Capabilities
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Built for privacy and control.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="Self-Custodial"
              description="You hold your keys. No third-party custody. Full control over your assets."
            />
            <FeatureCard
              icon={Lock}
              title="Zero-Knowledge"
              description="ZK proofs for every transfer. Balances and transaction graphs remain hidden."
            />
            <FeatureCard
              icon={Eye}
              title="Fully Private"
              description="Unlink addresses shield your identity. Onchain observers see nothing."
            />
            <FeatureCard
              icon={KeyRound}
              title="Recovery Phrase"
              description="Standard mnemonic backup. Import or export your wallet anytime."
            />
            <FeatureCard
              icon={Zap}
              title="Monad Performance"
              description="High-throughput L1. Fast finality, low fees, EVM compatibility."
            />
            <FeatureCard
              icon={Layers}
              title="MetaMask Compatible"
              description="Connect your existing wallet. Deposit and withdraw seamlessly."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 lg:px-16 lg:py-32 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            How It Works
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            <Step
              number={1}
              title="Connect"
              description="Connect MetaMask and create a private Unlink wallet. Your recovery phrase stays local."
            />
            <Step
              number={2}
              title="Deposit"
              description="Fund your Unlink address. Balances are ZK-shielded and invisible onchain."
            />
            <Step
              number={3}
              title="Transact"
              description="Send and receive privately. Withdraw to your MetaMask when needed."
            />
          </div>
        </div>
      </section>

      {/* Technology */}
      <section
        id="technology"
        className="px-6 py-24 lg:px-16 lg:py-32 border-t border-border/50 bg-gradient-to-b from-card/30 to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Technology
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
            NeoBank is built on Monad, a high-performance EVM-compatible Layer 1,
            and Unlink, a privacy protocol that provides zero-knowledge shielded
            addresses and private transfers. ZK proofs are generated client-side;
            the backend stores only metadata for your convenience.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-xl border border-border/60 bg-secondary/30 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-default">
              Monad
            </span>
            <span className="rounded-xl border border-border/60 bg-secondary/30 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-default">
              Unlink Protocol
            </span>
            <span className="rounded-xl border border-border/60 bg-secondary/30 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-default">
              Zero-Knowledge Proofs
            </span>
            <span className="rounded-xl border border-border/60 bg-secondary/30 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-default">
              MetaMask
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-16 lg:py-32 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Ready to bank privately?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Create your private wallet and start transacting on Monad.
          </p>
          <Link href="/connect" className="group inline-block mt-10">
            <Button
              size="lg"
              className="h-14 px-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] gap-2 transition-all duration-300 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 lg:px-16 border-t border-border/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <NeoBankLogo size="sm" />
          <p className="text-sm text-muted-foreground font-medium">
            NeoBank Protocol · Powered by Unlink · Built on Monad · All
            transfers are private onchain
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 lg:p-8 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-5 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3 transition-all duration-300">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="relative group">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/60 bg-primary/5 text-primary font-bold text-lg group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
        {number}
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
