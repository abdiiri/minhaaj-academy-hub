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
import { MoreHorizontal, Pencil, Trash2, FileText, Search, PlusCircle } from 'lucide-react';
import { useResults, Result, ResultInsert } from '@/hooks/useResults';
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
  const [viewClassFilter, setViewClassFilter] = useState<string>('all');
  const [examType, setExamType] = useState<string>('midterm');
  const [examDate, setExamDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');

  const { results, isLoading, createBulkResults, deleteResult } = useResults(
    viewClassFilter !== 'all' ? viewClassFilter : undefined
  );
  const { classes } = useClasses();
  const { students } = useStudents();

  const canManage = role === 'admin' || role === 'staff';

  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId);
  }, [classes, selectedClassId]);

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
                  Select a class, exam type, and date to enter results for all students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Results Entry Table */}
                {selectedClass ? (
                  <ResultsEntryTable
                    selectedClass={selectedClass}
                    students={students}
                    existingResults={results}
                    examType={examType}
                    examDate={examDate}
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
              <Select value={viewClassFilter} onValueChange={setViewClassFilter}>
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
                <CardTitle>All Results</CardTitle>
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
                      {canManage ? 'Switch to "Enter Results" tab to add results.' : 'No results to display.'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Student</TableHead>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
