# ExploraQuest — Final Technical Specification (v2)

## 🏗️ Architecture Baseline
- **Framework:** Next.js 14+ (App Router)
- **Deployment:** Vercel (Production-grade Serverless)
- **Database/Storage:** Supabase (PostgreSQL + S3-compatible Buckets)
- **State Management:** TanStack Query v5 (Optimistic UI & Cache synchronization)
- **AI Engine:** OpenAI GPT-4o-mini (Vision-enabled for immediate on-site feedback)

## 📡 The API Strategy (Option A: Explicit REST)
We explicitly chose RESTful API routes over Server Actions for clear documentation and decoupled testing during the demo.

### Key Endpoints
1. `GET /api/trips/[code]` - Verify and join trip (Student)
2. `POST /api/trips/ai-generate` - Destination context -> AI Mission list (Teacher)
3. `POST /api/submissions` - Image upload + AI Vision feedback (Student)
4. `GET /api/dashboard/[trip-id]` - Participation overview (Teacher)

## ⚡ UX Strategy: Optimistic UI with Tanstack Query v5
We will implement an "Expectation First" UX:
- **Student Submission:** When a photo is taken, we immediately render a local "pending" card. 
- **AI Processing:** The `useMutation` `onMutate` hook handles UI state, while the background process handles Supabase upload and OpenAI Vision calls.
- **Rollback:** In case of failure, we use the `onError` pattern to inform the child and restore the session state.

## 💾 Data Schema (Supabase)

### Table: `trips`
- `id` (uuid)
- `access_code` (string, unique 4-digit)
- `name` (string)
- `topic` (string)
- `status` (enum: pre, during, post)

### Table: `missions`
- `id` (uuid)
- `trip_id` (fk)
- `title` (string)
- `objective` (text)

### Table: `results`
- `id` (uuid)
- `mission_id` (fk)
- `student_name` (string)
- `photo_url` (string)
- `ai_feedback` (text)
- `timestamp` (default: now())

## 🖥️ Component Architecture (RSC vs Client)

### Server Components (RSC)
- `TripIntroPage`: Fast static delivery.
- `PostTripReport`: Heavily optimized data fetch for "Exploration Story" timeline.
- `TeacherDashboard`: Direct DB fetch for class tables.

### Client Components (Tanstack Query)
- `ExplorerInterface`: Real-time camera interactions and AI feedback state machine.
- `MissionGenerator`: Teacher's AI-assisted trip planning tool.
- `TripJoiner`: LocalStorage-based session management for students.

## 📅 48-Hour Implementation Path

### Phase 1: Foundation (8h)
- DB Schema in Supabase.
- Config for `openai` and `@tanstack/react-query`.
- Standard project boilerplate with responsive mobile padding.

### Phase 2: AI & Logic (12h)
- Implementation of the `api/submissions` vision route.
- Fine-tuning the AI "Exploration Guide" system prompt.
- Server-side validation logic for trip codes.

### Phase 3: Interface Construction (20h)
- Mobile-first Explorer UI (The Student "Game").
- Teacher Console (The Dashboard).
- Real-time interaction loop testing.

### Phase 4: Polish & Deploy (8h)
- Vercel Deployment.
- Client-side image compression implementation.
- Final visual polish (Animations for "AI is thinking").
