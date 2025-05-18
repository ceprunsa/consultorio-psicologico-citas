"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { usePsychologists } from "../hooks/usePsychologists";
import { useProcesses } from "../hooks/useProcesses";
import { useConsultationReasons } from "../hooks/useConsultationReasons";
import { useAuth } from "../hooks/useAuth";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { Appointment } from "../types";
import toast from "react-hot-toast";

const Appointments = () => {
  const {
    appointments,
    isLoading,
    deleteAppointment,
    updateAppointmentStatus,
  } = useAppointments();
  const { psychologists, isLoading: isLoadingPsychologists } =
    usePsychologists();
  const { processes, isLoading: isLoadingProcesses } = useProcesses();
  const { reasons, isLoading: isLoadingReasons } = useConsultationReasons();
  const { user, isAdmin, isCoordinator, isPsychologist } = useAuth();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPsychologist, setSelectedPsychologist] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Estado para modal de confirmación
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [appointmentToChangeStatus, setAppointmentToChangeStatus] = useState<{
    appointment: Appointment | null;
    newStatus: Appointment["status"] | null;
  }>({ appointment: null, newStatus: null });

  // Debugging
  useEffect(() => {
    console.log(
      `Usuario actual: ${user?.email}, Rol: ${user?.role}, Es psicólogo: ${isPsychologist}`
    );
    console.log(`Citas cargadas: ${appointments.length}`);
  }, [user, isPsychologist, appointments]);

  // Filtrar citas
  const filteredAppointments = appointments
    .filter((appointment) => {
      // Filtro por término de búsqueda (nombre del cliente o DNI)
      if (
        searchTerm &&
        !appointment.client.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !appointment.client.dni.includes(searchTerm)
      ) {
        return false;
      }

      // Filtro por psicólogo
      if (
        selectedPsychologist &&
        appointment.psychologistId !== selectedPsychologist
      ) {
        return false;
      }

      // Filtro por proceso
      if (selectedProcess && appointment.processId !== selectedProcess) {
        return false;
      }

      // Filtro por motivo
      if (selectedReason && appointment.reasonId !== selectedReason) {
        return false;
      }

      // Filtro por estado
      if (selectedStatus && appointment.status !== selectedStatus) {
        return false;
      }

      // Filtro por fecha
      if (selectedDate && appointment.date !== selectedDate) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Ordenar por fecha (más reciente primero) y luego por hora
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return a.time.localeCompare(b.time);
    });

  const handleDeleteClick = (appointment: Appointment) => {
    if (!isAdmin && !isCoordinator) {
      toast.error("No tienes permisos para eliminar citas");
      return;
    }
    setAppointmentToDelete(appointment);
  };

  const handleChangeStatusClick = (
    appointment: Appointment,
    newStatus: Appointment["status"]
  ) => {
    if (
      isPsychologist &&
      newStatus === "cancelled" &&
      !isAdmin &&
      !isCoordinator
    ) {
      toast.error("No tienes permisos para cancelar citas");
      return;
    }
    setAppointmentToChangeStatus({ appointment, newStatus });
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete || !appointmentToDelete.id) return;

    try {
      await deleteAppointment(appointmentToDelete.id);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error("Error al eliminar cita:", error);
    }
  };

  const confirmChangeStatus = async () => {
    if (
      !appointmentToChangeStatus.appointment ||
      !appointmentToChangeStatus.newStatus
    )
      return;

    try {
      await updateAppointmentStatus(
        appointmentToChangeStatus.appointment.id,
        appointmentToChangeStatus.newStatus
      );
      setAppointmentToChangeStatus({ appointment: null, newStatus: null });
    } catch (error) {
      console.error("Error al cambiar estado de la cita:", error);
    }
  };

  const cancelDelete = () => {
    setAppointmentToDelete(null);
  };

  const cancelChangeStatus = () => {
    setAppointmentToChangeStatus({ appointment: null, newStatus: null });
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      case "no-show":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programada";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      case "no-show":
        return "No asistió";
      default:
        return "Desconocido";
    }
  };

  if (
    isLoading ||
    isLoadingPsychologists ||
    isLoadingProcesses ||
    isLoadingReasons
  ) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay citas y el usuario es psicólogo, mostrar un mensaje específico
  if (isPsychologist && appointments.length === 0) {
    return (
      <div className="w-full max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Mis Citas Psicológicas
            </h1>
            <p className="text-gray-600">Gestión de citas asignadas</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <AlertCircle size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            No tienes citas asignadas
          </h2>
          <p className="text-gray-600 mb-4">
            Actualmente no tienes citas psicológicas asignadas. Las citas que te
            sean asignadas aparecerán aquí.
          </p>
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, por favor contacta al coordinador o
            administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {isPsychologist ? "Mis Citas Psicológicas" : "Citas Psicológicas"}
          </h1>
          <p className="text-gray-600">
            {isPsychologist
              ? "Gestión de citas asignadas"
              : "Gestión de citas del consultorio psicológico"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary inline-flex items-center"
          >
            <Filter size={18} className="mr-1 md:mr-2" />
            <span>{showFilters ? "Ocultar filtros" : "Mostrar filtros"}</span>
          </button>
          {(isAdmin || isCoordinator) && (
            <Link
              to="/appointments/new"
              className="btn btn-primary inline-flex items-center"
            >
              <Plus size={18} className="mr-1 md:mr-2" />
              <span>Nueva Cita</span>
            </Link>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <select
              className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="no-show">No asistieron</option>
            </select>
          </div>
        </div>

        {/* Filtros adicionales */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {!isPsychologist && (
              <div>
                <label
                  htmlFor="psychologist"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Psicólogo
                </label>
                <select
                  id="psychologist"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedPsychologist}
                  onChange={(e) => setSelectedPsychologist(e.target.value)}
                >
                  <option value="">Todos los psicólogos</option>
                  {psychologists.map((psychologist) => (
                    <option key={psychologist.id} value={psychologist.id}>
                      {psychologist.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor="process"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Proceso
              </label>
              <select
                id="process"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
              >
                <option value="">Todos los procesos</option>
                {processes.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motivo de consulta
              </label>
              <select
                id="reason"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="">Todos los motivos</option>
                {reasons.map((reason) => (
                  <option key={reason.id} value={reason.id}>
                    {reason.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de citas */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gray-100 p-3">
                <Search size={24} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No se encontraron citas
            </h3>
            <p className="text-gray-500">
              No se encontraron citas con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Encabezado de la tabla (solo visible en pantallas grandes) */}
            <div className="hidden lg:grid lg:grid-cols-12 bg-gray-50 px-6 py-3 rounded-t-lg">
              <div className="lg:col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </div>
              <div className="lg:col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </div>
              {!isPsychologist && (
                <div className="lg:col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </div>
              )}
              <div
                className={`lg:col-span-${
                  isPsychologist ? "4" : "2"
                } text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Motivo
              </div>
              <div className="lg:col-span-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </div>
              <div className="lg:col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </div>
            </div>

            {/* Filas de citas */}
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 lg:p-0 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Vista para pantallas grandes (similar a tabla) */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:px-6 lg:py-4">
                  <div className="lg:col-span-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.client.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        DNI: {appointment.client.dni}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.client.situation === "ceprunsa"
                          ? "Postulante CEPRUNSA"
                          : "Particular"}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-900">
                        {new Date(
                          appointment.date + "T00:00:00"
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.time}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.modality === "presential"
                          ? "Presencial"
                          : "Virtual"}
                      </div>
                    </div>
                  </div>
                  {!isPsychologist && (
                    <div className="lg:col-span-2 text-sm text-gray-900">
                      {appointment.psychologistName}
                    </div>
                  )}
                  <div
                    className={`lg:col-span-${
                      isPsychologist ? "4" : "2"
                    } text-sm text-gray-900`}
                  >
                    {appointment.reasonName}
                  </div>
                  <div className="lg:col-span-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(
                        appointment.status
                      )}`}
                    >
                      {getStatusDisplayName(appointment.status)}
                    </span>
                  </div>
                  <div className="lg:col-span-2 text-right flex justify-end space-x-2">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </Link>
                    {(isAdmin ||
                      isCoordinator ||
                      (isPsychologist &&
                        appointment.status === "scheduled")) && (
                      <>
                        {(isAdmin || isCoordinator) && (
                          <Link
                            to={`/appointments/${appointment.id}/edit`}
                            className="p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors duration-200"
                            title="Editar cita"
                          >
                            <Edit size={18} />
                          </Link>
                        )}
                        {appointment.status === "scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                handleChangeStatusClick(
                                  appointment,
                                  "completed"
                                )
                              }
                              className="p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors duration-200"
                              title="Marcar como completada"
                            >
                              <CheckCircle size={18} />
                            </button>
                            {(isAdmin || isCoordinator) && (
                              <button
                                onClick={() =>
                                  handleChangeStatusClick(
                                    appointment,
                                    "cancelled"
                                  )
                                }
                                className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                                title="Cancelar cita"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleChangeStatusClick(appointment, "no-show")
                              }
                              className="p-2 rounded-md text-yellow-600 hover:bg-yellow-50 transition-colors duration-200"
                              title="Marcar como no asistió"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {(isAdmin || isCoordinator) && (
                      <button
                        onClick={() => handleDeleteClick(appointment)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Eliminar cita"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vista para pantallas pequeñas y medianas (tarjetas) */}
                <div className="lg:hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <div className="text-base font-medium text-gray-900">
                        {appointment.client.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        DNI: {appointment.client.dni}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(
                        appointment.status
                      )}`}
                    >
                      {getStatusDisplayName(appointment.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Fecha y hora:</p>
                      <p className="text-sm">
                        {new Date(
                          appointment.date + "T00:00:00"
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {!isPsychologist && (
                      <div>
                        <p className="text-xs text-gray-500">Psicólogo:</p>
                        <p className="text-sm">
                          {appointment.psychologistName}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Motivo:</p>
                      <p className="text-sm">{appointment.reasonName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Modalidad:</p>
                      <p className="text-sm">
                        {appointment.modality === "presential"
                          ? "Presencial"
                          : "Virtual"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3 border-t pt-3">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </Link>
                    {(isAdmin ||
                      isCoordinator ||
                      (isPsychologist &&
                        appointment.status === "scheduled")) && (
                      <>
                        {(isAdmin || isCoordinator) && (
                          <Link
                            to={`/appointments/${appointment.id}/edit`}
                            className="p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors duration-200"
                            title="Editar cita"
                          >
                            <Edit size={18} />
                          </Link>
                        )}
                        {appointment.status === "scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                handleChangeStatusClick(
                                  appointment,
                                  "completed"
                                )
                              }
                              className="p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors duration-200"
                              title="Marcar como completada"
                            >
                              <CheckCircle size={18} />
                            </button>
                            {(isAdmin || isCoordinator) && (
                              <button
                                onClick={() =>
                                  handleChangeStatusClick(
                                    appointment,
                                    "cancelled"
                                  )
                                }
                                className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                                title="Cancelar cita"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleChangeStatusClick(appointment, "no-show")
                              }
                              className="p-2 rounded-md text-yellow-600 hover:bg-yellow-50 transition-colors duration-200"
                              title="Marcar como no asistió"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {(isAdmin || isCoordinator) && (
                      <button
                        onClick={() => handleDeleteClick(appointment)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Eliminar cita"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {appointmentToDelete && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Eliminar cita
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar la cita de{" "}
                        <span className="font-semibold">
                          {appointmentToDelete.client.fullName}
                        </span>{" "}
                        programada para el{" "}
                        <span className="font-semibold">
                          {new Date(
                            appointmentToDelete.date + "T00:00:00"
                          ).toLocaleDateString()}{" "}
                          a las {appointmentToDelete.time}
                        </span>
                        ? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-danger sm:ml-3"
                  onClick={confirmDelete}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mt-3 sm:mt-0 sm:ml-3"
                  onClick={cancelDelete}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambio de estado */}
      {appointmentToChangeStatus.appointment &&
        appointmentToChangeStatus.newStatus && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      {appointmentToChangeStatus.newStatus === "completed" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : appointmentToChangeStatus.newStatus ===
                        "cancelled" ? (
                        <XCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        Cambiar estado de la cita
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas marcar la cita de{" "}
                          <span className="font-semibold">
                            {
                              appointmentToChangeStatus.appointment.client
                                .fullName
                            }
                          </span>{" "}
                          como{" "}
                          <span className="font-semibold">
                            {getStatusDisplayName(
                              appointmentToChangeStatus.newStatus
                            )}
                          </span>
                          ?
                        </p>
                        {appointmentToChangeStatus.newStatus ===
                          "completed" && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-700 mb-2">
                              Puedes agregar notas sobre la consulta en la
                              página de detalles después de marcarla como
                              completada.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`btn ${
                      appointmentToChangeStatus.newStatus === "completed"
                        ? "btn-primary"
                        : appointmentToChangeStatus.newStatus === "cancelled"
                        ? "btn-danger"
                        : "btn-warning"
                    } sm:ml-3`}
                    onClick={confirmChangeStatus}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mt-3 sm:mt-0 sm:ml-3"
                    onClick={cancelChangeStatus}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Appointments;
