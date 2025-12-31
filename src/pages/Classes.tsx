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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockClasses } from '@/data/mockData';
import { SchoolClass } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Users, 
  Download, 
  Plus,
  FileSpreadsheet,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function Classes() {
  const [classes, setClasses] = useState<SchoolClass[]>(mockClasses);
  const [filterCurriculum, setFilterCurriculum] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredClasses = classes.filter(cls => 
    filterCurriculum === 'all' || cls.curriculum === filterCurriculum
  );

  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    const level = cls.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(cls);
    return acc;
  }, {} as Record<string, SchoolClass[]>);

  const handleExportResults = (className: string) => {
    toast({
      title: 'Exporting Results',
      description: `Exporting results for ${className}...`,
    });
  };

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
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary">
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
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Class Name</Label>
                    <Input placeholder="e.g., Grade 4A" />
                  </div>
                  <div className="space-y-2">
                    <Label>Curriculum</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select curriculum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBE">CBE</SelectItem>
                        <SelectItem value="Edexcel">Edexcel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select>
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ahmed Hassan</SelectItem>
                        <SelectItem value="2">Fatima Omar</SelectItem>
                        <SelectItem value="3">Yusuf Ali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="gradient-primary" onClick={() => {
                    toast({ title: 'Class Created', description: 'The new class has been created successfully.' });
                    setIsAddDialogOpen(false);
                  }}>
                    Create Class
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Classes by Level */}
        {Object.entries(groupedClasses).map(([level, levelClasses]) => (
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
                          {cls.curriculum} • {cls.academicYear}
                        </CardDescription>
                      </div>
                      <Badge className={
                        cls.curriculum === 'CBE' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-secondary/10 text-secondary'
                      }>
                        {cls.curriculum}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.studentCount} students</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Teacher</p>
                      <p className="text-sm font-medium">{cls.teacherName || 'Not assigned'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-1">
                        {cls.subjects.slice(0, 4).map(subject => (
                          <Badge key={subject} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {cls.subjects.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{cls.subjects.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Users className="h-4 w-4 mr-1" />
                        Students
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportResults(cls.name)}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
