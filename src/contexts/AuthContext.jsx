import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { fetchUserProfile } from "../services/profileService";
import { FullContext } from "./FullContext"; // Importamos el objeto

// export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Inicialización Sincrónica de la Sesión
  const [session, setSession] = useState(() => {
    // BUSCÁ ESTA KEY EN TU NAVEGADOR (F12 -> Application -> Local Storage)
    // Suele ser: sb-[TU-PROJECT-ID]-auth-token
    const saved = localStorage.getItem("sb-ougtipazurskmbtasbfl-auth-token");
    return saved ? JSON.parse(saved) : null;
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session: curr } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (curr) {
          setSession(curr);
          // USÁS EL SERVICIO EXTERNO
          const profileData = await fetchUserProfile(curr.user.id);
          if (profileData) setProfile(profileData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();

    // Suscripción para cambios futuros (Login/Logout/Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        // Aquí podrías re-fetch profile si es necesario
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ session, profile, loading }), [session, profile, loading]);

  return <FullContext.Provider value={value}>{children}</FullContext.Provider>;
};




