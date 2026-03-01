"use client"

import { useEffect, useRef } from "react"

const PARTICLE_COUNT = 80
const CONNECT_DISTANCE = 120

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
      }))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const primaryRgb = "0, 212, 170"

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${primaryRgb}, 0.8)`
        ctx.fill()

        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DISTANCE) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            const alpha = (1 - dist / CONNECT_DISTANCE) * 0.15
            ctx.strokeStyle = `rgba(${primaryRgb}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener("resize", resize)
    animate()
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dark base */}
      <div className="absolute inset-0 bg-background" />

      {/* Aurora mesh - dramatic flowing gradient */}
      <div className="absolute inset-0 animate-aurora opacity-[0.9]">
        <div className="aurora-shape aurora-1" />
        <div className="aurora-shape aurora-2" />
        <div className="aurora-shape aurora-3" />
        <div className="aurora-shape aurora-4" />
      </div>

      {/* Large glowing orbs */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full opacity-30 blur-[120px] animate-orb-dramatic bg-primary" />
        <div className="absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full opacity-25 blur-[100px] animate-orb-dramatic-2 bg-chart-2" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full opacity-20 blur-[140px] animate-orb-dramatic-3 bg-chart-3" />
      </div>

      {/* Particle network canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      />

      {/* Hexagonal grid */}
      <div
        className="absolute inset-0 opacity-[0.12] animate-grid-pulse"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath fill='none' stroke='%2300d4aa' stroke-width='0.5' d='M28 0l28 14v28l-28 14-28-14V14z'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 98px",
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
        <div
          className="absolute inset-0 animate-scan-fast"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,212,170,0.2) 50%, transparent 100%)",
            backgroundSize: "100% 400%",
          }}
        />
      </div>

      {/* Subtle noise */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

