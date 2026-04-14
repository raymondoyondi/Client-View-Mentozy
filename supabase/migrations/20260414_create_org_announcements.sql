-- ==============================
-- ORG ANNOUNCEMENTS
-- ==============================
-- Stores announcements posted by organizations for their students and teachers.
CREATE TABLE IF NOT EXISTS public.org_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_announcements_org_id ON public.org_announcements(org_id);
CREATE INDEX IF NOT EXISTS idx_org_announcements_created_at ON public.org_announcements(created_at DESC);

ALTER TABLE public.org_announcements ENABLE ROW LEVEL SECURITY;

-- Organizations can view their own announcements.
DROP POLICY IF EXISTS "Orgs can view org announcements" ON public.org_announcements;
CREATE POLICY "Orgs can view org announcements"
ON public.org_announcements
FOR SELECT
USING (auth.uid() = org_id);

-- Teachers attached to the organization can view org announcements.
DROP POLICY IF EXISTS "Org teachers can view org announcements" ON public.org_announcements;
CREATE POLICY "Org teachers can view org announcements"
ON public.org_announcements
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.org_teachers
        WHERE org_teachers.org_id = org_announcements.org_id
          AND org_teachers.teacher_id = auth.uid()
          AND org_teachers.status = 'Active'
    )
);

-- Students with enrollments under the organization can view org announcements.
DROP POLICY IF EXISTS "Org students can view org announcements" ON public.org_announcements;
CREATE POLICY "Org students can view org announcements"
ON public.org_announcements
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.enrollments
        WHERE enrollments.org_id = org_announcements.org_id
          AND enrollments.user_id = auth.uid()
    )
);

-- Only organizations can create announcements.
DROP POLICY IF EXISTS "Orgs can create announcements" ON public.org_announcements;
CREATE POLICY "Orgs can create announcements"
ON public.org_announcements
FOR INSERT
WITH CHECK (auth.uid() = org_id);

-- Only organizations can edit announcements they authored.
DROP POLICY IF EXISTS "Orgs can update announcements" ON public.org_announcements;
CREATE POLICY "Orgs can update announcements"
ON public.org_announcements
FOR UPDATE
USING (auth.uid() = org_id)
WITH CHECK (auth.uid() = org_id);

-- Only organizations can delete announcements they authored.
DROP POLICY IF EXISTS "Orgs can delete announcements" ON public.org_announcements;
CREATE POLICY "Orgs can delete announcements"
ON public.org_announcements
FOR DELETE
USING (auth.uid() = org_id);
