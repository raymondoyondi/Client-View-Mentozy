-- Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read blogs
CREATE POLICY "Public blogs are viewable by everyone." 
ON public.blogs FOR SELECT USING (true);

-- Allow anyone to insert blogs (since "anyone can write")
CREATE POLICY "Anyone can insert a blog." 
ON public.blogs FOR INSERT WITH CHECK (true);

-- Set up the storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket
CREATE POLICY "Blog images are publicly accessible."
ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can upload blog images."
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');
