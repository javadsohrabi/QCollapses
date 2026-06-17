'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import LogoMark from '../../components/LogoMark'
import exhibitsData from '../../content/exhibits.json'

const col = {
  purple:  '#7C72DD',
  purpleB: '#9D96E8',
  muted:   '#9492B0',
  text:    '#E2E0FF',
  bg:      '#09090F',
  surface: '#0F0F1A',
  border:  '#1C1C2E',
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

interface Exhibit {
  id:         string
  myth:       string
  category:   string
  difficulty: string
  readTime:   string
  room:       string
  [key: string]: unknown
}

const difficultyColor: Record<string, string> = {
  Beginner:     'rgba(29,158,117,0.15)',
  Intermediate: 'rgba(239,159,39,0.15)',
  Advanced:     'rgba(220,80,80,0.15)',
}
const difficultyText: Record<string, string> = {
  Beginner:     '#1D9E75',
  Intermediate: '#EF9F27',
  Advanced:     '#DC5050',
}

const rooms = [
  { id: 'Foundations', label: 'Foundations', icon: '⟨ψ|', color: '#7C72DD' },
  { id: 'Circuits',    label: 'Circuits',    icon: '⊕',        color: '#1D9E75' },
  { id: 'Algorithms',  label: 'Algorithms',  icon: '∑',        color: '#9D96E8' },
  { id: 'Quantum ML',  label: 'Quantum ML',  icon: '∇',        color: '#5DCAA5' },
  { id: 'Hardware',    label: 'Hardware',    icon: '⊗',        color: '#B8B3F0' },
]

const categories  = ['All', ...rooms.map(r => r.id)]
const difficulties: ('All' | Difficulty)[] = ['All', 'Beginner', 'Intermediate', 'Advanced']
const allExhibits = exhibitsData as Exhibit[]

function ExhibitCard({ exhibit, roomColor }: { exhibit: Exhibit; roomColor: string }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <Link href={'/misconceptions/' + exhibit.id} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <motion.div
          whileHover={{ borderColor: roomColor + '55', y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            backgroundColor: col.surface,
            border: '1px solid ' + col.border,
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            cursor: 'pointer',
          }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, ' + roomColor + '55, transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', backgroundColor: difficultyColor[exhibit.difficulty], color: difficultyText[exhibit.difficulty] }}>
              {exhibit.difficulty}
            </span>
            <span style={{ color: col.muted, fontSize: '11px' }}>{exhibit.readTime}</span>
          </div>
          <p style={{ color: col.text, fontSize: '13px', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {exhibit.myth}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ color: roomColor, fontSize: '14px', opacity: 0.7 }}>→</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function Misconceptions() {
  const [catFilter,  setCatFilter]  = useState('All')
  const [diffFilter, setDiffFilter] = useState<'All' | Difficulty>('All')
  const [topicPages, setTopicPages] = useState<Record<string, number>>({})
  const TOPIC_PAGE_SIZE = 9

  const getTopicPage = (roomId: string) => topicPages[roomId] || 1
  const setTopicPage = (roomId: string, page: number) => {
    setTopicPages(prev => ({ ...prev, [roomId]: page }))

  }

  const resetTopicPages = () => setTopicPages({})

  const filtered = allExhibits.filter(e => {
    const catOk  = catFilter  === 'All' || e.room       === catFilter
    const diffOk = diffFilter === 'All' || e.difficulty === diffFilter
    return catOk && diffOk
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: col.bg, paddingBottom: '80px' }}>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 20px 32px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <LogoMark size={20} color={col.purple} />
            <p style={{ color: col.purple, fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Misconceptions
            </p>
          </div>
          <h1 style={{ color: col.text, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Cases of wrong intuition
          </h1>
          <p style={{ color: col.muted, fontSize: '15px', lineHeight: 1.7, maxWidth: '520px' }}>
            Each case holds a wrong idea that feels completely true. Read why people believe it, see the correction, and test it yourself in the simulator.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: col.muted, fontSize: '11px', letterSpacing: '0.08em', marginRight: '4px' }}>TOPIC</span>
            {categories.map(c => {
              const room   = rooms.find(r => r.id === c)
              const active = catFilter === c
              return (
                <button key={c} onClick={() => { setCatFilter(c); resetTopicPages() }}
                  style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + (active ? (room?.color ?? col.purple) : col.border), backgroundColor: active ? (room?.color ?? col.purple) + '18' : 'transparent', color: active ? (room?.color ?? col.purpleB) : col.muted, cursor: 'pointer', fontWeight: active ? 500 : 400, transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                  {c}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: col.muted, fontSize: '11px', letterSpacing: '0.08em', marginRight: '4px' }}>LEVEL</span>
            {difficulties.map(d => {
              const active = diffFilter === d
              const dc = d === 'All' ? col.purple : difficultyText[d]
              return (
                <button key={d} onClick={() => { setDiffFilter(d); resetTopicPages() }}
                  style={{ padding: '5px 13px', borderRadius: '100px', fontSize: '12px', border: '1px solid ' + (active ? dc : col.border), backgroundColor: active ? dc + '20' : 'transparent', color: active ? dc : col.muted, cursor: 'pointer', fontWeight: active ? 500 : 400, transition: 'all 0.15s', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                  {d}
                </button>
              )
            })}
          </div>

          <div style={{ color: col.muted, fontSize: '12px' }}>
            <span style={{ color: col.purpleB, fontWeight: 500 }}>{filtered.length}</span> of {allExhibits.length} cases
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {rooms.map(room => {
          const roomExhibits = filtered.filter(e => e.room === room.id)
          if (roomExhibits.length === 0) return null
          return (
            <motion.div key={room.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}>
              <div id={'room-' + room.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid ' + room.color + '28' }}>
                <span style={{ color: room.color, fontSize: '15px', fontFamily: 'monospace', opacity: 0.8 }}>{room.icon}</span>
                <span style={{ color: room.color, fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{room.label}</span>
                <span style={{ color: col.muted, fontSize: '11px', marginLeft: 'auto' }}>{roomExhibits.length} case{roomExhibits.length !== 1 ? 's' : ''}</span>
              </div>
              {(() => {
                const currentPage = getTopicPage(room.id)
                const totalPages  = Math.ceil(roomExhibits.length / TOPIC_PAGE_SIZE)
                const pageItems   = roomExhibits.slice((currentPage - 1) * TOPIC_PAGE_SIZE, currentPage * TOPIC_PAGE_SIZE)
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                      {pageItems.map(e => (
                        <ExhibitCard key={e.id} exhibit={e} roomColor={room.color} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
                        <button onClick={() => setTopicPage(room.id, currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{ padding: '5px 11px', borderRadius: '7px', fontSize: '12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid ' + col.border, backgroundColor: 'transparent', color: currentPage === 1 ? col.border : col.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                          ←
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button key={p} onClick={() => setTopicPage(room.id, p)}
                            style={{ width: '30px', height: '30px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', border: '1px solid ' + (currentPage === p ? room.color : col.border), backgroundColor: currentPage === p ? room.color + '18' : 'transparent', color: currentPage === p ? room.color : col.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                            {p}
                          </button>
                        ))}
                        <button onClick={() => setTopicPage(room.id, currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{ padding: '5px 11px', borderRadius: '7px', fontSize: '12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid ' + col.border, backgroundColor: 'transparent', color: currentPage === totalPages ? col.border : col.muted, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                          →
                        </button>
                        <span style={{ color: col.muted, fontSize: '11px', marginLeft: '4px' }}>
                          {(currentPage - 1) * TOPIC_PAGE_SIZE + 1}–{Math.min(currentPage * TOPIC_PAGE_SIZE, roomExhibits.length)} of {roomExhibits.length}
                        </span>
                      </div>
                    )}
                  </>
                )
              })()}
            </motion.div>
          )
        })}
      </div>

      <div style={{ maxWidth: '960px', margin: '24px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '16px 20px', borderRadius: '10px', border: '1px solid ' + col.border, backgroundColor: col.surface, alignItems: 'center' }}>
          <span style={{ color: col.muted, fontSize: '11px', letterSpacing: '0.08em' }}>LEVEL</span>
          {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: difficultyText[d] }} />
              <span style={{ color: col.muted, fontSize: '12px' }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
