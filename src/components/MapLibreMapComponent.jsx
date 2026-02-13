import React, { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { useAuth } from "../hooks/useAuth";

export default function MapTilerComponent({ gymsArray }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom] = useState(13);
  const [lng] = useState(-64.152456); // Buenos Aires
  const [lat] = useState(-31.426168);
  const API_KEY = import.meta.env.VITE_MAPTILER_APY_KEY;
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (map.current) return;

    navigator.geolocation.getCurrentPosition(
      // Éxito: callback que recibe la posición
      (position) => {
        const { latitude, longitude } = position.coords;
        // setUserLat(latitude);
        // setUserLong(longitude);
        // console.log(`Latitud: ${latitude}`);
        // console.log(`Longitud: ${longitude}`);
        // console.log("Posición completa:", position);
      },
      // Error: callback si el usuario niega el permiso o hay error
      (error) => {
        console.error("Error al obtener la ubicación:", error.message);
      },
    );

    maptilersdk.config.apiKey = API_KEY;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BASIC_V2, //maptilersdk.MapStyle.STREETS_V4,
      center: [lng, lat],
      zoom: zoom,
    });
    // console.log("gyms a mostrar:", gymsArray);

    // --- Lógica para agregar marcadores ---
    gymsArray.forEach((gym) => {
      // Definimos el HTML del popup con un botón
      let htmlContent = "";
      if (profile?.role === "admin") {
        htmlContent = `
        <div style="text-align:center; background:gray;">
          <h3>${gym.title}</h3>
          <p>${gym.category_name}</p>
          <p>${gym.phone}</p>
          <button onclick="window.location.href='/admin/AdminGymDetails?q=${gym.title}'" 
                  style="background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer;">
            Ver detalles / Buscar
          </button>
        </div>
      `;
      } else {
        htmlContent = `
        <div style="text-align:center; background:gray;">
          <h3>${gym.title}</h3>
          <p>${gym.category_name}</p>
          <p>${gym.phone}</p>
          <button onclick="window.location.href='/user/my-bookings?name=${gym.title}&id=${gym.id}'" 
                  style="background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer;">
            Ver detalles / Reservar
          </button>
        </div>
      `;
      }

      // Creamos el popup y lo vinculamos al marcador
      const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(htmlContent);

      new maptilersdk.Marker({ color: "#0000FF" }) // Puedes personalizar el color
        .setLngLat([gym.longitud, gym.latitud])
        .setPopup(popup) //new maptilersdk.Popup().setHTML(`<h3>${gym.name}</h3>`)
        .addTo(map.current);
    });

    // --- Lógica para centrar el mapa en uno de ellos (Ej: el primero) ---
    // Usamos 'flyTo' para una transición suave al primer gimnasio
    if (gymsArray.length > 0) {
      map.current.flyTo({
        center: [-60.6638467, -32.9530517],
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
