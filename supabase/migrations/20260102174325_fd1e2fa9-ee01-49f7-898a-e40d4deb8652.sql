-- Create student_payments table for payment tracking
CREATE TABLE public.student_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  reference_number TEXT,
  proof_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage payments"
ON public.student_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Staff can view and confirm/reject payments
CREATE POLICY "Staff can view payments"
ON public.student_payments
FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update payment status"
ON public.student_payments
FOR UPDATE
USING (has_role(auth.uid(), 'staff'::app_role));

-- Parents can view their children's payments (via student's parent_email matching their email)
CREATE POLICY "Parents can view own payments"
ON public.student_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE s.id = student_payments.student_id
    AND s.parent_email = p.email
  )
);

-- Parents can insert payments for their children
CREATE POLICY "Parents can create payments"
ON public.student_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE s.id = student_payments.student_id
    AND s.parent_email = p.email
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_student_payments_updated_at
BEFORE UPDATE ON public.student_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true);

-- Storage policies for payment proofs
CREATE POLICY "Anyone can view payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own payment proofs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);