import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Initial loading state

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role, full_name, avatar_url')
              .eq('id', session.user.id)
              .limit(1) // Ensure only one row is expected
              .maybeSingle(); // Returns null if no row, or the single row. Throws if multiple.
            
            if (error) {
              console.error("AuthContext: Error fetching profile:", error.message);
              setProfile(null);
              console.warn("AuthContext: Profile fetch failed for existing session. Forcing logout.");
              await supabase.auth.signOut();
            } else if (data) {
              setProfile(data);
            } else {
              console.warn("AuthContext: No profile found for user ID:", session.user.id, "despite SIGNED_IN. Forcing logout.");
              setProfile(null);
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error("AuthContext: Critical error during profile fetch:", error.message);
            setProfile(null);
            console.warn("AuthContext: Critical error during profile fetch. Forcing logout.");
            await supabase.auth.signOut();
          }
        }
        else {
          setProfile(null);
        }
        setLoading(false); // Set loading to false after all async operations are done.
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    profile,
    loading,
  }), [session, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};