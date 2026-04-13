-- ==============================
-- ORGANIZATION MODE SUPPORT
-- ==============================
-- This migration adds support for organization mode by:
-- 1. Creating org_teachers table for teacher memberships
-- 2. Adding org_id to enrollments for organization-specific course enrollments
-- 3. Adding org_id to bookings for organization-specific sessions
-- 4. Adding org_id to tracks for organization-specific courses

-- ==============================
-- ORG_TEACHERS TABLE
-- ==============================
-- Stores the relationship between an organization and its teachers/mentors
CREATE TABLE IF NOT EXISTS public.org_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Active',
    role TEXT DEFAULT 'Teacher', -- Teacher, Lead Teacher, Admin, etc.
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, teacher_id)
);

-- Enable Row Level Security
ALTER TABLE public.org_teachers ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: org_teachers
-- 1. Organizations and teachers can view membership
DROP POLICY IF EXISTS "View org teachers relationship" ON public.org_teachers;
CREATE POLICY "View org teachers relationship" 
ON public.org_teachers FOR SELECT 
USING (auth.uid() = org_id OR auth.uid() = teacher_id);

-- 2. Organizations can add teachers
DROP POLICY IF EXISTS "Orgs can add teachers" ON public.org_teachers;
CREATE POLICY "Orgs can add teachers" 
ON public.org_teachers FOR INSERT 
WITH CHECK (auth.uid() = org_id);

-- 3. Organizations can update teacher records
DROP POLICY IF EXISTS "Orgs can update teachers" ON public.org_teachers;
CREATE POLICY "Orgs can update teachers" 
ON public.org_teachers FOR UPDATE 
USING (auth.uid() = org_id);

-- 4. Organizations can remove teachers
DROP POLICY IF EXISTS "Orgs can remove teachers" ON public.org_teachers;
CREATE POLICY "Orgs can remove teachers" 
ON public.org_teachers FOR DELETE 
USING (auth.uid() = org_id);

-- ==============================
-- ORG_TEACHER_INVITATIONS TABLE
-- ==============================
-- Stores invitations sent from an organization to potential teachers
CREATE TABLE IF NOT EXISTS public.org_teacher_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, teacher_id)
);

-- Enable Row Level Security
ALTER TABLE public.org_teacher_invitations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: org_teacher_invitations
-- 1. Organizations and teachers can view invitations they are part of
DROP POLICY IF EXISTS "View teacher invitations" ON public.org_teacher_invitations;
CREATE POLICY "View teacher invitations" 
ON public.org_teacher_invitations FOR SELECT 
USING (auth.uid() = org_id OR auth.uid() = teacher_id);

-- 2. Organizations can create (send) invitations
DROP POLICY IF EXISTS "Send teacher invitations" ON public.org_teacher_invitations;
CREATE POLICY "Send teacher invitations" 
ON public.org_teacher_invitations FOR INSERT 
WITH CHECK (auth.uid() = org_id);

-- 3. Teachers can update the status of invitations sent to them
DROP POLICY IF EXISTS "Update teacher invitation status" ON public.org_teacher_invitations;
CREATE POLICY "Update teacher invitation status" 
ON public.org_teacher_invitations FOR UPDATE 
USING (auth.uid() = teacher_id);

-- 4. Organizations can delete (clear) invitations
DROP POLICY IF EXISTS "Orgs can delete teacher invitations" ON public.org_teacher_invitations;
CREATE POLICY "Orgs can delete teacher invitations" 
ON public.org_teacher_invitations FOR DELETE 
USING (auth.uid() = org_id);

-- ==============================
-- ADD ORG_ID TO ENROLLMENTS
-- ==============================
-- Add org_id to track organization-specific enrollments
-- NULL means personal enrollment, UUID means organization enrollment
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for faster org-scoped queries
CREATE INDEX IF NOT EXISTS idx_enrollments_org_id ON public.enrollments(org_id);

-- ==============================
-- ADD ORG_ID TO BOOKINGS
-- ==============================
-- Add org_id to track organization-specific sessions
-- NULL means personal booking, UUID means organization booking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for faster org-scoped queries
CREATE INDEX IF NOT EXISTS idx_bookings_org_id ON public.bookings(org_id);

-- ==============================
-- ADD ORG_ID TO TRACKS
-- ==============================
-- Add org_id to track organization-specific courses
-- NULL means public/personal course, UUID means organization course
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add creator_id to tracks if not exists
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for faster org-scoped queries
CREATE INDEX IF NOT EXISTS idx_tracks_org_id ON public.tracks(org_id);
CREATE INDEX IF NOT EXISTS idx_tracks_creator_id ON public.tracks(creator_id);

-- ==============================
-- UPDATE RLS POLICIES FOR ORG SUPPORT
-- ==============================

-- Enrollments: Allow orgs and org students to view org enrollments
DROP POLICY IF EXISTS "View org enrollments" ON public.enrollments;
CREATE POLICY "View org enrollments"
ON public.enrollments FOR SELECT
USING (
    auth.uid() = user_id OR 
    auth.uid() = org_id OR
    EXISTS (
        SELECT 1 FROM org_teachers 
        WHERE org_teachers.org_id = enrollments.org_id 
        AND org_teachers.teacher_id = auth.uid()
    )
);

-- Bookings: Allow orgs and org teachers to view org bookings
DROP POLICY IF EXISTS "View org bookings" ON public.bookings;
CREATE POLICY "View org bookings"
ON public.bookings FOR SELECT
USING (
    auth.uid() = student_id OR
    auth.uid() = org_id OR
    EXISTS (
        SELECT 1 FROM mentors WHERE mentors.id = bookings.mentor_id AND mentors.user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM org_teachers 
        WHERE org_teachers.org_id = bookings.org_id 
        AND org_teachers.teacher_id = auth.uid()
    )
);
