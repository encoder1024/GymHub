import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import 'tachyons/css/tachyons.min.css'
import 'leaflet/dist/leaflet.css'; // Importar estilos de Leaflet
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>,
)
