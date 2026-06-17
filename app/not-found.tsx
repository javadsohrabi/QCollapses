'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

function CollapseCanvas({ collapsed }: { collapsed: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const collapseRef = useRef(false)
  const progressRef = useRef(0)

  useEffect(() => {
    collapseRef.current = collapsed
  }, [collapsed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // superposition state — many spread out nodes
    const nodes: {
      x: number; y: number; vx: number; vy: number
      r: number; pulse: number; hue: number
      cx: number; cy: number
    }[] = []

    for (let i = 0; i < 32; i++) {
      nodes.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    (Math.random() - 0.5) * 0.5,
        vy:    (Math.random() - 0.5) * 0.5,
        r:     Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
        hue:   Math.random() > 0.6 ? 180 : 250,
        cx:    0,
        cy:    0,
      })
    }

    let frame: number
    let t = 0

    const draw = () => {
      if (!canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.012

      const isCollapsed = collapseRef.current
      const targetX = canvas.width  / 2
      const targetY = canvas.height / 2

      if (isCollapsed) {
        progressRef.current = Math.min(1, progressRef.current + 0.025)
      } else {
        progressRef.current = Math.max(0, progressRef.current - 0.02)
      }

      const prog = progressRef.current
      const ease = prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2

      nodes.forEach(n => {
        if (!isCollapsed || prog < 1) {
          n.x += n.vx * (1 - ease)
          n.y += n.vy * (1 - ease)
          if (n.x < 0 || n.x > canvas.width)  n.vx *= -1
          if (n.y < 0 || n.y > canvas.height) n.vy *= -1
        }

        n.pulse += 0.02

        const drawX = n.x + (targetX - n.x) * ease
        const drawY = n.y + (targetY - n.y) * ease

        const p = Math.sin(n.pulse) * 0.5 + 0.5
        const r = n.r * (1 + (1 - ease) * p)
        const alpha = ease > 0.85 ? (1 - ease) * 6 : 1

        // glow
        const grd = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, r * 6)
        grd.addColorStop(0, 'hsla(' + n.hue + ',80%,75%,' + (0.5 * alpha) + ')')
        grd.addColorStop(1, 'hsla(' + n.hue + ',80%,75%,0)')
        ctx.beginPath()
        ctx.arc(drawX, drawY, r * 6, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // core dot
        ctx.beginPath()
        ctx.arc(drawX, drawY, r, 0, Math.PI * 2)
        ctx.fillStyle = 'hsla(' + n.hue + ',90%,88%,' + (0.9 * alpha) + ')'
        ctx.fill()
      })

      // connection lines — fade out as collapse progresses
      if (prog < 0.8) {
        const lineAlpha = 1 - prog / 0.8
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx   = nodes[i].x - nodes[j].x
            const dy   = nodes[i].y - nodes[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 160) {
              ctx.beginPath()
              ctx.strokeStyle = 'rgba(124,114,221,' + ((1 - dist / 160) * 0.2 * lineAlpha) + ')'
              ctx.lineWidth = 0.6
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
              ctx.stroke()
            }
          }
        }
      }

      // collapse flash at the center when fully collapsed
      if (prog > 0.85) {
        const flashAlpha = (prog - 0.85) / 0.15
        const flashR = flashAlpha * 80
        const flash = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, flashR)
        flash.addColorStop(0, 'rgba(200,196,255,' + (flashAlpha * 0.6) + ')')
        flash.addColorStop(0.4, 'rgba(124,114,221,' + (flashAlpha * 0.3) + ')')
        flash.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(targetX, targetY, flashR, 0, Math.PI * 2)
        ctx.fillStyle = flash
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}

export default function NotFound() {
  const [phase, setPhase] = useState<'superposition' | 'collapsing' | 'collapsed'>('superposition')

  useEffect(() => {
    // auto-trigger collapse after 1.2s
    const t1 = setTimeout(() => setPhase('collapsing'), 1200)
    const t2 = setTimeout(() => setPhase('collapsed'),  2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090F', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      <CollapseCanvas collapsed={phase !== 'superposition'} />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,114,221,0.06) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: '560px' }}>

        <AnimatePresence mode='wait'>
          {phase === 'superposition' && (
            <motion.div key='super'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#7C72DD', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Searching for page...
              </div>
              <div style={{ fontSize: '18px', color: '#9492B0', lineHeight: 1.7 }}>
                Page exists in superposition.<br />
                <span style={{ color: '#9D96E8' }}>Collapsing wavefunction...</span>
              </div>
            </motion.div>
          )}

          {phase === 'collapsing' && (
            <motion.div key='collapsing'
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#EFC060', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Measurement in progress...
              </div>
              <div style={{ fontSize: '18px', color: '#9492B0', lineHeight: 1.7 }}>
                <span style={{ color: '#EFC060' }}>Wavefunction collapsing</span><br />
                into a definite state...
              </div>
            </motion.div>
          )}

          {phase === 'collapsed' && (
            <motion.div key='collapsed'
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7C72DD', marginBottom: '14px' }}>
                State collapsed
              </div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 'clamp(72px, 16vw, 120px)', fontWeight: 600, letterSpacing: '-0.04em', color: '#E2E0FF', lineHeight: 1, marginBottom: '16px' }}>
                404
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: '#9492B0', lineHeight: 1.7, marginBottom: '8px' }}>
                This page collapsed into an undefined state.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: '13px', color: '#9492B0', lineHeight: 1.7, marginBottom: '36px', opacity: 0.6 }}>
                Much like a qubit before measurement — it existed somewhere,
                but the act of observing it collapsed every possibility into nothing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link href='/'
                  style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: 'linear-gradient(135deg, #7C72DD, #5F57C4)', color: '#fff', textDecoration: 'none', boxShadow: '0 0 24px rgba(124,114,221,0.25)' }}>
                  Back to home
                </Link>
                <Link href='/misconceptions'
                  style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '14px', border: '1px solid #1C1C2E', color: '#9492B0', textDecoration: 'none' }}>
                  Enter the misconceptions section
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #1C1C2E', backgroundColor: '#0F0F1A' }}>
                <p style={{ color: '#9492B0', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Quick navigation
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { href: '/misconceptions',    label: 'Misconceptions'      },
                    { href: '/simulator', label: 'Simulator'   },
                    { href: '/papers',    label: 'Featured Papers' },
                    { href: '/about',     label: 'About'       },
                  ].map(l => (
                    <Link key={l.href} href={l.href}
                      style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', border: '1px solid #1C1C2E', color: '#9492B0', textDecoration: 'none' }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
