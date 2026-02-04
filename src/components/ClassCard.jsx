import React from 'react';

const ClassCard = ({ classInfo, onBook }) => {
  const startTime = new Date(classInfo.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(classInfo.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determinar si la clase aún es reservable (ej. no ha pasado, o tiene cupos)
  // Para este ejemplo, asumimos que todas son reservables si la fecha es futura.
  const isReservable = new Date(classInfo.start_time) > new Date(); 

  return (
    <div className="bg-white shadow-1 br3 w-100 w-100-m w-30-l flex flex-column justify-between">
      <h3 className="pa1 f4 mv0">{classInfo.name}</h3>
      <p className="f6 lh-copy measure mid-gray">{classInfo.description}</p>
      <p className="f6 mt2">
        <strong>Horario:</strong> {startTime} - {endTime}
      </p>
      <p className="f6">
        <strong>Cupos disponibles:</strong> {classInfo.capacity}
      </p>
      {isReservable ? (
        <button
          onClick={() => onBook(classInfo)}
          className="bn ph3 pv2 input-reset ba b--green bg-green grow pointer f6 dib br2 white mt3"
        >
          Reservar
        </button>
      ) : (
        <p className="f6 gray mt3">Clase no disponible o pasada.</p>
      )}
    </div>
  );
};

export default ClassCard;
