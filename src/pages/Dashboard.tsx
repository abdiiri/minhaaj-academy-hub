import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useStaff } from '@/hooks/useStaff';
import { useClasses } from '@/hooks/useClasses';
import { usePayments } from '@/hooks/usePayments';
import { useFeeStructures } from '@/hooks/useFeeStructures';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Clock,
  BookOpen,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, role } = useAuth();
  const { students, loading: studentsLoading } = useStudents();
  const { staff, loading: staffLoading } = useStaff();
  const { classes, loading: classesLoading } = useClasses();
  const { payments, loading: paymentsLoading } = usePayments();
  const { feeStructures } = useFeeStructures();

  const loading = studentsLoading || staffLoading || classesLoading || paymentsLoading;
  const isStaff = role === 'staff';

  // Calculate fee stats for admin
  const feeStats = useMemo(() => {
    if (!isStaff) return null;

    let totalExpected = 0;
    let totalCollected = 0;

    students.forEach(student => {
      const studentClass = classes.find(c => c.id === student.class_id);
      const fee = studentClass ? feeStructures.find(f => 
        f.level === studentClass.level && 
        f.curriculum === studentClass.curriculum
      ) : null;
      
      if (fee) {
        totalExpected += Number(fee.total_fee);
      }
    });

    const confirmedPayments = payments.filter(p => p.status === 'confirmed');
    totalCollected = confirmedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalExpected,
      totalCollected,
      outstanding: totalExpected - totalCollected,
      collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
    };
  }, [students, classes, feeStructures, payments, isStaff]);

  const statCards = [
    {
      title: 'Total Students',
      value: students.length,
      icon: GraduationCap,
      change: `${students.filter(s => s.status === 'active').length} active`,
      color: 'primary',
    },
    {
      title: 'Total Staff',
      value: staff.length,
      icon: Users,
      change: `${staff.filter(s => s.status === 'active').length} active`,
      color: 'secondary',
    },
    {
      title: 'Active Classes',
      value: classes.length,
      icon: BookOpen,
      change: 'This academic year',
      color: 'success',
    },
    {
      title: 'Pending Setup',
      value: classes.length === 0 ? 'Setup needed' : 'Ready',
      icon: Clock,
      change: classes.length === 0 ? 'Add classes to start' : 'System configured',
      color: classes.length === 0 ? 'warning' : 'success',
    },
  ];

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
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(' ')[0] || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at Minhaaj Academy today.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            <BookOpen className="h-3 w-3 mr-1" />
            Academic Year 2025/2026
          </Badge>
        </div>

        {/* Admin Fee Summary */}
        {isStaff && feeStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expected Fees</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      KES {feeStats.totalExpected.toLocaleString()}
                    </p>
                    <p className="text-xs mt-2 text-muted-foreground">
                      {students.length} enrolled students
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                    <p className="text-2xl font-bold text-success mt-2">
                      KES {feeStats.totalCollected.toLocaleString()}
                    </p>
                    <p className="text-xs mt-2 text-success">
                      {feeStats.collectionRate}% collection rate
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10 text-success">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-destructive mt-2">
                      KES {feeStats.outstanding.toLocaleString()}
                    </p>
                    <p className="text-xs mt-2 text-destructive">
                      Pending collection
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold text-warning mt-2">
                      {payments.filter(p => p.status === 'pending' || p.status === 'received').length}
                    </p>
                    <p className="text-xs mt-2 text-warning">
                      Awaiting confirmation
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10 text-warning">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card 
              key={stat.title} 
              className="card-hover overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <p className={`text-xs mt-2 ${
                      stat.color === 'warning' ? 'text-warning' : 'text-success'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                    stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                    stat.color === 'success' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  }`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Set up your school management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-lg ${staff.length > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Add Staff Members</p>
                    <p className="text-sm text-muted-foreground">{staff.length} staff added</p>
                  </div>
                  <Badge variant={staff.length > 0 ? 'default' : 'outline'}>
                    {staff.length > 0 ? 'Done' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-lg ${classes.length > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create Classes</p>
                    <p className="text-sm text-muted-foreground">{classes.length} classes created</p>
                  </div>
                  <Badge variant={classes.length > 0 ? 'default' : 'outline'}>
                    {classes.length > 0 ? 'Done' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-lg ${students.length > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Enroll Students</p>
                    <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
                  </div>
                  <Badge variant={students.length > 0 ? 'default' : 'outline'}>
                    {students.length > 0 ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Classes</span>
                  <span className="text-lg font-semibold">{classes.length}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Curriculums</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/5">CBE</Badge>
                  <Badge variant="outline" className="bg-secondary/5">Edexcel</Badge>
                  <Badge variant="outline" className="bg-accent/5">Islamic</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
