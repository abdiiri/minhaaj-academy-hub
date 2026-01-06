import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAttendance, AttendanceInsert } from '@/hooks/useAttendance';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { CalendarIcon, Check, X, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentAttendance {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  status: AttendanceStatus;
  existingId?: string;
}

export default function Attendance() {
  const { user } = useAuth();
  const { classes, fetchClasses } = useClasses();
  const { students, fetchStudents } = useStudents();
  const { attendance, loading, fetchAttendance, markAttendance } = useAttendance();
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendanceForClassAndDate();
    }
  }, [selectedClass, selectedDate]);

  const loadAttendanceForClassAndDate = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Get students in selected class
    const classStudents = students.filter(s => s.class_id === selectedClass);
    
    // Fetch existing attendance for this class and date
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', selectedClass)
      .eq('date', dateStr);

    // Map students with their attendance status
    const attendanceMap = new Map(
      existingAttendance?.map(a => [a.student_id, { status: a.status as AttendanceStatus, id: a.id }]) || []
    );

    const mappedStudents: StudentAttendance[] = classStudents.map(student => ({
      student_id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      admission_number: student.admission_number,
      status: attendanceMap.get(student.id)?.status || 'present',
      existingId: attendanceMap.get(student.id)?.id,
    }));

    setStudentAttendance(mappedStudents);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendance(prev =>
      prev.map(s =>
        s.student_id === studentId ? { ...s, status } : s
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || studentAttendance.length === 0) return;

    setSaving(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const records: AttendanceInsert[] = studentAttendance.map(s => ({
      student_id: s.student_id,
      class_id: selectedClass,
      date: dateStr,
      status: s.status,
      marked_by: user?.id || null,
    }));

    const success = await markAttendance(records);
    if (success) {
      await loadAttendanceForClassAndDate();
    }
    setSaving(false);
  };

  const markAllAs = (status: AttendanceStatus) => {
    setStudentAttendance(prev =>
      prev.map(s => ({ ...s, status }))
    );
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
      present: { variant: 'default', icon: <Check className="h-3 w-3" /> },
      absent: { variant: 'destructive', icon: <X className="h-3 w-3" /> },
      late: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      excused: { variant: 'outline', icon: <FileText className="h-3 w-3" /> },
    };

    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="gap-1 capitalize">
        {icon}
        {status}
      </Badge>
    );
  };

  const getStats = () => {
    const total = studentAttendance.length;
    const present = studentAttendance.filter(s => s.status === 'present').length;
    const absent = studentAttendance.filter(s => s.status === 'absent').length;
    const late = studentAttendance.filter(s => s.status === 'late').length;
    const excused = studentAttendance.filter(s => s.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Mark and manage student attendance</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-64">
                <label className="text-sm font-medium mb-2 block">Select Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.curriculum} {cls.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedClass && studentAttendance.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground">Present</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <p className="text-xs text-muted-foreground">Late</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                <p className="text-xs text-muted-foreground">Excused</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Attendance for {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAllAs('present')}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAllAs('absent')}>
                  Mark All Absent
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {studentAttendance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No students found in this class.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">
                            {student.admission_number}
                          </TableCell>
                          <TableCell>
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant={student.status === 'present' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student.student_id, 'present')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={student.status === 'absent' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student.student_id, 'absent')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={student.status === 'late' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student.student_id, 'late')}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={student.status === 'excused' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student.student_id, 'excused')}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveAttendance} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                Please select a class to mark attendance.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
