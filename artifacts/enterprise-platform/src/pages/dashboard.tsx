import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, CheckSquare, Zap, TrendingUp, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { format } from "date-fns";

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
const BAR_COLORS = 'hsl(var(--primary))';

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2"><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-96" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats.tasksByStatus || !stats.coursesByStatus) return null;

  const taskData = [
    { name: 'To Do', value: stats.tasksByStatus?.todo || 0 },
    { name: 'In Progress', value: stats.tasksByStatus?.in_progress || 0 },
    { name: 'Completed', value: stats.tasksByStatus?.completed || 0 },
  ];

  const courseData = [
    { name: 'Draft', value: stats.coursesByStatus?.draft || 0 },
    { name: 'Published', value: stats.coursesByStatus?.published || 0 },
    { name: 'Archived', value: stats.coursesByStatus?.archived || 0 },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground mt-1 text-lg">Here's what's happening across your organization today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold font-display">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{stats.activeUsers} active this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-3xl font-bold font-display">{stats.activeCourses}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground font-medium">
              <span>Out of {stats.totalCourses} total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
                <p className="text-3xl font-bold font-display">{Math.round(stats.taskCompletionRate * 100)}%</p>
              </div>
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground font-medium">
              <span>{stats.completedTasks} / {stats.totalTasks} tasks done</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Automations</p>
                <p className="text-3xl font-bold font-display">{stats.activeAutomations}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground font-medium">
              <span>Running smoothly</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
            <CardDescription>Task breakdown and course distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[300px]">
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Tasks by Status</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {taskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {taskData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Courses by Status</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="value" fill={BAR_COLORS} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="rounded-2xl shadow-sm border-border/50 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto pr-2 custom-scrollbar">
            <div className="space-y-6">
              {stats.recentActivity?.length > 0 ? stats.recentActivity.map((log) => (
                <div key={log.id} className="flex gap-4 relative">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border/50 last:hidden" />
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 z-10 border-2 border-background">
                    <span className="text-xs font-medium text-muted-foreground">{log.user?.name?.charAt(0) || '*'}</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{log.user?.name || 'System'}</span> {log.action} <span className="font-medium text-primary">{log.entityType}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(log.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
