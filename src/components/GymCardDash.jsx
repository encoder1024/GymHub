const GymCardDash = ({gymInfo, cantClases}) => { // Recibe gym 

  // Usar clases proporcionadas si existen, de lo contrario, usar mock
//   const classesToShow = gym.classes && gym.classes.length > 0 ? gym.classes : mockClasses;
  // console.log("Elementos recibidos:", cantClases)

  return (
    <div className="bg-gray br3 w-100 w-100-m w-100-l flex flex-column justify-between">
      {/* Imagen del gimnasio (placeholder) */}
      <div className="w-100 w-40-l pa2">
        <img src="https://placehold.co/600x400/000000/FFFFFF/png?text=Gym" className="db w-100 h-auto br2 br--top-l" alt="Foto de un gimnasio." />
      </div>
      
      <div className="bg-gray shadow-1 br3 w-100 w-100-m w-100-l flex flex-column justify-between">
        <div>
          <h1 className="f4 f3-ns mv0">{gymInfo.title}</h1>
          <p className="f6 lh-copy measure mt2">{gymInfo.category_name}</p>
          <p className="f6 lh-copy measure mt2">Ubicación: {gymInfo.lat},{gymInfo.lng}</p>
          {/* Podría añadir la dirección si estuviera en gym.location */}
        </div>
        
        {/* Sección de Clases */}
        <div className="mt4">
          <h3 className="f5 mv2">Clases Disponibles: {cantClases.count}</h3>
          {/* {classesToShow.length > 0 ? (
            classesToShow.length()
          ) : (
            <p className="f6 mid-gray">Este gimnasio no tiene clases programadas actualmente.</p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default GymCardDash;