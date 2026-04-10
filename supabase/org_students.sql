-- ==============================
-- ORGANIZATION STUDENTS SYSTEM
-- ==============================

-- ORG STUDENTS Table
-- Stores the relationship between an organization and its enrolled students
CREATE TABLE IF NOT EXISTS public.org_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Active',
    grade TEXT DEFAULT 'General',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, student_id)
);

-- ORG STUDENT INVITATIONS Table
-- Stores invitations sent from an organization to potential students
CREATE TABLE IF NOT EXISTS public.org_student_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.org_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_student_invitations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: org_students
-- 1. Organizations and students can view membership
DROP POLICY IF EXISTS "View org students relationship" ON public.org_students;
CREATE POLICY "View org students relationship" 
ON public.org_students FOR SELECT 
USING (auth.uid() = org_id OR auth.uid() = student_id);

-- 2. Students can join an organization (Insert their own record)
DROP POLICY IF EXISTS "Students can join organizations" ON public.org_students;
CREATE POLICY "Students can join organizations" 
ON public.org_students FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- RLS POLICIES: org_student_invitations
-- 1. Organizations and students can view invitations they are part of
DROP POLICY IF EXISTS "View student invitations" ON public.org_student_invitations;
CREATE POLICY "View student invitations" 
ON public.org_student_invitations FOR SELECT 
USING (auth.uid() = org_id OR auth.uid() = student_id);

-- 2. Organizations can create (send) invitations
DROP POLICY IF EXISTS "Send student invitations" ON public.org_student_invitations;
CREATE POLICY "Send student invitations" 
ON public.org_student_invitations FOR INSERT 
WITH CHECK (auth.uid() = org_id);

-- 3. Students can update the status of invitations sent to them
DROP POLICY IF EXISTS "Update student invitation status" ON public.org_student_invitations;
CREATE POLICY "Update student invitation status" 
ON public.org_student_invitations FOR UPDATE 
USING (auth.uid() = student_id);

-- 4. Organizations can delete (clear) invitations
DROP POLICY IF EXISTS "Orgs can delete invitations" ON public.org_student_invitations;
CREATE POLICY "Orgs can delete invitations" 
ON public.org_student_invitations FOR DELETE 
USING (auth.uid() = org_id);
