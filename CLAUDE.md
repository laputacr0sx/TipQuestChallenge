# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ExploraQuest** is a mobile-first, AI-powered educational web application for Hong Kong primary school field trips. It transforms school visits into structured, motivating exploration experiences.

**Target Users:**
- Students (ages 8-10): Exploration game-style interface with minimal typing, image-first
- Teachers: Lightweight trip setup and review dashboard

**Core Phases:** Pre-Trip → During Trip → Post Trip

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database/Storage:** Supabase (PostgreSQL + S3-compatible Buckets)
- **State Management:** TanStack Query v5 (Optimistic UI & Cache synchronization)
- **AI Engine:** OpenAI GPT-4o-mini (Vision-enabled for image analysis)
- **Deployment:** Vercel

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm run test
```

## Architecture

### API Routes (REST)
- `GET /api/trips/[code]` — Verify and join trip (Student)
- `POST /api/trips/ai-generate` — Generate missions from destination context (Teacher)
- `POST /api/submissions` — Image upload + AI Vision feedback (Student)
- `GET /api/dashboard/[trip-id]` — Participation overview (Teacher)

### Database Schema (Supabase)

**trips**
- `id` (uuid)
- `access_code` (string, unique 4-digit)
- `name` (string)
- `topic` (string)
- `status` (enum: pre, during, post)

**missions**
- `id` (uuid)
- `trip_id` (fk)
- `title` (string)
- `objective` (text)

**results**
- `id` (uuid)
- `mission_id` (fk)
- `student_name` (string)
- `photo_url` (string)
- `ai_feedback` (text)
- `timestamp` (default: now())

### Component Architecture

**Server Components (RSC):**
- `TripIntroPage` — Fast static delivery
- `PostTripReport` — Data fetch for "Exploration Story" timeline
- `TeacherDashboard` — Direct DB fetch for class tables

**Client Components:**
- `ExplorerInterface` — Real-time camera and AI feedback
- `MissionGenerator` — Teacher's AI-assisted trip planning
- `TripJoiner` — LocalStorage-based session management

## Design Principles

- **Student Experience:** Exploration game vibe, visual-first, minimal typing, instant AI encouragement
- **AI Role:** Encouraging guide, not grader — respond motivatingly even for imperfect submissions
- **Teacher Workflow:** Quick trip setup, AI-generated missions, simple review dashboard
- **UX:** Optimistic UI with TanStack Query — show pending state immediately, rollback on failure

## Environment Variables Required

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Key Files

- `exploraquest_technical_final.md` — Technical specification
- `exploraquest_planning_phase.md` — Product planning document