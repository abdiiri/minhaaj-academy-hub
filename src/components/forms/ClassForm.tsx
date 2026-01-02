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
import { ClassInsert } from '@/hooks/useClasses';
import { StaffMember } from '@/hooks/useStaff';

interface ClassFormProps {
  formData: ClassInsert;
  setFormData: React.Dispatch<React.SetStateAction<ClassInsert>>;
  teachers: StaffMember[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

export function ClassForm({ formData, setFormData, teachers, onSubmit, onCancel, submitLabel }: ClassFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Class Name</Label>
        <Input 
          placeholder="e.g., Grade 4A" 
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
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
        <Label>Level</Label>
        <Select 
          value={formData.level} 
          onValueChange={v => setFormData(prev => ({ ...prev, level: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kindergarten">Kindergarten</SelectItem>
            <SelectItem value="Primary">Primary</SelectItem>
            <SelectItem value="Junior School">Junior School</SelectItem>
            <SelectItem value="iPrimary">iPrimary</SelectItem>
            <SelectItem value="iLowerSec">iLowerSec</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Class Teacher</Label>
        <Select 
          value={formData.teacher_id || 'none'} 
          onValueChange={v => setFormData(prev => ({ ...prev, teacher_id: v === 'none' ? undefined : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assign teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No teacher assigned</SelectItem>
            {teachers.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Subjects (comma separated)</Label>
        <Input 
          placeholder="Mathematics, English, Science, etc." 
          value={formData.subjects?.join(', ') || ''}
          onChange={e => setFormData(prev => ({ 
            ...prev, 
            subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
        />
      </div>
      <div className="space-y-2">
        <Label>Academic Year</Label>
        <Input 
          placeholder="2025/2026" 
          value={formData.academic_year}
          onChange={e => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="gradient-primary" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
