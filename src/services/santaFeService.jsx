import { geolocalizarGimnasio } from "../services/geoencoderSeervice";
import { CrudFetchAll, CrudUpdate } from "./supaCrud";

export const cargaDBSantaFe = async () => {
  const datosGym = {
    calle: "Av. Colón",
    numero: "4500",
    ciudad: "Córdoba",
    estado: "Córdoba",
    pais: "Argentina",
  };

  const { data: arrayGyms, error: fetchError } =
    await CrudFetchAll("gymsSantaFe");
  // const gym1 = [arrayGyms[0],arrayGyms[1]];
  if (!fetchError) {
    console.log("Estos son los gyms de Santa Fe: ", arrayGyms);
    for (const gym of arrayGyms) {
      const direccion = gym.street;
      let datosGym = {};
      let match = "";
      
      if (direccion){
        match = direccion.match(/\d+/); // Busca la primera secuencia de dígitos
      } else {
        continue;
      }

      const calleSinNumero = direccion.replace(/\s+\d+$/, "").trim();

      if (match) {
        const numero = match[0];
        console.log(numero); // "2035"
        datosGym = {
          calle: calleSinNumero,
          numero: match[0],
          ciudad: gym.city,
          estado: gym.state,
          pais: "Argentina",
        };
      } else {
        datosGym = {
          calle: gym.street,
          numero: "100",
          ciudad: gym.city,
          estado: gym.state,
          pais: "Argentina",
        };
      }

      console.log(datosGym);

      const coords = await geolocalizarGimnasio(datosGym);

      if (coords) {
        console.log(
          `Gimnasio ${gym.title} ubicado en: ${coords.lat}, ${coords.lon}`
        );
        
        // Aquí harías el insert en Supabase incluyendo coords.lat y coords.lon
        
        const pointWKT = `POINT(${coords.lon} ${coords.lat})`;
        
        const { error: errorUpdate } = await CrudUpdate(
          gym.id,
          "gymsSantaFe",
          {location: pointWKT},
        );

        if (errorUpdate) {
          console.log("Error en el update: ", errorUpdate);
          throw new Error("error en el update de location");
        }
      } else {
        console.log("Error en el update: No hay coordenadas");
      }
    }
  }
};
