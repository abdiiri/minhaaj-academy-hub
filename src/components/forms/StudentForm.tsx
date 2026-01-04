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
import { StudentInsert } from '@/hooks/useStudents';
import { ClassRecord } from '@/hooks/useClasses';

interface StudentFormProps {
  formData: StudentInsert;
  setFormData: React.Dispatch<React.SetStateAction<StudentInsert>>;
  classes: ClassRecord[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  showPasswordField?: boolean; // Only show when adding new student
}

export function StudentForm({ formData, setFormData, classes, onSubmit, onCancel, submitLabel, showPasswordField = false }: StudentFormProps) {
  return (
    <div className="max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label>Admission Number</Label>
          <Input 
            placeholder="MA-2025-001" 
            value={formData.admission_number}
            onChange={e => setFormData(prev => ({ ...prev, admission_number: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={v => setFormData(prev => ({ ...prev, status: v as 'active' | 'inactive' | 'graduated' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
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
          <Label>Date of Birth</Label>
          <Input 
            type="date" 
            value={formData.date_of_birth}
            onChange={e => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={v => setFormData(prev => ({ ...prev, gender: v as 'male' | 'female' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Curriculum</Label>
          <Select 
            value={formData.curriculum} 
            onValueChange={v => setFormData(prev => ({ ...prev, curriculum: v as 'CBE' | 'Edexcel' | 'Islamic' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select curriculum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CBE">CBE</SelectItem>
              <SelectItem value="Edexcel">Edexcel</SelectItem>
              <SelectItem value="Islamic">Islamic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Class</Label>
          <Select 
            value={formData.class_id || 'none'} 
            onValueChange={v => setFormData(prev => ({ ...prev, class_id: v === 'none' ? undefined : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No class assigned</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Parent/Guardian Name</Label>
          <Input 
            placeholder="Enter parent name" 
            value={formData.parent_name}
            onChange={e => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Parent Phone</Label>
          <Input 
            placeholder="+254 7XX XXX XXX" 
            value={formData.parent_phone}
            onChange={e => setFormData(prev => ({ ...prev, parent_phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Parent Email</Label>
          <Input 
            type="email" 
            placeholder="parent@email.com" 
            value={formData.parent_email}
            onChange={e => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
          />
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
              Set a password for this student to log in using their parent email. Leave empty if no login account is needed.
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
