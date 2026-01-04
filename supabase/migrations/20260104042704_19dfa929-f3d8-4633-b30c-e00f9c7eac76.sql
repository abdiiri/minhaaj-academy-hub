-- Add user_id column to staff table to link with auth users
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to students table to link with auth users  
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- Add RLS policy for students to view their own data
CREATE POLICY "Students can view their own data" 
ON public.students 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add RLS policy for students to view classes
CREATE POLICY "Students can view classes" 
ON public.classes 
FOR SELECT 
USING (has_role(auth.uid(), 'student'));

-- Add RLS policy for students to view fee structures
CREATE POLICY "Students can view fee structures" 
ON public.fee_structures 
FOR SELECT 
USING (has_role(auth.uid(), 'student'));