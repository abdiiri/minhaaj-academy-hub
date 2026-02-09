
-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('secular', 'arabic')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, type)
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Staff can manage subjects
CREATE POLICY "Staff can manage subjects"
ON public.subjects
FOR ALL
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Parents can view subjects
CREATE POLICY "Parents can view subjects"
ON public.subjects
FOR SELECT
USING (has_role(auth.uid(), 'parent'::app_role));
