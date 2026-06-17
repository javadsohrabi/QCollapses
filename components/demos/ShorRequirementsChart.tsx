'use client'
import { motion } from 'framer-motion'

const data = [
  { label: 'RSA-512',  physical: 3,  logical: '1,500',  color: '#5DCAA5' },
  { label: 'RSA-1024', physical: 6,  logical: '3,000',  color: '#EFC060' },
  { label: 'RSA-2048', physical: 20, logical: '4,000',  color: '#F08080' },
  { label: 'RSA-4096', physical: 40, logical: '8,000',  color: '#DC5050' },
]

const maxPhys = 40

export default function ShorRequirementsChart() {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ backgroundColor: '#0F0F1A', borderRadius: '8px', padding: '16px', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#9492B0', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Physical qubits needed to break RSA (Gidney and Ekera, 2021)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.map((d, i) => (
            <div key={d.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: d.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {d.label}
                </span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9492B0', fontFamily: "'JetBrains Mono', monospace" }}>
                    {d.logical} logical
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: d.color, fontFamily: "'JetBrains Mono', monospace", minWidth: '36px', textAlign: 'right' }}>
                    {d.physical}M
                  </span>
                </div>
              </div>
              <div style={{ height: '24px', backgroundColor: '#0A0A14', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: (d.physical / maxPhys * 100) + '%' }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%', borderRadius: '6px', backgroundColor: d.color, opacity: 0.85 }}
                />
              </div>
            </div>
          ))}

          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#7C72DD', fontFamily: "'JetBrains Mono', monospace" }}>
                Current best hardware
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#7C72DD', fontFamily: "'JetBrains Mono', monospace" }}>
                ~127 qubits
              </span>
            </div>
            <div style={{ height: '24px', backgroundColor: '#0A0A14', borderRadius: '6px', overflow: 'hidden', position: 'relative', border: '1px dashed rgba(124,114,221,0.4)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '0.3%' }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{ height: '100%', borderRadius: '6px', backgroundColor: '#7C72DD', opacity: 0.9 }}
              />
              <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#9D96E8', fontFamily: "'JetBrains Mono', monospace" }}>
                barely visible on this scale
              </span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#9492B0', lineHeight: 1.6, opacity: 0.8 }}>
        Breaking RSA-2048 requires ~20 million physical qubits running for 8 hours. Current best hardware has 127. The gap is not closing fast enough to be a near-term threat — but post-quantum cryptography standards are already being deployed.
      </p>
    </div>
  )
}
