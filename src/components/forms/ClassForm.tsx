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
import { Subject } from '@/hooks/useSubjects';
import { GradeScaleEditor } from '@/components/grades/GradeScaleEditor';
import { GRADE_SCALE } from '@/lib/gradeCalculator';
import { SubjectPicker } from '@/components/forms/SubjectPicker';

interface ClassFormProps {
  formData: ClassInsert;
  setFormData: React.Dispatch<React.SetStateAction<ClassInsert>>;
  teachers: StaffMember[];
  secularSubjects: Subject[];
  arabicSubjects: Subject[];
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

export function ClassForm({ formData, setFormData, teachers, secularSubjects, arabicSubjects, onSubmit, onCancel, submitLabel }: ClassFormProps) {
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
        <SubjectPicker
          label="Secular Subjects"
          availableSubjects={secularSubjects}
          selectedSubjects={formData.secular_subjects || []}
          onChange={subjects => setFormData(prev => ({ ...prev, secular_subjects: subjects }))}
          variant="outline"
        />
        <SubjectPicker
          label="Arabic Subjects"
          availableSubjects={arabicSubjects}
          selectedSubjects={formData.arabic_subjects || []}
          onChange={subjects => setFormData(prev => ({ ...prev, arabic_subjects: subjects }))}
          variant="secondary"
        />
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
