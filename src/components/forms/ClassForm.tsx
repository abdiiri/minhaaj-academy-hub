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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ClassInsert } from '@/hooks/useClasses';
import { StaffMember } from '@/hooks/useStaff';
import { GradeScaleEditor } from '@/components/grades/GradeScaleEditor';
import { GRADE_SCALE } from '@/lib/gradeCalculator';

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
    <div className="max-h-[60vh] overflow-y-auto pr-2">
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
          <Label>Secular Subjects (comma separated)</Label>
          <Input 
            placeholder="Mathematics, English, Science, etc." 
            value={Array.isArray(formData.secular_subjects) ? formData.secular_subjects.join(', ') : ''}
            onChange={e => {
              const value = e.target.value;
              // Only split and filter when there's actual content
              const subjects = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
              setFormData(prev => ({ ...prev, secular_subjects: subjects }));
            }}
          />
          <p className="text-xs text-muted-foreground">Enter secular subjects separated by commas</p>
        </div>
        <div className="space-y-2">
          <Label>Arabic Subjects (comma separated)</Label>
          <Input 
            placeholder="Quran, Arabic Language, Islamic Studies, etc." 
            value={Array.isArray(formData.arabic_subjects) ? formData.arabic_subjects.join(', ') : ''}
            onChange={e => {
              const value = e.target.value;
              // Only split and filter when there's actual content
              const subjects = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
              setFormData(prev => ({ ...prev, arabic_subjects: subjects }));
            }}
          />
          <p className="text-xs text-muted-foreground">Enter Arabic/Islamic subjects separated by commas</p>
        </div>
        <div className="space-y-2">
          <Label>Academic Year</Label>
          <Input 
            placeholder="2025/2026" 
            value={formData.academic_year}
            onChange={e => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
          />
        </div>

        {/* Grade Scale Configuration */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="grade-scale">
            <AccordionTrigger className="text-sm font-medium">
              Custom Grade Scale (Optional)
            </AccordionTrigger>
            <AccordionContent>
              <GradeScaleEditor
                gradeScale={formData.grade_scale || GRADE_SCALE}
                onChange={(scale) => setFormData(prev => ({ ...prev, grade_scale: scale }))}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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
