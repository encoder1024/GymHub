// Puedes importar y renderizar este componente en tu App.js principal
// import MapLibreMapComponent from './MapLibreMapComponent';

import React, { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
// Importa el CSS como se indica en el punto 2 de la imagen
import '@maptiler/sdk/dist/maptiler-sdk.css'; 

export default function MapTilerComponent() {
  // Referencia al div que contendrá el mapa
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom] = useState(14);
  // Coordenadas para el centro del mapa
  const [lng] = useState(-58.3816); 
  const [lat] = useState(-34.6037); 
  const API_KEY = 'IotQHWTNCjuptTA8Nvv7'; // <-- Clave de ejemplo de tu imagen

  useEffect(() => {
    if (map.current) return; // Inicializa el mapa solo una vez

    // Configura la API key globalmente, como en la línea 3 de la imagen
    maptilersdk.config.apiKey = API_KEY;

    // Inicializa el mapa usando la referencia al contenedor
    map.current = new maptilersdk.Map({
      container: mapContainer.current, // usa la referencia del div
      style: maptilersdk.MapStyle.STREETS, // como en la línea 6 de la imagen
      center: [lng, lat],
      zoom: zoom,
    });
  }, [lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div 
        ref={mapContainer} 
        className="map" 
        // Define la altura directamente aquí con style inline 
        style={{ width: '100%', height: '500px' }} 
      />
    </div>
  );
}

