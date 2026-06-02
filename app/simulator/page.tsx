'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COL = {
  purple:  '#7C72DD',
  purpleB: '#9D96E8',
  dim:     '#3D3875',
  muted:   '#6B698A',
  text:    '#E2E0FF',
  bg:      '#09090F',
  surface: '#0F0F1A',
  border:  '#1C1C2E',
  teal:    '#1D9E75',
  amber:   '#EFC060',
  red:     '#F08080',
}

const STEPS = 10

type GateName = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'CNOT' | 'SWAP' | 'CCX' | 'Rx' | 'Ry' | 'Rz' | 'M'
type CellRole = 'single' | 'ctrl' | 'ctrl2' | 'tgt' | 'q1' | 'q2' | 'measure'

interface Cell {
  type:      GateName
  role?:     CellRole
  partner?:  number
  partner2?: number
  angle?:    number
}

type Circuit = (Cell | null)[][]

const GATE_INFO: Record<GateName, { bg: string; fg: string; border: string; desc: string }> = {
  H:    { bg: 'rgba(124,114,221,0.15)', fg: '#B8B3F0', border: 'rgba(124,114,221,0.4)',  desc: 'Hadamard - creates superposition'         },
  X:    { bg: 'rgba(29,158,117,0.15)',  fg: '#5DCAA5', border: 'rgba(29,158,117,0.4)',   desc: 'Pauli-X - bit flip (quantum NOT)'         },
  Y:    { bg: 'rgba(239,100,100,0.12)', fg: '#F08080', border: 'rgba(239,100,100,0.3)',  desc: 'Pauli-Y - bit and phase flip'             },
  Z:    { bg: 'rgba(239,159,39,0.15)',  fg: '#EFC060', border: 'rgba(239,159,39,0.4)',   desc: 'Pauli-Z - phase flip'                    },
  S:    { bg: 'rgba(93,202,165,0.12)',  fg: '#5DCAA5', border: 'rgba(93,202,165,0.35)',  desc: 'S gate - 90 degree phase shift'          },
  T:    { bg: 'rgba(184,179,240,0.12)', fg: '#C8C4FF', border: 'rgba(184,179,240,0.35)', desc: 'T gate - 45 degree phase shift'          },
  CNOT: { bg: 'rgba(220,80,120,0.12)',  fg: '#E890B0', border: 'rgba(220,80,120,0.35)',  desc: 'Controlled-NOT - entangles two qubits'   },
  SWAP: { bg: 'rgba(80,180,220,0.12)',  fg: '#80C8E8', border: 'rgba(80,180,220,0.35)',  desc: 'SWAP - exchanges two qubit states'       },
  CCX:  { bg: 'rgba(239,159,39,0.12)',  fg: '#EFC060', border: 'rgba(239,159,39,0.35)',  desc: 'Toffoli - controlled-controlled-NOT'     },
  Rx:   { bg: 'rgba(93,202,165,0.12)',  fg: '#5DCAA5', border: 'rgba(93,202,165,0.35)',  desc: 'Rx - X-axis rotation by angle theta'     },
  Ry:   { bg: 'rgba(93,202,165,0.12)',  fg: '#5DCAA5', border: 'rgba(93,202,165,0.35)',  desc: 'Ry - Y-axis rotation by angle theta'     },
  Rz:   { bg: 'rgba(93,202,165,0.12)',  fg: '#5DCAA5', border: 'rgba(93,202,165,0.35)',  desc: 'Rz - Z-axis rotation by angle theta'     },
  M:    { bg: 'rgba(240,128,128,0.12)', fg: '#F08080', border: 'rgba(240,128,128,0.35)', desc: 'Measure - collapses qubit to 0 or 1'     },
}

const TWO_QUBIT   = new Set<GateName>(['CNOT', 'SWAP'])
const THREE_QUBIT = new Set<GateName>(['CCX'])
const ROTATION    = new Set<GateName>(['Rx', 'Ry', 'Rz'])

type Cx = { re: number; im: number }
const C0    = (re: number, im = 0): Cx => ({ re, im })
const cadd  = (a: Cx, b: Cx): Cx => ({ re: a.re + b.re, im: a.im + b.im })
const cmul  = (a: Cx, b: Cx): Cx => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
const cabs2 = (a: Cx) => a.re * a.re + a.im * a.im
const cfmt  = (a: Cx) => {
  const r = Math.abs(a.re) < 1e-9 ? 0 : +a.re.toFixed(3)
  const i = Math.abs(a.im) < 1e-9 ? 0 : +a.im.toFixed(3)
  if (i === 0) return r.toFixed(3)
  if (r === 0) return (i < 0 ? '-' : '') + Math.abs(i).toFixed(3) + 'i'
  return r.toFixed(3) + (i >= 0 ? '+' : '') + i.toFixed(3) + 'i'
}

const S2 = Math.SQRT2
const MATS: Record<string, Cx[][]> = {
  H: [[C0(1/S2), C0(1/S2)],  [C0(1/S2),  C0(-1/S2)]],
  X: [[C0(0),    C0(1)],      [C0(1),     C0(0)]],
  Y: [[C0(0),    C0(0,-1)],   [C0(0,1),   C0(0)]],
  Z: [[C0(1),    C0(0)],      [C0(0),     C0(-1)]],
  S: [[C0(1),    C0(0)],      [C0(0),     C0(0,1)]],
  T: [[C0(1),    C0(0)],      [C0(0),     C0(Math.cos(Math.PI/4), Math.sin(Math.PI/4))]],
}

const rxMat = (a: number): Cx[][] => [[C0(Math.cos(a/2)), C0(0,-Math.sin(a/2))], [C0(0,-Math.sin(a/2)), C0(Math.cos(a/2))]]
const ryMat = (a: number): Cx[][] => [[C0(Math.cos(a/2)), C0(-Math.sin(a/2))],   [C0(Math.sin(a/2)),    C0(Math.cos(a/2))]]
const rzMat = (a: number): Cx[][] => [[C0(Math.cos(a/2),-Math.sin(a/2)), C0(0)], [C0(0), C0(Math.cos(a/2), Math.sin(a/2))]]

function applySingle(state: Cx[], mat: Cx[][], q: number, n: number): Cx[] {
  const res = [...state]
  for (let i = 0; i < (1 << n); i++) {
    if (!((i >> (n-1-q)) & 1)) {
      const j = i | (1 << (n-1-q))
      res[i] = cadd(cmul(mat[0][0], state[i]), cmul(mat[0][1], state[j]))
      res[j] = cadd(cmul(mat[1][0], state[i]), cmul(mat[1][1], state[j]))
    }
  }
  return res
}

function applyCNOT(state: Cx[], ctrl: number, tgt: number, n: number): Cx[] {
  const res = new Array(1 << n)
  for (let i = 0; i < (1 << n); i++)
    res[((i >> (n-1-ctrl)) & 1) ? i ^ (1 << (n-1-tgt)) : i] = state[i]
  return res
}

function applySWAP(state: Cx[], q1: number, q2: number, n: number): Cx[] {
  const res = new Array(1 << n)
  for (let i = 0; i < (1 << n); i++) {
    const b1 = (i >> (n-1-q1)) & 1
    const b2 = (i >> (n-1-q2)) & 1
    res[b1 !== b2 ? i ^ (1 << (n-1-q1)) ^ (1 << (n-1-q2)) : i] = state[i]
  }
  return res
}

function applyToffoli(state: Cx[], c1: number, c2: number, tgt: number, n: number): Cx[] {
  const res = [...state]
  for (let i = 0; i < (1 << n); i++) {
    const b1 = (i >> (n-1-c1)) & 1
    const b2 = (i >> (n-1-c2)) & 1
    if (b1 && b2) {
      const j = i ^ (1 << (n-1-tgt))
      if (i < j) { const tmp = res[i]; res[i] = res[j]; res[j] = tmp }
    }
  }
  return res
}

function applyMeasure(state: Cx[], q: number, n: number): Cx[] {
  const p1 = state.reduce((sum, amp, i) => sum + ((i >> (n-1-q)) & 1 ? cabs2(amp) : 0), 0)
  const outcome = Math.random() < p1 ? 1 : 0
  const res = state.map((amp, i) => {
    const bit = (i >> (n-1-q)) & 1
    if (bit !== outcome) return C0(0)
    const norm = outcome === 1 ? Math.sqrt(p1) : Math.sqrt(1 - p1)
    return norm > 1e-12 ? C0(amp.re / norm, amp.im / norm) : C0(0)
  })
  return res
}

function applyDepolarizing(state: Cx[], q: number, n: number, p: number): Cx[] {
  if (p <= 0) return state
  const r = Math.random()
  if (r < p / 3)       return applySingle(state, MATS.X, q, n)
  if (r < 2 * p / 3)   return applySingle(state, MATS.Y, q, n)
  if (r < p)            return applySingle(state, MATS.Z, q, n)
  return state
}

function simulate(circ: Circuit, n: number, noise: number): Cx[] {
  let state = Array.from({ length: 1 << n }, (_, i) => C0(i === 0 ? 1 : 0))
  for (let t = 0; t < circ.length; t++) {
    const done = new Set<number>()
    for (let q = 0; q < n; q++) {
      if (done.has(q)) continue
      const cell = circ[t][q]
      if (!cell) continue
      if (cell.type === 'M' && cell.role === 'measure') {
        state = applyMeasure(state, q, n)
        done.add(q)
      } else if (cell.type === 'CNOT' && cell.role === 'ctrl' && cell.partner !== undefined) {
        state = applyCNOT(state, q, cell.partner, n)
        if (noise > 0) { state = applyDepolarizing(state, q, n, noise); state = applyDepolarizing(state, cell.partner, n, noise) }
        done.add(q); done.add(cell.partner)
      } else if (cell.type === 'SWAP' && cell.role === 'q1' && cell.partner !== undefined) {
        state = applySWAP(state, q, cell.partner, n)
        if (noise > 0) { state = applyDepolarizing(state, q, n, noise); state = applyDepolarizing(state, cell.partner, n, noise) }
        done.add(q); done.add(cell.partner)
      } else if (cell.type === 'CCX' && cell.role === 'ctrl' && cell.partner !== undefined && cell.partner2 !== undefined) {
        state = applyToffoli(state, q, cell.partner, cell.partner2, n)
        if (noise > 0) { [q, cell.partner, cell.partner2].forEach(qb => { state = applyDepolarizing(state, qb, n, noise) }) }
        done.add(q); done.add(cell.partner); done.add(cell.partner2)
      } else if (ROTATION.has(cell.type) && cell.angle !== undefined) {
        const mat = cell.type === 'Rx' ? rxMat(cell.angle) : cell.type === 'Ry' ? ryMat(cell.angle) : rzMat(cell.angle)
        state = applySingle(state, mat, q, n)
        if (noise > 0) state = applyDepolarizing(state, q, n, noise)
        done.add(q)
      } else if (MATS[cell.type]) {
        state = applySingle(state, MATS[cell.type], q, n)
        if (noise > 0) state = applyDepolarizing(state, q, n, noise)
        done.add(q)
      }
    }
  }
  return state
}

function sampleShots(probs: number[], shots: number): number[] {
  const counts = new Array(probs.length).fill(0)
  for (let i = 0; i < shots; i++) {
    let r = Math.random(), acc = 0
    for (let j = 0; j < probs.length; j++) {
      acc += probs[j]
      if (r < acc) { counts[j]++; break }
    }
  }
  return counts
}

function computeMetrics(circ: Circuit, n: number) {
  let single = 0, twoQ = 0, threeQ = 0, measurements = 0, depth = 0
  const qubitDepth = new Array(n).fill(0)
  const gateDistrib: Record<string, number> = {}
  for (let t = 0; t < circ.length; t++) {
    let colUsed = false
    for (let q = 0; q < n; q++) {
      const cell = circ[t][q]
      if (!cell) continue
      if (cell.role === 'tgt' || cell.role === 'q2' || cell.role === 'ctrl2') continue
      colUsed = true
      gateDistrib[cell.type] = (gateDistrib[cell.type] || 0) + 1
      if (cell.type === 'M') { measurements++; qubitDepth[q]++ }
      else if (TWO_QUBIT.has(cell.type)) {
        twoQ++
        const maxD = Math.max(qubitDepth[q], cell.partner !== undefined ? qubitDepth[cell.partner] : 0) + 1
        qubitDepth[q] = maxD
        if (cell.partner !== undefined) qubitDepth[cell.partner] = maxD
      } else if (THREE_QUBIT.has(cell.type)) {
        threeQ++
        const partners = [q, cell.partner ?? q, cell.partner2 ?? q]
        const maxD = Math.max(...partners.map(p => qubitDepth[p])) + 1
        partners.forEach(p => { qubitDepth[p] = maxD })
      } else {
        single++
        qubitDepth[q]++
      }
    }
    if (colUsed) depth = Math.max(depth, ...qubitDepth)
  }
  const totalGates = single + twoQ + threeQ
  return { totalGates, single, twoQ, threeQ, measurements, depth, qubitDepth, gateDistrib }
}

function optimizeCircuit(circ: Circuit, n: number): { circuit: Circuit; changes: string[] } {
  const nc = circ.map(col => col.map(cell => cell ? { ...cell } : null)) as Circuit
  const changes: string[] = []
  const selfInverse = new Set(['H', 'X', 'Y', 'Z', 'CNOT', 'SWAP'])
  let changed = true
  let passes = 0
  while (changed && passes < 10) {
    changed = false
    passes++
    for (let q = 0; q < n; q++) {
      for (let t = 0; t < STEPS - 1; t++) {
        const a = nc[t][q]
        const b = nc[t+1][q]
        if (!a || !b) continue
        if (a.role !== 'single' && a.role !== 'ctrl') continue
        if (b.role !== 'single' && b.role !== 'ctrl') continue
        if (a.type === b.type && selfInverse.has(a.type)) {
          if (a.type === 'CNOT' && a.partner === b.partner) {
            nc[t][q] = null
            nc[t+1][q] = null
            if (a.partner !== undefined) { nc[t][a.partner] = null; nc[t+1][a.partner] = null }
            changes.push('Cancelled CNOT pair on q' + q + ', q' + a.partner)
            changed = true
          } else if (a.role === 'single') {
            nc[t][q] = null
            nc[t+1][q] = null
            changes.push('Cancelled ' + a.type + ' pair on q' + q)
            changed = true
          }
        }
        if (a.type === 'S' && b.type === 'S') {
          nc[t][q] = { type: 'Z', role: 'single' }
          nc[t+1][q] = null
          changes.push('Merged S+S into Z on q' + q)
          changed = true
        }
        if (a.type === 'T' && b.type === 'T') {
          nc[t][q] = { type: 'S', role: 'single' }
          nc[t+1][q] = null
          changes.push('Merged T+T into S on q' + q)
          changed = true
        }
      }
    }
  }
  return { circuit: nc, changes }
}

const mkCirc = (): Circuit => Array.from({ length: STEPS }, () => Array(4).fill(null))

const PRESETS: Record<string, { label: string; desc: string; n: number; build: () => Circuit }> = {
  bell: {
    label: 'Bell state',
    desc:  'Maximum entanglement. 50% |00> and 50% |11>.',
    n: 2,
    build: () => {
      const c = mkCirc()
      c[0][0] = { type: 'H',    role: 'single'            }
      c[1][0] = { type: 'CNOT', role: 'ctrl', partner: 1  }
      c[1][1] = { type: 'CNOT', role: 'tgt',  partner: 0  }
      return c
    },
  },
  ghz: {
    label: 'GHZ state',
    desc:  '3-qubit entanglement. Exactly 50% |000> and 50% |111>.',
    n: 3,
    build: () => {
      const c = mkCirc()
      c[0][0] = { type: 'H',    role: 'single'           }
      c[1][0] = { type: 'CNOT', role: 'ctrl', partner: 1 }
      c[1][1] = { type: 'CNOT', role: 'tgt',  partner: 0 }
      c[2][0] = { type: 'CNOT', role: 'ctrl', partner: 2 }
      c[2][2] = { type: 'CNOT', role: 'tgt',  partner: 0 }
      return c
    },
  },
  interference: {
    label: 'Interference',
    desc:  'H-Z-H = X. Interference cancels |0> amplitude completely, forcing |1> with 100% probability.',
    n: 2,
    build: () => {
      const c = mkCirc()
      c[0][0] = { type: 'H', role: 'single' }
      c[0][1] = { type: 'H', role: 'single' }
      c[1][0] = { type: 'Z', role: 'single' }
      c[1][1] = { type: 'Z', role: 'single' }
      c[2][0] = { type: 'H', role: 'single' }
      c[2][1] = { type: 'H', role: 'single' }
      return c
    },
  },
  grover: {
    label: 'Grover 2q',
    desc:  'Grover search on 2 qubits. Amplitude amplification finds |11> with high probability.',
    n: 2,
    build: () => {
      const c = mkCirc()
      c[0][0] = { type: 'H',    role: 'single'           }
      c[0][1] = { type: 'H',    role: 'single'           }
      c[1][0] = { type: 'CNOT', role: 'ctrl', partner: 1 }
      c[1][1] = { type: 'CNOT', role: 'tgt',  partner: 0 }
      c[2][0] = { type: 'H',    role: 'single'           }
      c[2][1] = { type: 'H',    role: 'single'           }
      c[3][0] = { type: 'X',    role: 'single'           }
      c[3][1] = { type: 'X',    role: 'single'           }
      c[4][0] = { type: 'H',    role: 'single'           }
      c[5][0] = { type: 'CNOT', role: 'ctrl', partner: 1 }
      c[5][1] = { type: 'CNOT', role: 'tgt',  partner: 0 }
      c[6][0] = { type: 'H',    role: 'single'           }
      c[7][0] = { type: 'X',    role: 'single'           }
      c[7][1] = { type: 'X',    role: 'single'           }
      return c
    },
  },
  measure_demo: {
    label: 'Measure demo',
    desc:  'Shows mid-circuit measurement. H puts qubit in superposition, M collapses it, then X flips the result.',
    n: 2,
    build: () => {
      const c = mkCirc()
      c[0][0] = { type: 'H', role: 'single'  }
      c[0][1] = { type: 'H', role: 'single'  }
      c[1][0] = { type: 'M', role: 'measure' }
      c[2][0] = { type: 'X', role: 'single'  }
      c[3][1] = { type: 'M', role: 'measure' }
      return c
    },
  },
}

function GateBox({ cell }: { cell: Cell }) {
  const g = GATE_INFO[cell.type]
  if (cell.type === 'M') return (
    <div style={{ width: 36, height: 36, borderRadius: '7px', backgroundColor: g.bg, border: '1px solid ' + g.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1px' }}>
      <svg width='18' height='14' viewBox='0 0 18 14'>
        <path d='M1 13 Q9 1 17 13' fill='none' stroke={g.fg} strokeWidth='1.6' strokeLinecap='round'/>
        <line x1='9' y1='13' x2='14' y2='7' stroke={g.fg} strokeWidth='1.4' strokeLinecap='round'/>
      </svg>
      <span style={{ fontSize: '7px', color: g.fg, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>M</span>
    </div>
  )
  if (cell.role === 'ctrl' || cell.role === 'ctrl2') return (
    <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: g.fg }} />
  )
  if (cell.role === 'tgt') return (
    <svg width={28} height={28} viewBox='0 0 28 28'>
      <circle cx='14' cy='14' r='10' fill='none' stroke={g.fg} strokeWidth='1.8'/>
      <line x1='14' y1='4'  x2='14' y2='24' stroke={g.fg} strokeWidth='1.8'/>
      <line x1='4'  y1='14' x2='24' y2='14' stroke={g.fg} strokeWidth='1.8'/>
    </svg>
  )
  if (cell.role === 'q1' || cell.role === 'q2') return (
    <svg width={22} height={22} viewBox='0 0 22 22'>
      <line x1='3' y1='3' x2='19' y2='19' stroke={g.fg} strokeWidth='2.2' strokeLinecap='round'/>
      <line x1='19' y1='3' x2='3' y2='19' stroke={g.fg} strokeWidth='2.2' strokeLinecap='round'/>
    </svg>
  )
  const label = ROTATION.has(cell.type) && cell.angle !== undefined
    ? cell.type + '(' + (cell.angle / Math.PI).toFixed(1) + 'p)'
    : cell.type
  return (
    <div style={{ width: 36, height: 36, borderRadius: '7px', backgroundColor: g.bg, border: '1px solid ' + g.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ROTATION.has(cell.type) ? '9px' : '12px', fontWeight: 600, color: g.fg, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', padding: '2px' }}>
      {label}
    </div>
  )
}

function MetricsPanel({ circ, n }: { circ: Circuit; n: number }) {
  const m = useMemo(() => computeMetrics(circ, n), [circ, n])
  const items = [
    { label: 'Total gates',    value: m.totalGates,    color: COL.purpleB },
    { label: 'Single-qubit',   value: m.single,        color: COL.teal    },
    { label: 'Two-qubit',      value: m.twoQ,          color: '#E890B0'   },
    { label: 'Three-qubit',    value: m.threeQ,        color: COL.amber   },
    { label: 'Measurements',   value: m.measurements,  color: COL.red     },
    { label: 'Circuit depth',  value: m.depth,         color: COL.purpleB },
  ]
  return (
    <div style={{ border: '1px solid ' + COL.border, borderRadius: '12px', overflow: 'hidden', backgroundColor: COL.surface, marginBottom: '20px' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + COL.border, backgroundColor: '#0A0A14', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Circuit metrics</span>
        <span style={{ color: COL.muted, fontSize: '11px', opacity: 0.5 }}>updates live</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1px', backgroundColor: COL.border }}>
        {items.map(item => (
          <div key={item.label} style={{ padding: '14px 16px', backgroundColor: COL.surface }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: item.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>{item.value}</div>
            <div style={{ fontSize: '11px', color: COL.muted, marginTop: '3px' }}>{item.label}</div>
          </div>
        ))}
      </div>
      {m.totalGates > 0 && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid ' + COL.border }}>
          <div style={{ fontSize: '11px', color: COL.muted, marginBottom: '8px', letterSpacing: '0.06em' }}>GATE DISTRIBUTION</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Object.entries(m.gateDistrib).map(([gate, count]) => (
              <span key={gate} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', backgroundColor: 'rgba(124,114,221,0.1)', border: '1px solid rgba(124,114,221,0.2)', color: COL.purpleB, fontFamily: "'JetBrains Mono', monospace" }}>
                {gate} x{count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CircuitGrid({
  circ, nQ, onCell, pending, label
}: {
  circ: Circuit
  nQ: number
  onCell?: (s: number, q: number) => void
  pending?: { s: number; q: number; second?: number } | null
  label?: string
}) {
  const getConnectors = () => {
    const lines: { s: number; q1: number; q2: number; color: string }[] = []
    for (let s = 0; s < STEPS; s++) {
      for (let q = 0; q < nQ; q++) {
        const cell = circ[s][q]
        if (!cell) continue
        if (cell.type === 'CNOT' && cell.role === 'ctrl' && cell.partner !== undefined && cell.partner > q)
          lines.push({ s, q1: q, q2: cell.partner, color: '#E890B0' })
        if (cell.type === 'SWAP' && cell.role === 'q1' && cell.partner !== undefined && cell.partner > q)
          lines.push({ s, q1: q, q2: cell.partner, color: '#80C8E8' })
        if (cell.type === 'CCX' && cell.role === 'ctrl' && cell.partner !== undefined && cell.partner2 !== undefined)
          lines.push({ s, q1: Math.min(q, cell.partner, cell.partner2), q2: Math.max(q, cell.partner, cell.partner2), color: '#EFC060' })
      }
    }
    return lines
  }
  const connectors = getConnectors()
  const CW = 58, CH = 52, LW = 56
  const interactive = !!onCell
  return (
    <div>
      {label && <p style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ border: '1px solid ' + COL.border, borderRadius: '12px', overflow: 'hidden', backgroundColor: COL.surface, minWidth: LW + STEPS * CW, display: 'inline-block', width: '100%' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid ' + COL.border, backgroundColor: '#0A0A14' }}>
            <div style={{ width: LW, flexShrink: 0 }} />
            {Array.from({ length: STEPS }, (_, s) => (
              <div key={s} style={{ width: CW, flexShrink: 0, height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: COL.muted, opacity: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>t{s}</div>
            ))}
          </div>
          {Array.from({ length: nQ }, (_, q) => (
            <div key={q} style={{ display: 'flex', borderTop: q > 0 ? '1px solid ' + COL.border : 'none' }}>
              <div style={{ width: LW, flexShrink: 0, height: CH, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', gap: '4px', borderRight: '1px solid ' + COL.border, backgroundColor: '#0A0A14' }}>
                <span style={{ color: COL.muted, fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>|0&gt;</span>
                <span style={{ color: COL.text, fontSize: '13px', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>q{q}</span>
              </div>
              {Array.from({ length: STEPS }, (_, s) => {
                const cell      = circ[s][q]
                const isPend    = pending && pending.s === s && (pending.q === q || pending.second === q)
                const connector = connectors.find(l => l.s === s && (l.q1 === q || l.q2 === q))
                const isBetween = connectors.some(l => l.s === s && l.q1 < q && l.q2 > q)
                const connColor = connector?.color ?? connectors.find(l => l.s === s && l.q1 < q && l.q2 > q)?.color ?? COL.purple
                const isMeasureAfter = (() => { for (let t2 = 0; t2 < s; t2++) { if (circ[t2][q]?.type === 'M') return true } return false })()
                return (
                  <div key={s} onClick={() => onCell && onCell(s, q)}
                    style={{ width: CW, flexShrink: 0, height: CH, borderLeft: '1px solid ' + COL.border, position: 'relative', cursor: interactive ? 'pointer' : 'default', backgroundColor: isPend ? 'rgba(124,114,221,0.05)' : isMeasureAfter ? 'rgba(240,128,128,0.03)' : 'transparent', transition: 'background-color 0.1s' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: isMeasureAfter ? 'rgba(240,128,128,0.2)' : COL.border, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    {(connector || isBetween) && (
                      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '2px', top: isBetween ? '0' : (connector && connector.q1 === q ? '50%' : '0'), bottom: isBetween ? '0' : (connector && connector.q2 === q ? '50%' : '0'), backgroundColor: connColor, pointerEvents: 'none', zIndex: 1 }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      {cell && <GateBox cell={cell} />}
                      {isPend && !cell && (
                        <div style={{ width: 34, height: 34, borderRadius: '7px', border: '1.5px dashed ' + COL.purple, backgroundColor: 'rgba(124,114,221,0.08)' }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Simulator() {
  const [nQ, setNQ]           = useState(2)
  const [circ, setCirc]       = useState<Circuit>(mkCirc)
  const [selGate, setSelGate] = useState<GateName>('H')
  const [angle, setAngle]     = useState(Math.PI / 2)
  const [noise, setNoise]     = useState(0)
  const [shots, setShots]     = useState(1024)
  const [pending, setPending] = useState<{ s: number; q: number; second?: number } | null>(null)
  const [result, setResult]   = useState<Cx[] | null>(null)
  const [shotCounts, setShotCounts] = useState<number[] | null>(null)
  const [tab, setTab]         = useState<'probs' | 'shots' | 'state' | 'optimize'>('probs')
  const [hint, setHint]       = useState('Select a gate then click a cell to place it')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [optResult, setOptResult] = useState<{ circuit: Circuit; changes: string[] } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const preset = params.get('preset')
    if (preset && PRESETS[preset]) {
      const p = PRESETS[preset]
      setNQ(p.n)
      setCirc(p.build())
      setActivePreset(preset)
      setHint(p.label + ' loaded from case page — click Simulate to run')
    }
  }, [])

  const removeCell = useCallback((nc: Circuit, s: number, q: number) => {
    const cell = nc[s][q]
    if (!cell) return
    if (cell.partner  !== undefined) nc[s][cell.partner]  = null
    if (cell.partner2 !== undefined) nc[s][cell.partner2] = null
    nc[s][q] = null
  }, [])

  const handleCell = useCallback((s: number, q: number) => {
    if (q >= nQ) return
    const nc = circ.map(r => [...r]) as Circuit

    if (selGate === 'M') {
      const cell = nc[s][q]
      if (cell?.type === 'M') { nc[s][q] = null }
      else { nc[s][q] = { type: 'M', role: 'measure' } }
      setCirc(nc); setResult(null); setActivePreset(null)
      setHint('Measurement placed - qubit collapses here during simulation')
      return
    }

    if (THREE_QUBIT.has(selGate)) {
      if (!pending) {
        removeCell(nc, s, q)
        setPending({ s, q })
        setHint('CCX: click the second control qubit in column t' + s)
        setCirc(nc); return
      }
      if (pending.second === undefined) {
        if (pending.s !== s || q === pending.q) { setPending(null); setHint('Cancelled'); return }
        setPending({ ...pending, second: q })
        setHint('CCX: click the target qubit in column t' + s)
        return
      }
      if (pending.s !== s || q === pending.q || q === pending.second) { setPending(null); setHint('Cancelled'); return }
      const c1 = pending.q, c2 = pending.second, tgt = q
      removeCell(nc, s, c1); removeCell(nc, s, c2); removeCell(nc, s, tgt)
      nc[s][c1]  = { type: 'CCX', role: 'ctrl',  partner: c2,  partner2: tgt }
      nc[s][c2]  = { type: 'CCX', role: 'ctrl2', partner: c1,  partner2: tgt }
      nc[s][tgt] = { type: 'CCX', role: 'tgt',   partner: c1,  partner2: c2  }
      setPending(null); setHint('Toffoli placed')
      setCirc(nc); setResult(null); setActivePreset(null); return
    }

    if (TWO_QUBIT.has(selGate)) {
      if (!pending) {
        const cell = nc[s][q]
        if (cell && (TWO_QUBIT.has(cell.type) || THREE_QUBIT.has(cell.type))) {
          removeCell(nc, s, q); setCirc(nc); setResult(null); setActivePreset(null); return
        }
        setPending({ s, q })
        setHint(selGate + ': click the ' + (selGate === 'CNOT' ? 'target' : 'second') + ' qubit in column t' + s)
        setCirc(nc); return
      }
      if (pending.s !== s || pending.q === q) { setPending(null); setHint('Cancelled'); return }
      const q1 = pending.q, q2 = q
      removeCell(nc, s, q1); removeCell(nc, s, q2)
      if (selGate === 'CNOT') {
        nc[s][q1] = { type: 'CNOT', role: 'ctrl', partner: q2 }
        nc[s][q2] = { type: 'CNOT', role: 'tgt',  partner: q1 }
      } else {
        nc[s][q1] = { type: 'SWAP', role: 'q1', partner: q2 }
        nc[s][q2] = { type: 'SWAP', role: 'q2', partner: q1 }
      }
      setPending(null); setHint(selGate + ' placed')
      setCirc(nc); setResult(null); setActivePreset(null); return
    }

    const cell = nc[s][q]
    if (cell) { removeCell(nc, s, q) }
    else if (ROTATION.has(selGate)) { nc[s][q] = { type: selGate, role: 'single', angle } }
    else { nc[s][q] = { type: selGate, role: 'single' } }
    setHint('Gate placed')
    setCirc(nc); setResult(null); setActivePreset(null)
  }, [circ, nQ, selGate, angle, pending, removeCell])

  const doSimulate = () => {
    const state = simulate(circ, nQ, noise)
    const probs = state.map(cabs2)
    setResult(state)
    setShotCounts(sampleShots(probs, shots))
    setTab('probs')
    setHint('Simulation complete')
  }

  const doOptimize = () => {
    const opt = optimizeCircuit(circ, nQ)
    setOptResult(opt)
    setTab('optimize')
    setHint(opt.changes.length > 0 ? opt.changes.length + ' optimizations applied' : 'No optimizations found for this circuit')
  }

  const doClear = () => {
    setCirc(mkCirc()); setPending(null); setResult(null)
    setShotCounts(null); setOptResult(null)
    setActivePreset(null); setHint('Circuit cleared')
  }

  const loadPreset = (key: string) => {
    const p = PRESETS[key]
    setNQ(p.n); setCirc(p.build()); setPending(null)
    setResult(null); setShotCounts(null); setOptResult(null)
    setActivePreset(key)
    setHint(p.label + ' loaded - click Simulate')
  }

  const sz     = 1 << nQ
  const labels = Array.from({ length: sz }, (_, i) => '|' + i.toString(2).padStart(nQ, '0') + '>')
  const probs  = result ? result.map(cabs2) : []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090F' }}>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 20px 32px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ color: '#7C72DD', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>Quantum lab</p>
          <h1 style={{ color: '#E2E0FF', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '10px' }}>Circuit simulator</h1>
          <p style={{ color: '#6B698A', fontSize: '15px', lineHeight: 1.7, maxWidth: '520px', marginBottom: '14px' }}>
            Build a quantum circuit, add noise, measure mid-circuit, optimize gates, and inspect results. 4 qubits, 10 steps, 13 gate types.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '560px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,159,39,0.07)', border: '1px solid rgba(239,159,39,0.2)' }}>
              <span style={{ color: '#EFC060', fontSize: '13px', flexShrink: 0 }}>!</span>
              <p style={{ color: '#EFC060', fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                Noise uses Monte Carlo single-trajectory simulation — correct on average across many shots, not per single run. No density matrix or hardware-specific transpilation. Use the shot histogram tab for noisy results.
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(124,114,221,0.06)', border: '1px solid rgba(124,114,221,0.18)' }}>
              <span style={{ color: '#7C72DD', fontSize: '13px', flexShrink: 0 }}>◈</span>
              <p style={{ color: '#9D96E8', fontSize: '12px', lineHeight: 1.6, opacity: 0.9 }}>
                Coming in a future version: density matrix simulation, hardware-specific noise models (IBM, IonQ), qubit routing and transpilation, Bloch sphere visualization, circuit export to Qiskit and OpenQASM, and benchmark comparisons across backends.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 80px' }}>

        <MetricsPanel circ={circ} n={nQ} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <p style={{ color: '#6B698A', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Preset circuits</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button key={key} onClick={() => loadPreset(key)}
                style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, border: '1px solid ' + (activePreset === key ? '#7C72DD' : '#1C1C2E'), backgroundColor: activePreset === key ? 'rgba(124,114,221,0.12)' : 'transparent', color: activePreset === key ? '#9D96E8' : '#6B698A', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {p.label}
              </button>
            ))}
          </div>
          {activePreset && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '11px 15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: 'rgba(124,114,221,0.06)', border: '1px solid rgba(124,114,221,0.18)', fontSize: '13px', color: '#6B698A', lineHeight: 1.6 }}>
              <span style={{ color: '#9D96E8', fontWeight: 500 }}>{PRESETS[activePreset].label}: </span>
              {PRESETS[activePreset].desc}
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <p style={{ color: '#6B698A', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gates</p>
            <span style={{ color: '#1C1C2E' }}>·</span>
            <span style={{ color: '#6B698A', fontSize: '11px', opacity: 0.7 }}>{GATE_INFO[selGate].desc}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {(Object.keys(GATE_INFO) as GateName[]).map(g => {
              const info = GATE_INFO[g]
              const active = selGate === g
              return (
                <button key={g} onClick={() => { setSelGate(g); setPending(null) }}
                  style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid ' + (active ? info.border : '#1C1C2E'), backgroundColor: active ? info.bg : 'transparent', color: active ? info.fg : '#6B698A', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'JetBrains Mono', monospace" }}>
                  {g}
                </button>
              )
            })}
          </div>

          {ROTATION.has(selGate) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: COL.muted, fontSize: '12px' }}>theta = {(angle / Math.PI).toFixed(2)} pi</span>
              <input type='range' min={0} max={2 * Math.PI} step={0.05} value={angle} onChange={e => setAngle(parseFloat(e.target.value))} style={{ width: '160px', accentColor: '#7C72DD' }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                {[['pi/4', Math.PI/4], ['pi/2', Math.PI/2], ['pi', Math.PI], ['3pi/2', 3*Math.PI/2]].map(([lbl, val]) => (
                  <button key={String(lbl)} onClick={() => setAngle(val as number)} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', border: '1px solid #1C1C2E', backgroundColor: 'transparent', color: COL.muted, fontFamily: "'JetBrains Mono', monospace" }}>{lbl as string}</button>
                ))}
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Qubits</span>
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => { setNQ(n); setCirc(mkCirc()); setResult(null); setShotCounts(null); setOptResult(null); setPending(null); setActivePreset(null) }}
                style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: '1px solid ' + (nQ === n ? '#7C72DD' : '#1C1C2E'), backgroundColor: nQ === n ? 'rgba(124,114,221,0.12)' : 'transparent', color: nQ === n ? '#9D96E8' : COL.muted, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {n}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Noise</span>
            <input type='range' min={0} max={0.3} step={0.01} value={noise} onChange={e => setNoise(parseFloat(e.target.value))} style={{ width: '160px', accentColor: noise > 0 ? '#F08080' : '#7C72DD' }} />
            <span style={{ color: noise > 0.1 ? COL.red : noise > 0 ? COL.amber : COL.muted, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", minWidth: '80px' }}>
              {noise === 0 ? 'ideal (no noise)' : (noise * 100).toFixed(0) + '% depolarizing'}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[[0, 'ideal'], [0.01, '1%'], [0.05, '5%'], [0.1, '10%']].map(([val, lbl]) => (
                <button key={String(lbl)} onClick={() => setNoise(val as number)} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', border: '1px solid ' + (noise === val ? (val === 0 ? '#7C72DD' : '#F08080') : '#1C1C2E'), backgroundColor: noise === val ? (val === 0 ? 'rgba(124,114,221,0.1)' : 'rgba(240,128,128,0.1)') : 'transparent', color: noise === val ? (val === 0 ? '#9D96E8' : '#F08080') : COL.muted, fontFamily: "'JetBrains Mono', monospace" }}>{lbl as string}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Repetitions</span>
            <input type='range' min={64} max={8192} step={64} value={shots} onChange={e => setShots(parseInt(e.target.value))} style={{ width: '160px', accentColor: '#7C72DD' }} />
            <span style={{ color: COL.muted, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{shots} shots</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[[256, '256'], [1024, '1k'], [4096, '4k'], [8192, '8k']].map(([val, lbl]) => (
                <button key={String(lbl)} onClick={() => setShots(val as number)} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', border: '1px solid ' + (shots === val ? '#7C72DD' : '#1C1C2E'), backgroundColor: shots === val ? 'rgba(124,114,221,0.1)' : 'transparent', color: shots === val ? '#9D96E8' : COL.muted, fontFamily: "'JetBrains Mono', monospace" }}>{lbl as string}</button>
              ))}
            </div>
          </div>
        </motion.div>

        <p style={{ color: COL.muted, fontSize: '11px', lineHeight: 1.6, marginBottom: '16px', opacity: 0.7 }}>
          One shot = one full circuit run = one random measurement outcome. More shots gives a more accurate picture of the true probability distribution.
        </p>

        <CircuitGrid circ={circ} nQ={nQ} onCell={handleCell} pending={pending} label='Circuit' />

        <div style={{ margin: '12px 0 16px', minHeight: '20px' }}>
          <AnimatePresence mode='wait'>
            <motion.p key={hint} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ color: COL.muted, fontSize: '12px' }}>{hint}</motion.p>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <button onClick={doSimulate}
            style={{ padding: '11px 28px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, #7C72DD, #5F57C4)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(124,114,221,0.25)', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            Simulate
          </button>
          <button onClick={doOptimize}
            style={{ padding: '11px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, backgroundColor: 'rgba(29,158,117,0.1)', color: '#5DCAA5', border: '1px solid rgba(29,158,117,0.3)', cursor: 'pointer', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            Optimize
          </button>
          <button onClick={doClear}
            style={{ padding: '11px 20px', borderRadius: '10px', fontSize: '13px', backgroundColor: 'transparent', color: COL.muted, border: '1px solid #1C1C2E', cursor: 'pointer', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            Clear
          </button>
        </div>

        <AnimatePresence>
          {(result || optResult) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ border: '1px solid ' + COL.border, borderRadius: '12px', overflow: 'hidden', backgroundColor: COL.surface }}>
                <div style={{ display: 'flex', borderBottom: '1px solid ' + COL.border, backgroundColor: '#0A0A14', overflowX: 'auto' }}>
                  {(['probs', 'shots', 'state', 'optimize'] as const).map(t => {
                    const labels2: Record<string, string> = { probs: 'Probabilities', shots: 'Shot histogram', state: 'State vector', optimize: 'Optimizer' }
                    return (
                      <button key={t} onClick={() => setTab(t)}
                        style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 500, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: tab === t ? COL.text : COL.muted, borderBottom: '2px solid ' + (tab === t ? COL.purple : 'transparent'), transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
                        {labels2[t]}
                      </button>
                    )
                  })}
                </div>

                <div style={{ padding: '20px 24px' }}>

                  {tab === 'probs' && result && (
                    <div>
                      <p style={{ color: COL.muted, fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
                        Exact measurement probability per basis state. {noise > 0 && 'Noise applied: ' + (noise * 100).toFixed(0) + '% depolarizing per gate. Run multiple times to see variation.'}
                      </p>
                      {labels.map((lbl, i) => {
                        const pct = Math.round(probs[i] * 1000) / 10
                        const bc  = probs[i] > 0.49 ? COL.purple : probs[i] > 0.09 ? COL.purpleB : COL.dim
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <span style={{ width: '58px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: COL.text, flexShrink: 0 }}>{lbl}</span>
                            <div style={{ flex: 1, height: '24px', backgroundColor: '#0A0A14', borderRadius: '6px', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', backgroundColor: bc, borderRadius: '6px' }} />
                            </div>
                            <span style={{ width: '52px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: COL.text, flexShrink: 0 }}>{pct.toFixed(1)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {tab === 'shots' && shotCounts && (
                    <div>
                      <p style={{ color: COL.muted, fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
                        Each shot is one full circuit execution — a single random measurement outcome. Real quantum hardware runs the circuit this many times and counts results. More shots = more accurate histogram.
                      </p>
                      {labels.map((lbl, i) => {
                        const count = shotCounts[i]
                        const pct   = (count / shots) * 100
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <span style={{ width: '58px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: COL.text, flexShrink: 0 }}>{lbl}</span>
                            <div style={{ flex: 1, height: '24px', backgroundColor: '#0A0A14', borderRadius: '6px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: pct + '%', backgroundColor: COL.teal, borderRadius: '6px', transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ width: '80px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: COL.text, flexShrink: 0 }}>{count} ({pct.toFixed(1)}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {tab === 'state' && result && (
                    <div>
                      <p style={{ color: COL.muted, fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
                        Complex amplitudes of the final state vector. Highlighted states have non-zero amplitude.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                        {labels.map((lbl, i) => {
                          const active = probs[i] > 0.001
                          return (
                            <div key={i} style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: active ? 'rgba(124,114,221,0.08)' : '#0A0A14', border: '1px solid ' + (active ? 'rgba(124,114,221,0.25)' : COL.border) }}>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 500, color: active ? COL.purpleB : COL.muted, marginBottom: '4px' }}>{lbl}</div>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: active ? COL.text : COL.muted, opacity: active ? 1 : 0.4 }}>{cfmt(result[i])}</div>
                              <div style={{ fontSize: '10px', color: COL.muted, marginTop: '3px' }}>p = {(Math.round(probs[i] * 1000) / 10).toFixed(1)}%</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {tab === 'optimize' && (
                    <div>
                      {!optResult && (
                        <p style={{ color: COL.muted, fontSize: '13px', lineHeight: 1.6 }}>
                          Click the Optimize button above to run gate cancellation and merging on your circuit.
                        </p>
                      )}
                      {optResult && (
                        <div>
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: COL.muted, fontSize: '12px', marginBottom: '12px', lineHeight: 1.6 }}>
                              {optResult.changes.length > 0
                                ? optResult.changes.length + ' optimization' + (optResult.changes.length > 1 ? 's' : '') + ' applied:'
                                : 'No redundant gates found. Circuit is already optimal.'
                              }
                            </p>
                            {optResult.changes.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
                                {optResult.changes.map((c, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5DCAA5', fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: COL.teal }}>-</span> {c}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Original</span>
                                <span style={{ color: COL.muted, fontSize: '11px' }}>{computeMetrics(circ, nQ).totalGates} gates · depth {computeMetrics(circ, nQ).depth}</span>
                              </div>
                              <CircuitGrid circ={circ} nQ={nQ} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: COL.teal, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Optimized</span>
                                <span style={{ color: COL.teal, fontSize: '11px' }}>{computeMetrics(optResult.circuit, nQ).totalGates} gates · depth {computeMetrics(optResult.circuit, nQ).depth}</span>
                              </div>
                              <CircuitGrid circ={optResult.circuit} nQ={nQ} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '48px', borderTop: '1px solid ' + COL.border, paddingTop: '32px' }}>
          <p style={{ color: COL.muted, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Gate reference</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {(Object.entries(GATE_INFO) as [GateName, typeof GATE_INFO[GateName]][]).map(([name, info]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0A0A14', border: '1px solid ' + COL.border }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0, backgroundColor: info.bg, border: '1px solid ' + info.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: info.fg, fontFamily: "'JetBrains Mono', monospace" }}>{name}</div>
                <div>
                  <div style={{ color: COL.text, fontSize: '11px', fontWeight: 500 }}>{name}</div>
                  <div style={{ color: COL.muted, fontSize: '10px', marginTop: '1px', lineHeight: 1.4 }}>{info.desc.split(' - ')[1]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}