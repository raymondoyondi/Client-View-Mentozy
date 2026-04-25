-- Fix Booking RLS to allow Organization Teachers to accept sessions
-- The previous policy only allowed the 'Global Mentor' or the 'Student' to update bookings.
-- With Organization Mode, we must also allow teachers assigned to the organization.

DROP POLICY IF EXISTS "Booking updates" ON public.bookings;

CREATE POLICY "Booking updates"
ON public.bookings FOR UPDATE USING (
  auth.uid() = student_id OR
  EXISTS (
    SELECT 1 FROM mentors 
    WHERE id = bookings.mentor_id 
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM org_teachers 
    WHERE org_teachers.org_id = bookings.org_id 
    AND org_teachers.teacher_id = auth.uid()
  )
);

-- Ensure they can also view them (Already exists in org_mode_support but let's be safe)
DROP POLICY IF EXISTS "Mentor views bookings" ON public.bookings;
CREATE POLICY "Mentor views bookings"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mentors 
    WHERE id = bookings.mentor_id 
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM org_teachers 
    WHERE org_teachers.org_id = bookings.org_id 
    AND org_teachers.teacher_id = auth.uid()
  )
);
