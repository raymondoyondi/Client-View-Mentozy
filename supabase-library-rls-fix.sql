-- MENTOZY FIX: Allows anyone to update the engagement stats (likes, views, downloads) of any library resource!
-- 1. Drop the restrictive specific 'update' policy if it existed for just the author
DROP POLICY IF EXISTS "Users can update their own resources" ON public.library_resources;

-- 2. Create the new policy that allows anyone to update the resources (required for likes/views to increment)
CREATE POLICY "Anyone can update library resources" ON public.library_resources
    FOR UPDATE USING (true);
