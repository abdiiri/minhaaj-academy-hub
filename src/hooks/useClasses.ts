import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClassRecord {
  id: string;
  name: string;
  curriculum: 'CBE' | 'Edexcel' | 'Islamic';
  level: string;
  section: string | null;
  teacher_id: string | null;
  subjects: string[];
  academic_year: string;
  created_at: string;
  updated_at: string;
  staff?: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface ClassInsert {
  name: string;
  curriculum: 'CBE' | 'Edexcel' | 'Islamic';
  level: string;
  section?: string;
  teacher_id?: string;
  subjects?: string[];
  academic_year?: string;
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        staff:teacher_id (first_name, last_name)
      `)
      .order('name', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch classes', variant: 'destructive' });
    } else {
      setClasses((data || []) as ClassRecord[]);
    }
    setLoading(false);
  };

  const addClass = async (classData: ClassInsert) => {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select(`
        *,
        staff:teacher_id (first_name, last_name)
      `)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = data as ClassRecord;
    toast({ title: 'Success', description: 'Class created successfully' });
    setClasses(prev => [...prev, typedData]);
    return typedData;
  };

  const updateClass = async (id: string, updates: Partial<ClassInsert>) => {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        staff:teacher_id (first_name, last_name)
      `)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = data as ClassRecord;
    toast({ title: 'Success', description: 'Class updated successfully' });
    setClasses(prev => prev.map(c => c.id === id ? typedData : c));
    return typedData;
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    toast({ title: 'Success', description: 'Class deleted successfully' });
    setClasses(prev => prev.filter(c => c.id !== id));
    return true;
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return { classes, loading, fetchClasses, addClass, updateClass, deleteClass };
}
