---
name: habit-quest-overview
description: Habit Quest - gamified RPG habit tracker for two people, inspired by Frieren and Atomic Habits. GDD v3 in docs/gdd-v3.md.
type: project
---

**Habit Quest** — app personal de hábitos gamificada estilo RPG para dos personas (Alex y su novia).

**Why:** Las apps de hábitos existentes tienen gamificación cosmética sin consecuencias reales. Este sistema usa narrativa generativa estilo Frieren con pérdidas reales cuando no cumplís.

**How to apply:**
- El GDD v3 es la fuente de verdad del diseño: `docs/gdd-v3.md`
- Stack: Next.js 15 (App Router, RSC, Tailwind), Claude API (narrativa), Nano Banana/Gemini (imágenes), Veo 3.1 (video), PostgreSQL + Prisma, Supabase (auth + storage), Railway/Render (deploy)
- Filosofía: identidad > resultados, consecuencias sin juicio moral, narrativa Frieren hardcodeada
- Roadmap original: 8 semanas incrementales (MVP core → consecuencias → co-op → visual → vínculo → arcos → recompensas → pulido)
- Desarrollo con spec-driven development y brainstorming de superpowers para cada feature
