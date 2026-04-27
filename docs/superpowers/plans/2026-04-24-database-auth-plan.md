# Database & Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Supabase backend with PostgreSQL schema, RLS policies, teacher authentication, and student trip access via codes.

**Architecture:** Use Supabase Auth for teachers, RLS for database security, and API-layer validation for student trip access. Photos stored in Supabase Storage bucket.

**Tech Stack:** Next.js 14+ (App Router), Supabase (PostgreSQL + Auth + Storage), TanStack Query v5, OpenAI GPT-4o-mini

---

## File Structure

```
exploraquest/
├── .env.local                      # Local environment variables
├── lib/
│   └── supabase.ts                 # Supabase client initialization
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema + RLS policies
├── scripts/
│   └── setup-storage.ts            # Storage bucket setup script
├── app/
│   └── api/
│       ├── trips/
│       │   └── [code]/
│       │       └── route.ts        # GET trip by access code
│       ├── submissions/
│       │   └── route.ts            # POST photo submission + AI feedback
│       └── dashboard/
│           └── [tripId]/
│               └── route.ts        # GET teacher dashboard data
├── utils/
│   ├── trip.ts                     # Trip-related helper functions
│   └── auth.ts                     # Auth-related helper functions
└── types/
    └── supabase.ts                 # Generated Supabase types
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `.env.local.example`

- [ ] **Step 1: Initialize Next.js project with TypeScript**

Run:
```bash
npx create-next-app@latest exploraquest --typescript --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm
```

Expected: Next.js project created with TypeScript and App Router

- [ ] **Step 2: Install dependencies**

Run:
```bash
cd exploraquest
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query openai nanoid
npm install -D @types/node typescript
```

Expected: Dependencies installed

- [ ] **Step 3: Create .env.local.example**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-...
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with dependencies"
```

---

## Task 2: Configure Supabase Client

**Files:**
- Modify: `.env.local` (create from example)
- Create: `lib/supabase.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`

- [ ] **Step 1: Write the failing test**

Create: `tests/lib/supabase.test.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Mock environment variables
const mockUrl = 'https://test.supabase.co'
const mockKey = 'eyJtestKey'

describe('Supabase Client', () => {
  it('should create a client with valid URL and key', () => {
    const supabase = createClient(mockUrl, mockKey)
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/supabase.test.ts`
Expected: PASS (createClient is a simple factory)

- [ ] **Step 3: Write minimal implementation**

Create: `lib/supabase.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
```

Create: `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from Server Component
        }
      },
    },
  })
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- tests/lib/supabase.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat: add Supabase client setup"
```

---

## Task 3: Create Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write SQL migration for tables and RLS**

Create: `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (links to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pre' CHECK (status IN ('pre', 'during', 'post')),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  ai_feedback TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can select own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trips RLS policies
CREATE POLICY "Teachers can select own trips" ON trips
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own trips" ON trips
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own trips" ON trips
  FOR DELETE USING (teacher_id = auth.uid());

-- Missions RLS policies
CREATE POLICY "Teachers can select missions for own trips" ON missions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM trips WHERE id = missions.trip_id AND teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can insert missions for own trips" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE id = missions.trip_id AND teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can update missions for own trips" ON missions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trips WHERE id = missions.trip_id AND teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can delete missions for own trips" ON missions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM trips WHERE id = missions.trip_id AND teacher_id = auth.uid())
  );

-- Results RLS policies
CREATE POLICY "Teachers can select results for own trips" ON results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN trips t ON m.trip_id = t.id
      WHERE m.id = results.mission_id AND t.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update results for own trips" ON results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN trips t ON m.trip_id = t.id
      WHERE m.id = results.mission_id AND t.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete results for own trips" ON results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN trips t ON m.trip_id = t.id
      WHERE m.id = results.mission_id AND t.teacher_id = auth.uid()
    )
  );

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index on trips.access_code for fast lookups
CREATE INDEX idx_trips_access_code ON trips(access_code);

-- Create index on missions.trip_id
CREATE INDEX idx_missions_trip_id ON missions(trip_id);

-- Create index on results.mission_id
CREATE INDEX idx_results_mission_id ON results(mission_id);
```

- [ ] **Step 2: Document how to run migration**

Add to project README or Supabase dashboard:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add database schema with RLS policies"
```

---

## Task 4: Set Up Storage Bucket

**Files:**
- Create: `scripts/setup-storage.ts`

- [ ] **Step 1: Write storage bucket setup script**

Create: `scripts/setup-storage.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupStorage() {
  // Create bucket for student photos
  const { data: bucket, error: bucketError } = await supabaseAdmin.storage.createBucket(
    'student-photos',
    {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    }
  )

  if (bucketError) {
    // Bucket might already exist, which is fine
    if (bucketError.message.includes('already exists')) {
      console.log('Bucket "student-photos" already exists')
    } else {
      console.error('Error creating bucket:', bucketError)
      process.exit(1)
    }
  } else {
    console.log('Created bucket "student-photos"')
  }

  // Set up storage policy for public read access
  const { error: policyError } = await supabaseAdmin.storage.from('student-photos').createFilePublicAccessPolicy(
    'student-photos-policy',
    {
      public: true,
    }
  )

  if (policyError) {
    console.log('Storage policy might already exist:', policyError.message)
  } else {
    console.log('Created storage policy')
  }

  console.log('Storage setup complete!')
}

setupStorage()
```

- [ ] **Step 2: Run storage setup script**

Run:
```bash
npx tsx scripts/setup-storage.ts
```

Expected: Bucket created or already exists

- [ ] **Step 3: Commit**

```bash
git add scripts/
git commit -m "feat: add storage bucket setup script"
```

---

## Task 5: Create Helper Functions

**Files:**
- Create: `utils/trip.ts`
- Create: `utils/auth.ts`
- Create: `types/supabase.ts`

- [ ] **Step 1: Write helper function tests**

Create: `tests/utils/trip.test.ts`

```typescript
import { generateAccessCode, validateAccessCode } from '@/utils/trip'

describe('Trip utilities', () => {
  describe('generateAccessCode', () => {
    it('should generate a 4-digit code', () => {
      const code = generateAccessCode()
      expect(code).toMatch(/^\d{4}$/)
    })

    it('should generate unique codes', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(generateAccessCode())
      }
      // Should have mostly unique codes (allow some collision)
      expect(codes.size).toBeGreaterThan(90)
    })
  })

  describe('validateAccessCode', () => {
    it('should return true for valid 4-digit code', () => {
      expect(validateAccessCode('1234')).toBe(true)
    })

    it('should return false for invalid codes', () => {
      expect(validateAccessCode('123')).toBe(false)
      expect(validateAccessCode('12345')).toBe(false)
      expect(validateAccessCode('abcd')).toBe(false)
      expect(validateAccessCode('')).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/utils/trip.test.ts`
Expected: FAIL - functions not defined

- [ ] **Step 3: Write helper function implementations**

Create: `utils/trip.ts`

```typescript
import { customAlphabet } from 'nanoid'

const generateAccessCode = customAlphabet('0123456789', 4)

export function generateAccessCodeValue(): string {
  return generateAccessCode()
}

export function validateAccessCode(code: string): boolean {
  return /^\d{4}$/.test(code)
}

export interface Trip {
  id: string
  access_code: string
  name: string
  topic: string
  status: 'pre' | 'during' | 'post'
  teacher_id: string
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  trip_id: string
  title: string
  objective: string
  order_index: number
  created_at: string
}

export interface Result {
  id: string
  mission_id: string
  student_name: string
  photo_url: string
  ai_feedback: string | null
  timestamp: string
}
```

Create: `utils/auth.ts`

```typescript
import { getSupabaseBrowserClient } from '@/lib/supabase'

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'teacher',
      },
    },
  })
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signOut()
}

export async function getSession() {
  const supabase = getSupabaseBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = getSupabaseBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/utils/trip.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/ tests/
git commit -m "feat: add trip and auth helper functions"
```

---

## Task 6: Create API Routes

**Files:**
- Create: `app/api/trips/[code]/route.ts`
- Create: `app/api/submissions/route.ts`
- Create: `app/api/dashboard/[tripId]/route.ts`
- Create: `app/api/trips/ai-generate/route.ts`

- [ ] **Step 1: Write API route tests**

Create: `tests/app/api/trips/[code]/route.test.ts`

```typescript
import { GET } from '@/app/api/trips/[code]/route'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}))

describe('GET /api/trips/[code]', () => {
  it('should return 400 for invalid access code', async () => {
    const request = new NextRequest('http://localhost:3000/api/trips/abc')
    const params = Promise.resolve({ code: 'abc' })

    const response = await GET(request, { params })
    expect(response.status).toBe(400)
  })

  it('should return 404 for non-existent trip', async () => {
    const request = new NextRequest('http://localhost:3000/api/trips/1234')
    const params = Promise.resolve({ code: '1234' })

    const response = await GET(request, { params })
    expect(response.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/app/api/trips/`
Expected: FAIL - route not defined

- [ ] **Step 3: Write API route implementations**

Create: `app/api/trips/[code]/route.ts`

```typescript
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { validateAccessCode } from '@/utils/trip'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  // Validate access code format
  if (!validateAccessCode(code)) {
    return NextResponse.json({ error: 'Invalid access code format' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()

  // Get trip by access code
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('access_code', code)
    .single()

  if (error || !trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  // Get missions for the trip
  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('trip_id', trip.id)
    .order('order_index')

  return NextResponse.json({
    trip,
    missions: missions || [],
  })
}
```

Create: `app/api/trips/ai-generate/route.ts`

```typescript
import { getSupabaseServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { tripId, destination, topic } = await request.json()

    if (!tripId || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId, destination' },
        { status: 400 }
      )
    }

    // Generate missions using OpenAI
    const prompt = `You are an educational trip planner. Create 3-5 simple, age-appropriate exploration missions for primary school students (ages 8-10) visiting "${destination}"${topic ? ` to learn about ${topic}` : ''}.

Requirements:
- Each mission should be a simple action students can do during the trip
- Focus on observation, discovery, and reflection
- Use encouraging, curiosity-provoking language
- Keep titles short (under 30 characters)
- Keep objectives brief (under 100 characters)

Return a JSON array with this exact structure:
[
  { "title": "Find a green leaf", "objective": "Look for a leaf and notice its shape" },
  { "title": "Count the birds", "objective": "Spot and count different birds you see" }
]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      return NextResponse.json({ error: 'Failed to generate missions' }, { status: 500 })
    }

    const missions = JSON.parse(responseText)
    const missionsArray = Array.isArray(missions) ? missions : missions.missions || []

    const supabase = await getSupabaseServerClient()

    // Insert missions into database
    const { data: insertedMissions, error: insertError } = await supabase
      .from('missions')
      .insert(
        missionsArray.map((mission: { title: string; objective: string }, index: number) => ({
          trip_id: tripId,
          title: mission.title,
          objective: mission.objective,
          order_index: index,
        }))
      )
      .select()

    if (insertError) {
      console.error('Error inserting missions:', insertError)
      return NextResponse.json({ error: 'Failed to save missions' }, { status: 500 })
    }

    return NextResponse.json({ missions: insertedMissions })
  } catch (error) {
    console.error('Error generating missions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

Create: `app/api/submissions/route.ts`

```typescript
import { getSupabaseServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const missionId = formData.get('missionId') as string
    const studentName = formData.get('studentName') as string
    const photo = formData.get('photo') as File

    if (!missionId || !studentName || !photo) {
      return NextResponse.json(
        { error: 'Missing required fields: missionId, studentName, photo' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()

    // Get mission details
    const { data: mission } = await supabase
      .from('missions')
      .select('*, trips(*)')
      .eq('id', missionId)
      .single()

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Upload photo to Supabase Storage
    const fileName = `${mission.trip_id}/${studentName}-${Date.now()}.${photo.name.split('.').pop()}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(fileName, photo)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('student-photos')
      .getPublicUrl(fileName)

    // Call OpenAI Vision for feedback
    const base64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    const imageUrl = `data:${photo.type};base64,${base64}`

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an encouraging exploration guide for primary school students (ages 8-10). A student is completing a mission: "${mission.title}" with objective: "${mission.objective}". Provide encouraging, simple feedback that:
1. Acknowledges what they captured
2. Adds a simple observation or fact
3. Ends with a curiosity prompt

Keep responses short (2-3 sentences), use simple words, and be enthusiastic!`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    })

    const aiFeedback = aiResponse.choices[0]?.message?.content || 'Great observation!'

    // Save result to database
    const { data: result, error: resultError } = await supabase
      .from('results')
      .insert({
        mission_id: missionId,
        student_name: studentName,
        photo_url: publicUrl,
        ai_feedback: aiFeedback,
      })
      .select()
      .single()

    if (resultError) {
      console.error('Result error:', resultError)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        ai_feedback: aiFeedback,
      },
    })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

Create: `app/api/dashboard/[tripId]/route.ts`

```typescript
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params

  const supabase = await getSupabaseServerClient()

  // Get trip details
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (tripError || !trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  // Get missions with submission counts
  const { data: missions } = await supabase
    .from('missions')
    .select(`
      *,
      results (
        id,
        student_name,
        photo_url,
        ai_feedback,
        timestamp
      )
    `)
    .eq('trip_id', tripId)
    .order('order_index')

  // Calculate stats
  const totalMissions = missions?.length || 0
  const totalSubmissions = missions?.reduce(
    (acc, m) => acc + (m.results?.length || 0),
    0
  ) || 0
  const uniqueStudents = new Set(
    missions?.flatMap((m) => m.results?.map((r: any) => r.student_name)) || []
  ).size

  return NextResponse.json({
    trip,
    missions: missions || [],
    stats: {
      totalMissions,
      totalSubmissions,
      uniqueStudents,
    },
  })
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/app/api/trips/`
Expected: Tests pass (or skip if mocking is complex)

- [ ] **Step 5: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for trips, submissions, and dashboard"
```

---

## Task 7: Verify Full Integration

**Files:**
- Create: `tests/integration/database.test.ts`

- [ ] **Step 1: Write integration test**

Create: `tests/integration/database.test.ts`

```typescript
// Integration tests require actual Supabase instance
// These tests verify the schema and RLS policies work correctly

describe('Database Integration', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  beforeAll(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
  })

  it('should have valid Supabase configuration', () => {
    expect(supabaseUrl).toContain('supabase.co')
    expect(supabaseAnonKey).toMatch(/^eyJ/)
  })

  it('should connect to Supabase', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

    const { data, error } = await supabase.from('trips').select('count')
    expect(error).toBeNull()
  })
})
```

- [ ] **Step 2: Run integration test**

Run: `npm test -- tests/integration/`
Expected: PASS if Supabase is configured

- [ ] **Step 3: Commit**

```bash
git add tests/integration/
git commit -m "test: add integration tests for database"
```

---

## Summary

| Task | Description | Status |
|------|-------------|--------|
| 1 | Initialize Next.js project | Pending |
| 2 | Configure Supabase client | Pending |
| 3 | Create database schema with RLS | Pending |
| 4 | Set up storage bucket | Pending |
| 5 | Create helper functions | Pending |
| 6 | Create API routes | Pending |
| 7 | Verify full integration | Pending |

---

## Next Steps

After completing all tasks:
1. Configure `.env.local` with actual Supabase credentials
2. Run the SQL migration in Supabase Dashboard
3. Run `npx tsx scripts/setup-storage.ts` to create the bucket
4. Test the full flow: create trip → generate missions → student joins → submits photo