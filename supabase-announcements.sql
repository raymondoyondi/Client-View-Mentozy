-- 1. Create the announcements table
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy 1: Anyone logged in can view announcements (or change this to specific students if you prefer restricting read access)
CREATE POLICY "Announcements are viewable by everyone" 
ON public.announcements FOR SELECT 
USING (true);

-- Policy 2: Organizations can insert their own announcements
CREATE POLICY "Organizations can insert their own announcements" 
ON public.announcements FOR INSERT 
WITH CHECK (auth.uid() = org_id);

-- Policy 3: Organizations can update their own announcements
CREATE POLICY "Organizations can update their own announcements" 
ON public.announcements FOR UPDATE 
USING (auth.uid() = org_id);

-- Policy 4: Organizations can delete their own announcements
CREATE POLICY "Organizations can delete their own announcements" 
ON public.announcements FOR DELETE 
USING (auth.uid() = org_id);

-- 4. Enable Realtime updates (Optional, for live feed)
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
