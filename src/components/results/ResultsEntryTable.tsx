import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Save, Loader2 } from 'lucide-react';
import { StudentRecord } from '@/hooks/useStudents';
import { ClassRecord } from '@/hooks/useClasses';
import { Result, ResultInsert } from '@/hooks/useResults';
import { toast } from '@/hooks/use-toast';

interface ResultsEntryTableProps {
  selectedClass: ClassRecord;
  students: StudentRecord[];
  existingResults: Result[];
  examType: string;
  examDate: string;
  onSaveResults: (results: ResultInsert[]) => Promise<void>;
  isSaving: boolean;
}

type ScoreMap = Record<string, Record<string, number | ''>>;

export function ResultsEntryTable({
  selectedClass,
  students,
  existingResults,
  examType,
  examDate,
  onSaveResults,
  isSaving,
}: ResultsEntryTableProps) {
  const [scores, setScores] = useState<ScoreMap>({});

  // Get all subjects for the class
  const allSubjects = useMemo(() => {
    const secular = selectedClass.secular_subjects || [];
    const arabic = selectedClass.arabic_subjects || [];
    return [...secular, ...arabic];
  }, [selectedClass]);

  // Filter students by class
  const classStudents = useMemo(() => {
    return students.filter(s => s.class_id === selectedClass.id && s.status === 'active');
  }, [students, selectedClass.id]);

  // Initialize scores from existing results
  useEffect(() => {
    const initialScores: ScoreMap = {};
    
    classStudents.forEach(student => {
      initialScores[student.id] = {};
      allSubjects.forEach(subject => {
        const existingResult = existingResults.find(
          r => r.student_id === student.id && 
               r.subject === subject && 
               r.exam_type === examType &&
               r.exam_date === examDate
        );
        initialScores[student.id][subject] = existingResult ? existingResult.score : '';
      });
    });
    
    setScores(initialScores);
  }, [classStudents, allSubjects, existingResults, examType, examDate]);

  const handleScoreChange = (studentId: string, subject: string, value: string) => {
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue,
      },
    }));
  };

  const calculateTotal = (studentId: string): number => {
    const studentScores = scores[studentId] || {};
    return Object.values(studentScores).reduce<number>((sum, score) => {
      return sum + (typeof score === 'number' ? score : 0);
    }, 0);
  };

  const calculateMaxTotal = (): number => {
    return allSubjects.length * 100;
  };

  const handleSave = async () => {
    const resultsToSave: ResultInsert[] = [];
    
    classStudents.forEach(student => {
      const studentScores = scores[student.id] || {};
      allSubjects.forEach(subject => {
        const score = studentScores[subject];
        if (typeof score === 'number' && score >= 0) {
          resultsToSave.push({
            student_id: student.id,
            class_id: selectedClass.id,
            subject,
            exam_type: examType as 'quiz' | 'midterm' | 'final' | 'assignment' | 'project',
            score,
            max_score: 100,
            exam_date: examDate,
          });
        }
      });
    });

    if (resultsToSave.length === 0) {
      toast({ title: 'No scores entered', description: 'Please enter at least one score', variant: 'destructive' });
      return;
    }

    await onSaveResults(resultsToSave);
  };

  if (classStudents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No active students found in this class.
      </div>
    );
  }

  if (allSubjects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No subjects configured for this class. Please add subjects in the Classes page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[200px] w-[250px] font-semibold">Student Name</TableHead>
              {allSubjects.map(subject => (
                <TableHead key={subject} className="min-w-[100px] text-center font-semibold">
                  {subject}
                </TableHead>
              ))}
              <TableHead className="min-w-[100px] text-center font-semibold bg-primary/10">
                Total ({calculateMaxTotal()})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classStudents.map((student, idx) => (
              <TableRow key={student.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                <TableCell className="font-medium min-w-[200px]">
                  <div>
                    <p className="font-semibold">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                  </div>
                </TableCell>
                {allSubjects.map(subject => (
                  <TableCell key={subject} className="p-1">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={scores[student.id]?.[subject] ?? ''}
                      onChange={(e) => handleScoreChange(student.id, subject, e.target.value)}
                      className="w-full text-center h-9"
                      placeholder="-"
                    />
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold bg-primary/5">
                  {calculateTotal(student.id)} / {calculateMaxTotal()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Results
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
