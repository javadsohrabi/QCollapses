import { notFound } from 'next/navigation'
import exhibitsData from '../../../content/exhibits.json'
import CaseClient from './CaseClient'

interface Exhibit {
  id:            string
  title:         string
  myth:          string
  category:      string
  difficulty:    string
  readTime:      string
  room:          string
  belief:        string
  correction:    string
  researchNote:  string
  simulatorPreset: string
  tags:          string[]
  relatedIds:    string[]
}

const exhibits = exhibitsData as Exhibit[]

export function generateStaticParams() {
  return exhibits.map(e => ({ id: e.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exhibit = exhibits.find(e => e.id === id)
  if (!exhibit) return {}
  return {
    title: exhibit.myth + ' · QCollapses',
    description: exhibit.correction.slice(0, 160),
  }
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exhibit = exhibits.find(e => e.id === id)
  if (!exhibit) notFound()
  const found = exhibit!
  const related = exhibits.filter(e => found.relatedIds?.includes(e.id) ?? false)
  return <CaseClient exhibit={found} related={related} />
}
