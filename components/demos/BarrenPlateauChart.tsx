'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function BarrenPlateauChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth, H = 200
    canvas.width = W; canvas.height = H

    ctx.fillStyle = '#0F0F1A'
    ctx.roundRect(0, 0, W, H, 8)
    ctx.fill()

    const qubits = [2, 4, 6, 8, 10, 12, 14, 16]
    const variance = qubits.map(n => Math.pow(2, -n))
    const maxV = variance[0]
    const pad = { l: 52, r: 20, t: 20, b: 36 }
    const cW = W - pad.l - pad.r
    const cH = H - pad.t - pad.b

    ctx.strokeStyle = '#1C1C2E'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (i / 4) * cH
      ctx.beginPath()
      ctx.moveTo(pad.l, y)
      ctx.lineTo(pad.l + cW, y)
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.strokeStyle = '#7C72DD'
    ctx.lineWidth = 2
    qubits.forEach((q, i) => {
      const x = pad.l + (i / (qubits.length - 1)) * cW
      const y = pad.t + (1 - variance[i] / maxV) * cH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    qubits.forEach((q, i) => {
      const x = pad.l + (i / (qubits.length - 1)) * cW
      const y = pad.t + (1 - variance[i] / maxV) * cH
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#7C72DD'
      ctx.fill()

      ctx.fillStyle = '#6B698A'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('n=' + q, x, H - pad.b + 16)
    })

    ctx.fillStyle = '#B8B3F0'
    ctx.font = '9px monospace'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (i / 4) * cH
      const val = maxV * (1 - i / 4)
      ctx.fillText(val.toExponential(0), pad.l - 4, y + 4)
    }

    ctx.save()
    ctx.translate(12, pad.t + cH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#6B698A'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Gradient variance', 0, 0)
    ctx.restore()
  }, [])

  return (
    <div style={{ marginBottom: '8px' }}>
      <p style={{ fontSize: '11px', color: '#6B698A', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Gradient variance vs qubit count (global cost function)
      </p>
      <canvas ref={canvasRef} style={{ width: '100%', height: '200px', borderRadius: '8px', display: 'block' }} />
      <p style={{ fontSize: '11px', color: '#6B698A', marginTop: '8px', lineHeight: 1.6, opacity: 0.7 }}>
        Gradient variance scales as O(2^-n). At 16 qubits the gradient is 65,000x smaller than at 2 qubits — effectively zero. No classical optimization trick fixes this.
      </p>
    </div>
  )
}
