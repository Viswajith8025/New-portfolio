export type Project = {
  id: string
  title: string
  subtitle: string
  category: string
  poster: string
  description: string
  features: string[]
  tags: string[]
  liveUrl?: string
  repoUrl?: string
  phoneFrame?: boolean
  featured?: boolean
}

export type Experience = {
  org: string
  role: string
  dates: string
  bullets: string[]
}

export const profile = {
  name: 'Viswajith E',
  short: 'VISWAJITH E',
  logoRest: 'ISWAJITH E',
  eyebrow: 'Available for New Opportunities',
  roleLine: ['Full Stack Developer'],
  tagline:
    'Forward deployed engineer shipping AI agents, business automation, and full-stack ops software with React, TypeScript, Python, and Supabase.',
  loaderLine: 'SHIPPING AI AGENTS AND FULL-STACK OPS SOFTWARE',
  frameRole: 'Software Engineer (FDE)',
  email: 'viswajith.e.cs@gmail.com',
  phone: '+91 7736958025',
  phoneHref: 'tel:+917736958025',
  location: 'Calicut, Kerala 673010',
  whatsapp: {
    label: 'WHATSAPP',
    number: '+91 77369 58025',
    url: 'https://wa.me/917736958025?text=Hi%20Viswajith%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project.',
  },
  linkedin: 'https://www.linkedin.com/in/viswajithe',
  github: 'https://github.com/Viswajith8025',
  resume: '/resume.pdf',
  portrait: '/media/portrait.webp',
  hero: '/hero/hero-bg.jpg',
}

export const about = {
  eyebrow: 'About Me',
  title: 'ABOUT VISWAJITH E.',
  paragraphs: [
    'Full stack developer and forward deployed engineer — AI agents, business automation, and ops software in React, TypeScript, Python, and Supabase.',
    'Client-facing by default: on-site visits, requirement gathering, then shipping systems with RBAC and real data workflows.',
  ],
  toolkit: [
    'React',
    'TypeScript',
    'Python',
    'FastAPI',
    'Supabase',
    'LangGraph',
    'Node.js',
    'Tailwind CSS',
    'Flutter',
    'PostgreSQL',
  ],
}

export const experience: Experience[] = [
  {
    org: 'Demo Vendor Co.',
    role: 'Software Engineer (FDE)',
    dates: '06/2026 · Calicut',
    bullets: [
      'Client requirements, on-site visits, and workflow analysis.',
      'AI automations, agentic workflows, and full-stack ops apps.',
      'Implementation, integration, testing, and client-driven refinement.',
    ],
  },
  {
    org: 'Freelance',
    role: 'Full Stack Developer',
    dates: '09/2024 – 04/2026 · Calicut',
    bullets: [
      'Client web apps: auth, dashboards, responsive UI, business workflows.',
      'Frontend + backend, integration, deployment, and hosting.',
    ],
  },
]

export const education = [
  { title: 'Bachelor of Computer Science', meta: 'IHRD · 2021 – 2024' },
  { title: 'Agentic AI · LangChain & LangGraph', meta: 'IBM · Coursera · Aug 2026' },
  { title: 'MERN Stack Internship', meta: 'Softroniics · Jun 2024 – Feb 2025' },
]

export const stats = [
  { id: 'years', value: 2, suffix: '+', label: 'Years Building' },
  { id: 'works', value: 16, suffix: '', label: 'Selected Works' },
  { id: 'live', value: 6, suffix: '', label: 'Live Products' },
]

export const projects: Project[] = [
  {
    id: 'report-agent',
    featured: true,
    title: 'Multi-Business AI Reporting Assistant',
    subtitle: 'WhatsApp BI across two businesses',
    category: 'AI Agents',
    poster: '/thumbnails/report-agent.webp',
    description:
      'WhatsApp BI agent spanning parcel logistics and fuel-station data — cron SQL digests with no LLM, plus a LangGraph lane that only calls whitelisted parameterized tools.',
    features: [
      'Lane A: reviewed SQL → reconcile validation → PDF/Excel via Baileys (figures never from LLM).',
      'Lane B: layout JSON editable; every stated number must come back from a SQL tool.',
    ],
    tags: ['LangGraph', 'SQL', 'Baileys'],
  },
  {
    id: 'field-ops',
    title: 'Field Sales & Operations Platform',
    subtitle: 'GPS-gated visits and offline sync',
    category: 'Field Ops',
    poster: '/thumbnails/operations-admin.webp',
    description:
      'Field-sales stack where visits must start within 50 m of the shop, GPS trails ride the open sale cycle, and offline negotiate/complete share one session id.',
    features: [
      'VisitVerification gates (50 m start / 30 m accuracy) with fraud flags on the session.',
      'Android foreground location bounded to the sale cycle; offline GPS queue keeps timestamps.',
    ],
    tags: ['Flutter', 'GPS FGS', 'Supabase'],
  },
  {
    id: 'fuel-os',
    title: 'Fuel Station Management System',
    subtitle: 'Shift face check and pump sync',
    category: 'Station OS',
    poster: '/thumbnails/fuelbunk-os.webp',
    description:
      'Station OS with on-device face anti-spoof for shift open/close, live BOS pump sync, and a digest-only WhatsApp bridge.',
    features: [
      'YuNet detect + SFace embed + MiniFASNet anti-spoof — scores only, no face DB on the bunk PC.',
      'Punch-gated shift sessions plus 20+ BOS payload kinds upserted into Supabase.',
    ],
    tags: ['ONNX Face', 'BOS Sync', 'PWA'],
  },
  {
    id: 'factory',
    title: 'Offline-First Textile Factory Management System',
    subtitle: 'LAN source of truth over Tailscale',
    category: 'Factory Systems',
    poster: '/thumbnails/factory-app.webp',
    description:
      'LAN-only textile factory PWA — phones work offline; the factory PC (SQLite WAL) is the only source of truth over Tailscale.',
    features: [
      'Idempotent sync_ops with applied / conflict / held recovery on the outbox.',
      'Money and qty as integers (paise, cm, mg); two factories with outside-role lockdown.',
    ],
    tags: ['Offline sync', 'SQLite', 'Paise'],
  },
  {
    id: 'resort',
    title: 'Resort Attendance & Housekeeping Ops',
    subtitle: 'Face punch and evening digests',
    category: 'Hospitality Ops',
    poster: '/thumbnails/resort-app.webp',
    description:
      'Multi-property resort ops app where staff punch with AWS Rekognition face match, housekeeping needs photo proof, and owners get Baileys EOD WhatsApp digests.',
    features: [
      'Face punch at ~95% match threshold with duplicate-face collapse across enrolments.',
      '6 PM IST Baileys EOD digests: attendance, leave, and unfinished rooms — no Meta template lag.',
    ],
    tags: ['Rekognition', 'Supabase', 'Baileys'],
  },
  {
    id: 'lending',
    title: 'Lending & Loan Operations Platform',
    subtitle: 'Paise schedules and cash routes',
    category: 'Lending',
    poster: '/thumbnails/blade-finance.webp',
    description:
      'Multi-role lending OS — paise-exact loan schedules, field cash routes with once-only handover, and bilingual EN/Tamil desks.',
    features: [
      'Installment math in paise with IST day boundaries — Recovery/Advance derived from schedule state.',
      'Field stop list → cash/UPI collect → single cash handover to accountant (RLS-hardened).',
    ],
    tags: ['Loan engine', 'Supabase', 'i18n'],
  },
  {
    id: 'pipeline',
    title: 'Corporate Sales Pipeline',
    subtitle: 'MD gates on the kanban',
    category: 'Sales Pipeline',
    poster: '/thumbnails/sales-pipeline.webp',
    description:
      'B2B sales kanban with MD approval gates and renewal periods — illegal stage drags are blocked in the UI and RLS.',
    features: [
      'Pipeline → pending_md → converted/renewal/lost, including MD counter/renegotiate.',
      'Mandatory next-step on board moves; salesperson portal vs admin approval strip.',
    ],
    tags: ['MD gates', 'Kanban', 'Supabase'],
  },
  {
    id: 'erp',
    title: 'IT Services ERP SaaS',
    subtitle: 'Enterprise Business Management Platform',
    category: 'ERP',
    poster: '/thumbnails/erp.webp',
    description:
      'Agency ERP that syncs eSSL biometric punches over SOAP and keeps writes race-safe with optimistic concurrency — plus GST billing.',
    features: [
      'Local sync agent pulls GetTransactionsLog from eSSL devices into attendance.',
      'Version-column OCC + immutable audit logs so concurrent edits don’t silently clobber.',
    ],
    tags: ['eSSL SOAP', 'Supabase', 'OCC'],
  },
  {
    id: 'campus',
    title: 'Campus Task Accountability',
    subtitle: 'Assignment rules in Postgres',
    category: 'Campus Tools',
    poster: '/thumbnails/kmct.webp',
    description:
      'Accountability module for a multi-college group — assignment hierarchy is enforced in Postgres, not just the UI, across campus roles.',
    features: [
      'DB + workflow forbid coordinators assigning “up”; owners can assign across colleges.',
      'Daily login summary modal: new / overdue / due-soon (IST), dismiss once per day.',
    ],
    tags: ['Supabase', 'RLS', 'React'],
  },
  {
    id: 'vault-er',
    featured: true,
    title: 'VAULT-ER',
    subtitle: 'Credentials vault with live RLS gates',
    category: 'Security',
    poster: '/thumbnails/vault-er.webp',
    description:
      'PWA credentials vault with per-item TOTP codes, walk-away vault lock, and release gates that live-test RLS isolation between accounts.',
    features: [
      'Idle/manual lock wipes in-memory vault; clipboard auto-clear after copy.',
      'npm run gate proves user B cannot read user A’s vault, docs, or audit log.',
    ],
    tags: ['TOTP', 'RLS', 'PWA'],
    liveUrl: 'https://vault-err.netlify.app/',
    repoUrl: 'https://github.com/Viswajith8025/Vault-er',
  },
  {
    id: 'viswallet',
    featured: true,
    title: 'Viswallet',
    subtitle: 'Offline finance in integer paise',
    category: 'Finance',
    poster: '/thumbnails/viswallet.webp',
    description:
      'Offline-first finance PWA — integer paise in Dexie, salary-day cycles, and passphrase-wrapped encrypted backups.',
    features: [
      'Salary-day month keys drive pacing instead of calendar-month assumptions.',
      'Export/import as encrypted .vwbackup with passphrase — not plain JSON by default.',
    ],
    tags: ['Dexie', 'Paise', 'AES backup'],
    liveUrl: 'https://viswallet-sigma.vercel.app/',
    repoUrl: 'https://github.com/Viswajith8025/Viswallet',
  },
  {
    id: 'flexora',
    featured: true,
    title: 'Flexora',
    subtitle: 'One-Day Job Platform',
    category: 'Marketplaces',
    poster: '/thumbnails/flexora.webp',
    description:
      'Same-day local staffing marketplace where district-aware job matching meets live Socket.io status and Razorpay checkout before a shift starts.',
    features: [
      'Region/district regex matching so seekers see jobs near them, not a national dump.',
      'Socket.io live job status plus Razorpay order create → signature verify on pay.',
    ],
    tags: ['Socket.io', 'Razorpay', 'MongoDB'],
    liveUrl: 'https://flexora-wheat.vercel.app/',
    repoUrl: 'https://github.com/Viswajith8025/Flexora',
  },
  {
    id: 'civic-eye',
    featured: true,
    title: 'Civic Eye',
    subtitle: 'Citizen Complaint Reporting',
    category: 'Civic Tech',
    poster: '/thumbnails/civiceye.webp',
    description:
      'Civic complaint PWA that clusters nearby reports on a map, AI-summarizes cases for staff, and notifies citizens on status and rewards.',
    features: [
      'Mongo $near geo queries (Haversine fallback) so nearby complaints cluster on Leaflet.',
      'OpenAI municipal summaries with rule-based fallback when no API key is set.',
    ],
    tags: ['MongoDB Geo', 'OpenAI', 'PWA'],
    repoUrl: 'https://github.com/Viswajith8025/CivicEye',
  },
  {
    id: 'livekeralam',
    featured: true,
    title: 'LiveKeralam',
    subtitle: 'Discovery Platform',
    category: 'Discovery',
    poster: '/thumbnails/livekeralam.webp',
    description:
      'Kerala heritage discovery with SoulSync scoring — vibe, district, and season weighted into a personal festival blueprint, then live event chat.',
    features: [
      'Weighted match engine (vibe keywords, district proximity, season) in SoulSync.',
      'JWT-auth Socket.io rooms per event plus admin support/event moderation inbox.',
    ],
    tags: ['SoulSync', 'Socket.io', 'MERN'],
    liveUrl: 'https://eventkeralamm.vercel.app/',
    repoUrl: 'https://github.com/Viswajith8025/LiveKeralam',
  },
  {
    id: 'arsenal',
    featured: true,
    title: 'Arsenal Fitness',
    subtitle: 'Premium Fitness Platform',
    category: 'Brand Sites',
    poster: '/thumbnails/arsenal.webp',
    description:
      'Gym brand site with an on-page AI coach scoped to gym knowledge, and join leads delivered over Telegram.',
    features: [
      'Kiran coach: Groq → OpenAI → Gemini provider fallback over a fixed gym knowledge base.',
      'Serverless join API posts leads to Telegram when the bot token is configured.',
    ],
    tags: ['Groq', 'Telegram', 'React'],
    liveUrl: 'https://www.arsenalfitness.in/',
    repoUrl: 'https://github.com/Viswajith8025/ArsenalFitness',
  },
  {
    id: 'janani',
    featured: true,
    title: 'Janani',
    subtitle: 'Wellness Experience',
    category: 'Booking',
    poster: '/thumbnails/janani.webp',
    description:
      'Wayanad Ayurveda retreat with real booking refs and Razorpay checkout — not a brochure-only site.',
    features: [
      'JAN- booking references into Supabase with Razorpay order create + signature verify.',
      'Rate-limited booking/auth routes and Zod-validated payment schemas.',
    ],
    tags: ['Razorpay', 'Supabase', 'React'],
    liveUrl: 'https://jananilifestyle.in',
  },
]

export const services = [
  { id: 'agents', title: 'AI Agents & WhatsApp Reporting', priceLabel: 'Engagement', price: 'Freelance / Contract' },
  { id: 'field', title: 'Field Ops & Offline-First Apps', priceLabel: 'Engagement', price: 'Freelance / Contract' },
  { id: 'backends', title: 'Supabase Backends, Auth & RLS', priceLabel: 'Engagement', price: 'Freelance / Contract' },
  { id: 'web', title: 'Full-Stack Web Apps', priceLabel: 'Engagement', price: 'Freelance / Contract' },
  { id: 'sites', title: 'Booking & Brand Sites', priceLabel: 'Engagement', price: 'Freelance / Contract' },
]

export const skills = [
  { name: 'React', category: 'Frontend', level: 'Master' },
  { name: 'TypeScript', category: 'Frontend', level: 'Advanced' },
  { name: 'Python / FastAPI', category: 'Backend', level: 'Advanced' },
  { name: 'Supabase / Postgres', category: 'Data', level: 'Advanced' },
  { name: 'LangGraph AI Agents', category: 'AI', level: 'Advanced' },
  { name: 'Node.js APIs', category: 'Backend', level: 'Proficient' },
  { name: 'Tailwind / UI Engineering', category: 'Frontend', level: 'Advanced' },
  { name: 'Git & CI/CD', category: 'Tools', level: 'Proficient' },
]

export const arsenal = [
  { slug: 'react', label: 'React' },
  { slug: 'typescript', label: 'TypeScript' },
  { slug: 'python', label: 'Python' },
  { slug: 'fastapi', label: 'FastAPI' },
  { slug: 'supabase', label: 'Supabase' },
  { slug: 'langchain', label: 'LangChain' },
  { slug: 'git', label: 'Git' },
] as const

export const aiWorkflow = [
  'LangGraph',
  'LangChain',
  'n8n',
  'Claude',
  'Claude Code',
  'ChatGPT',
  'GitHub Copilot',
  'OpenAI Codex',
  'Cursor',
  'Grok',
]

export const navLinks = [
  { href: '#projects', label: 'Projects' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]
