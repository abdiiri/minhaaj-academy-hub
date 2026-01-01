import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentRecord {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  curriculum: 'CBE' | 'Edexcel' | 'Islamic';
  class_id: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  classes?: {
    name: string;
  } | null;
}

export interface StudentInsert {
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  curriculum: 'CBE' | 'Edexcel' | 'Islamic';
  class_id?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  enrollment_date?: string;
  status?: 'active' | 'inactive' | 'graduated';
}

export function useStudents() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch students', variant: 'destructive' });
    } else {
      setStudents((data || []) as StudentRecord[]);
    }
    setLoading(false);
  };

  const addStudent = async (studentData: StudentInsert) => {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select(`
        *,
        classes:class_id (name)
      `)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = data as StudentRecord;
    toast({ title: 'Success', description: 'Student enrolled successfully' });
    setStudents(prev => [typedData, ...prev]);
    return data;
  };

  const updateStudent = async (id: string, updates: Partial<StudentInsert>) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        classes:class_id (name)
      `)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = data as StudentRecord;
    toast({ title: 'Success', description: 'Student updated successfully' });
    setStudents(prev => prev.map(s => s.id === id ? typedData : s));
    return data;
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    toast({ title: 'Success', description: 'Student deleted successfully' });
    setStudents(prev => prev.filter(s => s.id !== id));
    return true;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents, addStudent, updateStudent, deleteStudent };
}
