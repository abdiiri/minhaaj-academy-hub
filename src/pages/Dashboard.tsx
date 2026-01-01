import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockDashboardStats } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Clock,
  BookOpen,
  TrendingUp,
  UserPlus,
  CheckCircle,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statCards = [
  {
    title: 'Total Students',
    value: mockDashboardStats.totalStudents,
    icon: GraduationCap,
    change: '+12 this term',
    color: 'primary',
  },
  {
    title: 'Total Staff',
    value: mockDashboardStats.totalStaff,
    icon: Users,
    change: '+2 this month',
    color: 'secondary',
  },
  {
    title: 'Fees Collected',
    value: `KES ${(mockDashboardStats.feesCollected / 1000000).toFixed(2)}M`,
    icon: CreditCard,
    change: '78% of target',
    color: 'success',
  },
  {
    title: 'Pending Payments',
    value: mockDashboardStats.pendingPayments,
    icon: Clock,
    change: 'Requires action',
    color: 'warning',
  },
];

const activityIcons = {
  enrollment: UserPlus,
  payment: CreditCard,
  result: FileText,
  staff: Users,
};

export default function Dashboard() {
  const { user, profile } = useAuth();

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest updates across the school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDashboardStats.recentActivities.map((activity) => {
                  const Icon = activityIcons[activity.type];
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'enrollment' ? 'bg-primary/10 text-primary' :
                        activity.type === 'payment' ? 'bg-success/10 text-success' :
                        activity.type === 'result' ? 'bg-accent/10 text-accent' :
                        'bg-secondary/10 text-secondary'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
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
                  <span className="text-sm text-muted-foreground">Active Classes</span>
                  <span className="text-lg font-semibold">{mockDashboardStats.activeClasses}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 w-3/4" />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fee Collection</span>
                  <span className="text-lg font-semibold">78%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success rounded-full h-2" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Attendance Today</span>
                  <span className="text-lg font-semibold">94%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent rounded-full h-2" style={{ width: '94%' }} />
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
