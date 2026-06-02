'use client'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

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

type Level = 'Beginner' | 'Intermediate' | 'Advanced'

interface Paper {
  id:           string
  title:        string
  authors:      string
  journal:      string
  date:         string
  topic:        string
  level:        Level
  idea:         string
  takeaway:     string
  link:         string
  tags:         string[]
  featured:     boolean
  featuredDate: string
  featuredNote: string
}

const levelColor: Record<Level, string> = {
  Beginner:     '#1D9E75',
  Intermediate: '#EFC060',
  Advanced:     '#F08080',
}

const levelBg: Record<Level, string> = {
  Beginner:     'rgba(29,158,117,0.1)',
  Intermediate: 'rgba(239,159,39,0.1)',
  Advanced:     'rgba(240,128,128,0.1)',
}

import papersData from '../../content/papers.json'
const PAPERS: Paper[] = papersData as Paper[]

const topics   = ['All', ...Array.from(new Set(PAPERS.map(p => p.topic)))]
const journals = ['All', ...Array.from(new Set(PAPERS.map(p => p.journal))).sort()]
const years    = ['All', ...Array.from(new Set(PAPERS.map(p => p.date.slice(0, 4)))).sort().reverse()]

function PaperCard({ paper }: { paper: Paper }) {
  const [expanded, setExpanded] = useState(false)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const isFeatured = paper.featured

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: '1px solid ' + (isFeatured ? 'rgba(239,192,96,0.35)' : COL.border),
        borderRadius: '14px',
        backgroundColor: isFeatured ? 'rgba(239,192,96,0.04)' : COL.surface,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        position: 'relative',
      }}>
      {isFeatured && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #EFC060, rgba(239,192,96,0.2))' }} />
      )}

      <div style={{ padding: '20px 22px' }}>

        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: levelBg[paper.level], color: levelColor[paper.level] }}>
              {paper.level}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(124,114,221,0.1)', color: COL.purpleB, border: '1px solid rgba(124,114,221,0.2)' }}>
              {paper.topic}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: COL.muted, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
            {fmtDate(paper.date)}
          </span>
        </div>

        {/* title */}
        <h2 style={{ color: COL.text, fontSize: isFeatured ? 'clamp(16px, 2vw, 19px)' : 'clamp(14px, 2vw, 16px)', fontWeight: isFeatured ? 600 : 500, lineHeight: 1.4, marginBottom: '6px' }}>
          {paper.title}
        </h2>

        {/* authors + journal */}
        <p style={{ fontSize: '12px', color: COL.muted, marginBottom: '4px', lineHeight: 1.5 }}>
          {paper.authors}
        </p>
        <p style={{ fontSize: '12px', color: COL.purple, marginBottom: '14px', fontStyle: 'italic' }}>
          {paper.journal}
        </p>

        {/* main idea */}
        <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(124,114,221,0.05)', border: '1px solid rgba(124,114,221,0.12)', marginBottom: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: COL.purple, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Main idea
          </p>
          <p style={{ fontSize: '13px', color: COL.muted, lineHeight: 1.7 }}>
            {paper.idea}
          </p>
        </div>

        {/* expandable section */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}>
            <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.15)', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: COL.teal, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Key takeaway
              </p>
              <p style={{ fontSize: '13px', color: COL.muted, lineHeight: 1.7 }}>
                {paper.takeaway}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
              {paper.tags.map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', backgroundColor: '#0A0A14', border: '1px solid ' + COL.border, color: COL.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ fontSize: '12px', color: COL.purple, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            {expanded ? '↑ Show less' : '↓ Why it matters + tags'}
          </button>
          <a href={paper.link} target='_blank' rel='noopener noreferrer'
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(124,114,221,0.3)', color: COL.purpleB, textDecoration: 'none', backgroundColor: 'rgba(124,114,221,0.07)' }}>
            Read paper ↗
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default function Papers() {
  const [topicFilter,   setTopicFilter]   = useState('All')
  const [journalFilter, setJournalFilter] = useState('All')
  const [yearFilter,    setYearFilter]    = useState('All')
  const [sort, setSort]                   = useState<'date' | 'alpha'>('date')
  const [page, setPage]                   = useState(1)
  const PAGE_SIZE = 20

  const resetPage = () => setPage(1)

  const filtered = PAPERS
    .filter(p =>
      (topicFilter   === 'All' || p.topic              === topicFilter)   &&
      (journalFilter === 'All' || p.journal            === journalFilter) &&
      (yearFilter    === 'All' || p.date.slice(0, 4)   === yearFilter)
    )
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      if (sort === 'date')  return new Date(b.date).getTime() - new Date(a.date).getTime()
      return a.title.localeCompare(b.title)
    })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COL.bg }}>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 20px 32px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ color: COL.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Daily papers
          </p>
          <h1 style={{ color: COL.text, fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Daily Papers
          </h1>
          <p style={{ color: COL.muted, fontSize: '15px', lineHeight: 1.7, maxWidth: '520px', marginBottom: '14px' }}>
            One carefully selected quantum computing paper per day — with a plain-language summary, key takeaway, and direct link. Curated for researchers, students, and engineers who want to stay current without drowning in arXiv.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(124,114,221,0.06)', border: '1px solid rgba(124,114,221,0.18)', maxWidth: '520px' }}>
            <span style={{ color: COL.purpleB, fontSize: '13px', flexShrink: 0 }}>◈</span>
            <p style={{ color: COL.purpleB, fontSize: '12px', lineHeight: 1.6, opacity: 0.9 }}>
              Papers are selected based on their impact, how interesting the result is, the creativity of the approach, and whether the core idea is genuinely new. Incremental work is rarely featured.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
          style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: COL.muted, fontSize: '11px', letterSpacing: '0.08em', marginRight: '4px' }}>TOPIC</span>
            {topics.map(t => (
              <button key={t} onClick={() => { setTopicFilter(t); resetPage() }}
                style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + (topicFilter === t ? COL.purple : COL.border), backgroundColor: topicFilter === t ? 'rgba(124,114,221,0.12)' : 'transparent', color: topicFilter === t ? COL.purpleB : COL.muted, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: COL.muted, fontSize: '11px', letterSpacing: '0.08em', marginRight: '4px', flexShrink: 0 }}>JOURNAL</span>
            {journals.map(j => {
              const active = journalFilter === j
              const short  = j === 'All' ? 'All' : j.length > 22 ? j.slice(0, 22) + '...' : j
              return (
                <button key={j} onClick={() => { setJournalFilter(j); resetPage() }}
                  style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + (active ? COL.purple : COL.border), backgroundColor: active ? 'rgba(124,114,221,0.12)' : 'transparent', color: active ? COL.purpleB : COL.muted, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
                  {short}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: COL.muted, fontSize: '11px', letterSpacing: '0.08em', marginRight: '4px' }}>YEAR</span>
            {years.map(y => {
              const active = yearFilter === y
              return (
                <button key={y} onClick={() => { setYearFilter(y); resetPage() }}
                  style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + (active ? COL.teal : COL.border), backgroundColor: active ? 'rgba(29,158,117,0.12)' : 'transparent', color: active ? COL.teal : COL.muted, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'JetBrains Mono', monospace" }}>
                  {y}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ color: COL.muted, fontSize: '11px', letterSpacing: '0.08em' }}>SORT</span>
            {[['date', 'Most recent'], ['alpha', 'A to Z']].map(([val, lbl]) => (
              <button key={val} onClick={() => { setSort(val as 'date' | 'alpha'); resetPage() }}
                style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + (sort === val ? COL.purple : COL.border), backgroundColor: sort === val ? 'rgba(124,114,221,0.12)' : 'transparent', color: sort === val ? COL.purpleB : COL.muted, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {lbl}
              </button>
            ))}
            <button onClick={() => { setTopicFilter('All'); setJournalFilter('All'); setYearFilter('All'); resetPage() }}
              style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + COL.border, backgroundColor: 'transparent', color: COL.muted, cursor: 'pointer', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              Clear filters
            </button>
            <span style={{ color: COL.muted, fontSize: '12px', marginLeft: 'auto' }}>
              <span style={{ color: COL.purpleB, fontWeight: 500 }}>{filtered.length}</span> of {PAPERS.length} papers
            </span>
            <a href="mailto:contact@qcollapses.com?subject=Paper suggestion"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, border: '1px solid rgba(124,114,221,0.25)', color: COL.purpleB, textDecoration: 'none', backgroundColor: 'rgba(124,114,221,0.06)' }}>
              ✉ Suggest a paper
            </a>
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* pagination info */}
      {filtered.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: COL.muted, fontSize: '12px' }}>
            Page <span style={{ color: COL.purpleB, fontWeight: 500 }}>{page}</span> of {Math.ceil(filtered.length / PAGE_SIZE)}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === 1}
              style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer', border: '1px solid ' + COL.border, backgroundColor: 'transparent', color: page === 1 ? COL.border : COL.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              ← Prev
            </button>
            <button onClick={() => { setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === Math.ceil(filtered.length / PAGE_SIZE)}
              style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', cursor: page === Math.ceil(filtered.length / PAGE_SIZE) ? 'not-allowed' : 'pointer', border: '1px solid ' + COL.border, backgroundColor: 'transparent', color: page === Math.ceil(filtered.length / PAGE_SIZE) ? COL.border : COL.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COL.muted, fontSize: '14px' }}>
            No papers match this filter combination.
          </div>
        ) : (
          filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(paper => <PaperCard key={paper.id} paper={paper} />)
        )}

        {/* bottom pagination */}
        {filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px' }}>
            <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === 1}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', border: '1px solid ' + COL.border, backgroundColor: 'transparent', color: page === 1 ? COL.border : COL.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              ← Previous
            </button>
            {Array.from({ length: Math.ceil(filtered.length / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ width: '34px', height: '34px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: '1px solid ' + (page === p ? COL.purple : COL.border), backgroundColor: page === p ? 'rgba(124,114,221,0.12)' : 'transparent', color: page === p ? COL.purpleB : COL.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {p}
              </button>
            ))}
            <button onClick={() => { setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={page === Math.ceil(filtered.length / PAGE_SIZE)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: page === Math.ceil(filtered.length / PAGE_SIZE) ? 'not-allowed' : 'pointer', border: '1px solid ' + COL.border, backgroundColor: 'transparent', color: page === Math.ceil(filtered.length / PAGE_SIZE) ? COL.border : COL.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              Next →
            </button>
          </div>
        )}

        <div style={{ marginTop: '48px', padding: '20px 24px', borderRadius: '12px', border: '1px solid ' + COL.border, backgroundColor: COL.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ color: COL.text, fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Know a paper that should be here?</p>
            <p style={{ color: COL.muted, fontSize: '13px' }}>If it changed how you think about quantum computing, it probably belongs.</p>
          </div>
          <a href="mailto:contact@qcollapses.com?subject=Paper suggestion"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(124,114,221,0.3)', color: COL.purpleB, textDecoration: 'none', backgroundColor: 'rgba(124,114,221,0.07)', whiteSpace: 'nowrap' }}>
            ✉ Suggest a paper
          </a>
        </div>
      </div>

    </div>
  )
}
