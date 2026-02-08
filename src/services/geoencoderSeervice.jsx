// src/services/geocodingService.js
import { supabase } from '../supabaseClient'; // Asegúrate de que esta sea tu instancia configurada

export const geolocalizarGimnasio = async (datosDireccion) => {
  const { data, error } = await supabase.functions.invoke('geolocalizar-gym', {
    body: datosDireccion, // {calle, numero, ciudad, estado, pais}
    method: 'POST',
  });

  if (error) {
    console.error("Error al llamar a la función Edge:", error.message);
    return null;
  }

  if (data && data.error) {
      console.error("Error de la API:", data.error);
      return null;
  }
  
  return data; // Devuelve { lat, lon, direccion }
};
