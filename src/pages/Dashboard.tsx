"use client";

import { useAuth } from "../hooks/useAuth";
import { useAppointments } from "../hooks/useAppointments";
import { usePsychologists } from "../hooks/usePsychologists";
import { useProcesses } from "../hooks/useProcesses";
import { useConsultationReasons } from "../hooks/useConsultationReasons";
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { user, isAdmin, isCoordinator, isPsychologist } = useAuth();
  const { appointments, isLoading: isLoadingAppointments } = useAppointments();
  const { psychologists, isLoading: isLoadingPsychologists } =
    usePsychologists();
  const { processes, isLoading: isLoadingProcesses } = useProcesses();
  const { reasons, isLoading: isLoadingReasons } = useConsultationReasons();
  const [isLoading, setIsLoading] = useState(true);

  // Filtrar citas por estado
  const scheduledAppointments = appointments.filter(
    (app) => app.status === "scheduled"
  );
  const completedAppointments = appointments.filter(
    (app) => app.status === "completed"
  );
  const cancelledAppointments = appointments.filter(
    (app) => app.status === "cancelled"
  );
  const noShowAppointments = appointments.filter(
    (app) => app.status === "no-show"
  );

  // Obtener citas para hoy
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((app) => app.date === today);

  // Obtener próximas citas (futuras)
  const upcomingAppointments = appointments
    .filter((app) => app.date > today && app.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calcular estadísticas para psicólogos
  const psychologistStats = psychologists.map((psychologist) => {
    const psychologistAppointments = appointments.filter(
      (app) => app.psychologistId === psychologist.id
    );
    const completed = psychologistAppointments.filter(
      (app) => app.status === "completed"
    ).length;
    const scheduled = psychologistAppointments.filter(
      (app) => app.status === "scheduled"
    ).length;
    const cancelled = psychologistAppointments.filter(
      (app) => app.status === "cancelled"
    ).length;
    const noShow = psychologistAppointments.filter(
      (app) => app.status === "no-show"
    ).length;
    const total = psychologistAppointments.length;

    // Calcular tasa de completitud (porcentaje de citas completadas del total)
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...psychologist,
      stats: {
        completed,
        scheduled,
        cancelled,
        noShow,
        total,
        completionRate,
      },
    };
  });

  // Ordenar psicólogos por número total de citas
  const sortedPsychologists = [...psychologistStats].sort(
    (a, b) => b.stats.total - a.stats.total
  );

  useEffect(() => {
    if (
      !isLoadingAppointments &&
      !isLoadingPsychologists &&
      !isLoadingProcesses &&
      !isLoadingReasons
    ) {
      setIsLoading(false);
    }
  }, [
    isLoadingAppointments,
    isLoadingPsychologists,
    isLoadingProcesses,
    isLoadingReasons,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Función para formatear fecha
  const formatDate = (dateString: string | number | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido{user?.displayName ? `, ${user.displayName}` : ""} al
          sistema de gestión de citas psicológicas
        </p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {user?.role === "admin"
            ? "Administrador"
            : user?.role === "coordinator"
            ? "Coordinador"
            : user?.role === "psychologist"
            ? "Psicólogo"
            : "Usuario"}
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Citas Programadas</p>
              <p className="text-2xl font-semibold">
                {scheduledAppointments.length}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/appointments"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Ver todas
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Citas Completadas</p>
              <p className="text-2xl font-semibold">
                {completedAppointments.length}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {completedAppointments.length > 0 && appointments.length > 0 ? (
                <span className="font-medium text-green-600">
                  {Math.round(
                    (completedAppointments.length / appointments.length) * 100
                  )}
                  % del total
                </span>
              ) : (
                <span>Sin datos</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Citas Canceladas</p>
              <p className="text-2xl font-semibold">
                {cancelledAppointments.length}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {cancelledAppointments.length > 0 && appointments.length > 0 ? (
                <span className="font-medium text-red-600">
                  {Math.round(
                    (cancelledAppointments.length / appointments.length) * 100
                  )}
                  % del total
                </span>
              ) : (
                <span>Sin datos</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">No Asistieron</p>
              <p className="text-2xl font-semibold">
                {noShowAppointments.length}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {noShowAppointments.length > 0 && appointments.length > 0 ? (
                <span className="font-medium text-yellow-600">
                  {Math.round(
                    (noShowAppointments.length / appointments.length) * 100
                  )}
                  % del total
                </span>
              ) : (
                <span>Sin datos</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Citas de hoy */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b flex justify-between items-center">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="font-semibold text-lg text-gray-800">
                Citas para hoy
              </h2>
            </div>
            <span className="text-sm font-medium text-blue-600">
              {formatDate(today)}
            </span>
          </div>
          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <Calendar className="h-12 w-12" />
                </div>
                <p className="text-gray-500">
                  No hay citas programadas para hoy
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="block hover:bg-gray-50 rounded-md p-3 -mx-3 transition-colors"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">
                          {appointment.client?.fullName}
                        </p>
                        <span className="text-sm font-medium text-blue-600">
                          {appointment.time}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{appointment.psychologistName}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : appointment.status === "completed"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {appointment.status === "scheduled"
                            ? "Programada"
                            : appointment.status === "completed"
                            ? "Completada"
                            : appointment.status === "cancelled"
                            ? "Cancelada"
                            : "No asistió"}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {appointment.modality === "presential"
                            ? "Presencial"
                            : "Virtual"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 text-center">
              <Link
                to="/appointments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver todas las citas
              </Link>
            </div>
          </div>
        </div>

        {/* Próximas citas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="font-semibold text-lg text-gray-800">
                Próximas citas
              </h2>
            </div>
          </div>
          <div className="p-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <Clock className="h-12 w-12" />
                </div>
                <p className="text-gray-500">
                  No hay próximas citas programadas
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="block hover:bg-gray-50 rounded-md p-3 -mx-3 transition-colors"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">
                          {appointment.client?.fullName}
                        </p>
                        <div className="text-sm font-medium text-green-600">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{appointment.time}</span>
                        <span className="mx-2">•</span>
                        <User className="h-4 w-4 mr-1" />
                        <span>{appointment.psychologistName}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {appointment.modality === "presential"
                            ? "Presencial"
                            : "Virtual"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 text-center">
              <Link
                to="/appointments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Programar nueva cita
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sección adicional para administradores y coordinadores */}
      {(isAdmin || isCoordinator) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Resumen de Psicólogos
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Psicólogo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Citas
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Completadas
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Programadas
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tasa de Completitud
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPsychologists.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No hay psicólogos registrados
                      </td>
                    </tr>
                  ) : (
                    sortedPsychologists.map((psychologist) => (
                      <tr key={psychologist.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {psychologist.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {psychologist.institutionalEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {psychologist.stats.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {psychologist.stats.completed}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {psychologist.stats.scheduled}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${psychologist.stats.completionRate}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {psychologist.stats.completionRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {psychologists.length > 0 && (
              <div className="px-6 py-4 border-t">
                <Link
                  to="/psychologists"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center"
                >
                  Ver todos los psicólogos
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección para psicólogos */}
      {isPsychologist && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Mis Estadísticas
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            {appointments.length === 0 ? (
              <p className="text-center text-gray-500">
                No tienes citas asignadas
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total de Citas</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {appointments.length}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Completadas</p>
                    <p className="text-2xl font-bold text-green-700">
                      {completedAppointments.length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {scheduledAppointments.length}
                    </p>
                  </div>
                </div>

                <h3 className="font-medium text-gray-800 mb-3">
                  Distribución de Citas
                </h3>
                <div className="h-4 w-full bg-gray-200 rounded-full mb-4">
                  {appointments.length > 0 && (
                    <>
                      <div className="flex h-4 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${
                              (completedAppointments.length /
                                appointments.length) *
                              100
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-blue-500"
                          style={{
                            width: `${
                              (scheduledAppointments.length /
                                appointments.length) *
                              100
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-red-500"
                          style={{
                            width: `${
                              (cancelledAppointments.length /
                                appointments.length) *
                              100
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-yellow-500"
                          style={{
                            width: `${
                              (noShowAppointments.length /
                                appointments.length) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                          <span>
                            Completadas (
                            {Math.round(
                              (completedAppointments.length /
                                appointments.length) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-blue-500 rounded-full mr-1"></div>
                          <span>
                            Programadas (
                            {Math.round(
                              (scheduledAppointments.length /
                                appointments.length) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-red-500 rounded-full mr-1"></div>
                          <span>
                            Canceladas (
                            {Math.round(
                              (cancelledAppointments.length /
                                appointments.length) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-yellow-500 rounded-full mr-1"></div>
                          <span>
                            No asistieron (
                            {Math.round(
                              (noShowAppointments.length /
                                appointments.length) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {(isAdmin || isCoordinator) && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <h2 className="font-semibold text-lg text-gray-800">
              Información del Sistema
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Psicólogos</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {psychologists.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Psicólogos registrados en el sistema
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Activity className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Procesos</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-700">
                  {processes.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Procesos de atención configurados
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-900">
                    Motivos de Consulta
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {reasons.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Motivos de consulta disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
