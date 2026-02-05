-- Clean up all remaining admin-based and redundant policies, make them PERMISSIVE

-- =============================================================================
-- ANNOUNCEMENTS TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Parents can view their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff can manage announcements" ON public.announcements;

CREATE POLICY "Staff can manage announcements" 
ON public.announcements 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Parents can view published announcements" 
ON public.announcements 
FOR SELECT 
USING (has_role(auth.uid(), 'parent'::app_role) AND is_published = true AND target_audience IN ('all', 'parents'));

-- =============================================================================
-- ATTENDANCE TABLE - Fix all policies  
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can manage attendance" ON public.attendance;

CREATE POLICY "Staff can manage attendance" 
ON public.attendance 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- =============================================================================
-- CLASSES TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Staff can view classes" ON public.classes;
DROP POLICY IF EXISTS "Staff can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Parents can view classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view classes" ON public.classes;

CREATE POLICY "Staff can manage classes" 
ON public.classes 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Parents can view classes" 
ON public.classes 
FOR SELECT 
USING (has_role(auth.uid(), 'parent'::app_role));

-- =============================================================================
-- FEE_STRUCTURES TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Staff can view fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Staff can manage fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Parents can view fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Students can view fee structures" ON public.fee_structures;

CREATE POLICY "Staff can manage fee structures" 
ON public.fee_structures 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Parents can view fee structures" 
ON public.fee_structures 
FOR SELECT 
USING (has_role(auth.uid(), 'parent'::app_role));

-- =============================================================================
-- PROFILES TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can manage profiles" ON public.profiles;

CREATE POLICY "Staff can manage profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- =============================================================================
-- RESULTS TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage results" ON public.results;
DROP POLICY IF EXISTS "Staff can manage results" ON public.results;

CREATE POLICY "Staff can manage results" 
ON public.results 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- =============================================================================
-- STAFF TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can view staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can manage staff records" ON public.staff;

CREATE POLICY "Staff can manage staff records" 
ON public.staff 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- =============================================================================
-- STUDENT_PAYMENTS TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage payments" ON public.student_payments;
DROP POLICY IF EXISTS "Staff can view payments" ON public.student_payments;
DROP POLICY IF EXISTS "Staff can update payment status" ON public.student_payments;
DROP POLICY IF EXISTS "Staff can manage payments" ON public.student_payments;

CREATE POLICY "Staff can manage payments" 
ON public.student_payments 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- =============================================================================
-- STUDENTS TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Staff can view students" ON public.students;
DROP POLICY IF EXISTS "Staff can manage students" ON public.students;

CREATE POLICY "Staff can manage students" 
ON public.students 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- =============================================================================
-- USER_ROLES TABLE - Fix all policies
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Staff can manage user roles" ON public.user_roles;

CREATE POLICY "Staff can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));