'use client'
import { useState, useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

const NoiseDecayChart       = lazy(() => import('../../../components/demos/NoiseDecayChart'))
const BarrenPlateauChart    = lazy(() => import('../../../components/demos/BarrenPlateauChart'))
const ShorRequirementsChart = lazy(() => import('../../../components/demos/ShorRequirementsChart'))
const QMLComparisonChart    = lazy(() => import('../../../components/demos/QMLComparisonChart'))
const QubitQualityChart     = lazy(() => import('../../../components/demos/QubitQualityChart'))
const ConnectivityChart     = lazy(() => import('../../../components/demos/ConnectivityChart'))
const QuantumVolumeChart    = lazy(() => import('../../../components/demos/QuantumVolumeChart'))

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

const diffColor: Record<string, string> = {
  Beginner:     '#1D9E75',
  Intermediate: '#EF9F27',
  Advanced:     '#F08080',
}
const diffBg: Record<string, string> = {
  Beginner:     'rgba(29,158,117,0.1)',
  Intermediate: 'rgba(239,159,39,0.1)',
  Advanced:     'rgba(240,128,128,0.1)',
}

interface Exhibit {
  id:                  string
  title:               string
  myth:                string
  category:            string
  difficulty:          string
  readTime:            string
  room:                string
  belief:              string
  correction:          string
  researchNote:        string
  simulatorAvailable:  boolean
  simulatorPreset:     string
  simulatorGuide:      string
  demoType:            string
  demoComponent?:      string
  demoNote?:           string
  tags:                string[]
  relatedIds:          string[]
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function StepBlock({ number, label, color, bg, children }: {
  number: string; label: string; color: string; bg: string; children: React.ReactNode
}) {
  return (
    <FadeUp>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: bg, border: '1px solid ' + color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: color, fontFamily: "'JetBrains Mono', monospace" }}>
            {number}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {label}
          </p>
          {children}
        </div>
      </div>
    </FadeUp>
  )
}

function DemoSection({ exhibit }: { exhibit: Exhibit }) {
  const comp = exhibit.demoComponent

  if (exhibit.demoType === 'none') {
    return (
      <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(107,105,138,0.08)', border: '1px solid rgba(107,105,138,0.2)' }}>
        <p style={{ color: COL.muted, fontSize: '13px', lineHeight: 1.7 }}>
          {exhibit.demoNote || 'This concept cannot be demonstrated with a small circuit simulator. See the research notes for references.'}
        </p>
      </div>
    )
  }

  return (
    <Suspense fallback={<div style={{ height: '200px', backgroundColor: '#0F0F1A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: COL.muted, fontSize: '12px' }}>Loading chart...</span></div>}>
      {comp === 'NoiseDecayChart'       && <NoiseDecayChart />}
      {comp === 'BarrenPlateauChart'    && <BarrenPlateauChart />}
      {comp === 'ShorRequirementsChart' && <ShorRequirementsChart />}
      {comp === 'QMLComparisonChart'    && <QMLComparisonChart />}
      {comp === 'QubitQualityChart'     && <QubitQualityChart />}
      {comp === 'ConnectivityChart'     && <ConnectivityChart />}
      {comp === 'QuantumVolumeChart'    && <QuantumVolumeChart />}
    </Suspense>
  )
}

export default function CaseClient({ exhibit, related }: { exhibit: Exhibit; related: Exhibit[] }) {
  const [researchOpen, setResearchOpen] = useState(false)

  const showDemo      = exhibit.demoType === 'chart' || exhibit.demoType === 'both'
  const showSimulator = exhibit.simulatorAvailable || exhibit.demoType === 'both' || exhibit.demoType === 'simulator'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COL.bg }}>

      <div style={{ borderBottom: '1px solid ' + COL.border, background: 'linear-gradient(to bottom, #0D0B1E, #09090F)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(124,114,221,0.08) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 56px', position: 'relative' }}>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
              <Link href="/misconceptions" style={{ fontSize: '12px', color: COL.muted, textDecoration: 'none' }}>Misconceptions</Link>
              <span style={{ color: COL.border }}>/</span>
              <span style={{ fontSize: '12px', color: COL.muted }}>{exhibit.category}</span>
              <span style={{ color: COL.border }}>/</span>
              <span style={{ fontSize: '12px', color: COL.purpleB }}>{exhibit.title}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '100px', backgroundColor: diffBg[exhibit.difficulty], color: diffColor[exhibit.difficulty] }}>
                {exhibit.difficulty}
              </span>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', backgroundColor: 'rgba(124,114,221,0.1)', color: COL.purpleB, border: '1px solid rgba(124,114,221,0.2)' }}>
                {exhibit.category}
              </span>
              <span style={{ fontSize: '11px', color: COL.muted, padding: '3px 0' }}>{exhibit.readTime}</span>
              {showSimulator && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', backgroundColor: 'rgba(29,158,117,0.1)', color: COL.teal, border: '1px solid rgba(29,158,117,0.2)' }}>
                  Interactive
                </span>
              )}
              {showDemo && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', backgroundColor: 'rgba(239,159,39,0.1)', color: COL.amber, border: '1px solid rgba(239,159,39,0.2)' }}>
                  Visual demo
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', fontWeight: 500, color: COL.purple, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
              The myth
            </p>
            <h1 style={{ color: COL.text, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.02em', maxWidth: '620px', fontStyle: 'italic' }}>
              {exhibit.myth}
            </h1>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '56px 24px 80px' }}>

        <StepBlock number="01" label="Why people believe this" color={COL.amber} bg="rgba(239,159,39,0.08)">
          <p style={{ color: COL.muted, fontSize: '15px', lineHeight: 1.85 }}>
            {exhibit.belief}
          </p>
        </StepBlock>

        <StepBlock number="02" label="The correction" color={COL.teal} bg="rgba(29,158,117,0.08)">
          <div style={{ padding: '20px 22px', borderRadius: '12px', backgroundColor: 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.15)', marginBottom: '16px' }}>
            <p style={{ color: COL.text, fontSize: '15px', lineHeight: 1.85 }}>
              {exhibit.correction}
            </p>
          </div>
        </StepBlock>

        {showDemo && (
          <StepBlock number="03" label="Visual demonstration" color={COL.amber} bg="rgba(239,159,39,0.08)">
            <DemoSection exhibit={exhibit} />
          </StepBlock>
        )}

        <StepBlock number={showDemo ? '04' : '03'} label={showSimulator ? 'Try it in the simulator' : 'Simulator note'} color={COL.purple} bg="rgba(124,114,221,0.08)">
          {showSimulator ? (
            <div>
              <div style={{ padding: '16px 18px', borderRadius: '10px', backgroundColor: 'rgba(124,114,221,0.06)', border: '1px solid rgba(124,114,221,0.18)', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: COL.purpleB, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  What to do
                </p>
                <p style={{ color: COL.muted, fontSize: '13px', lineHeight: 1.75 }}>
                  {exhibit.simulatorGuide}
                </p>
              </div>
              <Link href={'/simulator?preset=' + exhibit.simulatorPreset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: 'linear-gradient(135deg, #7C72DD, #5F57C4)', color: '#fff', textDecoration: 'none', boxShadow: '0 0 24px rgba(124,114,221,0.2)' }}>
                Open in simulator
              </Link>
            </div>
          ) : (
            <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(107,105,138,0.06)', border: '1px solid rgba(107,105,138,0.18)' }}>
              <p style={{ color: COL.muted, fontSize: '13px', lineHeight: 1.7 }}>
                {exhibit.demoNote || 'This concept requires either mathematical proof or hardware-scale experiments beyond what a browser simulator can demonstrate. See the research notes for the canonical references.'}
              </p>
            </div>
          )}
        </StepBlock>

        <StepBlock number={showDemo ? '05' : showSimulator ? '04' : '03'} label="Research notes" color={COL.purpleB} bg="rgba(157,150,232,0.08)">
          <button onClick={() => setResearchOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: COL.purpleB, backgroundColor: 'transparent', border: '1px solid rgba(157,150,232,0.2)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', marginBottom: '12px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            {researchOpen ? 'Hide' : 'Show'} research notes
          </button>
          {researchOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: '16px 18px', borderRadius: '10px', backgroundColor: 'rgba(157,150,232,0.05)', border: '1px solid rgba(157,150,232,0.15)' }}>
                <p style={{ color: COL.muted, fontSize: '13px', lineHeight: 1.8 }}>
                  {exhibit.researchNote}
                </p>
              </div>
            </motion.div>
          )}
        </StepBlock>

        <FadeUp>
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: COL.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Tags</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {exhibit.tags.map(tag => (
                <span key={tag} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#0A0A14', border: '1px solid ' + COL.border, color: COL.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </FadeUp>

        {related.length > 0 && (
          <FadeUp>
            <div style={{ borderTop: '1px solid ' + COL.border, paddingTop: '40px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: COL.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Related cases</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {related.map(r => (
                  <Link key={r.id} href={'/misconceptions/' + r.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', border: '1px solid ' + COL.border, backgroundColor: COL.surface, textDecoration: 'none', gap: '12px' }}>
                    <div>
                      <p style={{ color: COL.text, fontSize: '13px', fontWeight: 400, marginBottom: '3px', fontStyle: 'italic' }}>{r.myth}</p>
                      <p style={{ color: COL.muted, fontSize: '11px' }}>{r.category} · {r.readTime}</p>
                    </div>
                    <span style={{ color: COL.purple, fontSize: '16px', flexShrink: 0 }}>&#8594;</span>
                  </Link>
                ))}
              </div>
            </div>
          </FadeUp>
        )}

        <FadeUp>
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid ' + COL.border }}>
            <Link href="/misconceptions" style={{ fontSize: '13px', color: COL.purple, textDecoration: 'none' }}>
              &#8592; Back to the misconceptions section
            </Link>
          </div>
        </FadeUp>

      </div>
    </div>
  )
}
