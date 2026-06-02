'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import LogoMark from '../../components/LogoMark'

const COL = {
  purple:  '#7C72DD',
  purpleB: '#9D96E8',
  muted:   '#6B698A',
  text:    '#E2E0FF',
  bg:      '#09090F',
  surface: '#0F0F1A',
  border:  '#1C1C2E',
  teal:    '#1D9E75',
  amber:   '#EFC060',
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

const sections = [
  {
    label: 'Transparency',
    color: COL.amber,
    body: 'Some content on this site — including paper summaries, case explanations, and demos — is written or assisted by AI. The featured paper selection will also be assisted by an AI agent in the future. Every scientific claim is reviewed, but mistakes can still happen. If you find one, please report it.',
  },
  {
    label: 'What this site offers',
    color: COL.teal,
    body: 'QCollapses is free, ad-free, and requires no account. It is built for students, researchers, and engineers who want honest quantum computing resources. The simulator runs entirely in your browser, and new cases and papers are added regularly.',
  },
  {
    label: 'Simulator roadmap',
    color: COL.purpleB,
    body: 'The current simulator uses state-vector simulation in the browser. It is designed for learning and experimentation, but does not yet support density matrices, hardware noise models, qubit routing, or Qiskit/OpenQASM export. Phase 2 will add noise simulation, hardware backends, and circuit export using server-side infrastructure.',
  },
]

export default function About() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: COL.bg }}>

      <div style={{ borderBottom: '1px solid ' + COL.border, background: 'linear-gradient(to bottom, #0D0B1E, #09090F)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(124,114,221,0.07) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 24px 56px', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <LogoMark size={20} color={COL.purple} />
              <p style={{ color: COL.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>About</p>
            </div>
            <h1 style={{ color: COL.text, fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '20px' }}>
              Built by a quantum lover.<br />
              <span style={{ color: COL.purpleB }}>Learning in public.</span>
            </h1>
            <p style={{ color: COL.muted, fontSize: '15px', lineHeight: 1.85, maxWidth: '540px' }}>
              QCollapses exists because quantum computing is full of misconceptions — in papers, talks, and sometimes in my own research. This site makes those ideas explicit, tests them openly, and improves them in public.
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {sections.map((s, i) => (
          <FadeUp key={s.label} delay={i * 0.06}>
            <div style={{ padding: '20px 22px', borderRadius: '12px', backgroundColor: COL.surface, border: '1px solid ' + COL.border, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, ' + s.color + ', transparent)' }} />
              <p style={{ fontSize: '11px', fontWeight: 500, color: s.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>{s.label}</p>
              <p style={{ color: COL.muted, fontSize: '14px', lineHeight: 1.85 }}>{s.body}</p>
            </div>
          </FadeUp>
        ))}

        <FadeUp delay={0.18}>
          <div style={{ padding: '20px 22px', borderRadius: '12px', backgroundColor: COL.surface, border: '1px solid rgba(124,114,221,0.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, ' + COL.purple + ', ' + COL.teal + ')' }} />
            <p style={{ fontSize: '11px', fontWeight: 500, color: COL.purpleB, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Support</p>
            <p style={{ color: COL.muted, fontSize: '14px', lineHeight: 1.85, marginBottom: '16px' }}>
              QCollapses will stay free. Donations help cover hosting, development, and the next generation of the simulator.
            </p>
            <a href="https://ko-fi.com/qcollapses" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: 'linear-gradient(135deg, #7C72DD, #5F57C4)', color: '#fff', textDecoration: 'none', boxShadow: '0 0 20px rgba(124,114,221,0.2)' }}>
              ⚛ Buy me a qubit
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.22}>
          <div style={{ padding: '20px 22px', borderRadius: '12px', backgroundColor: COL.surface, border: '1px solid ' + COL.border }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: COL.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Contact</p>
            <p style={{ color: COL.muted, fontSize: '14px', lineHeight: 1.85, marginBottom: '16px' }}>
              Found an error? Want to suggest a misconception or challenge a correction? Get in touch — accuracy is the whole point of this project.
            </p>
            <a href="mailto:contact@qcollapses.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: COL.purpleB, textDecoration: 'none' }}>
              ✉ contact@qcollapses.com
            </a>
          </div>
        </FadeUp>

      </div>
    </div>
  )
}
