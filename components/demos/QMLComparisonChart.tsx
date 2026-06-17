'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function QMLComparisonChart() {
  const [active, setActive] = useState<'structured' | 'random'>('structured')

  const data = {
    structured: {
      label: 'Structured quantum dataset',
      quantum: [62, 71, 78, 84, 89, 91],
      classical: [58, 63, 66, 68, 69, 70],
      note: 'On data with genuine quantum structure, quantum kernels can outperform classical ones.',
    },
    random: {
      label: 'Random classical dataset',
      quantum: [51, 55, 57, 58, 59, 60],
      classical: [54, 62, 70, 76, 81, 85],
      note: 'On typical classical data, classical ML matches or exceeds quantum models. Huang et al. (2021) showed classical kernels can be constructed to match quantum ones.',
    },
  }

  const d = data[active]
  const sizes = ['10', '50', '200', '500', '1k', '5k']
  const maxVal = 100
  const H = 160

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {(['structured', 'random'] as const).map(k => (
          <button key={k} onClick={() => setActive(k)}
            style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', border: '1px solid ' + (active === k ? '#7C72DD' : '#1C1C2E'), backgroundColor: active === k ? 'rgba(124,114,221,0.12)' : 'transparent', color: active === k ? '#9D96E8' : '#9492B0', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            {k === 'structured' ? 'Quantum data' : 'Classical data'}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#0F0F1A', borderRadius: '8px', padding: '16px', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#9492B0', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {d.label} — accuracy vs training size
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Quantum kernel', values: d.quantum, color: '#7C72DD' },
            { label: 'Classical kernel', values: d.classical, color: '#1D9E75' },
          ].map(({ label, values, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: color }}>{label}</span>
                <span style={{ fontSize: '11px', color: '#9492B0' }}>{values[values.length - 1]}%</span>
              </div>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '40px' }}>
                {values.map((v, i) => (
                  <motion.div key={i}
                    initial={{ height: 0 }}
                    animate={{ height: (v / maxVal) * 40 + 'px' }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    style={{ flex: 1, backgroundColor: color, borderRadius: '3px 3px 0 0', opacity: 0.7 + i * 0.05 }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {sizes.map(s => (
                  <div key={s} style={{ flex: 1, fontSize: '9px', color: '#9492B0', textAlign: 'center', marginTop: '3px', fontFamily: 'monospace' }}>{s}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: '11px', color: '#9492B0', lineHeight: 1.6, opacity: 0.8 }}>
        {d.note}
      </p>
    </div>
  )
}
