import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StaffMember {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: 'teacher' | 'admin_staff' | 'support';
  subjects: string[];
  assigned_classes: string[];
  join_date: string;
  status: 'active' | 'inactive';
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffInsert {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'teacher' | 'admin_staff' | 'support';
  subjects?: string[];
  assigned_classes?: string[];
  join_date: string;
  status?: 'active' | 'inactive';
  password?: string; // For new staff creation with login credentials
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch staff', variant: 'destructive' });
    } else {
      setStaff((data || []) as StaffMember[]);
    }
    setLoading(false);
  };

  const addStaff = async (staffData: StaffInsert) => {
    // Extract password from staffData - don't send to database
    const { password, ...dbData } = staffData;
    
    const { data, error } = await supabase
      .from('staff')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = data as StaffMember;
    
    // If password is provided, create auth user via edge function
    if (password && password.length >= 6) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const response = await supabase.functions.invoke('create-user', {
          body: {
            email: staffData.email,
            password,
            name: `${staffData.first_name} ${staffData.last_name}`,
            role: 'staff',
            userType: 'staff',
            recordId: typedData.id
          }
        });

        if (response.error) {
          console.error('Error creating auth user:', response.error);
          toast({ 
            title: 'Warning', 
            description: 'Staff added but login account could not be created. ' + (response.error.message || ''),
            variant: 'destructive' 
          });
        } else {
          toast({ title: 'Success', description: 'Staff member added with login credentials' });
        }
      } catch (err) {
        console.error('Error invoking create-user:', err);
        toast({ 
          title: 'Warning', 
          description: 'Staff added but login account creation failed',
          variant: 'destructive' 
        });
      }
    } else {
      toast({ title: 'Success', description: 'Staff member added successfully' });
    }
    
    setStaff(prev => [typedData, ...prev]);
    return data;
  };

  const updateStaff = async (id: string, updates: Partial<StaffInsert>) => {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    const typedData = data as StaffMember;
    toast({ title: 'Success', description: 'Staff member updated successfully' });
    setStaff(prev => prev.map(s => s.id === id ? typedData : s));
    return data;
  };

  const deleteStaff = async (id: string) => {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    toast({ title: 'Success', description: 'Staff member deleted successfully' });
    setStaff(prev => prev.filter(s => s.id !== id));
    return true;
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return { staff, loading, fetchStaff, addStaff, updateStaff, deleteStaff };
}
