import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  verification: {
    google: 'I5wtXvDOFhjA6CbWP3ITBNrGVuA45uOC3yZaVRxa0Kw',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  title: { default: 'QCollapses', template: '%s · QCollapses' },
  description: 'Quantum computing explained through its misconceptions. Form the wrong idea, then watch it collapse.',
  keywords: ['quantum computing', 'quantum machine learning', 'quantum misconceptions', 'quantum education'],
  openGraph: {
    title: 'QCollapses',
    description: 'Quantum computing explained through its misconceptions. Form the wrong idea, then watch it collapse.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QCollapses',
    description: 'Quantum computing explained through its misconceptions. Form the wrong idea, then watch it collapse.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html, body {
            background-color: #09090F !important;
            color: #E2E0FF !important;
            font-family: 'Space Grotesk', system-ui, sans-serif !important;
            overflow-x: hidden;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          * { box-sizing: border-box; }
          a { color: inherit; }
          button { font-family: inherit; cursor: pointer; }
        `}</style>
      </head>
      <body>
        <Navbar />
        <main id="main-content" style={{ paddingTop: '56px' }}>
          {children}
        </main>
        <footer style={{
          borderTop: '1px solid #1C1C2E',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#09090F',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="16" height="15" viewBox="0 0 40 38" fill="none">
                <path d="M 20 13 C 18 5, 3 5, 3 13 C 3 21, 18 21, 20 13" stroke="#7C72DD" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M 20 13 C 22 5, 37 5, 37 13 C 37 21, 22 21, 20 13" stroke="#7C72DD" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="20" y1="13" x2="20" y2="32" stroke="#7C72DD" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="13" y1="28" x2="27" y2="28" stroke="#7C72DD" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <span style={{ color: '#E2E0FF', fontSize: '14px', fontWeight: 500 }}>QCollapses</span>
            </div>
            <p style={{ color: '#6B698A', fontSize: '13px', marginBottom: '8px' }}>
              Quantum computing explained through its misconceptions. Form the wrong idea, then watch it collapse.
            </p>
            <p style={{ color: '#6B698A', fontSize: '12px', opacity: 0.4 }}>
              Built in public by a quantum lover
            </p>
            <div style={{
              marginTop: '24px', paddingTop: '24px',
              borderTop: '1px solid #1C1C2E',
              display: 'flex', justifyContent: 'center',
              gap: '24px', flexWrap: 'wrap',
            }}>
              {[
                { label: 'Misconceptions',      href: '/misconceptions'    },
                { label: 'Simulator',   href: '/simulator' },
                { label: 'Daily Papers', href: '/papers' },
                { label: 'About',       href: '/about'     },
              ].map(l => (
                <a key={l.href} href={l.href}
                  style={{ color: '#6B698A', fontSize: '12px', textDecoration: 'none' }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
