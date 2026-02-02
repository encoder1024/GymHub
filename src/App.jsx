import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GymsPage from './pages/GymsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MembershipPage from './pages/MembershipPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import GymOwnerDashboardPage from './pages/GymOwnerDashboardPage';
import GymOwnerBookingListPage from './pages/GymOwnerBookingListPage';
import GymOwnerClassManagementPage from './pages/GymOwnerClassManagementPage'; // Importar la nueva página
import AdminGymApprovalPage from './pages/AdminGymApprovalPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminMetricsDashboardPage from './pages/AdminMetricsDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gyms" element={<GymsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />

          {/* Rutas Protegidas para cualquier usuario logueado */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

          {/* Rutas de Administrador */}
          <Route path="/admin/gym-approval" element={<ProtectedRoute roles={['admin']}><AdminGymApprovalPage /></ProtectedRoute>} />
          <Route path="/admin/user-management" element={<ProtectedRoute roles={['admin']}><AdminUserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/metrics" element={<ProtectedRoute roles={['admin']}><AdminMetricsDashboardPage /></ProtectedRoute>} />

          {/* Rutas de Propietario de Gimnasio (Owner) */}
          <Route path="/gym-owner-dashboard" element={<ProtectedRoute roles={['owner']}><GymOwnerDashboardPage /></ProtectedRoute>} />
          <Route path="/gym-owner-bookings" element={<ProtectedRoute roles={['owner']}><GymOwnerBookingListPage /></ProtectedRoute>} />
          <Route path="/gym-owner-classes" element={<ProtectedRoute roles={['owner']}><GymOwnerClassManagementPage /></ProtectedRoute>} />
          
          {/* Ruta fallback por si se accede a una ruta no definida */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App;