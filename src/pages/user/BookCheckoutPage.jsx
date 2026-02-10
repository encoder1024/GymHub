import { useLocation } from "react-router-dom";
import WhatsAppHelp from "../../components/WhatsappHelp";
import { CrudInsert } from "../../services/supaCrud";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";

const BookCheckoutPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accedemos a los arrays (usamos destructuring y opcional chaining por seguridad)
  const { clase, gym, profile, session } = location.state || {
    clase: [],
    gym: [],
    profile: [],
    session: [],
  };

  console.log("valores: ", clase, gym, profile, session);

  const startTime = new Date(clase.start_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(clase.end_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const startDateClase = new Date(clase.start_time).toLocaleDateString(
    "es-AR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );

  // 1. Obtenemos el mes y capitalizamos la primera letra
  const month = new Date(clase.start_time).toLocaleDateString("es-AR", {
    month: "long",
  });
  const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);

  // 2. Obtenemos el año
  const year = new Date(clase.start_time).getFullYear();

  // 3. Unimos todo con el guion
  const startDate = `${monthCapitalized}-${year}`;

  const handleConfirmBook = async () => {
    //TODO: guardar la reserva en bookins_santa_fe llamada al backend
    //TODO: actualizar la capacidad de la clase en -1 Lo hace el backend
    //TODO: la capacidad inicial es capacidad actual + bookings de esa clase lo hace el backend
    //TODO: cuando se borra un areserva, hay que modificar la capacidd en +1 lo hace el backend
    setLoading(true);

    const bookData = {
      user_id: session.user.id,
      class_id: clase.id,
      status: "confirmada",
    };
    try {
      const { error } = await supabase
        .from("bookings_santa_fe")
        .insert([bookData]);
      if (error) throw error;
    } catch (error) {
      if (error.code === "23505") {
        // Código de PostgreSQL para "Unique Violation"
        alert("¡Ya tenés una reserva para esta clase!");
      } else {
        console.error("Error desconocido:", error.message);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pa2">
      <h1 className="f3">Hola {profile.full_name}!</h1>
      <p className="lh-copy">
        Estás por reservar una clase y esto es un muy buen paso entre vos y el
        profe del gym que elegiste. Será un gusto recibirte!!!
      </p>
      <div className="flex flex-wrap shadow-1 br2">
        <div className="ma1">
          <h3>Datos de la Clase y el Gym:</h3>
          <h4 className="ma1 pa1 f4 mv0">{clase.name}</h4>
          {/* <h4 className="ma1 pa1 f4 mv0">{gym.title}</h4> */}
          <p className="ma1 f6 mt2">Descripción: {clase.description}</p>
          <p className="ma1 f6 mt2">
            <strong>Fecha:</strong> {startDateClase}
          </p>
          <p className="ma1 f6 mt2">
            <strong>Horario:</strong> {startTime} - {endTime}
          </p>
          <p className="ma1 f6">
            <strong>Cupos disponibles:</strong> {clase.capacity}
          </p>
        </div>
        <div className="ma1">
          {/* <h3>Datos del Gym:</h3> */}
          <h4 className="ma1 pa1 f4 mv0">{gym.title}</h4>
          <h4 className="ma1 pa1 f4 mv0">
            {gym.street}
          </h4>
          <p className="ma1 f6 mt2">
            <strong>Ciudad: :</strong> {gym.city}
          </p>          
          <p className="ma1 f6 mt2">
            Celular: {gym.phone_status ? gym.phone : "sin datos"}
          </p>
          <p className="ma1 f6 mt2">
            <strong>Miembro desde:</strong> {startDate}
          </p>
        </div>
      </div>
      <div>
        <button
          onClick={handleConfirmBook}
          className="bn ph3 pv2 input-reset ba b--green bg-green grow pointer f6 dib br2 white mt3"
        >
          Confirma la reserva
        </button>
      </div>
      {/* El botón recibe el número específico de ESTE gimnasio con gym.phone pero por ahora uso el mío para evitar problemas */}
      <WhatsAppHelp telefono={"+543513854913"} nombreGym={gym.title} />
    </div>
  );
};

export default BookCheckoutPage;
