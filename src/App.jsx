import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/common/HomePage";
import GymsPage from "./pages/common/GymsPage";
import LoginPage from "./pages/common/LoginPage";
import RegisterPage from "./pages/common/RegisterPage";
import MembershipPage from "./pages/admin/MembershipPage";
import CheckoutPage from "./pages/common/CheckoutPage";
import ProfilePage from "./pages/common/ProfilePage";
import MyBookingsPage from "./pages/user/MyBookingsPage";
import GymOwnerDashboardPage from "./pages/owner/GymOwnerDashboardPage";
import GymOwnerBookingListPage from "./pages/owner/GymOwnerBookingListPage";
import GymOwnerClassManagementPage from "./pages/owner/GymOwnerClassManagementPage"; // Importar la nueva página
import AdminGymApprovalPage from "./pages/admin/AdminGymApprovalPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import AdminMetricsDashboardPage from "./pages/admin/AdminMetricsDashboardPage";
import NotFoundPage from "./pages/common/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BookCheckoutPage from "./pages/user/BookCheckoutPage";
import AdminGymDetails from "./pages/admin/AdminGymDetails";

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
          {/* <Route path="/membership" element={<MembershipPage />} /> */}
          <Route path="/not-found" element={<NotFoundPage />} />

          {/* Rutas Protegidas para cualquier usuario logueado */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/book-checkout"
            element={
              <ProtectedRoute>
                <BookCheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Administrador */}
          <Route
            path="/admin/AdminGymApprovalPage"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminGymApprovalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/AdminUserManagementPage"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/AdminMetricsDashboardPage"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminMetricsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/membership"
            element={
              <ProtectedRoute roles={["admin", "owner"]}>
                <MembershipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/AdminGymDetails"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminGymDetails />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Propietario de Gimnasio (Owner) */}
          <Route
            path="/owner/gym-owner-dashboard"
            element={
              <ProtectedRoute roles={["owner"]}>
                <GymOwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/gym-owner-bookings"
            element={
              <ProtectedRoute roles={["owner"]}>
                <GymOwnerBookingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/gym-owner-classes"
            element={
              <ProtectedRoute roles={["owner"]}>
                <GymOwnerClassManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta fallback por si se accede a una ruta no definida */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
