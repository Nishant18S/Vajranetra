import { Routes, Route } from 'react-router-dom';

// Public shell
import PublicLayout from './components/public/PublicLayout';
import Landing from './pages/public/Landing';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import CitizenDashboard from './pages/public/CitizenDashboard';
import CitizenForecast from './pages/public/CitizenForecast';
import CitizenMap from './pages/public/CitizenMap';
import CitizenAlerts from './pages/public/CitizenAlerts';
import CitizenProfile from './pages/public/CitizenProfile';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Admin shell
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminRegionInspector from './pages/admin/AdminRegionInspector';
import AdminInspections from './pages/admin/AdminInspections';
import AdminForecast from './pages/admin/AdminForecast';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminCreateAlert from './pages/admin/AdminCreateAlert';
import AdminIncidents from './pages/admin/AdminIncidents';
import AdminMap from './pages/admin/AdminMap';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAudit from './pages/admin/AdminAudit';
import AdminUsers from './pages/admin/AdminUsers';

import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* ---------- Public (citizen) portal ---------- */}
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="forecast"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <CitizenForecast />
            </ProtectedRoute>
          }
        />
        <Route
          path="map"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <CitizenMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="alerts"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <CitizenAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute roles={['CITIZEN']}>
              <CitizenProfile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ---------- Admin login (standalone) ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ---------- Admin portal ---------- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['AUTHORITY', 'ADMIN']} adminScope>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="region" element={<AdminRegionInspector />} />
        <Route path="inspections" element={<AdminInspections />} />
        <Route path="forecast" element={<AdminForecast />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="alerts/new" element={<AdminCreateAlert />} />
        <Route path="incidents" element={<AdminIncidents />} />
        <Route path="map" element={<AdminMap />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit" element={<AdminAudit />} />

        {/* ADMIN-only pages */}
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['ADMIN']} adminScope>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}