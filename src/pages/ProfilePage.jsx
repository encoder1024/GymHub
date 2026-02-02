import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const ProfilePage = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(''); // El rol podría ser visible pero no editable por el usuario común

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
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setRole(data.role || 'cliente'); // Asignar rol actual, aunque no sea editable
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
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName }) // Solo permitimos actualizar el nombre completo por ahora
        .eq('id', session.user.id);

      if (error) throw error;
      alert('Perfil actualizado correctamente!'); // Mensaje de éxito
      // Opcional: Refrescar el perfil actual si es necesario
      // fetchProfile(); 
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="pa4 tc">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="pa4 tc red">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="pa4 tc">No se encontró perfil o no has iniciado sesión.</div>;
  }

  return (
    <div className="pa4">
      <h1 className="f2">Mi Perfil</h1>
      <div className="measure center pa4 bg-white shadow-1 br2">
        <form onSubmit={handleUpdateProfile}>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" htmlFor="full-name">Nombre Completo</label>
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
            <label className="db fw6 lh-copy f6" htmlFor="email">Email</label>
            <input
              className="pa2 input-reset ba bg-transparent silver w-100"
              type="email"
              id="email"
              value={session?.user?.email || ''}
              readOnly // El email no debería ser editable aquí
              disabled
            />
          </div>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" htmlFor="role">Rol</label>
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
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

