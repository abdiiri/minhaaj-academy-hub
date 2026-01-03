import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeeStructure {
  id: string;
  level: string;
  curriculum: string;
  academic_year: string;
  tuition_fee: number;
  activity_fee: number;
  transport_fee: number;
  lunch_fee: number;
  total_fee: number;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureInsert {
  level: string;
  curriculum: string;
  academic_year?: string;
  tuition_fee: number;
  activity_fee?: number;
  transport_fee?: number;
  lunch_fee?: number;
}

export function useFeeStructures() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: feeStructures = [], isLoading: loading } = useQuery({
    queryKey: ['fee_structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data as FeeStructure[];
    },
  });

  const addFeeStructure = useMutation({
    mutationFn: async (feeStructure: FeeStructureInsert) => {
      const { data, error } = await supabase
        .from('fee_structures')
        .insert(feeStructure)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_structures'] });
      toast({ title: 'Success', description: 'Fee structure added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateFeeStructure = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeeStructure> & { id: string }) => {
      const { data, error } = await supabase
        .from('fee_structures')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_structures'] });
      toast({ title: 'Success', description: 'Fee structure updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFeeStructure = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_structures'] });
      toast({ title: 'Success', description: 'Fee structure deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    feeStructures,
    loading,
    addFeeStructure: (data: FeeStructureInsert) => addFeeStructure.mutateAsync(data),
    updateFeeStructure: (data: Partial<FeeStructure> & { id: string }) => updateFeeStructure.mutateAsync(data),
    deleteFeeStructure: (id: string) => deleteFeeStructure.mutateAsync(id),
  };
}
