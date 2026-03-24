import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ClassCard = ({ classInfo, gymInfo, onBook, tabla }) => {
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState(0);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchBookingsCount = async () => {
      if (!classInfo?.id) return;

      try {
        const tableName = tabla === "SantaFe" ? "bookings_santa_fe" : "bookings";
        const { count, error } = await supabase
          .from(tableName)
          .select("*", { count: 'exact', head: true })
          .eq("class_id", classInfo.id)
          .eq("status", "confirmada");

        if (!error) {
          setConfirmedBookingsCount(count || 0);
        }
      } catch (err) {
        console.error("Error fetching bookings count:", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookingsCount();
  }, [classInfo.id, tabla]);

  if (!classInfo || !gymInfo || !onBook) {
    return null;
  }

  const startTime = new Date(classInfo.start_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(classInfo.end_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const startDate = new Date(classInfo.start_time).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let resultGymName = "";
  if (Array.isArray(gymInfo)) {
    const foundGym = gymInfo.find(g => g.id === classInfo.gym_id);
    if (foundGym) {
      resultGymName = tabla === "SantaFe" ? foundGym.title : foundGym.name;
    }
  } else if (gymInfo.id === classInfo.gym_id) {
    resultGymName = tabla === "SantaFe" ? gymInfo.title : gymInfo.name;
  }

  const actualCapacity = classInfo.capacity - confirmedBookingsCount;
  const isReservable = new Date(classInfo.start_time) > new Date() && actualCapacity > 0;

  return (
    <div className="bg-gray shadow-1 br3 w-full sm:w-72 flex flex-column justify-between ma2">
      <h3 className="ma1 pa1 f4 mv0 white">{classInfo.name}</h3>
      <h4 className="ma1 pa1 f4 mv0 white">{resultGymName}</h4>
      <p className="ma1 f6 mt2">{classInfo.description}</p>
      <p className="ma1 f6 mt2">
        <strong>Fecha:</strong> {startDate}
      </p>
      <p className="ma1 f6 mt2">
        <strong>Horario:</strong> {startTime} - {endTime}
      </p>
      <p className="ma1 f6">
        <strong>Cupos disponibles:</strong> {loadingBookings ? "Cargando..." : actualCapacity} / {classInfo.capacity}
      </p>
      {isReservable ? (
        <button
          onClick={() => onBook(classInfo, gymInfo)}
          className="bn ph3 pv2 input-reset ba b--green bg-green grow pointer f6 dib br2 white mt3"
        >
          Reservar
        </button>
      ) : (
        <p className="ma1 f6 gray mt3">
          {new Date(classInfo.start_time) <= new Date() 
            ? "Clase pasada." 
            : actualCapacity <= 0 
              ? "Sin cupos disponibles." 
              : "No disponible."}
        </p>
      )}
    </div>
  );
};

export default ClassCard;
