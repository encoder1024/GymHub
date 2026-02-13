import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "tachyons/css/tachyons.min.css";
import "leaflet/dist/leaflet.css"; // Importar estilos de Leaflet
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
);

// 👉 Registrar Service Worker (obligatorio para iPhone)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" }) // Forzamos el scope raíz
      .then((reg) => {
        console.log("SW registrado con éxito:", reg.scope);
      })
      .catch((err) => console.error("Error registrando SW", err));
  });
}

// // 👉 Inicializar OneSignal
// window.OneSignalDeferred = window.OneSignalDeferred || []
// window.OneSignalDeferred.push(async function (OneSignal) {
//   await OneSignal.init({
//     appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
//     // safari_web_id: "TU-SAFARI-WEB-ID", // obligatorio para iPhone
//     notifyButton: {
//       enable: true,
//     },
//     allowLocalhostAsSecureOrigin: true,
//   })
// })
