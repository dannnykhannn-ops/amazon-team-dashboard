import { supabase, User } from './supabase';

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'employee',
    });

    if (profileError) throw profileError;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (error) throw error;
  return userData;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      (async () => {
        const user = await getCurrentUser();
        callback(user);
      })();
    } else {
      callback(null);
    }
  });
}
