"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  RotateCcw,
  Pause,
  Layers,
  Lock,
  Wallet,
  Send,
  ShieldAlert,
  Coins,
  DollarSign,
} from "lucide-react"

type FlowMode = "standard" | "sensitive"

const STANDARD_BLOCKS = [
  { id: "pay", label: "Pay", sublabel: "Sender", icon: Wallet },
  { id: "hop1", label: "Hop 1", sublabel: "Privacy Pool", icon: Layers },
  { id: "hop2", label: "Hop 2", sublabel: "Privacy Pool", icon: Layers },
  { id: "hop3", label: "Hop 3", sublabel: "Privacy Pool", icon: Layers },
  { id: "transfer", label: "Transfer", sublabel: "unlink1...", icon: Send },
]

const CHUNK_COUNT = 5
const TRANSFER_AMOUNT = "2.0 MON"

function CryptoCoin({ className, size = "md", showAmount }: { className?: string; size?: "sm" | "md"; showAmount?: boolean }) {
  const sizeClass = size === "sm" ? "w-5 h-5" : "w-8 h-8"
  const iconClass = size === "sm" ? "h-2.5 w-2.5" : "h-4 w-4"
  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg shadow-primary/30 flex items-center justify-center border border-primary/40`}
      >
        <Coins className={`${iconClass} text-primary-foreground`} />
      </div>
      {showAmount && (
        <span className="text-xs font-bold text-primary whitespace-nowrap">{TRANSFER_AMOUNT}</span>
      )}
    </div>
  )
}

function ChunkCoin({ className, delay = 0, amount }: { className?: string; delay?: number; amount?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 animate-chunk-appear ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-destructive/90 via-destructive/80 to-destructive/70 shadow-md shadow-destructive/30 flex items-center justify-center border border-destructive/50">
        <DollarSign className="h-3 w-3 text-destructive-foreground" />
      </div>
      {amount && (
        <span className="text-[9px] font-semibold text-destructive">{amount}</span>
      )}
    </div>
  )
}

type SensitivePhase = "idle" | "amount" | "splitting" | "chunks" | "routing" | "complete"

export function TransferSimulation() {
  const [mode, setMode] = useState<FlowMode>("standard")
  const [isPlaying, setIsPlaying] = useState(false)
  const [coinStep, setCoinStep] = useState(0)
  const [phase, setPhase] = useState<"idle" | "animating" | "complete">("idle")
  const [sensitivePhase, setSensitivePhase] = useState<SensitivePhase>("idle")

  const blocks = STANDARD_BLOCKS
  const totalSteps = blocks.length

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCoinStep(0)
    setPhase("idle")
    setSensitivePhase("idle")
  }, [])

  const play = useCallback(() => {
    if (mode === "sensitive") {
      setSensitivePhase("amount")
      setIsPlaying(true)
    } else {
      setPhase("animating")
      setIsPlaying(true)
      setCoinStep(0)
    }
  }, [mode])

  // Standard flow: step through blocks
  useEffect(() => {
    if (mode !== "standard" || !isPlaying || phase !== "animating") return

    const interval = setInterval(() => {
      setCoinStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false)
          setPhase("complete")
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => clearInterval(interval)
  }, [mode, isPlaying, phase, totalSteps])

  // Sensitive flow: amount → splitting → chunks → routing → complete
  useEffect(() => {
    if (mode !== "sensitive" || !isPlaying) return

    const phases: SensitivePhase[] = ["amount", "splitting", "chunks", "routing", "complete"]
    const phaseIndex = phases.indexOf(sensitivePhase)
    const nextPhase = phases[phaseIndex + 1]

    const timeout = setTimeout(() => {
      if (sensitivePhase === "complete") {
        setIsPlaying(false)
        return
      }
      setSensitivePhase(nextPhase ?? "complete")
    }, sensitivePhase === "chunks" ? 1200 : 700)

    return () => clearTimeout(timeout)
  }, [mode, isPlaying, sensitivePhase])

  useEffect(() => {
    reset()
  }, [mode, reset])

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          How it works
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See how private transfers and withdrawals flow through NeoBank
        </p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as FlowMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="standard" className="gap-2">
            <Layers className="h-4 w-4" />
            Standard Transfer
          </TabsTrigger>
          <TabsTrigger value="sensitive" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            Sensitive Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-8">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Standard Transfer Flow
              </CardTitle>
              <CardDescription>
                Private transfer between Unlink addresses. Coins route through privacy hops — recipient, amount, and balance stay hidden onchain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 py-6">
              <FlowVisualization
                blocks={STANDARD_BLOCKS}
                coinStep={coinStep}
                phase={phase}
                mode="standard"
              />
              <div className="flex gap-3">
                <Button
                  onClick={play}
                  disabled={isPlaying}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {phase === "complete" ? "Replay" : isPlaying ? "Running..." : "Run Simulation"}
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Each hop routes the same amount through the ZK privacy pool. More hops = stronger anonymity. Recipient (unlink1...) receives privately.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitive" className="mt-8">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Sensitive Transfer
              </CardTitle>
              <CardDescription>
                Amount is divided into chunks that route through separate paths. Like Tor (packets) + Havala (intermediaries) — unlinkable, obfuscated flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 py-6">
              <SensitiveChunkFlow phase={sensitivePhase} />
              <div className="flex gap-3">
                <Button
                  onClick={play}
                  disabled={isPlaying}
                  variant="destructive"
                  className="gap-2"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {sensitivePhase === "complete" ? "Replay" : isPlaying ? "Running..." : "Run Simulation"}
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 space-y-2">
                <p className="text-sm font-medium text-destructive">Divided in Chunks</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Single amount ($) is split into multiple chunks</li>
                  <li>Chunks route through different intermediaries </li>
                  <li>No direct link between sender and final destination — unlinkable usage</li>
                  <li>Chunks reassemble at public address (0x...) — final destination</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SensitiveChunkFlow({ phase }: { phase: SensitivePhase }) {
  const showAmount = phase !== "idle"
  const showSplit = phase === "splitting" || phase === "chunks" || phase === "routing" || phase === "complete"
  const showChunks = phase === "chunks" || phase === "routing" || phase === "complete"
  const showDestination = phase === "routing" || phase === "complete"

  return (
    <div className="relative min-h-[280px] flex items-center py-8">
      {/* Flow: [Amount $] —vertical div lines—> [Divided in chunks] —line—> [Destination 0x] */}
      <div className="flex items-center justify-between w-full gap-2 sm:gap-6">
        {/* 1. Initial Amount ($) - matches diagram left rectangle */}
        <div
          className={`flex flex-col items-center gap-2 shrink-0 transition-all duration-500 ${
            showAmount ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-destructive/50 bg-destructive/10 flex flex-col items-center justify-center gap-1">
            <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
            <span className="text-xs font-bold text-destructive">{TRANSFER_AMOUNT}</span>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Private</span>
        </div>

        {/* 2. Division lines (vertical - extend right from amount, like diagram) */}
        <div
          className={`flex items-center gap-1 transition-all duration-500 ${
            showSplit ? "opacity-100" : "opacity-0"
          }`}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 h-14 sm:h-16 bg-destructive/50 rounded-full animate-chunk-split"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>

        {/* 3. Divided in chunks - middle rectangle with circles */}
        <div
          className={`flex-1 min-w-[140px] sm:min-w-[200px] rounded-xl border-2 border-dashed border-destructive/40 bg-destructive/5 p-4 transition-all duration-500 ${
            showChunks ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider text-center mb-3">
            divided in chunks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {Array.from({ length: CHUNK_COUNT }).map((_, i) => (
              <ChunkCoin key={i} delay={i * 100} amount={`${(2 / CHUNK_COUNT).toFixed(1)} MON`} />
            ))}
          </div>
        </div>

        {/* 4. Connector line to destination */}
        <div
          className={`flex-shrink-0 w-6 sm:w-10 h-0.5 rounded-full bg-destructive/40 transition-all duration-500 ${
            showDestination ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* 5. Final destination - top-right rectangle from diagram */}
        <div
          className={`flex flex-col items-center gap-2 shrink-0 transition-all duration-500 ${
            showDestination ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <div
            className={`w-12 h-14 sm:w-16 sm:h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 ${
              phase === "complete"
                ? "border-primary bg-primary/20"
                : "border-destructive/50 bg-destructive/10"
            }`}
          >
            {phase === "complete" ? (
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse" />
            ) : (
              <ShieldAlert className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
            )}
            <span className={`text-[10px] font-bold ${phase === "complete" ? "text-primary" : "text-destructive"}`}>
              {TRANSFER_AMOUNT}
            </span>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground font-mono">0x... Received</span>
        </div>
      </div>
    </div>
  )
}

function FlowVisualization({
  blocks,
  coinStep,
  phase,
  mode,
}: {
  blocks: typeof STANDARD_BLOCKS
  coinStep: number
  phase: "idle" | "animating" | "complete"
  mode: FlowMode
}) {
  const totalSteps = blocks.length
  const progressPercent = totalSteps > 1 ? (coinStep / (totalSteps - 1)) * 100 : 0

  return (
    <div className="relative">
      {/* Progress track (connector line) */}
      <div className="absolute top-[88px] left-[5%] right-[5%] h-1.5 bg-border/60 rounded-full overflow-hidden -z-10">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            mode === "sensitive" ? "bg-destructive/60" : "bg-primary/60"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Blocks row */}
      <div className="relative flex items-stretch justify-between gap-2 min-h-[200px]">
        {blocks.map((block, index) => {
          const Icon = block.icon
          const isActive = coinStep >= index
          const isCurrent = coinStep === index
          const isComplete = phase === "complete" && index === totalSteps - 1

          return (
            <div key={block.id} className="flex flex-1 flex-col items-center justify-end min-w-0">
              {/* Block */}
              <div
                className={`relative w-full rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 min-h-[140px] ${
                  isActive
                    ? mode === "sensitive"
                      ? "border-destructive/50 bg-destructive/10 shadow-lg shadow-destructive/10"
                      : "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-secondary/30"
                } ${isCurrent ? `scale-110 ring-2 shadow-xl ${mode === "sensitive" ? "ring-destructive/50" : "ring-primary/40"}` : ""}`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                    isActive
                      ? mode === "sensitive"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[11px] font-semibold text-center truncate w-full ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {block.label}
                </span>
                <span className="text-[9px] text-muted-foreground text-center truncate w-full font-mono">
                  {block.sublabel}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-primary mt-0.5">{TRANSFER_AMOUNT}</span>
                )}
                {isComplete && (
                  <div className="absolute inset-0 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                    <Lock className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Travelling crypto coin */}
      {phase !== "idle" && (
        <div className="absolute top-[72px] left-0 right-0 h-14 pointer-events-none">
          <div
            className="absolute transition-all duration-500 ease-out -translate-x-1/2"
            style={{
              left: `${5 + (progressPercent / 100) * 90}%`,
            }}
          >
            <div className={phase === "animating" ? "animate-coin-pulse" : ""}>
              <CryptoCoin showAmount />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
