import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status') // Incluir status
        .order('full_name');

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) return;
    try {
      const { error } = await supabase.rpc('deactivate_user', { p_user_id: userId });
      if (error) throw error;
      alert('Usuario desactivado.');
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      alert(`Error al desactivar usuario: ${error.message}`);
    }
  };

  const handleReactivateUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres reactivar este usuario?')) return;
    try {
      const { error } = await supabase.rpc('reactivate_user', { p_user_id: userId });
      if (error) throw error;
      alert('Usuario reactivado.');
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      alert(`Error al reactivar usuario: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres ELIMINAR este usuario? Esta acción es irreversible.')) return;
    try {
      const { error } = await supabase.rpc('delete_user_account', { p_user_id: userId });
      if (error) throw error;
      alert('Usuario eliminado permanentemente.');
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      alert(`Error al eliminar usuario: ${error.message}`);
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Gestión de Usuarios</h1>
      
      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="f6 red">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className="tc">No hay usuarios registrados.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="f6 w-100 mw8 center" cellSpacing="0">
            <thead>
              <tr>
                <th className="fw6 bb b--black-20 tl pa3 bg-light-gray">Nombre</th>
                <th className="fw6 bb b--black-20 tl pa3 bg-light-gray">Email</th>
                <th className="fw6 bb b--black-20 tl pa3 bg-light-gray">Rol</th>
                <th className="fw6 bb b--black-20 tl pa3 bg-light-gray">Estado</th>
                <th className="fw6 bb b--black-20 tl pa3 bg-light-gray">Acciones</th>
              </tr>
            </thead>
            <tbody className="lh-copy">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="pv3 pr3 bb b--black-20">{user.full_name || 'N/A'}</td>
                  <td className="pv3 pr3 bb b--black-20">{user.email}</td>
                  <td className="pv3 pr3 bb b--black-20">{user.role}</td>
                  <td className="pv3 pr3 bb b--black-20">
                    <span className={`pa2 f7 br2 ${user.status === 'active' ? 'bg-light-green' : 'bg-light-yellow'}`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="pv3 pr3 bb b--black-20">
                    {user.status === 'active' ? (
                      <button onClick={() => handleDeactivateUser(user.id)} className="bn ph2 pv1 input-reset ba b--orange bg-orange grow pointer f7 dib br2 white mr2">
                        Desactivar
                      </button>
                    ) : (
                      <button onClick={() => handleReactivateUser(user.id)} className="bn ph2 pv1 input-reset ba b--green bg-green grow pointer f7 dib br2 white mr2">
                        Reactivar
                      </button>
                    )}
                    <button onClick={() => handleDeleteUser(user.id)} className="bn ph2 pv1 input-reset ba b--red bg-red grow pointer f7 dib br2 white">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
