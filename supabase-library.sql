-- Create the library_resources table
CREATE TABLE IF NOT EXISTS public.library_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read library resources
CREATE POLICY "Anyone can view library resources" ON public.library_resources
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert library resources
CREATE POLICY "Authenticated users can insert library resources" ON public.library_resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authors can update and delete their own resources
CREATE POLICY "Users can update their own resources" ON public.library_resources
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own resources" ON public.library_resources
    FOR DELETE USING (auth.uid() = author_id);

-- Set up storage for library files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('library_files', 'library_files', true)
ON CONFLICT (id) DO NOTHING;

-- Set permissions for storage bucket
CREATE POLICY "Public Access for library_files" ON storage.objects
    FOR SELECT USING (bucket_id = 'library_files');

CREATE POLICY "Authenticated users can upload to library_files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'library_files' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own files in library_files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'library_files' 
        AND auth.uid() = owner
    );
