import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useClasses, ClassInsert, ClassRecord } from '@/hooks/useClasses';
import { useStaff } from '@/hooks/useStaff';
import { useStudents } from '@/hooks/useStudents';
import { ClassForm } from '@/components/forms/ClassForm';
import { 
  BookOpen, 
  Users, 
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function Classes() {
  const { classes, loading, addClass, updateClass, deleteClass } = useClasses();
  const { staff } = useStaff();
  const { students } = useStudents();
  const [filterCurriculum, setFilterCurriculum] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

  const [formData, setFormData] = useState<ClassInsert>({
    name: '',
    curriculum: 'CBE',
    level: '',
    teacher_id: undefined,
    secular_subjects: [],
    arabic_subjects: [],
    academic_year: '2025/2026',
    grade_scale: undefined
  });

  const teachers = staff.filter(s => s.role === 'teacher');

  const filteredClasses = classes.filter(cls => 
    cls && (filterCurriculum === 'all' || cls.curriculum === filterCurriculum)
  );

  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    if (!cls || !cls.level) return acc;
    const level = cls.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(cls);
    return acc;
  }, {} as Record<string, ClassRecord[]>);

  const getStudentCount = (classId: string) => {
    return students.filter(s => s.class_id === classId).length;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      curriculum: 'CBE',
      level: '',
      teacher_id: undefined,
      secular_subjects: [],
      arabic_subjects: [],
      academic_year: '2025/2026',
      grade_scale: undefined
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.level) return;
    const result = await addClass(formData);
    if (result) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (cls: ClassRecord) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      curriculum: cls.curriculum,
      level: cls.level,
      teacher_id: cls.teacher_id || undefined,
      secular_subjects: cls.secular_subjects || [],
      arabic_subjects: cls.arabic_subjects || [],
      academic_year: cls.academic_year,
      grade_scale: cls.grade_scale || undefined
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingClass) return;
    const result = await updateClass(editingClass.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingClass(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteClass(deleteId);
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
              <BookOpen className="h-8 w-8 text-primary" />
              Classes
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage classes, assign teachers, and view results
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={filterCurriculum} onValueChange={setFilterCurriculum}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Curriculum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Curriculums</SelectItem>
                <SelectItem value="CBE">CBE</SelectItem>
                <SelectItem value="Edexcel">Edexcel</SelectItem>
                <SelectItem value="Islamic">Islamic</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Set up a new class for the academic year.
                  </DialogDescription>
                </DialogHeader>
                <ClassForm 
                  formData={formData}
                  setFormData={setFormData}
                  teachers={teachers}
                  onSubmit={handleAdd}
                  onCancel={handleCancel}
                  submitLabel="Create Class"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
              <p className="text-muted-foreground mb-4">Create your first class to get started.</p>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Classes by Level */
          Object.entries(groupedClasses).map(([level, levelClasses]) => (
            <div key={level} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ChevronRight className="h-5 w-5 text-primary" />
                {level}
                <Badge variant="outline" className="ml-2">
                  {levelClasses.length} classes
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelClasses.map((cls) => (
                  <Card key={cls.id} className="card-hover">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{cls.name}</CardTitle>
                          <CardDescription>
                            {cls.curriculum} • {cls.academic_year}
                          </CardDescription>
                        </div>
                        <Badge className={
                          cls.curriculum === 'CBE' 
                            ? 'bg-primary/10 text-primary' 
                            : cls.curriculum === 'Edexcel'
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-accent/10 text-accent'
                        }>
                          {cls.curriculum}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{getStudentCount(cls.id)} students</span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Teacher</p>
                        <p className="text-sm font-medium">
                          {cls.staff ? `${cls.staff.first_name} ${cls.staff.last_name}` : 'Not assigned'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Secular Subjects</p>
                        <div className="flex flex-wrap gap-1">
                          {(cls.secular_subjects || []).slice(0, 3).map(subject => (
                            <Badge key={subject} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {(cls.secular_subjects || []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(cls.secular_subjects || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Arabic Subjects</p>
                        <div className="flex flex-wrap gap-1">
                          {(cls.arabic_subjects || []).slice(0, 3).map(subject => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {(cls.arabic_subjects || []).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(cls.arabic_subjects || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(cls)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update the class details.
              </DialogDescription>
            </DialogHeader>
            <ClassForm 
              formData={formData}
              setFormData={setFormData}
              teachers={teachers}
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
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this class? Students in this class will need to be reassigned.
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
