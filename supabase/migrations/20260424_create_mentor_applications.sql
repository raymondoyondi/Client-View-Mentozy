-- Mentor applications are stored separately from mentors table for moderation workflows.
CREATE TABLE IF NOT EXISTS public.mentor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id BIGINT NULL REFERENCES public.mentors(id) ON DELETE SET NULL,

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,

    qualification TEXT NOT NULL,
    qualification_details JSONB NOT NULL DEFAULT '{}'::jsonb,

    skills TEXT[] NOT NULL DEFAULT '{}',
    interests TEXT[] NOT NULL DEFAULT '{}',
    why_teach TEXT NOT NULL,
    teaching_differentiator TEXT NOT NULL,

    scenario_many_doubts TEXT NOT NULL,
    scenario_shy_child TEXT NOT NULL,
    scenario_edtech_confusion TEXT NOT NULL,

    hours_daily TEXT NOT NULL,
    commitment_type TEXT NOT NULL,

    government_id_url TEXT NOT NULL,
    pan_or_equivalent_url TEXT NOT NULL,
    additional_info TEXT,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_applications_status ON public.mentor_applications(status);
CREATE INDEX IF NOT EXISTS idx_mentor_applications_submitted_at ON public.mentor_applications(submitted_at DESC);

ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mentor applications" ON public.mentor_applications;
CREATE POLICY "Users can view own mentor applications"
ON public.mentor_applications
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mentor applications" ON public.mentor_applications;
CREATE POLICY "Users can insert own mentor applications"
ON public.mentor_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pending mentor applications" ON public.mentor_applications;
CREATE POLICY "Users can update own pending mentor applications"
ON public.mentor_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage mentor applications" ON public.mentor_applications;
CREATE POLICY "Admins can manage mentor applications"
ON public.mentor_applications
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);
