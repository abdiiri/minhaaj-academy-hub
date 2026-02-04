import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarIcon, Download, FileSpreadsheet, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttendanceStats {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

interface StudentAttendanceReport {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_name: string;
  stats: AttendanceStats;
}

interface DailyAttendanceRecord {
  date: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  status: string;
}

export default function AttendanceReports() {
  const { classes, fetchClasses } = useClasses();
  const { students, fetchStudents } = useStudents();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [studentReports, setStudentReports] = useState<StudentAttendanceReport[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyAttendanceRecord[]>([]);
  const [overallStats, setOverallStats] = useState<AttendanceStats | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [selectedClass, selectedStudent, startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      // Build query for attendance records
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(
            id, first_name, last_name, admission_number, class_id,
            class:classes(name)
          )
        `)
        .gte('date', startStr)
        .lte('date', endStr);

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      if (selectedStudent !== 'all') {
        query = query.eq('student_id', selectedStudent);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data for reports
      processReportData(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching reports',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (data: any[]) => {
    // Calculate overall stats
    const totalRecords = data.length;
    const present = data.filter(r => r.status === 'present').length;
    const absent = data.filter(r => r.status === 'absent').length;
    const late = data.filter(r => r.status === 'late').length;
    const excused = data.filter(r => r.status === 'excused').length;

    // Late counts as attended for attendance rate calculation
    const attended = present + late;

    setOverallStats({
      total_days: totalRecords,
      present,
      absent,
      late,
      excused,
      attendance_rate: totalRecords > 0 ? Math.round((attended / totalRecords) * 100) : 0,
    });

    // Group by student for individual reports
    const studentMap = new Map<string, any[]>();
    data.forEach(record => {
      const studentId = record.student_id;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, []);
      }
      studentMap.get(studentId)!.push(record);
    });

    const reports: StudentAttendanceReport[] = [];
    studentMap.forEach((records, studentId) => {
      const student = records[0].student;
      if (!student) return;

      const studentPresent = records.filter(r => r.status === 'present').length;
      const studentAbsent = records.filter(r => r.status === 'absent').length;
      const studentLate = records.filter(r => r.status === 'late').length;
      const studentExcused = records.filter(r => r.status === 'excused').length;
      const total = records.length;

      // Late counts as attended for attendance rate calculation
      const studentAttended = studentPresent + studentLate;

      reports.push({
        student_id: studentId,
        first_name: student.first_name,
        last_name: student.last_name,
        admission_number: student.admission_number,
        class_name: student.class?.name || 'N/A',
        stats: {
          total_days: total,
          present: studentPresent,
          absent: studentAbsent,
          late: studentLate,
          excused: studentExcused,
          attendance_rate: total > 0 ? Math.round((studentAttended / total) * 100) : 0,
        },
      });
    });

    setStudentReports(reports.sort((a, b) => a.last_name.localeCompare(b.last_name)));

    // Daily records for export
    const daily: DailyAttendanceRecord[] = data.map(record => ({
      date: record.date,
      student_name: record.student ? `${record.student.first_name} ${record.student.last_name}` : 'Unknown',
      admission_number: record.student?.admission_number || 'N/A',
      class_name: record.student?.class?.name || 'N/A',
      status: record.status,
    }));

    setDailyRecords(daily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const exportToCSV = (type: 'summary' | 'detailed') => {
    let csvContent = '';
    let filename = '';

    if (type === 'summary') {
      // Summary export - student stats
      csvContent = 'Admission No,Student Name,Class,Total Days,Present,Absent,Late,Excused,Attendance Rate\n';
      studentReports.forEach(report => {
        csvContent += `${report.admission_number},"${report.first_name} ${report.last_name}",${report.class_name},${report.stats.total_days},${report.stats.present},${report.stats.absent},${report.stats.late},${report.stats.excused},${report.stats.attendance_rate}%\n`;
      });
      filename = `attendance_summary_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`;
    } else {
      // Detailed export - daily records
      csvContent = 'Date,Admission No,Student Name,Class,Status\n';
      dailyRecords.forEach(record => {
        csvContent += `${record.date},${record.admission_number},"${record.student_name}",${record.class_name},${record.status}\n`;
      });
      filename = `attendance_detailed_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`;
    }

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast({
      title: 'Export successful',
      description: `${type === 'summary' ? 'Summary' : 'Detailed'} report downloaded.`,
    });
  };

  const filteredStudents = selectedClass === 'all' 
    ? students 
    : students.filter(s => s.class_id === selectedClass);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
          <p className="text-muted-foreground">View and export attendance statistics</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => exportToCSV('summary')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Summary
                </Button>
                <Button variant="outline" onClick={() => exportToCSV('detailed')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Detailed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Records</span>
                </div>
                <div className="text-2xl font-bold">{overallStats.total_days}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Attendance Rate</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{overallStats.attendance_rate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">Present</div>
                <div className="text-2xl font-bold text-green-600">{overallStats.present}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">Absent</div>
                <div className="text-2xl font-bold text-red-600">{overallStats.absent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">Late</div>
                <div className="text-2xl font-bold text-yellow-600">{overallStats.late}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">Excused</div>
                <div className="text-2xl font-bold text-blue-600">{overallStats.excused}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : studentReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found for the selected period.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Excused</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentReports.map((report) => (
                    <TableRow key={report.student_id}>
                      <TableCell className="font-medium">{report.admission_number}</TableCell>
                      <TableCell>{report.first_name} {report.last_name}</TableCell>
                      <TableCell>{report.class_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-600">{report.stats.present}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">{report.stats.absent}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{report.stats.late}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{report.stats.excused}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={report.stats.attendance_rate >= 80 ? 'default' : 'destructive'}
                          className={report.stats.attendance_rate >= 80 ? 'bg-green-600' : ''}
                        >
                          {report.stats.attendance_rate}%
                        </Badge>
                      </TableCell>
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
