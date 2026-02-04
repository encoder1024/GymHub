import React, { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

export default function MapTilerComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom] = useState(13);
  const [lng] = useState(-64.152456); // Buenos Aires
  const [lat] = useState(-31.426168);
  const API_KEY = "IotQHWTNCjuptTA8Nvv7";
  const [userLong, setUserLong] = useState(0);
  const [userLat, setUserLat] = useState(0);

  // Definimos nuestros datos de gimnasios (ejemplo)
  const gyms = [
    { id: 1, name: "Gimnasio Central", lng: -64.152456, lat: -31.426168 },
    { id: 2, name: "Gimnasio Norte", lng: -64.142456, lat: -31.416168 },
    { id: 3, name: "Gimnasio Sur", lng: -64.162456, lat: -31.436168 },
  ];

  // Definimos el HTML del popup con un botón
const htmlContent = `
  <div style="text-align:center">
    <h3>Nombre del Lugar</h3>
    <p>Breve descripción aquí.</p>
    <button onclick="window.location.href='/detalles/lugar-1'" 
            style="background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer;">
      Ver detalles / Reservar
    </button>
  </div>
`;

// Creamos el popup y lo vinculamos al marcador
const popup = new maptilersdk.Popup({ offset: 25 })
  .setHTML(htmlContent);

  useEffect(() => {
    if (map.current) return;

    navigator.geolocation.getCurrentPosition(
      // Éxito: callback que recibe la posición
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLong(longitude);
        console.log(`Latitud: ${latitude}`);
        console.log(`Longitud: ${longitude}`);
        console.log("Posición completa:", position);
      },
      // Error: callback si el usuario niega el permiso o hay error
      (error) => {
        console.error("Error al obtener la ubicación:", error.message);
      },
    );

    maptilersdk.config.apiKey = API_KEY;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [lng, lat],
      zoom: zoom,
    });

    // --- Lógica para agregar marcadores ---
    gyms.forEach((gym) => {
      new maptilersdk.Marker({ color: "#FF0000" }) // Puedes personalizar el color
        .setLngLat([gym.lng, gym.lat])
        .setPopup(popup) //new maptilersdk.Popup().setHTML(`<h3>${gym.name}</h3>`)
        .addTo(map.current);
    });

    // --- Lógica para centrar el mapa en uno de ellos (Ej: el primero) ---
    // Usamos 'flyTo' para una transición suave al primer gimnasio
    if (gyms.length > 0) {
      map.current.flyTo({
        center: [gyms[0].lng, gyms[0].lat],
        essential: true, // Esto garantiza que vuele incluso si la API es lenta
      });
    }
  }, [lng, lat, zoom]); // Asegúrate de que las dependencias incluyan todo lo necesario si cambian dinámicamente

  return (
    <div className="map-wrap">
      <div
        ref={mapContainer}
        className="map"
        style={{ width: "100%", height: "500px" }}
      />
    </div>
  );
}
