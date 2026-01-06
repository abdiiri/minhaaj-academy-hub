import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string | null;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export interface AttendanceInsert {
  student_id: string;
  class_id?: string | null;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string | null;
  marked_by?: string | null;
}

export function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAttendance = async (classId?: string, date?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(first_name, last_name, admission_number)
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAttendance(data as AttendanceRecord[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching attendance',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (records: AttendanceInsert[]) => {
    try {
      // Upsert attendance records (update if exists for same student+date)
      const { error } = await supabase
        .from('attendance')
        .upsert(records, { 
          onConflict: 'student_id,date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: 'Attendance marked',
        description: 'Attendance has been saved successfully.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error marking attendance',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateAttendance = async (id: string, updates: Partial<AttendanceInsert>) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAttendance(prev => 
        prev.map(record => 
          record.id === id ? { ...record, ...updates } : record
        )
      );

      toast({
        title: 'Attendance updated',
        description: 'Attendance record has been updated.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating attendance',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    attendance,
    loading,
    fetchAttendance,
    markAttendance,
    updateAttendance,
  };
}
