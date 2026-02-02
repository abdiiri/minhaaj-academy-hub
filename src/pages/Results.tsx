import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Plus, MoreHorizontal, Pencil, Trash2, FileText, Search } from 'lucide-react';
import { useResults, Result, ResultInsert } from '@/hooks/useResults';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const EXAM_TYPES = ['quiz', 'midterm', 'final', 'assignment', 'project'] as const;

export default function Results() {
  const { role } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const { results, isLoading, createResult, updateResult, deleteResult } = useResults(
    selectedClassId !== 'all' ? selectedClassId : undefined
  );
  const { classes } = useClasses();
  const { students } = useStudents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ResultInsert>({
    student_id: '',
    class_id: '',
    subject: '',
    exam_type: 'quiz',
    score: 0,
    max_score: 100,
    grade: '',
    remarks: '',
    exam_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const canManage = role === 'admin' || role === 'staff';

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (!formData.class_id) return [];
    return students.filter(s => s.class_id === formData.class_id);
  }, [students, formData.class_id]);

  // Get subjects for selected class (combine secular and arabic subjects)
  const classSubjects = useMemo(() => {
    if (!formData.class_id) return [];
    const selectedClass = classes.find(c => c.id === formData.class_id);
    const secular = selectedClass?.secular_subjects || [];
    const arabic = selectedClass?.arabic_subjects || [];
    return [...secular, ...arabic];
  }, [classes, formData.class_id]);

  // Filter results by search term
  const displayedResults = useMemo(() => {
    if (!searchTerm) return results;
    const term = searchTerm.toLowerCase();
    return results.filter(r => 
      r.students?.first_name.toLowerCase().includes(term) ||
      r.students?.last_name.toLowerCase().includes(term) ||
      r.students?.admission_number.toLowerCase().includes(term) ||
      r.subject.toLowerCase().includes(term)
    );
  }, [results, searchTerm]);

  const calculateGrade = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const grade = formData.grade || calculateGrade(formData.score, formData.max_score || 100);
    
    if (editingResult) {
      await updateResult.mutateAsync({
        id: editingResult.id,
        ...formData,
        grade,
      });
    } else {
      await createResult.mutateAsync({ ...formData, grade });
    }
    
    setIsDialogOpen(false);
    setEditingResult(null);
    setFormData({
      student_id: '',
      class_id: '',
      subject: '',
      exam_type: 'quiz',
      score: 0,
      max_score: 100,
      grade: '',
      remarks: '',
      exam_date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleEdit = (result: Result) => {
    setEditingResult(result);
    setFormData({
      student_id: result.student_id,
      class_id: result.class_id,
      subject: result.subject,
      exam_type: result.exam_type,
      score: result.score,
      max_score: result.max_score,
      grade: result.grade || '',
      remarks: result.remarks || '',
      exam_date: result.exam_date,
    });
    setIsDialogOpen(true);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Results</h1>
            <p className="text-muted-foreground">
              {canManage ? 'Manage and enter student academic results' : 'View student results'}
            </p>
          </div>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingResult(null);
                  setFormData({
                    student_id: '',
                    class_id: '',
                    subject: '',
                    exam_type: 'quiz',
                    score: 0,
                    max_score: 100,
                    grade: '',
                    remarks: '',
                    exam_date: format(new Date(), 'yyyy-MM-dd'),
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Result
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingResult ? 'Edit Result' : 'Add New Result'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) => setFormData({ 
                          ...formData, 
                          class_id: value,
                          student_id: '',
                          subject: '' 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
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
                      <Label>Student</Label>
                      <Select
                        value={formData.student_id}
                        onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                        disabled={!formData.class_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.first_name} {student.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        disabled={!formData.class_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {classSubjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Type</Label>
                      <Select
                        value={formData.exam_type}
                        onValueChange={(value: typeof EXAM_TYPES[number]) => 
                          setFormData({ ...formData, exam_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="score">Score</Label>
                      <Input
                        id="score"
                        type="number"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                        min={0}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxScore">Max Score</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        value={formData.max_score}
                        onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                        min={1}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examDate">Exam Date</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={formData.exam_date}
                        onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Add any remarks about the student's performance"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createResult.isPending || updateResult.isPending}>
                      {editingResult ? 'Update' : 'Add Result'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : displayedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Results Found</h3>
                <p className="text-muted-foreground">
                  {canManage ? 'Add your first result to get started.' : 'No results to display.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Date</TableHead>
                    {canManage && <TableHead className="w-[70px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {result.students?.first_name} {result.students?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.students?.admission_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.classes?.name} - {result.classes?.level}
                      </TableCell>
                      <TableCell>{result.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {result.exam_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.score}/{result.max_score}
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(result.grade || '')}>
                          {result.grade || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(result.exam_date), 'MMM d, yyyy')}</TableCell>
                      {canManage && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(result)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(result.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
