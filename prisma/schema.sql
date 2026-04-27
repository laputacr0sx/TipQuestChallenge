-- ExploraQuest Database Schema
-- Run this in Supabase SQL Editor

-- Create Trip table
CREATE TABLE IF NOT EXISTS "Trip" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "accessCode" TEXT UNIQUE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pre',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Mission table
CREATE TABLE IF NOT EXISTS "Mission" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL REFERENCES "Trip"(id) ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "hint" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Result table
CREATE TABLE IF NOT EXISTS "Result" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "missionId" UUID NOT NULL REFERENCES "Mission"(id) ON DELETE CASCADE,
    "studentName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "aiFeedback" TEXT,
    "notes" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "tripId" UUID NOT NULL REFERENCES "Trip"(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE "Trip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Result" ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - tighten as needed)
CREATE POLICY "Allow all for Trip" ON "Trip" FOR ALL USING (true);
CREATE POLICY "Allow all for Mission" ON "Mission" FOR ALL USING (true);
CREATE POLICY "Allow all for Result" ON "Result" FOR ALL USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_trip_accesscode" ON "Trip"("accessCode");
CREATE INDEX IF NOT EXISTS "idx_mission_tripid" ON "Mission"("tripId");
CREATE INDEX IF NOT EXISTS "idx_result_missionid" ON "Result"("missionId");
CREATE INDEX IF NOT EXISTS "idx_result_tripid" ON "Result"("tripId");
CREATE INDEX IF NOT EXISTS "idx_result_studentname" ON "Result"("studentName");

-- Storage bucket for student photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policy for photos (allow public read, authenticated write)
CREATE POLICY "Public read photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated upload photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() IN ('authenticated', 'anon'));

-- Show created tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('Trip', 'Mission', 'Result');