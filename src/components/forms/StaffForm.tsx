import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaffInsert } from '@/hooks/useStaff';

interface StaffFormProps {
  formData: StaffInsert;
  setFormData: React.Dispatch<React.SetStateAction<StaffInsert>>;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  showPasswordField?: boolean; // Only show when adding new staff
}

export function StaffForm({ formData, setFormData, onSubmit, onCancel, submitLabel, showPasswordField = false }: StaffFormProps) {
  return (
    <div className="max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label>Employee ID</Label>
          <Input 
            placeholder="EMP-001" 
            value={formData.employee_id}
            onChange={e => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={v => setFormData(prev => ({ ...prev, status: v as 'active' | 'inactive' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input 
            placeholder="Enter first name" 
            value={formData.first_name}
            onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input 
            placeholder="Enter last name" 
            value={formData.last_name}
            onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            type="email" 
            placeholder="staff@minhaaj.ac.ke" 
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input 
            placeholder="+254 7XX XXX XXX" 
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={v => setFormData(prev => ({ ...prev, role: v as 'teacher' | 'admin_staff' | 'support' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="admin_staff">Admin Staff</SelectItem>
              <SelectItem value="support">Support Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Join Date</Label>
          <Input 
            type="date" 
            value={formData.join_date}
            onChange={e => setFormData(prev => ({ ...prev, join_date: e.target.value }))}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Subjects (comma separated)</Label>
          <Input 
            placeholder="Mathematics, Science, English, etc." 
            value={formData.subjects?.join(', ') || ''}
            onChange={e => setFormData(prev => ({ 
              ...prev, 
              subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
          />
          <p className="text-xs text-muted-foreground">Enter multiple subjects separated by commas</p>
        </div>
        {showPasswordField && (
          <div className="space-y-2 col-span-2">
            <Label>Login Password</Label>
            <Input 
              type="password"
              placeholder="Minimum 6 characters" 
              value={formData.password || ''}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Set a password for this staff member to log in. Leave empty if no login account is needed.
            </p>
          </div>
        )}
        <div className="col-span-2 flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="gradient-primary" onClick={onSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
