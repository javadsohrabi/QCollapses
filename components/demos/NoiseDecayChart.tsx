'use client'
import { useEffect, useRef } from 'react'

export default function NoiseDecayChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth, H = 200
    canvas.width = W; canvas.height = H
    const pad = { l: 48, r: 20, t: 20, b: 36 }
    const cW = W - pad.l - pad.r
    const cH = H - pad.t - pad.b

    const gateCount = 100
    const errorRates = [0.001, 0.005, 0.01, 0.05, 0.1]
    const colors = ['#1D9E75', '#5DCAA5', '#EFC060', '#F08080', '#DC5050']
    const labels = ['0.1%', '0.5%', '1%', '5%', '10%']

    ctx.fillStyle = '#0F0F1A'
    ctx.roundRect(0, 0, W, H, 8)
    ctx.fill()

    ctx.strokeStyle = '#1C1C2E'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (i / 4) * cH
      ctx.beginPath()
      ctx.moveTo(pad.l, y)
      ctx.lineTo(pad.l + cW, y)
      ctx.stroke()
      ctx.fillStyle = '#6B698A'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText((100 - i * 25) + '%', pad.l - 6, y + 4)
    }

    ctx.fillStyle = '#6B698A'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 4; i++) {
      const x = pad.l + (i / 4) * cW
      ctx.fillText(String(i * 25), x, H - pad.b + 16)
    }

    errorRates.forEach((rate, ri) => {
      ctx.beginPath()
      ctx.strokeStyle = colors[ri]
      ctx.lineWidth = 1.5
      for (let g = 0; g <= gateCount; g++) {
        const fidelity = Math.pow(1 - rate, g)
        const x = pad.l + (g / gateCount) * cW
        const y = pad.t + (1 - fidelity) * cH
        g === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      const labelX = pad.l + cW + 4
      const labelY = pad.t + (1 - Math.pow(1 - rate, gateCount)) * cH
      ctx.fillStyle = colors[ri]
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(labels[ri], labelX, Math.min(labelY + 4, H - pad.b))
    })

    ctx.fillStyle = '#6B698A'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Gates executed', pad.l + cW / 2, H - 4)

    ctx.save()
    ctx.translate(12, pad.t + cH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Fidelity', 0, 0)
    ctx.restore()
  }, [])

  return (
    <div style={{ marginBottom: '8px' }}>
      <p style={{ fontSize: '11px', color: '#6B698A', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Fidelity decay by error rate per gate
      </p>
      <canvas ref={canvasRef} style={{ width: '100%', height: '200px', borderRadius: '8px', display: 'block' }} />
      <p style={{ fontSize: '11px', color: '#6B698A', marginTop: '8px', lineHeight: 1.6, opacity: 0.7 }}>
        At just 1% error per gate, a 100-gate circuit retains only 37% fidelity. At 5% it collapses to near zero.
      </p>
    </div>
  )
}
