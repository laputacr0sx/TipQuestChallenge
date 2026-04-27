# ExploraQuest — Database & Auth Specification

**Sub-project:** 1 of 4 (Sequential)
**Date:** 2026-04-24
**Status:** Approved for Implementation

---

## 1. Overview

Set up Supabase backend with PostgreSQL schema, Row Level Security (RLS) policies, teacher authentication via Supabase Auth, and simplified student access via trip codes.

---

## 2. Goals

- Teachers can sign up/login with email/password
- Teachers can create, view, edit, and delete their own trips
- Students can join a trip by entering a 4-digit access code + their name
- Students can view missions and submit photos for their trip only
- RLS policies enforce security at the database level

---

## 3. Database Schema

### Table: `profiles`
Links to Supabase Auth users for additional user data.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE |
| `email` | text | NOT NULL |
| `role` | text | NOT NULL, DEFAULT 'teacher' |
| `full_name` | text | |
| `created_at` | timestamptz | DEFAULT now() |

### Table: `trips`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PRIMARY KEY DEFAULT gen_random_uuid() |
| `access_code` | text | NOT NULL, UNIQUE, 4 characters (0-9) |
| `name` | text | NOT NULL |
| `topic` | text | NOT NULL |
| `status` | text | NOT NULL, DEFAULT 'pre', CHECK (status IN ('pre', 'during', 'post')) |
| `teacher_id` | uuid | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

### Table: `missions`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PRIMARY KEY DEFAULT gen_random_uuid() |
| `trip_id` | uuid | NOT NULL, REFERENCES trips(id) ON DELETE CASCADE |
| `title` | text | NOT NULL |
| `objective` | text | NOT NULL |
| `order_index` | integer | NOT NULL DEFAULT 0 |
| `created_at` | timestamptz | DEFAULT now() |

### Table: `results`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PRIMARY KEY DEFAULT gen_random_uuid() |
| `mission_id` | uuid | NOT NULL, REFERENCES missions(id) ON DELETE CASCADE |
| `student_name` | text | NOT NULL |
| `photo_url` | text | NOT NULL |
| `ai_feedback` | text | |
| `timestamp` | timestamptz | DEFAULT now() |

---

## 4. Row Level Security (RLS) Policies

### `profiles` table
- **SELECT**: User can read their own profile
- **INSERT**: Allow insert for authenticated users
- **UPDATE**: User can update their own profile

### `trips` table
- **SELECT**:
  - Teachers can SELECT their own trips (teacher_id = auth.uid())
  - Students can SELECT trips via access_code (handled in API, not RLS)
- **INSERT**: Authenticated teachers can insert
- **UPDATE**: Teachers can update their own trips
- **DELETE**: Teachers can delete their own trips

### `missions` table
- **SELECT**:
  - Teachers can SELECT missions for their own trips
  - Students can SELECT missions for trips they joined
- **INSERT**: Teachers can insert missions for their own trips
- **UPDATE**: Teachers can update missions for their own trips
- **DELETE**: Teachers can delete missions for their own trips

### `results` table
- **SELECT**:
  - Teachers can SELECT results for their own trips
  - Students can SELECT their own results (by student_name matching their session)
- **INSERT**: Students can insert results for their joined trip (no auth required, validated via API)
- **UPDATE**: Teachers can update results (e.g., add manual notes)
- **DELETE**: Teachers can delete results for their own trips

---

## 5. API Routes (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trips/[code]` | GET | Verify access code exists, return trip details + missions |
| `/api/trips/ai-generate` | POST | Generate missions via OpenAI for a trip (teacher) |
| `/api/submissions` | POST | Handle photo upload + AI vision feedback |
| `/api/dashboard/[trip-id]` | GET | Teacher view: participation stats |

### Student Session Storage
- Use `localStorage` to store: `{ tripId, accessCode, studentName }`
- No authentication required for students (access_code provides trip isolation)

---

## 6. Supabase Client Configuration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  (server-side only)
```

---

## 7. Implementation Order

1. **Create Supabase project** and configure environment variables
2. **Run SQL migration** to create tables and RLS policies
3. **Configure storage bucket** for student photo uploads
4. **Set up Supabase client** in Next.js app
5. **Create helper functions** for common operations (get trip by code, etc.)
6. **Test RLS policies** manually

---

## 8. Acceptance Criteria

- [ ] Teacher can sign up/login via Supabase Auth
- [ ] Teacher can create a trip with auto-generated 4-digit access code
- [ ] Teacher can view their own trips but not other teachers' trips
- [ ] Student can join trip by entering valid access code + name
- [ ] Student can see missions for their joined trip
- [ ] Student can submit a photo and receive AI feedback
- [ ] Teacher can see all student submissions for their trips
- [ ] RLS prevents unauthorized access at database level
- [ ] Photos are stored in Supabase Storage bucket
- [ ] Application handles auth errors gracefully

---

## 9. Dependencies

- `@supabase/supabase-js` — Supabase JavaScript client
- `@supabase/ssr` — Next.js SSR helpers (if using Supabase Auth helpers)
- `nanoid` — For generating short unique codes

---

## 10. Out of Scope

- Complex role management beyond teacher/student
- Multi-school/enterprise features
- Offline sync
- Real-time subscriptions (add later if needed)