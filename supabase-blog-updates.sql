-- Add likes_count to blogs table
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Allow anyone to update blogs (for likes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Anyone can update blogs.'
    ) THEN
        CREATE POLICY "Anyone can update blogs." ON public.blogs FOR UPDATE USING (true);
    END IF;
END $$;

-- Create comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for comments
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view and post comments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_comments' AND policyname = 'Public blog comments are viewable by everyone.'
    ) THEN
        CREATE POLICY "Public blog comments are viewable by everyone." ON public.blog_comments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_comments' AND policyname = 'Anyone can insert a blog comment.'
    ) THEN
        CREATE POLICY "Anyone can insert a blog comment." ON public.blog_comments FOR INSERT WITH CHECK (true);
    END IF;
END $$;
