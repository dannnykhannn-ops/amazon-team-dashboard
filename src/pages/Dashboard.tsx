import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

type DashboardStats = {
  totalEmployees: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionRate: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    averageCompletionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeesRes, tasksRes, completedRes] = await Promise.all([
        supabase.from('users').select('id').eq('role', 'employee'),
        supabase.from('tasks').select('id'),
        supabase.from('tasks').select('id').eq('status', 'completed'),
      ]);

      const overdueRes = await supabase
        .from('tasks')
        .select('id')
        .neq('status', 'completed')
        .lt('due_date', new Date().toISOString().split('T')[0]);

      const totalEmployees = employeesRes.data?.length || 0;
      const totalTasks = tasksRes.data?.length || 0;
      const completedTasks = completedRes.data?.length || 0;
      const overdueTasks = overdueRes.data?.length || 0;

      setStats({
        totalEmployees,
        totalTasks,
        completedTasks,
        overdueTasks,
        averageCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ComponentType<{ className: string }>;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:pl-72">
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Employees"
            value={stats.totalEmployees}
            color="bg-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Total Tasks"
            value={stats.totalTasks}
            color="bg-green-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completedTasks}
            color="bg-emerald-600"
          />
          <StatCard
            icon={Clock}
            label="Overdue"
            value={stats.overdueTasks}
            color="bg-orange-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${stats.averageCompletionRate.toFixed(1)}%`}
            color="bg-purple-600"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Quick Start</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-slate-900 mb-1">Add Employees</h3>
              <p className="text-sm text-slate-600">
                Go to the Employees section to add new team members and set their roles.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-slate-900 mb-1">Create Tasks</h3>
              <p className="text-sm text-slate-600">
                Create tasks and assign them to employees to track their progress.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-slate-900 mb-1">Monitor Progress</h3>
              <p className="text-sm text-slate-600">
                Track employee progress and update task statuses in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
