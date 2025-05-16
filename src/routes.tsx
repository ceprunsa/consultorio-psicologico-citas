import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CoordinatorRoute from "./components/CoordinatorRoute";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import AppointmentForm from "./pages/AppointmentForm";
import AppointmentDetails from "./pages/AppointmentDetails";
import Psychologists from "./pages/Psychologists";
import PsychologistForm from "./pages/PsychologistForm";
import Processes from "./pages/Processes";
import ProcessForm from "./pages/ProcessForm";
import ConsultationReasons from "./pages/ConsultationReasons";
import ConsultationReasonForm from "./pages/ConsultationReasonForm";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      // Rutas de usuarios - Solo admin
      {
        path: "users",
        element: (
          <AdminRoute>
            <Users />
          </AdminRoute>
        ),
      },
      {
        path: "users/new",
        element: (
          <AdminRoute>
            <UserForm />
          </AdminRoute>
        ),
      },
      {
        path: "users/:id",
        element: (
          <AdminRoute>
            <UserForm />
          </AdminRoute>
        ),
      },
      // Rutas de citas - Todos los roles
      {
        path: "appointments",
        element: (
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointments/new",
        element: (
          <CoordinatorRoute>
            <AppointmentForm />
          </CoordinatorRoute>
        ),
      },
      {
        path: "appointments/:id",
        element: (
          <ProtectedRoute>
            <AppointmentDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointments/:id/edit",
        element: (
          <CoordinatorRoute>
            <AppointmentForm />
          </CoordinatorRoute>
        ),
      },
      // Rutas de psicólogos - Admin y coordinador
      {
        path: "psychologists",
        element: (
          <CoordinatorRoute>
            <Psychologists />
          </CoordinatorRoute>
        ),
      },
      {
        path: "psychologists/new",
        element: (
          <CoordinatorRoute>
            <PsychologistForm />
          </CoordinatorRoute>
        ),
      },
      {
        path: "psychologists/:id",
        element: (
          <CoordinatorRoute>
            <PsychologistForm />
          </CoordinatorRoute>
        ),
      },
      // Rutas de procesos - Solo admin
      {
        path: "processes",
        element: (
          <AdminRoute>
            <Processes />
          </AdminRoute>
        ),
      },
      {
        path: "processes/new",
        element: (
          <AdminRoute>
            <ProcessForm />
          </AdminRoute>
        ),
      },
      {
        path: "processes/:id",
        element: (
          <AdminRoute>
            <ProcessForm />
          </AdminRoute>
        ),
      },
      // Rutas de motivos de consulta - Solo admin
      {
        path: "reasons",
        element: (
          <AdminRoute>
            <ConsultationReasons />
          </AdminRoute>
        ),
      },
      {
        path: "reasons/new",
        element: (
          <AdminRoute>
            <ConsultationReasonForm />
          </AdminRoute>
        ),
      },
      {
        path: "reasons/:id",
        element: (
          <AdminRoute>
            <ConsultationReasonForm />
          </AdminRoute>
        ),
      },
      // Ruta de perfil - Todos los roles
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      // Ruta de configuración - Solo admin
      {
        path: "settings",
        element: (
          <AdminRoute>
            <Settings />
          </AdminRoute>
        ),
      },
    ],
  },
]);
