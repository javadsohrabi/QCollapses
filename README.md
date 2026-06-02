# QCollapses

**Interactive quantum misconceptions museum** — learn quantum computing by watching wrong ideas collapse.

🌐 [qcollapses.com](https://qcollapses.com)

## What is this?

QCollapses is a free educational platform for quantum computing researchers, students, and engineers. It corrects common misconceptions about quantum computing through:

- **28+ misconception cases** — each with the myth, why people believe it, the correction, and an interactive demo
- **Browser-based quantum circuit simulator** — 4 qubits, 13 gate types, noise simulation, shot-based sampling, gate optimizer
- **Curated daily papers** — one carefully selected quantum computing paper per day with plain-language summaries
- **Visual demos** — inline charts for barren plateaus, Shor resource requirements, QML comparison, hardware topology

## Stack

- Next.js 16 (Turbopack)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Vercel Analytics

## Content

All content lives in two JSON files — no database, no CMS:

- `content/exhibits.json` — misconception cases
- `content/papers.json` — curated papers

Adding new content requires only editing these files.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT

---

Built by a quantum lover, learning in public.
