import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { GradeConfig, GRADE_SCALE } from '@/lib/gradeCalculator';

interface GradeScaleEditorProps {
  gradeScale: GradeConfig[];
  onChange: (scale: GradeConfig[]) => void;
}

export function GradeScaleEditor({ gradeScale, onChange }: GradeScaleEditorProps) {
  const [localScale, setLocalScale] = useState<GradeConfig[]>(
    gradeScale.length > 0 ? gradeScale : GRADE_SCALE
  );

  const handleUpdate = (index: number, field: keyof GradeConfig, value: string | number) => {
    const updated = [...localScale];
    if (field === 'minPercentage') {
      updated[index] = { ...updated[index], [field]: Number(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value as string };
    }
    // Sort by minPercentage descending
    updated.sort((a, b) => b.minPercentage - a.minPercentage);
    setLocalScale(updated);
    onChange(updated);
  };

  const handleAdd = () => {
    const newEntry: GradeConfig = {
      minPercentage: 0,
      grade: '',
      description: '',
    };
    const updated = [...localScale, newEntry].sort((a, b) => b.minPercentage - a.minPercentage);
    setLocalScale(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    if (localScale.length <= 2) return; // Keep at least 2 grades
    const updated = localScale.filter((_, i) => i !== index);
    setLocalScale(updated);
    onChange(updated);
  };

  const handleReset = () => {
    setLocalScale(GRADE_SCALE);
    onChange(GRADE_SCALE);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Grade Scale</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset to Default
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
          <div className="col-span-3">Min %</div>
          <div className="col-span-3">Grade</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {localScale.map((config, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <Input
                type="number"
                min={0}
                max={100}
                value={config.minPercentage}
                onChange={(e) => handleUpdate(index, 'minPercentage', e.target.value)}
                className="col-span-3 h-8 text-sm"
              />
              <Input
                value={config.grade}
                onChange={(e) => handleUpdate(index, 'grade', e.target.value)}
                className="col-span-3 h-8 text-sm"
                placeholder="A+"
              />
              <Input
                value={config.description}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                className="col-span-5 h-8 text-sm"
                placeholder="Excellent"
              />
              <Button
                variant="ghost"
                size="sm"
                className="col-span-1 h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleRemove(index)}
                disabled={localScale.length <= 2}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add Grade Level
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Scores at or above the minimum percentage will receive the corresponding grade.
        </p>
      </CardContent>
    </Card>
  );
}
