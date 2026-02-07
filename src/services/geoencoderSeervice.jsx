import NodeGeocoder from 'node-geocoder';

const options = {
  provider: 'openstreetmap',
  // Opcional: podés agregar 'fetch' si estás en una versión de Node antigua
  // formatter: null 
};

const geocoder = NodeGeocoder(options);

/**
 * Convierte una dirección en coordenadas lat/lon
 * @param {Object} data - { calle, numero, ciudad, estado, pais }
 */
export const obtenerCoordenadas = async ({ calle, numero, ciudad, estado, pais }) => {
  const direccionCompleta = `${calle} ${numero}, ${ciudad}, ${estado}, ${pais}`;
  
  try {
    const res = await geocoder.geocode(direccionCompleta);
    
    if (res.length > 0) {
      return {
        lat: res[0].latitude,
        lon: res[0].longitude,
        formateada: res[0].formattedAddress
      };
    }
    throw new Error("No se encontraron coordenadas para esa dirección.");
  } catch (error) {
    console.error("Error en Geocoding:", error.message);
    return null;
  }
};
