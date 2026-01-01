-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin_staff', 'support')),
  subjects TEXT[] DEFAULT '{}',
  assigned_classes TEXT[] DEFAULT '{}',
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  curriculum TEXT NOT NULL CHECK (curriculum IN ('CBE', 'Edexcel', 'Islamic')),
  level TEXT NOT NULL,
  section TEXT,
  teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  subjects TEXT[] DEFAULT '{}',
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  curriculum TEXT NOT NULL CHECK (curriculum IN ('CBE', 'Edexcel', 'Islamic')),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Staff policies (admins can do everything, staff can view)
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view staff" ON public.staff FOR SELECT USING (has_role(auth.uid(), 'staff'));

-- Classes policies (admins can manage, staff and parents can view)
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view classes" ON public.classes FOR SELECT USING (has_role(auth.uid(), 'staff'));
CREATE POLICY "Parents can view classes" ON public.classes FOR SELECT USING (has_role(auth.uid(), 'parent'));

-- Students policies (admins can manage, staff can view)
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view students" ON public.students FOR SELECT USING (has_role(auth.uid(), 'staff'));

-- Triggers for updated_at
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();