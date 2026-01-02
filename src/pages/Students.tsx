import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStudents, StudentInsert, StudentRecord } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { StudentForm } from '@/components/forms/StudentForm';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  GraduationCap,
  Filter,
  Loader2
} from 'lucide-react';

export default function Students() {
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { classes } = useClasses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurriculum, setFilterCurriculum] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const [formData, setFormData] = useState<StudentInsert>({
    admission_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    curriculum: 'CBE',
    class_id: undefined,
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    status: 'active'
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurriculum = filterCurriculum === 'all' || student.curriculum === filterCurriculum;
    return matchesSearch && matchesCurriculum;
  });

  const resetForm = () => {
    setFormData({
      admission_number: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      curriculum: 'CBE',
      class_id: undefined,
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      status: 'active'
    });
  };

  const handleAdd = async () => {
    if (!formData.first_name || !formData.last_name || !formData.admission_number || !formData.date_of_birth) return;
    const result = await addStudent(formData);
    if (result) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setFormData({
      admission_number: student.admission_number,
      first_name: student.first_name,
      last_name: student.last_name,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      curriculum: student.curriculum,
      class_id: student.class_id || undefined,
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      parent_email: student.parent_email || '',
      status: student.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    const result = await updateStudent(editingStudent.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteStudent(deleteId);
    setDeleteId(null);
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              Students
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage student enrollment, profiles, and records
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the student's details to enroll them in the system.
                  </DialogDescription>
                </DialogHeader>
                <StudentForm 
                  formData={formData}
                  setFormData={setFormData}
                  classes={classes}
                  onSubmit={handleAdd}
                  onCancel={handleCancel}
                  submitLabel="Enroll Student"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or admission number..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCurriculum} onValueChange={setFilterCurriculum}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by curriculum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Curriculums</SelectItem>
                  <SelectItem value="CBE">CBE</SelectItem>
                  <SelectItem value="Edexcel">Edexcel</SelectItem>
                  <SelectItem value="Islamic">Islamic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Records</CardTitle>
            <CardDescription>
              {filteredStudents.length} students found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                <p className="text-muted-foreground mb-4">Enroll your first student to get started.</p>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Curriculum</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.admission_number}
                        </TableCell>
                        <TableCell>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.classes?.name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            student.curriculum === 'CBE' ? 'bg-primary/5 text-primary' :
                            student.curriculum === 'Edexcel' ? 'bg-secondary/5 text-secondary' :
                            'bg-accent/5 text-accent'
                          }>
                            {student.curriculum}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{student.parent_name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{student.parent_phone || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            student.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                            student.status === 'inactive' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            'bg-muted text-muted-foreground'
                          }>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(student)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteId(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student's details.
              </DialogDescription>
            </DialogHeader>
            <StudentForm 
              formData={formData}
              setFormData={setFormData}
              classes={classes}
              onSubmit={handleUpdate}
              onCancel={handleCancel}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
