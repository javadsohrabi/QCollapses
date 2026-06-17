'use client'
import { motion } from 'framer-motion'

const devices = [
  { name: 'IBM Eagle (2021)',        qubits: 127,  qv: 64,        color: '#7C72DD' },
  { name: 'IBM Heron (2023)',        qubits: 133,  qv: 256,       color: '#9D96E8' },
  { name: 'Google Sycamore (2019)', qubits: 53,   qv: 32,        color: '#EF9F27' },
  { name: 'Google Willow (2024)',   qubits: 105,  qv: 512,       color: '#EFC060' },
  { name: 'IonQ Aria (2023)',       qubits: 25,   qv: 1024,      color: '#1D9E75' },
  { name: 'Quantinuum H2 (2023)',   qubits: 32,   qv: 1048576,   color: '#5DCAA5' },
]

const maxQV = 1048576

export default function QuantumVolumeChart() {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ backgroundColor: '#0F0F1A', borderRadius: '8px', padding: '16px', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#9492B0', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Quantum volume (log scale) vs raw qubit count
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {devices.map((d, i) => {
            const logQV  = Math.log2(d.qv)
            const maxLog = Math.log2(maxQV)
            const pct    = (logQV / maxLog) * 100
            return (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#E2E0FF', fontWeight: 500 }}>{d.name}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#9492B0', fontFamily: "'JetBrains Mono', monospace" }}>{d.qubits} qubits</span>
                    <span style={{ fontSize: '10px', color: d.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                      QV = {d.qv >= 1000000 ? (d.qv / 1000000).toFixed(1) + 'M' : d.qv >= 1000 ? (d.qv / 1000).toFixed(0) + 'k' : d.qv}
                    </span>
                  </div>
                </div>
                <div style={{ height: '20px', backgroundColor: '#0A0A14', borderRadius: '6px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: pct + '%' }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', backgroundColor: d.color, borderRadius: '6px', opacity: 0.85 }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#0A0A14', border: '1px solid #1C1C2E' }}>
          <p style={{ fontSize: '11px', color: '#9492B0', lineHeight: 1.6 }}>
            <span style={{ color: '#5DCAA5', fontWeight: 500 }}>Key insight: </span>
            Quantinuum H2 has 32 qubits but QV over 1 million — the highest ever recorded. IBM Eagle has 127 qubits but QV 64. The bars use a logarithmic scale — each step doubles the QV. Qubit count and quantum volume are nearly uncorrelated.
          </p>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: '#9492B0', lineHeight: 1.6, opacity: 0.8 }}>
        Quantum Volume was defined by Cross et al. (IBM, 2019) as a single number measuring the largest random square circuit a device can execute reliably. It combines qubit count, connectivity, gate fidelity, and coherence time. Bars use log base-2 scale.
      </p>
    </div>
  )
}
