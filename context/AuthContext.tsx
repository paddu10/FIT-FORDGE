import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  onboardingCompleted: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isInitialized: false,
  onboardingCompleted: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('calorie_target')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('[AuthContext] fetchProfile error:', error.message);
        }
        // If no profile row exists at all, onboarding is definitely not complete
        setOnboardingCompleted(false);
        return;
      }

      if (data) {
        const completed = data.calorie_target !== null && data.calorie_target !== undefined && Number(data.calorie_target) > 0;
        console.log('[AuthContext] calorie_target =', data.calorie_target, '→ onboardingCompleted =', completed);
        setOnboardingCompleted(completed);
      } else {
        setOnboardingCompleted(false);
      }
    } catch (err) {
      console.error('[AuthContext] fetchProfile exception:', err);
      setOnboardingCompleted(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setIsInitialized(true);
      }
    }
    
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setOnboardingCompleted(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isInitialized, onboardingCompleted, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
