'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import LogoMark from '../../components/LogoMark'
import exhibitsData from '../../content/exhibits.json'
import papersData from '../../content/papers.json'

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

interface Exhibit {
  id: string; myth: string; category: string
  difficulty: string; readTime: string; room: string
  belief: string; correction: string; tags: string[]
}

interface Paper {
  id: string; title: string; authors: string
  journal: string; date: string; topic: string
  level: string; idea: string; takeaway: string
  link: string; tags: string[]
}

const exhibits = exhibitsData as Exhibit[]
const papers   = papersData   as Paper[]

const diffColor: Record<string, string> = {
  Beginner:     '#1D9E75',
  Intermediate: '#EF9F27',
  Advanced:     '#F08080',
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const parts = text.split(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ backgroundColor: 'rgba(124,114,221,0.3)', color: '#E2E0FF', borderRadius: '2px', padding: '0 1px' }}>{part}</mark>
      : part
  )
}

function score(item: Exhibit | Paper, q: string): number {
  const ql = q.toLowerCase()
  let s = 0
  if ('myth' in item) {
    if (item.myth.toLowerCase().includes(ql))       s += 10
    if (item.category.toLowerCase().includes(ql))   s += 6
    if (item.belief.toLowerCase().includes(ql))     s += 4
    if (item.correction.toLowerCase().includes(ql)) s += 3
  } else {
    if (item.title.toLowerCase().includes(ql))      s += 10
    if (item.authors.toLowerCase().includes(ql))    s += 7
    if (item.topic.toLowerCase().includes(ql))      s += 6
    if (item.idea.toLowerCase().includes(ql))       s += 4
    if (item.takeaway.toLowerCase().includes(ql))   s += 3
  }
  if (item.tags.some(t => t.toLowerCase().includes(ql))) s += 5
  return s
}

export default function Search() {
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState<'all' | 'cases' | 'papers'>('all')
  const inputRef            = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) setQuery(q)
  }, [])

  const q = query.trim()

  const matchedCases = q
    ? exhibits.filter(e => score(e, q) > 0).sort((a, b) => score(b, q) - score(a, q))
    : []

  const matchedPapers = q
    ? papers.filter(p => score(p, q) > 0).sort((a, b) => score(b, q) - score(a, q))
    : []

  const totalResults = matchedCases.length + matchedPapers.length
  const showCases  = filter === 'all' || filter === 'cases'
  const showPapers = filter === 'all' || filter === 'papers'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COL.bg }}>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 20px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <LogoMark size={18} color={COL.purple} />
            <p style={{ color: COL.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Search
            </p>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cases, papers, tags, authors..."
              style={{
                width: '100%', padding: '14px 48px 14px 18px',
                borderRadius: '12px', fontSize: '16px',
                backgroundColor: COL.surface,
                border: '1px solid ' + (q ? COL.purple : COL.border),
                color: COL.text, outline: 'none',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {q && (
              <button onClick={() => setQuery('')}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: COL.muted, cursor: 'pointer', fontSize: '16px',
                }}>
                ✕
              </button>
            )}
          </div>

          {q && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
              {(['all', 'cases', 'papers'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 13px', borderRadius: '100px', fontSize: '12px', cursor: 'pointer',
                    border: '1px solid ' + (filter === f ? COL.purple : COL.border),
                    backgroundColor: filter === f ? 'rgba(124,114,221,0.12)' : 'transparent',
                    color: filter === f ? COL.purpleB : COL.muted,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    transition: 'all 0.15s', textTransform: 'capitalize',
                  }}>
                  {f === 'all' ? 'All (' + totalResults + ')' : f === 'cases' ? 'Cases (' + matchedCases.length + ')' : 'Papers (' + matchedPapers.length + ')'}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 80px' }}>
        <AnimatePresence mode="wait">
          {!q && (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.3 }}>⚛</div>
              <p style={{ color: COL.muted, fontSize: '15px', marginBottom: '8px' }}>
                Search across all cases and papers
              </p>
              <p style={{ color: COL.muted, fontSize: '13px', opacity: 0.6 }}>
                Try: "barren plateau", "Grover", "noise", "kernel", "Shor"
              </p>
            </motion.div>
          )}

          {q && totalResults === 0 && (
            <motion.div key="no-results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: COL.muted, fontSize: '15px', marginBottom: '8px' }}>
                No results for <span style={{ color: COL.text }}>"{q}"</span>
              </p>
              <p style={{ color: COL.muted, fontSize: '13px', opacity: 0.6 }}>
                Try a different term or browse the misconceptions directly
              </p>
              <Link href="/misconceptions" style={{ display: 'inline-block', marginTop: '16px', color: COL.purple, fontSize: '13px', textDecoration: 'none' }}>
                Browse all cases →
              </Link>
            </motion.div>
          )}

          {q && totalResults > 0 && (
            <motion.div key="results"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>

              {showCases && matchedCases.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: COL.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Cases — {matchedCases.length} result{matchedCases.length !== 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matchedCases.map((e, i) => (
                      <motion.div key={e.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}>
                        <Link href={'/misconceptions/' + e.id} style={{ textDecoration: 'none', display: 'block' }}>
                          <div style={{
                            padding: '14px 18px', borderRadius: '10px',
                            backgroundColor: COL.surface, border: '1px solid ' + COL.border,
                            transition: 'border-color 0.15s',
                          }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(124,114,221,0.1)', color: COL.purpleB }}>
                                {e.room}
                              </span>
                              <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: diffColor[e.difficulty] + '20', color: diffColor[e.difficulty] }}>
                                {e.difficulty}
                              </span>
                              <span style={{ fontSize: '10px', color: COL.muted, marginLeft: 'auto' }}>{e.readTime}</span>
                            </div>
                            <p style={{ color: COL.text, fontSize: '14px', lineHeight: 1.5, marginBottom: '4px', fontStyle: 'italic' }}>
                              {highlight(e.myth, q)}
                            </p>
                            <p style={{ color: COL.muted, fontSize: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {highlight(e.belief.slice(0, 140) + '...', q)}
                            </p>
                            {e.tags.some(t => t.toLowerCase().includes(q.toLowerCase())) && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {e.tags.filter(t => t.toLowerCase().includes(q.toLowerCase())).map(t => (
                                  <span key={t} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(124,114,221,0.1)', color: COL.purpleB, fontFamily: "'JetBrains Mono', monospace" }}>
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {showPapers && matchedPapers.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: COL.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Papers — {matchedPapers.length} result{matchedPapers.length !== 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matchedPapers.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}>
                        <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                          <div style={{
                            padding: '14px 18px', borderRadius: '10px',
                            backgroundColor: COL.surface, border: '1px solid ' + COL.border,
                            transition: 'border-color 0.15s',
                          }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(29,158,117,0.1)', color: COL.teal }}>
                                {p.topic}
                              </span>
                              <span style={{ fontSize: '10px', color: COL.purple, fontStyle: 'italic' }}>{p.journal}</span>
                              <span style={{ fontSize: '10px', color: COL.muted, marginLeft: 'auto' }}>{p.date.slice(0, 4)}</span>
                            </div>
                            <p style={{ color: COL.text, fontSize: '14px', fontWeight: 500, marginBottom: '4px', lineHeight: 1.4 }}>
                              {highlight(p.title, q)}
                            </p>
                            <p style={{ color: COL.muted, fontSize: '11px', marginBottom: '4px' }}>
                              {highlight(p.authors, q)}
                            </p>
                            <p style={{ color: COL.muted, fontSize: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {highlight(p.idea.slice(0, 140) + '...', q)}
                            </p>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
