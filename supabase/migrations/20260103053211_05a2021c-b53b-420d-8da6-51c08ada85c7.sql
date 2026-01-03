-- Create fee_structures table
CREATE TABLE public.fee_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  curriculum TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  tuition_fee NUMERIC NOT NULL DEFAULT 0,
  activity_fee NUMERIC NOT NULL DEFAULT 0,
  transport_fee NUMERIC NOT NULL DEFAULT 0,
  lunch_fee NUMERIC NOT NULL DEFAULT 0,
  total_fee NUMERIC GENERATED ALWAYS AS (tuition_fee + activity_fee + transport_fee + lunch_fee) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(level, curriculum, academic_year)
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- Admin can manage fee structures
CREATE POLICY "Admins can manage fee structures"
ON public.fee_structures
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Staff can view fee structures
CREATE POLICY "Staff can view fee structures"
ON public.fee_structures
FOR SELECT
USING (has_role(auth.uid(), 'staff'));

-- Parents can view fee structures
CREATE POLICY "Parents can view fee structures"
ON public.fee_structures
FOR SELECT
USING (has_role(auth.uid(), 'parent'));

-- Add updated_at trigger
CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();