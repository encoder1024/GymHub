import React from 'react';
import ClassCard from './ClassCard'; // Importar ClassCard
import { Link } from 'react-router-dom'; // Para navegación

const GymCard = ({ gym, onBook }) => { // Recibe gym y la función onBook
  // Mock classes data for demonstration if not provided by prop
  const mockClasses = [
    { id: 101, name: 'Yoga Flow', description: 'Sesión relajante de yoga.', start_time: new Date(Date.now() + 60*60*1000), end_time: new Date(Date.now() + 2*60*60*1000), capacity: 15 },
    { id: 102, name: 'Spinning Intensivo', description: 'Entrenamiento cardiovascular de alta intensidad.', start_time: new Date(Date.now() + 2*60*60*1000), end_time: new Date(Date.now() + 3*60*60*1000), capacity: 20 },
  ];

  // Usar clases proporcionadas si existen, de lo contrario, usar mock
  const classesToShow = gym.classes && gym.classes.length > 0 ? gym.classes : mockClasses;

  return (
    <article className="br2 ba dark-gray b--black-10 mv4 w-100 w-50-m w-100-l mw7 center flex flex-column flex-md-row">
      {/* Imagen del gimnasio (placeholder) */}
      <div className="w-100 w-40-l pa2">
        <img src="https://placehold.co/600x400/000000/FFFFFF/png?text=Gym" className="db w-100 h-auto br2 br--top-l" alt="Foto de un gimnasio." />
      </div>
      <div className="pa2 ph3-ns pb3-ns flex flex-column justify-between w-100 w-60-l">
        <div>
          <h1 className="f4 f3-ns mv0">{gym.name}</h1>
          <p className="f6 lh-copy measure mt2 mid-gray">{gym.description}</p>
          {/* Podría añadir la dirección si estuviera en gym.location */}
        </div>
        
        {/* Sección de Clases */}
        <div className="mt4">
          <h3 className="f5 mv2">Clases Disponibles:</h3>
          {classesToShow.length > 0 ? (
            <div className="flex flex-wrap justify-start">
              {classesToShow.map((cls) => (
                <ClassCard 
                  key={cls.id} 
                  classInfo={cls} 
                  onBook={onBook} // Pasa la función onBook a ClassCard
                />
              ))}
            </div>
          ) : (
            <p className="f6 mid-gray">Este gimnasio no tiene clases programadas actualmente.</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default GymCard;
