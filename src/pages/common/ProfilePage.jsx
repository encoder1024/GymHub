import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import OneSignal from "react-onesignal";

const ProfilePage = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(""); // El rol debe ser visible pero no editable por el usuario común
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const init = async () => {
      // await OneSignal.init({
      //   appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      //   allowLocalhostAsSecureOrigin: true,
      // });

      // 👉 Inicializar OneSignal
      // window.OneSignalDeferred = window.OneSignalDeferred || [];
      // window.OneSignalDeferred.push(async function (OneSignal) {
      //   await OneSignal.init({
      //     appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      //     // safari_web_id: "TU-SAFARI-WEB-ID", // obligatorio para iPhone
      //     notifyButton: {
      //       enable: true,
      //     },
      //     allowLocalhostAsSecureOrigin: true,
      //   });
      // });

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        });

        // Esperar a que el usuario esté listo
        await OneSignal.User.PushSubscription.waitUntilSubscribed();

        // Recién ahora hacer login
        await OneSignal.login(session.user.id);
      });
    };

    init();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setRole(data.role || "cliente"); // Asignar rol actual, aunque no sea editable
          setPhone(data.phone);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setIsUpdating(true);

    const sinEspacios = phone.replace(/\s+/g, "");

    // 2. La regex valida: +54 + (opcional 9) + (área) + (número)
    // Total de dígitos después del +54 debe ser 10 u 11
    const phoneRegex = /^\+549?\d{10}$/;

    if (phoneRegex.test(sinEspacios)) {
      setError("");
      // Aquí procedés con tu CrudUpdate o insert en gymsSantaFe
      // console.log("Teléfono válido, enviando a Supabase...");
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: fullName, phone: sinEspacios }) // Solo permitimos actualizar el nombre completo y el teléfono
          .eq("id", session.user.id);

        if (error) throw error;
        alert("Perfil actualizado correctamente!"); // Mensaje de éxito
        // Opcional: Refrescar el perfil actual si es necesario
        // fetchProfile();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsUpdating(false);
      }
    } else {
      setError("El formato del teléfono no es válido. Ej: +54 341 4810169");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pa4 tc">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="pa4 tc red">Error: {error}</div>;
  }

  if (!profile) {
    return (
      <div className="pa4 tc">
        No se encontró perfil o no has iniciado sesión.
      </div>
    );
  }

  return (
    <div className="pa4">
      <h1 className="f2">Mi Perfil</h1>
      <div className="measure center pa4 bg-gray shadow-1 br2">
        <form onSubmit={handleUpdateProfile}>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" htmlFor="full-name">
              Nombre Completo
            </label>
            <input
              className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
              type="text"
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" htmlFor="phone">
              Celular #
            </label>
            <input
              className={
                error
                  ? "border-red-500 pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  : "pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
              }
              type="tel"
              name="phone"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 341 4810169"
              required
            />
          </div>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" htmlFor="email">
              Email
            </label>
            <input
              className="pa2 input-reset ba bg-transparent silver w-100"
              type="email"
              id="email"
              value={session?.user?.email || ""}
              readOnly // El email no debería ser editable aquí
              disabled
            />
          </div>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" htmlFor="role">
              Rol
            </label>
            <input
              className="pa2 input-reset ba bg-transparent silver w-100"
              type="text"
              id="role"
              value={role}
              readOnly // El rol no es editable por el usuario común
              disabled
            />
          </div>
          {error && <p className="f6 red">{error}</p>}
          <button
            type="submit"
            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
            disabled={isUpdating}
          >
            {isUpdating ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
        <p style={{ color: "#bbb" }}>v:1.0.0</p>
      </div>
    </div>
  );
};

export default ProfilePage;
