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
  password?: string; // For new student creation with login credentials
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
    // Extract password from studentData - don't send to database
    const { password, ...dbData } = studentData;
    
    const { data, error } = await supabase
      .from('students')
      .insert([dbData])
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
    
    // If password is provided and we have an email, create auth user via edge function
    if (password && password.length >= 6 && studentData.parent_email) {
      try {
        const response = await supabase.functions.invoke('create-user', {
          body: {
            email: studentData.parent_email,
            password,
            name: `${studentData.first_name} ${studentData.last_name}`,
            role: 'student',
            userType: 'student',
            recordId: typedData.id
          }
        });

        if (response.error) {
          console.error('Error creating auth user:', response.error);
          toast({ 
            title: 'Warning', 
            description: 'Student added but login account could not be created. ' + (response.error.message || ''),
            variant: 'destructive' 
          });
        } else {
          toast({ title: 'Success', description: 'Student enrolled with login credentials' });
        }
      } catch (err) {
        console.error('Error invoking create-user:', err);
        toast({ 
          title: 'Warning', 
          description: 'Student added but login account creation failed',
          variant: 'destructive' 
        });
      }
    } else {
      toast({ title: 'Success', description: 'Student enrolled successfully' });
    }
    
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
