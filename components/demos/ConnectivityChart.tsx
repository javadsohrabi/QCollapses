'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const topologies = [
  {
    id: 'full',
    label: 'Ideal (fully connected)',
    desc: 'Every qubit can interact with every other. Circuit compiles directly with no overhead.',
    color: '#1D9E75',
    qubits: [
      { id: 0, x: 50,  y: 15  },
      { id: 1, x: 85,  y: 38  },
      { id: 2, x: 72,  y: 80  },
      { id: 3, x: 28,  y: 80  },
      { id: 4, x: 15,  y: 38  },
    ],
    edges: [[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]],
  },
  {
    id: 'heavy-hex',
    label: 'IBM Heavy-Hex',
    desc: 'Most qubits have 2 neighbors, junction qubits have 3. No qubit has 4 connections — chosen to reduce crosstalk and improve gate fidelity.',
    color: '#7C72DD',
    qubits: [
      { id: 0,  x: 10, y: 15 },
      { id: 1,  x: 30, y: 15 },
      { id: 2,  x: 50, y: 15 },
      { id: 3,  x: 70, y: 15 },
      { id: 4,  x: 90, y: 15 },
      { id: 5,  x: 20, y: 40 },
      { id: 6,  x: 60, y: 40 },
      { id: 7,  x: 10, y: 65 },
      { id: 8,  x: 30, y: 65 },
      { id: 9,  x: 50, y: 65 },
      { id: 10, x: 70, y: 65 },
      { id: 11, x: 90, y: 65 },
      { id: 12, x: 40, y: 90 },
      { id: 13, x: 80, y: 90 },
    ],
    edges: [
      [0,1],[1,2],[2,3],[3,4],
      [1,5],[5,8],
      [3,6],[6,10],
      [7,8],[8,9],[9,10],[10,11],
      [8,12],[10,13],
    ],
  },
  {
    id: 'grid',
    label: 'Google 2D Grid',
    desc: 'Qubits arranged in a 2D lattice. Each connects to up to 4 neighbors. Better connectivity than heavy-hex but still requires routing.',
    color: '#EF9F27',
    qubits: [
      { id: 0,  x: 20, y: 20 }, { id: 1,  x: 50, y: 20 }, { id: 2,  x: 80, y: 20 },
      { id: 3,  x: 20, y: 50 }, { id: 4,  x: 50, y: 50 }, { id: 5,  x: 80, y: 50 },
      { id: 6,  x: 20, y: 80 }, { id: 7,  x: 50, y: 80 }, { id: 8,  x: 80, y: 80 },
    ],
    edges: [[0,1],[1,2],[3,4],[4,5],[6,7],[7,8],[0,3],[3,6],[1,4],[4,7],[2,5],[5,8]],
  },
]

function TopologyGraph({ topology, active }: { topology: typeof topologies[0]; active: boolean }) {
  const W = 200, H = 120
  const scale = (v: number, max: number, dim: number) => (v / 100) * dim

  return (
    <div style={{
      border: '1px solid ' + (active ? topology.color : '#1C1C2E'),
      borderRadius: '10px', padding: '12px',
      backgroundColor: active ? topology.color + '08' : '#0F0F1A',
      transition: 'all 0.2s',
      cursor: 'default',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 500, color: active ? topology.color : '#6B698A', marginBottom: '8px', letterSpacing: '0.04em' }}>
        {topology.label}
      </p>
      <svg width={W} height={H} viewBox={'0 0 ' + W + ' ' + H} style={{ display: 'block', margin: '0 auto' }}>
        {topology.edges.map(([a, b], i) => {
          const qa = topology.qubits[a], qb = topology.qubits[b]
          return (
            <line key={i}
              x1={scale(qa.x, 100, W)} y1={scale(qa.y, 100, H)}
              x2={scale(qb.x, 100, W)} y2={scale(qb.y, 100, H)}
              stroke={active ? topology.color : '#2A2A3E'} strokeWidth="1.5" opacity="0.6"
            />
          )
        })}
        {topology.qubits.map(q => (
          <circle key={q.id}
            cx={scale(q.x, 100, W)} cy={scale(q.y, 100, H)} r="5"
            fill={active ? topology.color : '#3D3875'}
            stroke={active ? '#E2E0FF' : '#6B698A'} strokeWidth="1"
          />
        ))}
      </svg>
      <p style={{ fontSize: '10px', color: '#6B698A', marginTop: '8px', lineHeight: 1.5 }}>
        {topology.desc}
      </p>
    </div>
  )
}

export default function ConnectivityChart() {
  const [active, setActive] = useState('heavy-hex')

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ backgroundColor: '#0F0F1A', borderRadius: '8px', padding: '16px', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#6B698A', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Hardware topology comparison — click each to explore
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {topologies.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              style={{
                padding: '5px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer',
                border: '1px solid ' + (active === t.id ? t.color : '#1C1C2E'),
                backgroundColor: active === t.id ? t.color + '15' : 'transparent',
                color: active === t.id ? t.color : '#6B698A',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {topologies.map(t => (
            <TopologyGraph key={t.id} topology={t} active={active === t.id} />
          ))}
        </div>

        <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#0A0A14', border: '1px solid #1C1C2E' }}>
          <p style={{ fontSize: '11px', color: '#6B698A', lineHeight: 1.6 }}>
            <span style={{ color: '#9D96E8', fontWeight: 500 }}>Routing overhead: </span>
            A SWAP gate requires 3 CNOT gates and introduces 3x the noise of a single two-qubit gate. On IBM heavy-hex, typical circuits require 2-5x more gates after compilation than the abstract circuit shows.
          </p>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#6B698A', lineHeight: 1.6, opacity: 0.8 }}>
        Real quantum chips have fixed wiring. A circuit diagram showing a CNOT between any two qubits is an abstraction — the compiler must route the operation through the physical topology, often inserting many extra gates.
      </p>
    </div>
  )
}
