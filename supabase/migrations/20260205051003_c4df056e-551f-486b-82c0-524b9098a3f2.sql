-- Fix RLS policies for students table - change admin policy to PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students" 
ON public.students 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix staff policy to be permissive for SELECT
DROP POLICY IF EXISTS "Staff can view students" ON public.students;
CREATE POLICY "Staff can view students" 
ON public.students 
FOR SELECT 
USING (has_role(auth.uid(), 'staff'::app_role));

-- Fix student self-view policy
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
CREATE POLICY "Students can view their own data" 
ON public.students 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix RLS policies for classes table - change admin policy to PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes" 
ON public.classes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix other class policies to be permissive
DROP POLICY IF EXISTS "Parents can view classes" ON public.classes;
CREATE POLICY "Parents can view classes" 
ON public.classes 
FOR SELECT 
USING (has_role(auth.uid(), 'parent'::app_role));

DROP POLICY IF EXISTS "Staff can view classes" ON public.classes;
CREATE POLICY "Staff can view classes" 
ON public.classes 
FOR SELECT 
USING (has_role(auth.uid(), 'staff'::app_role));

DROP POLICY IF EXISTS "Students can view classes" ON public.classes;
CREATE POLICY "Students can view classes" 
ON public.classes 
FOR SELECT 
USING (has_role(auth.uid(), 'student'::app_role));