import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth"; // Para obtener el usuario actual
import ClassCard from "../components/ClassCard"; // Importar ClassCard
import { CrudDelete } from "../services/supaCrud";
import GymCardDash from "../components/GymCardDash";

const GymOwnerDashboardPage = () => {
  const { session } = useAuth();
  const [gym, setGym] = useState([]); // Para almacenar el gimnasio asociado al propietario
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // 1. Fetch profile to verify role and get owner_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData || profileData.role !== "owner") {
          setError("No tienes permisos para acceder a esta página.");
          setLoading(false);
          return;
        }

        // 2. Fetch the gym associated with this owner
        // const { data: gymData, error: gymError } = await supabase
        //   .from("gyms")
        //   .select("*")
        //   .eq("owner_id", session.user.id)
        //   .single();

        const { data: gymData, error: gymError } = await supabase.rpc(
          "get_gyms_with_coords",
        );

        if (gymError) throw gymError;
        if (!gymData) {
          setError("No se encontró un gimnasio asociado a tu cuenta.");
          setLoading(false);
          return;
        }
        setGym(gymData);

        // 3. Fetch classes for this gym
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*")
          .eq("gym_id", gymData[0].id)
          .order("start_time", { ascending: true });

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

  // --- Formulario para añadir/editar clases ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null); // Para editar una clase existente
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const [isFormOpenGym, setIsFormOpenGym] = useState(false);
  const [currentGym, setCurrentGym] = useState(null); // Para editar una clase existente
  const [nameGym, setNameGym] = useState("");
  const [descriptionGym, setDescriptionGym] = useState("");
  const [locationGymLat, setLocationGymLat] = useState("");
  const [locationGymLng, setLocationGymLng] = useState("");
  const [locationGym, setLocationGym] = useState("");

  const openFormForNewClass = () => {
    setCurrentClass(null);
    setClassName("");
    setClassDescription("");
    setStartTime("");
    setEndTime("");
    setCapacity("");
    setIsFormOpen(true);
  };

  const openFormForEdit = (cls) => {
    setCurrentClass(cls);
    setClassName(cls.name);
    setClassDescription(cls.description || "");
    setStartTime(new Date(cls.start_time).toISOString().slice(0, 16)); // Formato YYYY-MM-DDTHH:MM
    setEndTime(new Date(cls.end_time).toISOString().slice(0, 16));
    setCapacity(cls.capacity);
    setIsFormOpen(true);
  };

  const openFormForNewGym = () => {
    setCurrentGym(null);
    setNameGym("");
    setDescriptionGym("");
    setLocationGym("");
    setIsFormOpenGym(true);
  };

  const openFormForEditGym = (gym) => {
    setCurrentGym(gym);
    setNameGym(gym.name);
    setDescriptionGym(gym.description || "");
    setLocationGym(gym.position); // TODO: ver de dar formato en latitud y longitud al valor antes de mostrarlo
    setIsFormOpenGym(true);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!gym) return; // No se puede proceder sin el gimnasio

    setError(null);
    setLoading(true); // Reutilizar loading para indicar que se está guardando

    const gym2 = gym && gym[0]; //TODO: hay que preguntar en el formulario para que Gym es la clase y hacer dinamico esta asignación de id.

    const classData = {
      gym_id: gym2[0].id, //TODO: hay que preguntar en el formulario para que Gym es la clase y hacer dinamico esta asignación de id.
      name: className,
      description: classDescription,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      capacity: parseInt(capacity, 10),
    };

    try {
      let result = null;
      if (currentClass) {
        // Update existing class
        const { error } = await supabase
          .from("classes")
          .update(classData)
          .eq("id", currentClass.id);
        if (error) throw error;
        result = "Clase actualizada correctamente!";
      } else {
        // Create new class
        const { error } = await supabase.from("classes").insert([classData]);
        if (error) throw error;
        result = "Clase creada correctamente!";
      }
      alert(result);
      setIsFormOpen(false);
      // Refetch classes after submit
      const { data: updatedClasses, error: fetchError } = await supabase
        .from("classes")
        .select("*")
        .eq("gym_id", gym2[0].id) // TODO: ver cuando tenga varios gym un owner y esto se haga dinámico.
        .order("start_time", { ascending: true });
      if (!fetchError) setClasses(updatedClasses);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGymSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user) {
      setLoading(false);
      return;
    } // No se puede proceder sin el usuario logueado como owner

    setError(null);
    setLoading(true); // Reutilizar loading para indicar que se está guardando

    // const lat = -34.6037;
    // const lng = -58.3816;

    // IMPORTANTE: El orden es Longitud primero, luego Latitud
    const pointWKT = `POINT(${locationGymLng} ${locationGymLat})`;

    const gymData = {
      owner_id: session.user.id,
      name: nameGym,
      description: descriptionGym,
      location_coords: pointWKT,
    };

    // console.log("en el submit del form debería ser null:", currentGym);
    try {
      let result = null;
      if (currentGym) {
        //FOLLOW TOMORROW: ya tenemos un gym
        // Update existing class
        const { error } = await supabase
          .from("gyms")
          .update(gymData)
          .eq("id", currentGym.id);
        if (error) throw error;
        result = "Gym actualizado correctamente!";
      } else {
        // Create new class
        const { error } = await supabase.from("gyms").insert([gymData]);
        if (error) throw error;
        result = "Gym creado correctamente!";
      }
      alert(result);
      setIsFormOpenGym(false);
      // Refetch classes after submit
      // console.log(session.user.id)
      const { data: updatedGyms, error: fetchError } = await supabase
        .from("gyms")
        .select("*")
        .eq("owner_id", session.user.id);
      if (!fetchError) setGym(updatedGyms);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      const { error, elemId } = await CrudDelete(classId, "classes");

      if (error) throw error;

      setClasses(classes.filter((cls) => cls.id !== elemId)); // Actualizar estado local
    } catch (error) {
      console.log(`Error al eliminar elemento: ${error.message}`);
    }
  };

  const handleDeleteGym = async (gymId) => {
    try {
      const { error, elemId } = await CrudDelete(gymId, "gyms");

      if (error) throw error;

      setClasses(gym.filter((gym) => gym.id !== elemId)); // Actualizar estado local
    } catch (error) {
      console.log(`Error al eliminar elemento: ${error.message}`);
    }
  };

  return (
    <div className="pa4">
      <h1 className="f2 tc mb4">Panel de Propietario</h1>
      <div className="mb4">
        <h2 className="f3 mb3 flex items-center justify-between">
          Gestionar Gimnasio
          <button
            onClick={openFormForNewGym}
            className="bn ph3 pv2 bg-blue white grow pointer f6 dib br2"
          >
            + Añadir Gym
          </button>
        </h2>
        {isFormOpenGym && (
          <div className="measure center pa4 bg-light-gray shadow-1 br2 mb4">
            <h3 className="f4 mb3">
              {currentGym ? "Editar Gym" : "Nuevo Gym"}
            </h3>
            <form onSubmit={handleGymSubmit}>
              <div className="mv2">
                <label className="db fw6 lh-copy f6" htmlFor="class-name">
                  Nombre
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="text"
                  id="class-name"
                  value={nameGym}
                  onChange={(e) => setNameGym(e.target.value)}
                  required
                />
              </div>
              <div className="mv2">
                <label
                  className="db fw6 lh-copy f6"
                  htmlFor="class-description"
                >
                  Descripción
                </label>
                <textarea
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100 h-2"
                  id="class-description"
                  value={descriptionGym}
                  onChange={(e) => setDescriptionGym(e.target.value)}
                />
              </div>
              <div className="mv2 flex justify-between">
                <div>
                  <label className="db fw6 lh-copy f6" htmlFor="start-time">
                    Ubicación (Latitud, Longitud)
                  </label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white"
                    // type="datetime-local"
                    id="location-lat"
                    value={locationGymLat}
                    placeholder="Latitud"
                    onChange={(e) => setLocationGymLat(e.target.value)}
                    required
                  />
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white"
                    // type="datetime-local"
                    id="location-lng"
                    placeholder="Longitud"
                    value={locationGymLng}
                    onChange={(e) => setLocationGymLng(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="f6 red">{error}</p>}
              <button
                type="submit"
                className="b ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white mr2"
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : currentClass
                    ? "Actualizar Gym"
                    : "Guardar Gym"}
              </button>
              <button
                type="button"
                className="bn ph3 pv2 input-reset ba b--gray bg-gray pointer f6 dib br2 white"
                onClick={() => setIsFormOpenGym(false)}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
        {gym && !loading && !error && classes.length === 0 && (
          <p>No hay gimnasio actualmente.</p>
        )}
        {/* {console.log("Antes de enviar a map:", gym)} */}
        <div className="flex flex-wrap justify-center">
          {Array.isArray(gym) &&
            !loading &&
            !error &&
            gym.map((gymInter) => (
              <div
                key={gymInter.id}
                className="bg-white shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc flex flex-column justify-between"
              >
                <GymCardDash
                  gymInfo={gymInter}
                  cantClases={classes.length}
                  // Dummy onBook for now, actual logic will be handled later or if class is booked from gym page
                />
                <div className="mt3 flex justify-center gap-2">
                  <button
                    onClick={() => openFormForEditGym(gymInter)}
                    className="bn ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteGym(gymInter.id)}
                    className="bn ph3 pv2 input-reset ba b--red bg-red grow pointer f6 dib br2 white"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="mb4">
        <h2 className="f3 mb3 flex items-center justify-between">
          Mis Clases
          <button
            onClick={openFormForNewClass}
            className="bn ph3 pv2 bg-blue white grow pointer f6 dib br2"
          >
            + Añadir Clase
          </button>
        </h2>

        {isFormOpen && (
          <div className="measure center pa4 bg-light-gray shadow-1 br2 mb4">
            <h3 className="f4 mb3">
              {currentClass ? "Editar Clase" : "Nueva Clase"}
            </h3>
            <form onSubmit={handleClassSubmit}>
              <div className="mv2">
                <label className="db fw6 lh-copy f6" htmlFor="class-name">
                  Nombre
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="text"
                  id="class-name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              </div>
              <div className="mv2">
                <label
                  className="db fw6 lh-copy f6"
                  htmlFor="class-description"
                >
                  Descripción
                </label>
                <textarea
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100 h-2"
                  id="class-description"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                />
              </div>
              <div className="mv2 flex justify-between">
                <div>
                  <label className="db fw6 lh-copy f6" htmlFor="start-time">
                    Inicio
                  </label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white"
                    type="datetime-local"
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="db fw6 lh-copy f6" htmlFor="end-time">
                    Fin
                  </label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white"
                    type="datetime-local"
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mv2">
                <label className="db fw6 lh-copy f6" htmlFor="class-capacity">
                  Cupo Máximo
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="number"
                  id="class-capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  min="1"
                />
              </div>
              {error && <p className="f6 red">{error}</p>}
              <button
                type="submit"
                className="b ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white mr2"
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : currentClass
                    ? "Actualizar Clase"
                    : "Guardar Clase"}
              </button>
              <button
                type="button"
                className="bn ph3 pv2 input-reset ba b--gray bg-gray pointer f6 dib br2 white"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-wrap justify-center">
          {!loading && !error && classes.length === 0 && (
            <p>No hay clases programadas.</p>
          )}
          {!loading &&
            !error &&
            classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white shadow-1 br3 pa3 ma3 w-100 w-40-m w-30-l tc flex flex-column justify-between"
              >
                <ClassCard
                  classInfo={cls}
                  // Dummy onBook for now, actual logic will be handled later or if class is booked from gym page
                  onBook={() =>
                    alert(
                      "Reserva simulada. Iría a una página de confirmación o lógica de pago.",
                    )
                  }
                />
                <div className="mt3 flex justify-center gap-2">
                  <button
                    onClick={() => openFormForEdit(cls)}
                    className="bn ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="bn ph3 pv2 input-reset ba b--red bg-red grow pointer f6 dib br2 white"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Aquí se añadiría la sección para ver reservas */}
    </div>
  );
};

export default GymOwnerDashboardPage;
