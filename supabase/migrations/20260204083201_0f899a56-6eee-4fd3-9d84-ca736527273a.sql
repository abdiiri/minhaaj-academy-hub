-- Add paid_month column to student_payments table
ALTER TABLE public.student_payments 
ADD COLUMN paid_month text;