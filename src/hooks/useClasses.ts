import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GradeConfig } from '@/lib/gradeCalculator';

export interface ClassRecord {
  id: string;
  name: string;
  curriculum: 'CBE' | 'Edexcel' | 'Islamic';
  level: string;
  section: string | null;
  teacher_id: string | null;
  secular_subjects: string[];
  arabic_subjects: string[];
  academic_year: string;
  grade_scale: GradeConfig[] | null;
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
  secular_subjects?: string[];
  arabic_subjects?: string[];
  academic_year?: string;
  grade_scale?: GradeConfig[];
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
      // Filter out null entries and cast through unknown for JSONB fields
      const validClasses = (data || [])
        .filter(item => item !== null)
        .map(item => ({
          ...item,
          grade_scale: item.grade_scale as unknown as GradeConfig[] | null,
        })) as ClassRecord[];
      setClasses(validClasses);
    }
    setLoading(false);
  };

  const addClass = async (classData: ClassInsert) => {
    // Cast for Supabase compatibility - use JSON.parse/stringify for clean JSONB
    const insertData = {
      name: classData.name,
      curriculum: classData.curriculum,
      level: classData.level,
      section: classData.section,
      teacher_id: classData.teacher_id,
      secular_subjects: classData.secular_subjects,
      arabic_subjects: classData.arabic_subjects,
      academic_year: classData.academic_year,
      grade_scale: classData.grade_scale ? JSON.parse(JSON.stringify(classData.grade_scale)) : undefined,
    };
    
    const { data, error } = await supabase
      .from('classes')
      .insert([insertData])
      .select(`
        *,
        staff:teacher_id (first_name, last_name)
      `)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = {
      ...data,
      grade_scale: data.grade_scale as unknown as GradeConfig[] | null,
    } as ClassRecord;
    toast({ title: 'Success', description: 'Class created successfully' });
    setClasses(prev => [...prev, typedData]);
    return typedData;
  };

  const updateClass = async (id: string, updates: Partial<ClassInsert>) => {
    // Cast for Supabase compatibility
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.grade_scale) {
      updateData.grade_scale = JSON.parse(JSON.stringify(updates.grade_scale));
    }
    
    const { data, error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        staff:teacher_id (first_name, last_name)
      `)
      .maybeSingle();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = {
      ...data,
      grade_scale: data?.grade_scale as unknown as GradeConfig[] | null,
    } as ClassRecord;
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
