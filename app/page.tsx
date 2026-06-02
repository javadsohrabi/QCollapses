'use client'
import Link from 'next/link'
import exhibitsData from '../content/exhibits.json'
import papersData from '../content/papers.json'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import LogoMark from '../components/LogoMark'

const myths = [
  'A quantum computer tries all answers at once.',
  'More qubits always means better performance.',
  'Entanglement automatically gives a speedup.',
  'Quantum ML always beats classical ML.',
  'Noise only slightly affects results.',
  'A bigger circuit is always more expressive.',
]

const steps = [
  { n: '01', title: 'Encounter the myth', body: 'Each case opens with a claim that feels completely true. You are supposed to believe it — at first.' },
  { n: '02', title: 'Test it yourself', body: 'An interactive demo lets you poke the idea until it breaks. The simulator is one click away.' },
  { n: '03', title: 'Watch it collapse', body: 'The correction lands harder because you already believed the wrong thing. That is the whole point.' },
]

const allExhibits = exhibitsData as { id: string; myth: string; category: string; readTime: string; room: string }[]
const allPapers   = papersData as { id: string; title: string; authors: string; journal: string; date: string; topic: string; level: string; idea: string; takeaway: string; link: string; tags: string[]; featured: boolean; featuredDate: string; featuredNote: string }[]
const featuredPaper = allPapers.filter(p => p.featured).sort((a, b) => b.featuredDate.localeCompare(a.featuredDate))[0]

const topics = (() => {
  const icons: Record<string, string> = {
    'Foundations': '⟨ψ|',
    'Circuits':    '⊕',
    'Algorithms':  '∑',
    'Quantum ML':  '∇',
    'Hardware':    '⊗',
  }
  const counts = allExhibits.reduce((acc: Record<string, number>, e) => {
    acc[e.room] = (acc[e.room] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    icon: icons[label] || '○',
  }))
})()


// automatically picks: first case added (Most visited placeholder),
// a random middle case (Trending), and the last added case (New)
const featured = [
  { tag: 'Most visited', ...allExhibits[0],                              time: allExhibits[0]?.readTime },
  { tag: 'Trending',     ...allExhibits[Math.floor(allExhibits.length / 2)], time: allExhibits[Math.floor(allExhibits.length / 2)]?.readTime },
  { tag: 'New',          ...allExhibits[allExhibits.length - 1],         time: allExhibits[allExhibits.length - 1]?.readTime },
]

const col = {
  purple: '#7C72DD',
  purpleB: '#9D96E8',
  muted:  '#6B698A',
  text:   '#E2E0FF',
  dim:    '#3D3875',
  bg:     '#09090F',
  surface:'#0F0F1A',
  border: '#1C1C2E',
}

function QuantumCanvas({ mouseRef }: { mouseRef: React.MutableRefObject<{x: number, y: number}> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number; hue: number }[] = []
    for (let i = 0; i < 36; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2.5 + 1.5,
        pulse: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.7 ? 180 : 250,
      })
    }

    let frame: number
    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.008

      const mouse = mouseRef.current
      const rect = canvas.getBoundingClientRect()
      const mx = mouse.x - rect.left
      const my = mouse.y - rect.top

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.018
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
        const dx = n.x - mx; const dy = n.y - my
        const d = Math.sqrt(dx*dx + dy*dy)
        if (d < 120 && d > 0) { n.x += (dx/d) * 1.2; n.y += (dy/d) * 1.2 }
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 180) {
            const alpha = (1 - dist/180) * 0.35
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
            grad.addColorStop(0, `hsla(${nodes[i].hue},65%,65%,${alpha})`)
            grad.addColorStop(1, `hsla(${nodes[j].hue},65%,65%,${alpha})`)
            ctx.beginPath()
            ctx.strokeStyle = grad
            ctx.lineWidth = 0.7
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach(n => {
        const p = Math.sin(n.pulse) * 0.5 + 0.5
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, (n.r + p*2) * 5)
        grd.addColorStop(0, `hsla(${n.hue},90%,80%,${0.8 + p*0.2})`)
        grd.addColorStop(1, `hsla(${n.hue},70%,70%,0)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, (n.r + p*2)*5, 0, Math.PI*2)
        ctx.fillStyle = grd; ctx.fill()
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + p*0.8, 0, Math.PI*2)
        ctx.fillStyle = `hsla(${n.hue},100%,92%,1)`
        ctx.fill()
      })

      for (let w = 0; w < 3; w++) {
        ctx.beginPath()
        const amp = 14 - w*3
        const freq = 0.012 + w*0.005
        const yOff = canvas.height * (0.5 + w*0.18)
        for (let x = 0; x < canvas.width; x += 2) {
          const y = yOff + Math.sin(x*freq + t*(1+w*0.3)) * amp + Math.sin(x*freq*2 - t) * (amp*0.4)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(124,114,221,${0.05 - w*0.01})`
        ctx.lineWidth = 1.2; ctx.stroke()
      }

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
  )
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function CycleWord() {
  const words = ['wrong.', 'incomplete.', 'imprecise.', 'collapsing.']
  const [i, setI] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI(p => (p+1) % words.length), 2400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!measureRef.current) return
    const el = measureRef.current
    let max = 0
    words.forEach(w => {
      el.textContent = w
      max = Math.max(max, el.offsetWidth)
    })
    el.textContent = ''
    setWidth(max + 4)
  }, [])

  return (
    <>
      <span ref={measureRef} aria-hidden style={{
        position: 'fixed', top: '-9999px', left: '-9999px',
        visibility: 'hidden', whiteSpace: 'nowrap',
        fontSize: 'inherit', fontWeight: 'inherit',
        fontFamily: 'inherit', letterSpacing: 'inherit',
      }} />
      <span style={{
        display: 'inline-block',
        width: width || '260px',
        verticalAlign: 'bottom',
        overflow: 'hidden',
        height: '1.12em',
        position: 'relative',
      }}>
        <AnimatePresence mode="wait">
          <motion.span key={words[i]}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ color: col.purple, display: 'inline-block', position: 'absolute', left: 0, bottom: 0, whiteSpace: 'nowrap' }}>
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
}

function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: col.purpleB, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 600, letterSpacing: '-0.02em' }}>
        {value}
      </motion.div>
      <div style={{ color: col.muted, fontSize: '12px', marginTop: '4px', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

function QuantumComputer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 520, H = 400
    canvas.width = W; canvas.height = H
    const cx = W / 2

    const stages = [
      { y: 80,  rx: 190, ry: 18, h: 32, color: '#2E2E55', label: '300 K',  labelColor: '#8886AA' },
      { y: 140, rx: 158, ry: 15, h: 28, color: '#272750', label: '50 K',   labelColor: '#8886AA' },
      { y: 192, rx: 128, ry: 13, h: 25, color: '#202048', label: '4 K',    labelColor: '#9D96E8' },
      { y: 238, rx: 100, ry: 11, h: 22, color: '#1A1A40', label: '800 mK', labelColor: '#9D96E8' },
      { y: 278, rx: 74,  ry: 9,  h: 20, color: '#151535', label: '100 mK', labelColor: '#B8B3F0' },
      { y: 312, rx: 50,  ry: 7,  h: 18, color: '#101030', label: '15 mK',  labelColor: '#C8C4FF' },
    ]

    const wires = Array.from({ length: 28 }, (_, i) => ({
      x: cx + (Math.random() - 0.5) * 110,
      wobble: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.003,
      color: [
        'rgba(157,150,232,0.85)',
        'rgba(29,158,117,0.8)',
        'rgba(93,202,165,0.75)',
        'rgba(184,179,240,0.7)',
        'rgba(80,180,220,0.75)',
      ][Math.floor(Math.random() * 5)],
      width: 1.2 + Math.random() * 1.4,
    }))

    let t = 0
    let frame: number

    const drawCylinder = (y: number, rx: number, ry: number, h: number, color: string, pulse: number) => {
      const p = Math.sin(pulse) * 0.5 + 0.5

      // side
      const sideGrad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0)
      sideGrad.addColorStop(0,   'rgba(0,0,0,0.7)')
      sideGrad.addColorStop(0.15, color + 'BB')
      sideGrad.addColorStop(0.45, color + 'FF')
      sideGrad.addColorStop(0.55, color + 'FF')
      sideGrad.addColorStop(0.85, color + 'BB')
      sideGrad.addColorStop(1,   'rgba(0,0,0,0.7)')

      ctx.beginPath()
      ctx.moveTo(cx - rx, y)
      ctx.lineTo(cx - rx, y + h)
      ctx.ellipse(cx, y + h, rx, ry, 0, Math.PI, 0)
      ctx.lineTo(cx + rx, y)
      ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI, true)
      ctx.fillStyle = sideGrad
      ctx.fill()

      // bottom
      ctx.beginPath()
      ctx.ellipse(cx, y + h, rx, ry, 0, 0, Math.PI * 2)
      const btm = ctx.createRadialGradient(cx, y + h, 0, cx, y + h, rx)
      btm.addColorStop(0, color + 'CC')
      btm.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = btm
      ctx.fill()
      ctx.strokeStyle = `rgba(124,114,221,${0.15 + p * 0.12})`
      ctx.lineWidth = 0.8
      ctx.stroke()

      // top lid
      ctx.beginPath()
      ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI * 2)
      const top = ctx.createRadialGradient(cx - rx * 0.3, y, 0, cx, y, rx)
      top.addColorStop(0, 'rgba(220,216,255,0.18)')
      top.addColorStop(0.35, color + 'BB')
      top.addColorStop(1,   'rgba(0,0,0,0.4)')
      ctx.fillStyle = top
      ctx.fill()
      ctx.strokeStyle = `rgba(157,150,232,${0.2 + p * 0.15})`
      ctx.lineWidth = 1
      ctx.stroke()

      // rim highlight
      ctx.beginPath()
      ctx.ellipse(cx, y, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.9)
      ctx.strokeStyle = `rgba(200,196,255,${0.12 + p * 0.08})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    const drawWires = () => {
      const topY = 70
      const bottomY = stages[stages.length - 1].y + 4
      const pathLen = bottomY - topY

      wires.forEach(w => {
        // draw faint static wire line as track
        const wobX = Math.sin(t * w.speed * 30 + w.wobble) * 1.5
        ctx.beginPath()
        ctx.moveTo(w.x + wobX, topY)
        ctx.bezierCurveTo(
          w.x + wobX * 2, topY + pathLen * 0.3,
          w.x - wobX * 2, topY + pathLen * 0.7,
          w.x + wobX,     bottomY
        )
        ctx.strokeStyle = w.color.replace(/[\d.]+\)$/, '0.15)')
        ctx.lineWidth = 0.6
        ctx.stroke()

        // draw 3 moving dots along each wire
        for (let d = 0; d < 3; d++) {
          const phase = 1 - ((t * w.speed * 28 + w.wobble + d * 0.33) % 1 + 1) % 1
          const py = topY + phase * pathLen
          const bendX = Math.sin(w.wobble + phase * Math.PI * 2) * 2.5
          const px = w.x + bendX

          // dot glow
          const grd = ctx.createRadialGradient(px, py, 0, px, py, 5)
          grd.addColorStop(0, w.color.replace(/[\d.]+\)$/, '0.9)'))
          grd.addColorStop(1, w.color.replace(/[\d.]+\)$/, '0)'))
          ctx.beginPath()
          ctx.arc(px, py, 5, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()

          // dot core
          ctx.beginPath()
          ctx.arc(px, py, 1.8, 0, Math.PI * 2)
          ctx.fillStyle = w.color.replace(/[\d.]+\)$/, '1)')
          ctx.fill()
        }
      })
    }

    const drawQubitChip = (pulse: number) => {
      const chipY = stages[stages.length - 1].y + stages[stages.length - 1].h + 14
      const chipW = 72, chipH = 16
      const p = Math.sin(pulse) * 0.5 + 0.5

      // chip shadow
      ctx.beginPath()
      ctx.ellipse(cx, chipY + chipH + 6, chipW * 0.8, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(124,114,221,0.08)'
      ctx.fill()

      // chip body
      const chipGrad = ctx.createLinearGradient(cx - chipW, chipY, cx + chipW, chipY + chipH)
      chipGrad.addColorStop(0,   '#1C1C38')
      chipGrad.addColorStop(0.5, '#2A2A50')
      chipGrad.addColorStop(1,   '#1C1C38')
      ctx.beginPath()
      ctx.roundRect(cx - chipW, chipY, chipW * 2, chipH, 3)
      ctx.fillStyle = chipGrad
      ctx.fill()
      ctx.strokeStyle = `rgba(157,150,232,${0.5 + p * 0.35})`
      ctx.lineWidth = 1
      ctx.stroke()

      // chip top highlight
      ctx.beginPath()
      ctx.roundRect(cx - chipW + 2, chipY + 1, chipW * 2 - 4, 3, 2)
      ctx.fillStyle = `rgba(200,196,255,${0.06 + p * 0.04})`
      ctx.fill()

      const qRows = 3, qCols = 9
      const qSX = (chipW * 2 - 12) / (qCols - 1)
      const qSY = (chipH - 6) / (qRows - 1)

      for (let r = 0; r < qRows; r++) {
        for (let c = 0; c < qCols; c++) {
          const qx = cx - chipW + 6 + c * qSX
          const qy = chipY + 3 + r * qSY
          const active = Math.sin(t * 3.5 + r * 2.1 + c * 1.7) > 0.25
          const glow = active ? 0.9 + p * 0.1 : 0.15

          if (active) {
            const qGlow = ctx.createRadialGradient(qx, qy, 0, qx, qy, 7)
            qGlow.addColorStop(0, `rgba(157,150,232,${0.4 * p})`)
            qGlow.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.beginPath()
            ctx.arc(qx, qy, 7, 0, Math.PI * 2)
            ctx.fillStyle = qGlow
            ctx.fill()
          }

          ctx.beginPath()
          ctx.arc(qx, qy, active ? 2 : 1.5, 0, Math.PI * 2)
          ctx.fillStyle = active
            ? `rgba(200,196,255,${glow})`
            : `rgba(80,75,140,${glow})`
          ctx.fill()

          if (c < qCols - 1) {
            const nx = cx - chipW + 6 + (c + 1) * qSX
            const entangled = Math.sin(t * 2 + c * 1.3 + r) > 0.4
            if (entangled) {
              ctx.beginPath()
              ctx.moveTo(qx, qy); ctx.lineTo(nx, qy)
              ctx.strokeStyle = `rgba(124,114,221,${0.25 * p})`
              ctx.lineWidth = 0.7; ctx.stroke()
            }
          }
        }
      }

      ctx.font = 'bold 8px monospace'
      ctx.fillStyle = `rgba(157,150,232,${0.55 + p * 0.3})`
      ctx.textAlign = 'center'
      ctx.fillText('QPU  ·  27 QUBITS', cx, chipY + chipH + 12)
    }

    const drawSupportRod = () => {
      const rodGrad = ctx.createLinearGradient(cx - 5, 0, cx + 5, 0)
      rodGrad.addColorStop(0,   'rgba(20,20,40,0.9)')
      rodGrad.addColorStop(0.4, 'rgba(80,75,140,0.5)')
      rodGrad.addColorStop(0.6, 'rgba(80,75,140,0.5)')
      rodGrad.addColorStop(1,   'rgba(20,20,40,0.9)')
      ctx.beginPath()
      ctx.rect(cx - 4, 55, 8, 285)
      ctx.fillStyle = rodGrad
      ctx.fill()
    }

    const drawTopMount = () => {
      ctx.beginPath()
      ctx.ellipse(cx, 68, 205, 20, 0, 0, Math.PI * 2)
      const flangeGrad = ctx.createLinearGradient(cx - 205, 68, cx + 205, 68)
      flangeGrad.addColorStop(0,   '#0E0E22')
      flangeGrad.addColorStop(0.25, '#28284A')
      flangeGrad.addColorStop(0.5,  '#32325A')
      flangeGrad.addColorStop(0.75, '#28284A')
      flangeGrad.addColorStop(1,   '#0E0E22')
      ctx.fillStyle = flangeGrad
      ctx.fill()
      ctx.strokeStyle = 'rgba(124,114,221,0.3)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // rim highlight
      ctx.beginPath()
      ctx.ellipse(cx, 68, 205, 20, 0, Math.PI * 1.05, Math.PI * 1.95)
      ctx.strokeStyle = 'rgba(200,196,255,0.1)'
      ctx.lineWidth = 2
      ctx.stroke()

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const bx = cx + Math.cos(angle) * 188
        const by = 68 + Math.sin(angle) * 18
        ctx.beginPath()
        ctx.arc(bx, by, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#1E1E3C'
        ctx.fill()
        ctx.strokeStyle = 'rgba(124,114,221,0.35)'
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }

    const drawLabels = () => {
      stages.forEach(s => {
        const lx = cx + s.rx + 10
        const ly = s.y + s.h / 2 + 3

        ctx.beginPath()
        ctx.moveTo(cx + s.rx + 1, ly - 1)
        ctx.lineTo(cx + s.rx + 8, ly - 1)
        ctx.strokeStyle = s.labelColor
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 0.8
        ctx.stroke()
        ctx.globalAlpha = 1

        ctx.font = '9px monospace'
        ctx.fillStyle = s.labelColor
        ctx.textAlign = 'left'
        ctx.globalAlpha = 0.85
        ctx.fillText(s.label, lx, ly)
        ctx.globalAlpha = 1
      })
    }

    const drawAmbientGlow = () => {
      const lastY = stages[stages.length - 1].y + 10
      const grd = ctx.createRadialGradient(cx, lastY, 0, cx, lastY, 90)
      grd.addColorStop(0, `rgba(124,114,221,${0.1 + Math.sin(t * 0.6) * 0.04})`)
      grd.addColorStop(0.5, `rgba(124,114,221,0.03)`)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, lastY, 90, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // top ambient
      const topGrd = ctx.createRadialGradient(cx, 68, 0, cx, 68, 180)
      topGrd.addColorStop(0, `rgba(100,95,200,${0.06 + Math.sin(t * 0.4) * 0.02})`)
      topGrd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, 68, 180, 0, Math.PI * 2)
      ctx.fillStyle = topGrd
      ctx.fill()
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      drawAmbientGlow()
      drawSupportRod()
      drawWires()
      stages.forEach((s, i) => drawCylinder(s.y, s.rx, s.ry, s.h, s.color, t * 1.5 + i * 0.9))
      drawTopMount()
      drawQubitChip(t * 2.2)
      drawLabels()

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 0 50px', gap: '4px' }}>
      <p style={{ color: 'rgba(124,114,221,0.9)', fontSize: '10px', letterSpacing: '0.18em', fontFamily: 'monospace', textTransform: 'uppercase' }}>
        Dilution Refrigerator Architecture
      </p>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', maxWidth: '520px', height: 'auto' }} />
      </div>
      <p style={{ color: 'rgba(157,150,232,0.4)', fontSize: '10px', letterSpacing: '0.14em', fontFamily: 'monospace' }}>
        QPU operating at ~15 mK · colder than outer space
      </p>
    </div>
  )
}

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50])
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.25], [0.7, 0])
  const mouseRef = useRef<{x: number, y: number}>({ x: -999, y: -999 })

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* hero */}
      <section
        onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY } }}
        style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <motion.div style={{ opacity: canvasOpacity, position: 'absolute', inset: 0 }}>
          <QuantumCanvas mouseRef={mouseRef} />
        </motion.div>

        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,114,221,0.07) 0%, transparent 70%)',
        }} />

        <motion.div style={{ opacity: heroOpacity, y: heroY, position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(60px,10vw,100px) 24px' }}>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(124,114,221,0.3)',
                borderRadius: '100px', padding: '6px 14px',
                marginBottom: '32px',
                background: 'rgba(124,114,221,0.06)',
              }}>
              <LogoMark size={14} color="#7C72DD" />
              <span style={{ color: col.muted, fontSize: '12px', letterSpacing: '0.08em' }}>
                Interactive misconceptions · Quantum misconceptions
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                color: col.text,
                fontSize: 'clamp(2.4rem, 7vw, 5rem)',
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                marginBottom: '28px',
                maxWidth: '700px',
              }}>
              Your intuition<br />
              is probably{' '}
              <CycleWord />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              style={{ color: col.muted, fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: '460px', lineHeight: 1.8, marginBottom: '48px' }}>
              A misconceptions where you form the wrong idea first —
              then watch it collapse into something real.
              Built by a quantum lover, learning in public.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/misconceptions" style={{
                background: `linear-gradient(135deg, ${col.purple}, #5F57C4)`,
                color: '#fff', padding: '14px 32px',
                borderRadius: '10px', fontWeight: 600,
                fontSize: '14px', textDecoration: 'none',
                letterSpacing: '0.01em',
                boxShadow: `0 0 32px rgba(124,114,221,0.25)`,
              }}>
                Enter the misconceptions section
              </Link>
              <Link href="/simulator" style={{
                border: '1px solid #2A2A3E', color: col.muted,
                padding: '14px 28px', borderRadius: '10px',
                fontSize: '14px', textDecoration: 'none',
                background: 'rgba(255,255,255,0.02)',
              }}>
                Open simulator →
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              style={{ display: 'flex', gap: '40px', marginTop: '64px', flexWrap: 'wrap' }}>
              {[
                ['30+', 'Misconceptions'],
                ['3', 'Explanation levels'],
                ['1', 'Simulator'],
              ].map(([val, lbl]) => (
                <div key={lbl} style={{ borderLeft: `1px solid ${col.border}`, paddingLeft: '20px' }}>
                  <div style={{ color: col.purpleB, fontSize: '22px', fontWeight: 600 }}>{val}</div>
                  <div style={{ color: col.muted, fontSize: '12px', marginTop: '3px' }}>{lbl}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: col.muted, fontSize: '11px', letterSpacing: '0.1em', textAlign: 'center', cursor: 'default' }}>
            <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${col.border}, transparent)`, margin: '0 auto 8px' }} />
            SCROLL
          </motion.div>
        </motion.div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px',
          background: `linear-gradient(to bottom, transparent, ${col.bg})`,
          pointerEvents: 'none', zIndex: 2,
        }} />
      </section>

      {/* myths strip */}
      <div style={{ borderTop: `1px solid ${col.border}`, borderBottom: `1px solid ${col.border}`, padding: '16px 0', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${col.bg} 0%, transparent 8%, transparent 92%, ${col.bg} 100%)`, zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', gap: '48px', padding: '0 24px', opacity: 0.4 }}>
          {[...myths, ...myths].map((m, i) => (
            <span key={i} style={{ color: col.muted, fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ color: col.purple, marginRight: '8px' }}>✗</span>{m}
            </span>
          ))}
        </div>
      </div>

      {/* how it works */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(60px,10vw,120px) 24px' }}>
        <FadeUp>
          <div style={{ marginBottom: '56px' }}>
            <p style={{ color: col.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '14px' }}>The method</p>
            <h2 style={{ color: col.text, fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 600, letterSpacing: '-0.02em', maxWidth: '500px', lineHeight: 1.2 }}>
              Built around one idea:<br />collapse the wrong intuition
            </h2>
          </div>
        </FadeUp>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {steps.map(({ n, title, body }, i) => (
            <FadeUp key={n} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgba(124,114,221,0.4)' }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: col.surface, border: `1px solid ${col.border}`,
                  borderRadius: '14px', padding: '28px 24px',
                  position: 'relative', overflow: 'hidden', cursor: 'default',
                }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: `linear-gradient(to right, transparent, ${col.purple}, transparent)`,
                  opacity: 0.5,
                }} />
                <div style={{
                  position: 'absolute', top: '-40px', right: '-20px',
                  fontSize: '72px', fontWeight: 700, color: col.purple,
                  opacity: 0.04, fontFamily: 'monospace', pointerEvents: 'none',
                }}>{n}</div>
                <span style={{ color: col.purple, fontFamily: 'monospace', fontSize: '12px', opacity: 0.7 }}>{n}</span>
                <h3 style={{ color: col.text, fontWeight: 500, margin: '14px 0 10px', fontSize: '16px' }}>{title}</h3>
                <p style={{ color: col.muted, fontSize: '13px', lineHeight: 1.75 }}>{body}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* orbit visual */}
      <FadeUp>
        <QuantumComputer />
      </FadeUp>

      {/* featured cases */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px clamp(60px,10vw,120px)' }}>
        <FadeUp>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: col.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>Misconceptions</p>
              <h2 style={{ color: col.text, fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, letterSpacing: '-0.02em' }}>Featured cases</h2>
            </div>
            <Link href="/misconceptions" style={{ color: col.purple, fontSize: '13px', textDecoration: 'none', opacity: 0.8 }}>
              Browse all cases →
            </Link>
          </div>
        </FadeUp>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {featured.map(({ tag, myth: title, category, readTime, id }, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <Link href={'/misconceptions/' + id} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ x: 4, borderColor: 'rgba(124,114,221,0.4)' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    backgroundColor: col.surface, border: `1px solid ${col.border}`,
                    borderRadius: '12px', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px', cursor: 'pointer',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 500, padding: '3px 9px',
                      borderRadius: '100px', whiteSpace: 'nowrap', flexShrink: 0,
                      backgroundColor: 'rgba(124,114,221,0.1)',
                      border: '1px solid rgba(124,114,221,0.2)',
                      color: col.purpleB,
                    }}>{tag}</span>
                    <span style={{ color: col.text, fontSize: '13px', fontWeight: 400, overflow: 'hidden', flex: 1, whiteSpace: 'normal', lineHeight: 1.4 }}>
                      {title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{ color: col.muted, fontSize: '12px', display: 'none' }} className="desktop-only">{category}</span>
                    <span style={{ color: col.muted, fontSize: '11px', opacity: 0.6, whiteSpace: 'nowrap' }}>{readTime}</span>
                    <span style={{ color: col.purple, fontSize: '16px' }}>&#8594;</span>
                  </div>
                </motion.div>
              </Link>
            </FadeUp>
          ))}
        </div>

        {/* paper of the day */}
        {featuredPaper && (
          <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', marginBottom: 'clamp(48px, 8vw, 80px)' }}>
            <FadeUp>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '100px', backgroundColor: 'rgba(239,192,96,0.12)', border: '1px solid rgba(239,192,96,0.35)' }}>
                    <span style={{ fontSize: '14px', color: col.amber }}>★</span>
                    <span style={{ color: col.amber, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most interesting paper today</span>
                  </div>
                </div>
                <Link href="/papers" style={{ fontSize: '13px', color: col.purple, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  All papers →
                </Link>
              </div>

              <motion.div
                whileHover={{ borderColor: 'rgba(239,192,96,0.45)', y: -2 }}
                transition={{ duration: 0.15 }}
                style={{ borderRadius: '14px', backgroundColor: col.surface, border: '1px solid rgba(239,192,96,0.25)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, rgba(239,192,96,0.9), transparent)' }} />
                <div style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(239,192,96,0.12)', color: col.amber, border: '1px solid rgba(239,192,96,0.25)' }}>★ Featured today</span>
                    <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(124,114,221,0.1)', color: col.purpleB, border: '1px solid rgba(124,114,221,0.2)' }}>{featuredPaper.topic}</span>
                    <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(29,158,117,0.1)', color: '#1D9E75' }}>{featuredPaper.level}</span>
                    <span style={{ fontSize: '11px', color: col.muted, marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(featuredPaper.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 style={{ color: col.text, fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 600, lineHeight: 1.4, marginBottom: '6px' }}>
                    {featuredPaper.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: col.muted, marginBottom: '4px' }}>
                    {featuredPaper.authors.split(',').slice(0, 3).join(',')}{featuredPaper.authors.split(',').length > 3 ? ' et al.' : ''}
                  </p>
                  <p style={{ fontSize: '12px', color: col.purple, fontStyle: 'italic', marginBottom: '14px' }}>
                    {featuredPaper.journal}
                  </p>

                  <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(124,114,221,0.05)', border: '1px solid rgba(124,114,221,0.12)', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: col.purple, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Main idea</p>
                    <p style={{ fontSize: '13px', color: col.muted, lineHeight: 1.7 }}>{featuredPaper.idea}</p>
                  </div>

                  {featuredPaper.featuredNote && (
                    <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(239,192,96,0.06)', border: '1px solid rgba(239,192,96,0.2)', marginBottom: '14px' }}>
                      <p style={{ fontSize: '12px', color: col.amber, lineHeight: 1.6 }}>★ {featuredPaper.featuredNote}</p>
                    </div>
                  )}

                  <a href={featuredPaper.link} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(124,114,221,0.3)', color: col.purpleB, textDecoration: 'none', backgroundColor: 'rgba(124,114,221,0.07)' }}>
                    Read paper ↗
                  </a>
                </div>
              </motion.div>
            </FadeUp>
          </section>
        )}

        {/* topics grid */}
        <FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {topics.map(({ label, count, icon }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ borderColor: 'rgba(124,114,221,0.4)', y: -2 }}>
                <Link href={`/misconceptions?topic=${label.toLowerCase()}`}
                  style={{
                    backgroundColor: col.surface, border: `1px solid ${col.border}`,
                    borderRadius: '12px', padding: '18px', textDecoration: 'none', display: 'block',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at top left, rgba(124,114,221,0.05), transparent 60%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{ color: col.purple, fontSize: '18px', marginBottom: '10px', fontFamily: 'monospace' }}>{icon}</div>
                  <p style={{ color: col.text, fontSize: '13px', fontWeight: 500 }}>{label}</p>
                  <p style={{ color: col.muted, fontSize: '11px', marginTop: '4px' }}>{count} cases</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* stats bar */}
      <FadeUp>
        <div style={{ borderTop: `1px solid ${col.border}`, borderBottom: `1px solid ${col.border}` }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '32px' }}>
            <StatCounter value="30+" label="Misconceptions" />
            <StatCounter value="3"   label="Depth levels" />
            <StatCounter value="1"   label="Live simulator" />
            <StatCounter value="∞"   label="Wrong intuitions" />
          </div>
        </div>
      </FadeUp>

      {/* donation */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(40px,8vw,100px) 16px' }}>
        <FadeUp>
          <div style={{
            borderRadius: '16px', padding: 'clamp(28px,5vw,48px)',
            position: 'relative', overflow: 'hidden',
            border: `1px solid ${col.border}`,
            background: 'linear-gradient(135deg, #0F0F1A 0%, #0D0B24 100%)',
          }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,114,221,0.1), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,158,117,0.07), transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center', position: 'relative' }}>
              <div>
                <p style={{ color: col.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Support the project
                </p>
                <h3 style={{ color: col.text, fontWeight: 600, marginBottom: '12px', fontSize: 'clamp(18px,2.5vw,24px)', letterSpacing: '-0.02em' }}>
                  Keep QCollapses free
                </h3>
                <p style={{ color: col.muted, fontSize: '14px', lineHeight: 1.75, maxWidth: '100%' }}>
                  No ads, no paywalls. If a case saved you from a wrong intuition, a donation helps keep the site running and funds the Phase 2 simulator.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <motion.a
                  href="https://ko-fi.com/qcollapses"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(124,114,221,0.3)' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: `linear-gradient(135deg, ${col.purple}, #5F57C4)`,
                    color: '#fff', padding: '14px 28px',
                    borderRadius: '10px', fontWeight: 600,
                    fontSize: '14px', textDecoration: 'none',
                  }}>
                  ⚛ Buy me a qubit
                </motion.a>
                <p style={{ color: col.muted, fontSize: '11px', textAlign: 'center', opacity: 0.6 }}>
                  Via Ko-fi · No account needed · Zero fees
                </p>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

    </div>
  )
}
