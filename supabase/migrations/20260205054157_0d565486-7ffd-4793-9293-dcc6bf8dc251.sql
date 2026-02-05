-- Step 1: Drop all existing RLS policies that reference admin
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.student_payments;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage results" ON public.results;

-- Step 2: Create new RLS policies using staff role for full access

-- Students table - staff has full access
CREATE POLICY "Staff can manage students" 
ON public.students 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Classes table - staff has full access
CREATE POLICY "Staff can manage classes" 
ON public.classes 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Drop old staff SELECT-only policies and recreate parents/students as needed
DROP POLICY IF EXISTS "Staff can view students" ON public.students;
DROP POLICY IF EXISTS "Staff can view classes" ON public.classes;

-- Staff table - staff has full access
DROP POLICY IF EXISTS "Staff can view their own data" ON public.staff;
CREATE POLICY "Staff can manage staff records" 
ON public.staff 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Attendance table - staff has full access
DROP POLICY IF EXISTS "Staff can manage attendance" ON public.attendance;
CREATE POLICY "Staff can manage attendance" 
ON public.attendance 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Results table - staff has full access
DROP POLICY IF EXISTS "Staff can manage results" ON public.results;
CREATE POLICY "Staff can manage results" 
ON public.results 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Fee structures table - staff has full access
DROP POLICY IF EXISTS "Staff can view fee structures" ON public.fee_structures;
CREATE POLICY "Staff can manage fee structures" 
ON public.fee_structures 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Payments table - staff has full access
DROP POLICY IF EXISTS "Staff can view payments" ON public.student_payments;
DROP POLICY IF EXISTS "Staff can manage payments" ON public.student_payments;
CREATE POLICY "Staff can manage payments" 
ON public.student_payments 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Announcements table - staff has full access
DROP POLICY IF EXISTS "Staff can view announcements" ON public.announcements;
CREATE POLICY "Staff can manage announcements" 
ON public.announcements 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Profiles table - staff has full access
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
CREATE POLICY "Staff can manage profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- User roles table - staff can manage user roles
DROP POLICY IF EXISTS "Staff can view user roles" ON public.user_roles;
CREATE POLICY "Staff can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Step 3: Update all existing admin users to staff role
UPDATE public.user_roles SET role = 'staff' WHERE role = 'admin';

-- Step 4: Update the handle_new_user function to default to parent (already does)
-- No change needed as it already defaults to 'parent'

-- Note: We cannot drop and recreate the enum as existing data depends on it,
-- but we've updated all admin users to staff and removed admin-based policies