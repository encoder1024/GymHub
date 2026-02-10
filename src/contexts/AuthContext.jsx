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

    // ESTA ES TU ÚNICA FUENTE DE VERDAD
  const handleAuth = async (currentSession) => {
    if (!mounted) return;
    
    // IMPORTANTE: No pongas setLoading(true) aquí adentro si ya viene de initialize
    // para evitar "parpadeos" innecesarios si la sesión es null.
    setSession(currentSession);

    try {
      if (currentSession?.user) {
        const profileData = await fetchUserProfile(currentSession.user.id);
        if (mounted) setProfile(profileData);
      } else {
        if (mounted) setProfile(null);
      }
    } catch (err) {
      console.error("Error en perfil:", err);
    } finally {
      // ESTA LÍNEA ES LA QUE DESBLOQUEA EL F5
      if (mounted) setLoading(false);
    }
  };

    // Ejecución inicial segura
  const initialize = async () => {
    try {
      // Usamos getUser() en lugar de getSession() para mayor seguridad en F5
      // ya que getUser valida el token con el servidor
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        if (mounted) {
          setSession(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      // Si hay usuario, buscamos la sesión completa y el perfil
      const { data: { session: curr } } = await supabase.auth.getSession();
      await handleAuth(curr);
    } catch (err) {
      console.log(err);
      if (mounted) setLoading(false);
    }
  };
    initialize();

    // 2. Escucha de cambios (Login/Logout)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
    // Evitamos procesar INITIAL_SESSION si initialize ya lo hizo
    if (event === 'INITIAL_SESSION') return;

    if (event === 'SIGNED_OUT') {
      setSession(null);
      setProfile(null);
      setLoading(false);
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      handleAuth(newSession);
    }
  });

  return () => {
    mounted = false;
    subscription?.unsubscribe();
  };
}, []);

  const value = useMemo(
    () => ({ session, profile, loading }),
    [session, profile, loading],
  );

  return <FullContext.Provider value={value}>{children}</FullContext.Provider>;
};
