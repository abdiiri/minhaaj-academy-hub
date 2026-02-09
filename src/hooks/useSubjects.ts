import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subject {
  id: string;
  name: string;
  type: 'secular' | 'arabic';
  created_at: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch subjects', variant: 'destructive' });
    } else {
      setSubjects((data || []) as Subject[]);
    }
    setLoading(false);
  };

  const addSubject = async (name: string, type: 'secular' | 'arabic') => {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ name: name.trim(), type }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Error', description: 'This subject already exists', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return null;
    }

    toast({ title: 'Success', description: 'Subject added successfully' });
    setSubjects(prev => [...prev, data as Subject].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Subject deleted successfully' });
    setSubjects(prev => prev.filter(s => s.id !== id));
    return true;
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const secularSubjects = subjects.filter(s => s.type === 'secular');
  const arabicSubjects = subjects.filter(s => s.type === 'arabic');

  return { subjects, secularSubjects, arabicSubjects, loading, addSubject, deleteSubject, fetchSubjects };
}
