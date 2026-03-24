import { useLocation } from "react-router-dom";
import WhatsAppHelp from "../../components/WhatsAppHelp";
import { CrudInsert } from "../../services/supaCrud";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";

const BookCheckoutPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasBooked, setHasBooked] = useState(false);

  // Accedemos a los arrays (usamos destructuring y opcional chaining por seguridad)
  const { clase, gym, profile, session } = location.state || {
    clase: null,
    gym: null,
    profile: null,
    session: null,
  };

  const [currentCapacity, setCurrentCapacity] = useState(clase?.capacity || 0);

  if (!clase || !gym || !profile || !session) {
    return <div className="pa4 tc">Error: No se pudo cargar la información de la reserva.</div>;
  }

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
    if (hasBooked) return;
    if (currentCapacity <= 0) {
      alert("Lo sentimos, ya no quedan cupos disponibles.");
      return;
    }

    setLoading(true);
    setError(null);

    const bookData = {
      user_id: session.user.id,
      class_id: clase.id,
      status: "confirmada",
    };
    
    try {
      const { error: insertError } = await supabase
        .from("bookings_santa_fe")
        .insert([bookData]);

      if (insertError) {
        if (insertError.code === "23505") {
          setError("¡Ya tenés una reserva para esta clase!");
          setHasBooked(true); // Ya tiene reserva, no dejar intentar de nuevo
        } else {
          throw insertError;
        }
      } else {
        // Reserva exitosa
        setHasBooked(true);
        setCurrentCapacity(prev => prev - 1);
        alert("¡Reserva confirmada con éxito!");
      }
    } catch (err) {
      console.error("Error al reservar:", err.message);
      setError("Hubo un error al procesar tu reserva. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pa2">
      <h1 className="f3">Hola {profile.full_name}!</h1>
      <p className="lh-copy">
        {hasBooked 
          ? "Tu reserva ya está confirmada. ¡Te esperamos!" 
          : "Estás por reservar una clase y esto es un muy buen paso entre vos y el profe del gym que elegiste. Será un gusto recibirte!!!"}
      </p>
      <div className="flex flex-wrap shadow-1 br2">
        <div className="ma1">
          <h3>Datos de la Clase y el Gym:</h3>
          <h4 className="ma1 pa1 f4 mv0">{clase.name}</h4>
          <p className="ma1 f6 mt2">Descripción: {clase.description}</p>
          <p className="ma1 f6 mt2">
            <strong>Fecha:</strong> {startDateClase}
          </p>
          <p className="ma1 f6 mt2">
            <strong>Horario:</strong> {startTime} - {endTime}
          </p>
          <p className="ma1 f6">
            <strong>Cupos disponibles:</strong> {currentCapacity}
          </p>
        </div>
        <div className="ma1">
          <h4 className="ma1 pa1 f4 mv0">{gym.title}</h4>
          <h4 className="ma1 pa1 f4 mv0">
            {gym.street}
          </h4>
          <p className="ma1 f6 mt2">
            <strong>Ciudad:</strong> {gym.city}
          </p>          
          <p className="ma1 f6 mt2">
            Celular: {gym.phone_status ? gym.phone : "sin datos"}
          </p>
          <p className="ma1 f6 mt2">
            <strong>Miembro desde:</strong> {startDate}
          </p>
        </div>
      </div>

      {error && <p className="red f6 mt3 b">{error}</p>}

      <div className="mt3">
        {!hasBooked ? (
          <button
            onClick={handleConfirmBook}
            disabled={loading || currentCapacity <= 0}
            className={`bn ph3 pv2 input-reset ba b--green bg-green grow pointer f6 dib br2 white ${loading || currentCapacity <= 0 ? "o-50 no-pointer" : ""}`}
          >
            {loading ? "Confirmando..." : "Confirma la reserva"}
          </button>
        ) : (
          <div className="flex gap-2">
            <p className="green b f5">¡Reserva confirmada!</p>
            <button 
              onClick={() => window.history.back()}
              className="bn ph3 pv2 input-reset ba b--blue bg-blue grow pointer f6 dib br2 white ml3"
            >
              Volver a clases
            </button>
          </div>
        )}
      </div>
      <WhatsAppHelp telefono={"+543513854913"} nombreGym={gym.title} />
    </div>
  );
};

export default BookCheckoutPage;
