-- Allow a dedicated post-acceptance state before payment confirmation
-- so sessions are only "confirmed" after successful Razorpay payment.
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'accepted', 'confirmed', 'cancelled', 'completed'));
