import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | any;

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw here so the app can render in preview/dev environments.
  // Log a clear warning and provide a minimal stub implementation.
  // Add real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable functionality.
  // eslint-disable-next-line no-console
  console.warn(
    'Missing Supabase configuration (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). Supabase calls will return errors until configured.'
  );

  const stub = {
    from: () => ({
      select: async () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      update: async () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
      order: () => ({ select: async () => ({ data: null, error: new Error('Supabase not configured') }) }),
      maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: function () { return this; },
      neq: function () { return this; },
      lt: function () { return this; },
      in: function () { return this; },
    }),
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: (_cb: any) => ({ subscription: { unsubscribe: () => {} } }),
    },
  } as unknown as ReturnType<typeof createClient>;

  supabaseClient = stub;
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'employee';
  department: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  progress_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
};

export type AmazonKPI = {
  id: string;
  metric_name: string;
  metric_value: number | null;
  metric_date: string;
  period: string;
  data_source: string;
  created_at: string;
  updated_at: string;
};

export type Employee = {
  id: string;
  user_id: string;
  department: string | null;
  manager_id: string | null;
  total_tasks_assigned: number;
  tasks_completed: number;
  completion_rate: number;
  avg_completion_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};