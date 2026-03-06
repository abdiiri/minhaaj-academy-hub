import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Trash2, FileText, Search, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { exportResultsToExcel, exportResultsToPDF } from '@/lib/resultsExport';
import { useResults, ResultInsert } from '@/hooks/useResults';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/contexts/AuthContext';
import { ResultsEntryTable } from '@/components/results/ResultsEntryTable';
import { format } from 'date-fns';

const EXAM_TYPES = ['quiz', 'midterm', 'final', 'assignment', 'project'] as const;

export default function Results() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('view');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [entrySubjectType, setEntrySubjectType] = useState<'secular' | 'arabic'>('secular');
  const [examType, setExamType] = useState<string>('midterm');
  const [examDate, setExamDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // View tab state
  const [viewClassFilter, setViewClassFilter] = useState<string>('');
  const [viewSubjectType, setViewSubjectType] = useState<'secular' | 'arabic'>('secular');
  const [searchTerm, setSearchTerm] = useState('');

  const { results, isLoading, createBulkResults, deleteResult } = useResults(
    viewClassFilter || undefined
  );
  const { classes } = useClasses();
  const { students } = useStudents();

  const canManage = role === 'staff';

  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  const viewClass = useMemo(() => {
    return classes.find(c => c.id === viewClassFilter);
  }, [classes, viewClassFilter]);

  // Get subjects for selected view class filtered by type
  const viewSubjects = useMemo(() => {
    if (!viewClass) return [];
    if (viewSubjectType === 'secular') return viewClass.secular_subjects || [];
    return viewClass.arabic_subjects || [];
  }, [viewClass, viewSubjectType]);

  // Build student-row pivot data for view tab
  const studentRows = useMemo(() => {
    if (!viewClass || viewSubjects.length === 0) return [];

    // Filter results to only the selected subjects
    const filteredResults = results.filter(r => viewSubjects.includes(r.subject));

    // Apply search filter
    const searchFiltered = searchTerm
      ? filteredResults.filter(r =>
          r.students?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.students?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.students?.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredResults;

    // Group by student
    const studentMap = new Map<string, {
      id: string;
      name: string;
      admission: string;
      scores: Record<string, { score: number; grade: string | null; resultId: string }>;
    }>();

    searchFiltered.forEach(r => {
      if (!studentMap.has(r.student_id)) {
        studentMap.set(r.student_id, {
          id: r.student_id,
          name: `${r.students?.first_name || ''} ${r.students?.last_name || ''}`,
          admission: r.students?.admission_number || '',
          scores: {},
        });
      }
      const student = studentMap.get(r.student_id)!;
      // Keep latest result per subject
      if (!student.scores[r.subject] || r.exam_date > (student.scores[r.subject] as any).examDate) {
        student.scores[r.subject] = { score: r.score, grade: r.grade, resultId: r.id };
      }
    });

    return Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [results, viewClass, viewSubjects, searchTerm]);

  // Subject averages for view tab
  const viewSubjectAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    viewSubjects.forEach(subject => {
      const scores = studentRows
        .map(s => s.scores[subject]?.score)
        .filter((s): s is number => s !== undefined);
      if (scores.length > 0) {
        avgs[subject] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });
    return avgs;
  }, [studentRows, viewSubjects]);

  const handleSaveResults = async (resultsToSave: ResultInsert[]) => {
    await createBulkResults.mutateAsync(resultsToSave);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this result?')) {
      await deleteResult.mutateAsync(id);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Results</h1>
          <p className="text-muted-foreground">
            {canManage ? 'Enter and manage student academic results' : 'View student results'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {canManage && (
            <TabsList className="mb-4">
              <TabsTrigger value="view">View Results</TabsTrigger>
              <TabsTrigger value="entry">
                <PlusCircle className="mr-2 h-4 w-4" />
                Enter Results
              </TabsTrigger>
            </TabsList>
          )}

          {/* Entry Tab */}
          <TabsContent value="entry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enter Results</CardTitle>
                <CardDescription>
                  Select a class, subject type, exam type, and date to enter results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Type</Label>
                    <Select value={entrySubjectType} onValueChange={(v) => setEntrySubjectType(v as 'secular' | 'arabic')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secular">Secular</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Date</Label>
                    <Input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>
                </div>

                {selectedClass ? (
                  <ResultsEntryTable
                    selectedClass={selectedClass}
                    students={students}
                    existingResults={results}
                    examType={examType}
                    examDate={examDate}
                    subjectType={entrySubjectType}
                    onSaveResults={handleSaveResults}
                    isSaving={createBulkResults.isPending}
                  />
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Select a Class</h3>
                    <p className="text-muted-foreground">
                      Choose a class above to start entering results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Tab */}
          <TabsContent value="view" className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={viewClassFilter} onValueChange={setViewClassFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={viewSubjectType} onValueChange={(v) => setViewSubjectType(v as 'secular' | 'arabic')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secular">Secular</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
              {studentRows.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const studentScores: Record<string, Record<string, number | ''>> = {};
                      studentRows.forEach(s => {
                        studentScores[s.id] = {};
                        viewSubjects.forEach(sub => {
                          studentScores[s.id][sub] = s.scores[sub]?.score ?? '';
                        });
                      });
                      exportResultsToExcel({
                        students: studentRows.map(s => ({ id: s.id, first_name: s.name.split(' ')[0], last_name: s.name.split(' ').slice(1).join(' '), admission_number: s.admission })) as any[],
                        subjects: viewSubjects,
                        scores: studentScores,
                        averages: viewSubjectAverages,
                        className: viewClass?.name || '',
                        examType: 'All',
                        examDate: new Date().toISOString().split('T')[0],
                      });
                    }}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const studentScores: Record<string, Record<string, number | ''>> = {};
                      studentRows.forEach(s => {
                        studentScores[s.id] = {};
                        viewSubjects.forEach(sub => {
                          studentScores[s.id][sub] = s.scores[sub]?.score ?? '';
                        });
                      });
                      exportResultsToPDF({
                        students: studentRows.map(s => ({ id: s.id, first_name: s.name.split(' ')[0], last_name: s.name.split(' ').slice(1).join(' '), admission_number: s.admission })) as any[],
                        subjects: viewSubjects,
                        scores: studentScores,
                        averages: viewSubjectAverages,
                        className: viewClass?.name || '',
                        examType: 'All',
                        examDate: new Date().toISOString().split('T')[0],
                      });
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {viewClass
                    ? `${viewClass.name} — ${viewSubjectType === 'secular' ? 'Secular' : 'Arabic'} Results`
                    : 'Select a Class'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!viewClassFilter ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Select a Class</h3>
                    <p className="text-muted-foreground">Choose a class and subject type to view results</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : viewSubjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No Subjects</h3>
                    <p className="text-muted-foreground">
                      No {viewSubjectType} subjects configured for this class.
                    </p>
                  </div>
                ) : studentRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No Results Found</h3>
                    <p className="text-muted-foreground">
                      {canManage ? 'Switch to "Enter Results" tab to add results.' : 'No results to display.'}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="min-w-[200px] sticky left-0 bg-muted/50 font-semibold">Student</TableHead>
                          {viewSubjects.map(subject => (
                            <TableHead key={subject} className="min-w-[100px] text-center font-semibold">
                              {subject}
                            </TableHead>
                          ))}
                          <TableHead className="min-w-[80px] text-center font-semibold bg-primary/10">Total</TableHead>
                          <TableHead className="min-w-[80px] text-center font-semibold bg-primary/10">Average</TableHead>
                          {canManage && <TableHead className="w-[70px]">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentRows.map((student, idx) => {
                          const validScores = viewSubjects
                            .map(s => student.scores[s]?.score)
                            .filter((s): s is number => s !== undefined);
                          const total = validScores.reduce((a, b) => a + b, 0);
                          const avg = validScores.length > 0 ? (total / validScores.length).toFixed(1) : '-';

                          return (
                            <TableRow key={student.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                              <TableCell className="font-medium sticky left-0 bg-inherit">
                                <div>
                                  <p className="font-semibold">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.admission}</p>
                                </div>
                              </TableCell>
                              {viewSubjects.map(subject => {
                                const data = student.scores[subject];
                                return (
                                  <TableCell key={subject} className="text-center">
                                    {data ? (
                                      <div className="flex flex-col items-center gap-0.5">
                                        <span className="font-medium">{data.score}</span>
                                        {data.grade && (
                                          <Badge className={`text-[10px] px-1 py-0 ${getGradeColor(data.grade)}`}>
                                            {data.grade}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center font-bold bg-primary/5">
                                {validScores.length > 0 ? `${total}/${viewSubjects.length * 100}` : '-'}
                              </TableCell>
                              <TableCell className="text-center font-bold bg-primary/5">
                                {avg}
                              </TableCell>
                              {canManage && (
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {viewSubjects.map(subject => {
                                        const data = student.scores[subject];
                                        if (!data) return null;
                                        return (
                                          <DropdownMenuItem
                                            key={subject}
                                            onClick={() => handleDelete(data.resultId)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete {subject}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="bg-muted font-bold">
                          <TableCell className="sticky left-0 bg-muted">Class Average</TableCell>
                          {viewSubjects.map(subject => (
                            <TableCell key={subject} className="text-center">
                              {viewSubjectAverages[subject]?.toFixed(1) || '-'}
                            </TableCell>
                          ))}
                          <TableCell className="text-center bg-primary/10">-</TableCell>
                          <TableCell className="text-center bg-primary/10">
                            {(() => {
                              const allAvgs = Object.values(viewSubjectAverages);
                              return allAvgs.length > 0 ? (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1) : '-';
                            })()}
                          </TableCell>
                          {canManage && <TableCell />}
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
