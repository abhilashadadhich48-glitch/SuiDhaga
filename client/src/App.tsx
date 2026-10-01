import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import ExploreTailors from './pages/customer/ExploreTailors';
import TailorDetail from './pages/customer/TailorDetail';
import MeasurementProfile from './pages/customer/MeasurementProfile';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerAppointments from './pages/customer/CustomerAppointments';

// Tailor Pages
import TailorServices from './pages/tailor/TailorServices';
import TailorOrders from './pages/tailor/TailorOrders';
import TailorAppointments from './pages/tailor/TailorAppointments';
import TailorProfile from './pages/tailor/TailorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Footer from './components/Footer';
import AiChatbox from './components/AiChatbox';

const HomeRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <ExploreTailors />;
  }

  switch (user.role) {
    case 'tailor':
      return <Navigate to="/orders" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'customer':
    default:
      return <ExploreTailors />;
  }
};

const AppRoutes: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#2f5d50]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#faf8f5] text-[#2c2c2c] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            {/* Public and Role-switched landing page */}
            <Route path="/" element={<HomeRouter />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Specific Protected Routes */}
            <Route
              path="/tailor/:id"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <TailorDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/measurements"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MeasurementProfile />
                </ProtectedRoute>
              }
            />

            {/* Order Timeline (Shared route path, different components based on role) */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <RoleBasedOrderRedirect />
                </ProtectedRoute>
              }
            />

            {/* Appointments Agenda (Shared route path, different components based on role) */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <RoleBasedAppointmentRedirect />
                </ProtectedRoute>
              }
            />

            {/* Tailor Specific Protected Routes */}
            <Route
              path="/tailor/services"
              element={
                <ProtectedRoute allowedRoles={['tailor']}>
                  <TailorServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tailor/profile"
              element={
                <ProtectedRoute allowedRoles={['tailor']}>
                  <TailorProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Specific Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
        <AiChatbox />
      </div>
    </Router>
  );
};

const RoleBasedOrderRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'tailor') {
    return <TailorOrders />;
  }
  return <CustomerOrders />;
};

const RoleBasedAppointmentRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'tailor') {
    return <TailorAppointments />;
  }
  return <CustomerAppointments />;
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
