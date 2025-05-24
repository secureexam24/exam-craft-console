
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Teacher = Database['public']['Tables']['teachers']['Row'];

interface AuthContextType {
  user: User | null;
  teacher: Teacher | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (teacherData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch teacher profile
          setTimeout(async () => {
            const { data: teacherData } = await supabase
              .from('teachers')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setTeacher(teacherData);
            setLoading(false);
          }, 0);
        } else {
          setTeacher(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (teacherData: {
    name: string;
    email: string;
    password: string;
    college: string;
    department: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email: teacherData.email,
      password: teacherData.password,
    });

    if (error || !data.user) {
      return { error };
    }

    // Create teacher profile
    const { error: profileError } = await supabase
      .from('teachers')
      .insert({
        id: data.user.id,
        email: teacherData.email,
        name: teacherData.name,
        college_name: teacherData.college,
        department: teacherData.department,
        password_hash: '', // Supabase handles password hashing
      });

    return { error: profileError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      teacher,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
