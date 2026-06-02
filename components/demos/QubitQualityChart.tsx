'use client'
import { motion } from 'framer-motion'

const devices = [
  { name: 'IBM Eagle',     qubits: 127,  qv: 64,   t1: 300, t2: 200, gate2: 0.9955, label: 'IBM 2021'  },
  { name: 'IBM Heron',     qubits: 133,  qv: 256,  t1: 350, t2: 250, gate2: 0.9980, label: 'IBM 2023'  },
  { name: 'Google Sycamore', qubits: 53, qv: 32,   t1: 160, t2: 120, gate2: 0.9945, label: 'Google 2019'},
  { name: 'Google Willow', qubits: 105,  qv: 256,  t1: 400, t2: 280, gate2: 0.9985, label: 'Google 2024'},
  { name: 'IonQ Aria',     qubits: 25,   qv: 1024, t1: 100000, t2: 50000, gate2: 0.9990, label: 'IonQ 2023'},
]

const maxQV = 1024

export default function QubitQualityChart() {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ backgroundColor: '#0F0F1A', borderRadius: '8px', padding: '16px', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#6B698A', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Qubit count vs quantum volume across real devices
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {devices.map((d, i) => (
            <div key={d.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#E2E0FF', fontWeight: 500 }}>{d.name}</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#6B698A', fontFamily: "'JetBrains Mono', monospace" }}>{d.qubits} qubits</span>
                  <span style={{ fontSize: '10px', color: '#9D96E8', fontFamily: "'JetBrains Mono', monospace" }}>QV={d.qv}</span>
                  <span style={{ fontSize: '10px', color: '#5DCAA5', fontFamily: "'JetBrains Mono', monospace" }}>{((1 - d.gate2) * 100).toFixed(2)}% 2Q err</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <div>
                  <p style={{ fontSize: '9px', color: '#6B698A', marginBottom: '3px' }}>Qubits (raw count)</p>
                  <div style={{ height: '16px', backgroundColor: '#0A0A14', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (d.qubits / 133 * 100) + '%' }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      style={{ height: '100%', backgroundColor: '#3D3875', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: '#9D96E8', marginBottom: '3px' }}>Quantum Volume (quality)</p>
                  <div style={{ height: '16px', backgroundColor: '#0A0A14', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (d.qv / maxQV * 100) + '%' }}
                      transition={{ duration: 0.6, delay: i * 0.1 + 0.05 }}
                      style={{ height: '100%', backgroundColor: '#7C72DD', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#0A0A14', border: '1px solid #1C1C2E' }}>
          <p style={{ fontSize: '11px', color: '#6B698A', lineHeight: 1.6 }}>
            <span style={{ color: '#9D96E8', fontWeight: 500 }}>Key insight: </span>
            IonQ Aria has only 25 qubits but Quantum Volume 1024 — the highest shown. IBM Eagle has 127 qubits but QV 64. Raw qubit count and actual computational power are nearly uncorrelated across technologies.
          </p>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#6B698A', lineHeight: 1.6, opacity: 0.8 }}>
        Quantum Volume (Cross et al., IBM 2019) combines qubit count, connectivity, gate fidelity, and coherence time into a single metric. A device doubles its QV when all four improve simultaneously — much harder than just adding qubits.
      </p>
    </div>
  )
}
