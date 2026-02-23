<div align="center">

# 🧠 MindMesh

### AI-Powered Idea Collaboration Engine

*Map ideas as graphs. Analyze them with AI. Simulate revenue. Generate investor decks.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **Idea Graph Editor** | Drag-and-drop node canvas powered by React Flow — map Problems, Solutions, Revenue streams, Competitors, Markets, and Teams visually |
| 🤖 **AI Analysis** | One-click SWOT analysis with risk score, market viability, and revenue estimate — works out-of-the-box with mock AI (or plug in OpenAI GPT-4o-mini) |
| 📊 **Revenue Simulation** | Slider-based 12-month revenue projector with country adjustments, audience size, pricing, and Recharts bar visualizations |
| 🎤 **Pitch Deck Generator** | Auto-generates a 10-slide investor pitch deck from your idea graph |
| 👥 **Collaboration** | Invite collaborators with OWNER / EDITOR / VIEWER roles per room |
| 🔐 **Auth** | Email + password auth via NextAuth v5, optional Google OAuth |
| 🛡️ **Admin Dashboard** | User management, ban/unban, activity log |
| 💎 **Glassmorphism UI** | Dark-first animated gradient background with glassmorphism design system |

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/Rajvansh-1/MindMesh.git
cd MindMesh

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — the only required value for local dev is already set:
# DATABASE_URL="file:./dev.db"
# NEXTAUTH_SECRET=any-random-string

# 4. Initialize the database (SQLite — zero config)
npx prisma db push

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

> **No API keys needed** — AI analysis runs in mock mode by default.

---

## 🗂️ Project Structure

```
MindMesh/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Dashboard, Room, Admin pages
│   └── api/             # NextAuth + Admin API routes
├── actions/             # Server Actions (room, graph, AI, simulation, auth)
├── components/
│   ├── graph/           # GraphCanvas (React Flow), CustomNode, Toolbar, Header
│   ├── analytics/       # AnalysisPanel (SWOT), SimulationPanel (charts)
│   ├── dashboard/       # SidebarNav, CreateRoomModal
│   └── admin/           # BanUserButton
├── lib/                 # db.ts, auth.ts, ai.ts, utils.ts
├── prisma/              # schema.prisma (SQLite / PostgreSQL)
└── types/               # NextAuth type augmentation
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | SQLite: `file:./dev.db` \| PostgreSQL: connection string |
| `NEXTAUTH_SECRET` | ✅ | Any random string for JWT signing |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` (or your deployment URL) |
| `OPENAI_API_KEY` | Optional | Enables real GPT-4o-mini analysis (mock works without it) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |

---

## 🗄️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + custom glassmorphism |
| Auth | NextAuth v5 (JWT, Credentials, Google OAuth) |
| ORM | Prisma 5 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Graph | @xyflow/react (React Flow v12) |
| Charts | Recharts |
| Validation | Zod |
| UI Primitives | Lucide React |

---

## 🌐 Deploying to Vercel

### 1. Switch to PostgreSQL

In `prisma/schema.prisma`:
```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
}
```

### 2. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rajvansh-1/MindMesh)

Or manually:
1. Push code to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set environment variables (get a free PostgreSQL URL from [Supabase](https://supabase.com) or [Neon](https://neon.tech))
4. Deploy — Vercel auto-detects Next.js

### 3. Initialize Production DB

```bash
# Run once with your production DATABASE_URL set in .env.local
npx prisma db push
```

---

## 🛠️ Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push Prisma schema to DB
npm run db:studio    # Open Prisma Studio (visual DB editor)
```

---

## 📄 License

MIT © 2026 [Rajvansh](https://github.com/Rajvansh-1)
