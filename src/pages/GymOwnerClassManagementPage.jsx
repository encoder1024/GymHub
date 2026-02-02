import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ClassCard from "../components/ClassCard";

const GymOwnerClassManagementPage = () => {
  const { session } = useAuth();
  const [gym, setGym] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null); // Para editar una clase existente
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');

  // Fetch gym and its classes associated with the owner's profile
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch profile to verify role (optional, RLS should handle it)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData || profileData.role !== 'owner') {
          setError("No tienes permisos para acceder a esta página.");
          setLoading(false);
          return;
        }

        // 2. Fetch the gym associated with this owner
        const { data: gymData, error: gymError } = await supabase
          .from('gyms')
          .select('*')
          .eq('owner_id', session.user.id)
          .single();

        if (gymError) throw gymError;
        if (!gymData) {
            setError("No se encontró un gimnasio asociado a tu cuenta.");
            setLoading(false);
            return;
        }
        setGym(gymData);
        console.log("Fetched gymData:", gymData); // Add this log

        // 3. Fetch classes for this gym
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('gym_id', gymData.id)
          .order('start_time', { ascending: true });

        if (classesError) throw classesError;
        setClasses(classesData);

      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const openFormForNewClass = () => {
    setCurrentClass(null);
    setClassName('');
    setClassDescription('');
    // Set default values for datetime-local input to be current date/time or specific defaults
    const now = new Date();
    const defaultStartTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    setStartTime(defaultStartTime.toISOString().slice(0, 16));
    setEndTime(defaultEndTime.toISOString().slice(0, 16));
    setCapacity(10); // Default capacity
    setIsFormOpen(true);
  };

  const openFormForEdit = (cls) => {
    setCurrentClass(cls);
    setClassName(cls.name);
    setClassDescription(cls.description || '');
    setStartTime(new Date(cls.start_time).toISOString().slice(0, 16));
    setEndTime(new Date(cls.end_time).toISOString().slice(0, 16));
    setCapacity(cls.capacity);
    setIsFormOpen(true);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!gym) return;

    setError(null);
    setLoading(true); // Reutilizar loading para indicar que se está guardando

    const classData = {
      gym_id: gym.id,
      name: className,
      description: classDescription,
      // Ensure ISO string format for Supabase datetime
      start_time: new Date(startTime).toISOString(), 
      end_time: new Date(endTime).toISOString(),
      capacity: parseInt(capacity, 10),
    };

    // Basic validation for dates
    if (new Date(classData.start_time) >= new Date(classData.end_time)) {
        setError("La hora de inicio debe ser anterior a la hora de fin.");
        setLoading(false);
        return;
    }

    try {
      let resultMessage = '';
      if (currentClass) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update(classData)
          .eq('id', currentClass.id);
        if (error) throw error;
        resultMessage = 'Clase actualizada correctamente!';
      } else {
        // Create new class
        const { error } = await supabase
          .from('classes')
          .insert([classData]);
        if (error) throw error;
        resultMessage = 'Clase creada correctamente!';
      }
      alert(resultMessage);
      setIsFormOpen(false);
      // Refetch classes after submit
      const { data: updatedClasses, error: fetchError } = await supabase
          .from('classes')
          .select('*')
          .eq('gym_id', gym.id)
          .order('start_time', { ascending: true });
      if (!fetchError) setClasses(updatedClasses);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) return;

    try {
      const { error } = await supabase.from('classes').delete().eq('id', classId);
      if (error) throw error;
      alert('Clase eliminada correctamente.');
      setClasses(classes.filter(cls => cls.id !== classId)); // Actualizar estado local
    } catch (error) {
      alert(`Error al eliminar clase: ${error.message}`);
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Panel de Propietario</h1>
      
      <div className="mb4">
        <h2 className="f3 mb3">Gestionar Gimnasio</h2>
        {gym && (
          <div className="measure center pa4 bg-white shadow-1 br2">
            <p className="lh-copy measure"><strong>Nombre:</strong> {gym.name}</p>
            <p className="lh-copy measure"><strong>Descripción:</strong> {gym.description}</p>
            <p className="lh-copy measure"><strong>Ubicación:</strong> {gym.location}</p>
            {/* Añadir botón para editar perfil si es necesario */}
          </div>
        )}
      </div>

      <div className="mb4">
        <h2 className="f3 mb3 flex items-center justify-between">
          Mis Clases
          <button onClick={openFormForNewClass} className="bn ph3 pv2 bg-blue white grow pointer f6 dib br2">
            + Añadir Clase
          </button>
        </h2>
        
        {isFormOpen && (
          <div className="measure center pa4 bg-light-gray shadow-1 br2 mb4">
            <h3 className="f4 mb3">{currentClass ? 'Editar Clase' : 'Nueva Clase'}</h3>
            <form onSubmit={handleClassSubmit}>
              <div className="mv2">
                <label className="db fw6 lh-copy f6" htmlFor="class-name">Nombre</label>
                <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" id="class-name" value={className} onChange={(e) => setClassName(e.target.value)} required />
              </div>
              <div className="mv2">
                <label className="db fw6 lh-copy f6" htmlFor="class-description">Descripción</label>
                <textarea className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100 h-2" id="class-description" value={classDescription} onChange={(e) => setClassDescription(e.target.value)} />
              </div>
              <div className="mv2 flex justify-between">
                <div>
                  <label className="db fw6 lh-copy f6" htmlFor="start-time">Inicio</label>
                  {/* Input type datetime-local needs careful handling for timezone and default values */}
                  <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white" type="datetime-local" id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div>
                  <label className="db fw6 lh-copy f6" htmlFor="end-time">Fin</label>
                  <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white" type="datetime-local" id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>
              <div className="mv2">
                <label className="db fw6 lh-copy f6" htmlFor="class-capacity">Cupo Máximo</label>
                <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="number" id="class-capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min="1" />
              </div>
              {error && <p className="f6 red">{error}</p>}
              <button type="submit" className="b ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white mr2" disabled={loading}>
                {loading ? 'Guardando...' : (currentClass ? 'Actualizar Clase' : 'Guardar Clase')}
              </button>
              <button type="button" className="bn ph3 pv2 input-reset ba b--gray bg-gray pointer f6 dib br2 white" onClick={() => setIsFormOpen(false)}>Cancelar</button>
            </form>
          </div>
        )}

        {/* Listado de clases existentes */}
        <div className="flex flex-wrap justify-center">
          {!loading && !error && classes.length === 0 && gym && <p>Aún no has programado clases para tu gimnasio.</p>}
          {!loading && !error && classes.map((cls) => (
            <div key={cls.id} className="bg-white shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l flex flex-column justify-between">
              <ClassCard 
                classInfo={cls} 
                onBook={() => alert('Esta función es solo informativa en el dashboard. Las reservas se hacen desde la vista del cliente.')} // Botón de reservar en el dashboard del owner no debería hacer nada o llevar a "ver reservas"
              />
              <div className="mt3 flex justify-center gap-2">
                <button onClick={() => openFormForEdit(cls)} className="bn ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white">Editar</button>
                <button onClick={() => handleDeleteClass(cls.id)} className="bn ph3 pv2 input-reset ba b--red bg-red grow pointer f6 dib br2 white">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GymOwnerClassManagementPage;
