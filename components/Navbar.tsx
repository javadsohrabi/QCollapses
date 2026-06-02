'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LogoMark from './LogoMark'

const links = [
  { href: '/misconceptions', label: 'Misconceptions', sub: 'Browse misconceptions'        },
  { href: '/papers',         label: 'Daily Papers',   sub: 'One great paper, every day'   },
  { href: '/simulator',      label: 'Simulator',      sub: 'Build quantum circuits'       },
  { href: '/search',         label: 'Search',         sub: 'Find cases and papers'        },
  { href: '/about',          label: 'About',          sub: 'Who built this'               },
]

const C = {
  purple: '#7C72DD', muted: '#6B698A', text: '#E2E0FF',
  bg: '#09090F', border: '#1C1C2E',
}

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [width, setWidth]       = useState(1024)
  const pathname                = usePathname()
  const mobile                  = width < 768

  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
          backgroundColor: scrolled || open
            ? 'rgba(9,9,15,0.97)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          padding: '0 20px', height: '56px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          <Link href="/"
            aria-label="QCollapses home"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <LogoMark size={22} color="#7C72DD" />
            <span style={{ color: '#E2E0FF', fontSize: '15px', fontWeight: 500 }}>
              QCollapses
            </span>
          </Link>

          {!mobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              {links.filter(l => l.href !== '/search').map(l => (
                <Link key={l.href} href={l.href} style={{
                  color: isActive(l.href) ? '#E2E0FF' : '#6B698A',
                  fontSize: '13px', textDecoration: 'none',
                  borderBottom: isActive(l.href) ? '1px solid #7C72DD' : '1px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.15s',
                }}>
                  {l.label}
                </Link>
              ))}
              <a href="/search"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              color: '#6B698A', fontSize: '13px', textDecoration: 'none',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid #1C1C2E',
              transition: 'color 0.15s',
            }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#6B698A" strokeWidth="1.5"/>
              <line x1="11" y1="11" x2="15" y2="15" stroke="#6B698A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Search
          </a>
          <a href="https://ko-fi.com/qcollapses"
                target="_blank" rel="noopener noreferrer"
                style={{
                  color: '#7C72DD', fontSize: '12px', fontWeight: 500,
                  padding: '7px 16px', borderRadius: '100px',
                  border: '1px solid rgba(124,114,221,0.4)',
                  textDecoration: 'none',
                  backgroundColor: 'rgba(124,114,221,0.07)',
                  whiteSpace: 'nowrap',
                }}>
                ⚛ Buy me a qubit
              </a>
            </div>
          )}

          {mobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!open && (
                <a href="https://ko-fi.com/qcollapses"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    color: '#7C72DD', fontSize: '11px', fontWeight: 500,
                    padding: '6px 12px', borderRadius: '100px',
                    border: '1px solid rgba(124,114,221,0.4)',
                    textDecoration: 'none',
                    backgroundColor: 'rgba(124,114,221,0.07)',
                    whiteSpace: 'nowrap',
                  }}>
                  ⚛ Buy me a qubit
                </a>
              )}
              <button
                onClick={() => setOpen(v => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                style={{
                  background: 'none', border: 'none',
                  width: '44px', height: '44px',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  position: 'relative', borderRadius: '8px',
                  padding: '10px',
                }}>
                <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 0 : -6 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'block', width: '20px', height: '1.5px', backgroundColor: '#E2E0FF', position: 'absolute', borderRadius: '2px', transformOrigin: 'center' }} />
                <motion.span animate={{ opacity: open ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'block', width: '20px', height: '1.5px', backgroundColor: '#E2E0FF', position: 'absolute', borderRadius: '2px' }} />
                <motion.span animate={{ rotate: open ? -45 : 0, y: open ? 0 : 6 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'block', width: '20px', height: '1.5px', backgroundColor: '#E2E0FF', position: 'absolute', borderRadius: '2px', transformOrigin: 'center' }} />
              </button>
            </div>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {open && mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              backgroundColor: '#09090F',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,114,221,0.08) 0%, transparent 70%)',
            }} />
            <div style={{ height: '56px', borderBottom: '1px solid #1C1C2E', flexShrink: 0 }} />
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', padding: '0 28px', position: 'relative',
            }}>
              {links.map((l, i) => (
                <motion.div key={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}>
                  <Link href={l.href}
                    style={{ textDecoration: 'none', display: 'block', padding: '20px 0', borderBottom: '1px solid #1C1C2E' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{
                          color: isActive(l.href) ? '#7C72DD' : '#E2E0FF',
                          fontSize: 'clamp(26px, 8vw, 36px)',
                          fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '4px',
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                        }}>
                          {l.label}
                        </div>
                        <div style={{ color: '#6B698A', fontSize: '13px' }}>{l.sub}</div>
                      </div>
                      <span style={{ color: '#7C72DD', fontSize: '22px' }}>→</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.3 }}
              style={{ padding: '28px', borderTop: '1px solid #1C1C2E' }}>
              <a href="https://ko-fi.com/qcollapses"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center',
                  background: 'linear-gradient(135deg, #7C72DD, #5F57C4)',
                  color: '#fff', padding: '16px', borderRadius: '12px',
                  fontWeight: 600, fontSize: '16px', textDecoration: 'none',
                }}>
                ⚛ Buy me a qubit
              </a>
              <p style={{ color: '#6B698A', fontSize: '11px', textAlign: 'center', marginTop: '10px', opacity: 0.5 }}>
                Via Ko-fi · No account needed
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
