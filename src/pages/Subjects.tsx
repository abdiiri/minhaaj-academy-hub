import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useSubjects } from '@/hooks/useSubjects';
import { BookMarked, Plus, Trash2, Loader2 } from 'lucide-react';

export default function Subjects() {
  const { secularSubjects, arabicSubjects, loading, addSubject, deleteSubject } = useSubjects();
  const [newSecular, setNewSecular] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddSecular = async () => {
    if (!newSecular.trim()) return;
    const result = await addSubject(newSecular, 'secular');
    if (result) setNewSecular('');
  };

  const handleAddArabic = async () => {
    if (!newArabic.trim()) return;
    const result = await addSubject(newArabic, 'arabic');
    if (result) setNewArabic('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSubject(deleteId);
    setDeleteId(null);
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
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-primary" />
            Subjects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage secular and Arabic subjects available for classes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Secular Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secular Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Mathematics"
                  value={newSecular}
                  onChange={e => setNewSecular(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSecular()}
                />
                <Button size="sm" className="gradient-primary shrink-0" onClick={handleAddSecular}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {secularSubjects.map(subject => (
                  <Badge key={subject.id} variant="outline" className="text-sm py-1.5 px-3 gap-2">
                    {subject.name}
                    <button
                      onClick={() => setDeleteId(subject.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {secularSubjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">No secular subjects added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Arabic Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Arabic Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Quran"
                  value={newArabic}
                  onChange={e => setNewArabic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddArabic()}
                />
                <Button size="sm" className="gradient-primary shrink-0" onClick={handleAddArabic}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {arabicSubjects.map(subject => (
                  <Badge key={subject.id} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                    {subject.name}
                    <button
                      onClick={() => setDeleteId(subject.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {arabicSubjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">No Arabic subjects added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subject</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure? This won't remove the subject from classes that already have it assigned.
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
