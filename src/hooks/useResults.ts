import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Result {
  id: string;
  student_id: string;
  class_id: string;
  subject: string;
  exam_type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  max_score: number;
  grade: string | null;
  remarks: string | null;
  exam_date: string;
  entered_by: string | null;
  created_at: string;
  updated_at: string;
  students?: {
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  classes?: {
    name: string;
    level: string;
  };
}

export interface ResultInsert {
  student_id: string;
  class_id: string;
  subject: string;
  exam_type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  max_score?: number;
  grade?: string;
  remarks?: string;
  exam_date?: string;
}

export function useResults(classId?: string) {
  const queryClient = useQueryClient();

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['results', classId],
    queryFn: async () => {
      let query = supabase
        .from('results')
        .select(`
          *,
          students (first_name, last_name, admission_number),
          classes (name, level)
        `)
        .order('exam_date', { ascending: false });
      
      if (classId) {
        query = query.eq('class_id', classId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Result[];
    },
  });

  const createResult = useMutation({
    mutationFn: async (result: ResultInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('results')
        .insert({ ...result, entered_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({ title: 'Success', description: 'Result added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createBulkResults = useMutation({
    mutationFn: async (results: ResultInsert[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // First, delete existing results for these student/subject/exam combinations
      for (const result of results) {
        await supabase
          .from('results')
          .delete()
          .eq('student_id', result.student_id)
          .eq('subject', result.subject)
          .eq('exam_type', result.exam_type)
          .eq('exam_date', result.exam_date || new Date().toISOString().split('T')[0]);
      }
      
      // Then insert new results
      const { data, error } = await supabase
        .from('results')
        .insert(results.map(r => ({ ...r, entered_by: user?.id })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({ title: 'Success', description: 'Results saved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateResult = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Result> & { id: string }) => {
      const { data, error } = await supabase
        .from('results')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({ title: 'Success', description: 'Result updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteResult = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({ title: 'Success', description: 'Result deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    results,
    isLoading,
    error,
    createResult,
    createBulkResults,
    updateResult,
    deleteResult,
  };
}
