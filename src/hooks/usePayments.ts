import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentRecord {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  proof_image_url: string | null;
  status: 'pending' | 'received' | 'confirmed' | 'rejected';
  confirmed_by: string | null;
  confirmed_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  students?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    parent_name: string | null;
    parent_email: string | null;
  };
}

export interface PaymentInsert {
  student_id: string;
  amount: number;
  payment_date?: string;
  payment_method?: string;
  reference_number?: string;
  proof_image_url?: string;
  notes?: string;
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            admission_number,
            parent_name,
            parent_email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as PaymentRecord[]);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const addPayment = async (payment: PaymentInsert) => {
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .insert(payment)
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            admission_number,
            parent_name,
            parent_email
          )
        `)
        .single();

      if (error) throw error;
      
      setPayments(prev => [data as PaymentRecord, ...prev]);
      toast({
        title: 'Success',
        description: 'Payment submitted successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit payment',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Staff can mark payment as received
  const markAsReceived = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .update({
          status: 'received',
        })
        .eq('id', paymentId)
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            admission_number,
            parent_name,
            parent_email
          )
        `)
        .single();

      if (error) throw error;

      setPayments(prev => prev.map(p => p.id === paymentId ? data as PaymentRecord : p));
      toast({
        title: 'Success',
        description: 'Payment marked as received',
      });
      return data;
    } catch (error: any) {
      console.error('Error marking payment as received:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Only Admin can confirm/approve payment
  const confirmPayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .update({
          status: 'confirmed',
          confirmed_by: user?.id,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            admission_number,
            parent_name,
            parent_email
          )
        `)
        .single();

      if (error) throw error;

      setPayments(prev => prev.map(p => p.id === paymentId ? data as PaymentRecord : p));
      toast({
        title: 'Success',
        description: 'Payment approved successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to confirm payment',
        variant: 'destructive',
      });
      return null;
    }
  };

  const rejectPayment = async (paymentId: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('student_payments')
        .update({
          status: 'rejected',
          confirmed_by: user?.id,
          confirmed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', paymentId)
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            admission_number,
            parent_name,
            parent_email
          )
        `)
        .single();

      if (error) throw error;

      setPayments(prev => prev.map(p => p.id === paymentId ? data as PaymentRecord : p));
      toast({
        title: 'Payment Rejected',
        description: 'Payment has been rejected',
      });
      return data;
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payment',
        variant: 'destructive',
      });
      return null;
    }
  };

  const uploadProof = async (file: File, studentId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload proof image',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    payments,
    loading,
    addPayment,
    markAsReceived,
    confirmPayment,
    rejectPayment,
    uploadProof,
    refetch: fetchPayments,
  };
}
