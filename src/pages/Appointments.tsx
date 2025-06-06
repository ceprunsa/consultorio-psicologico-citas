"use client";

import {
  useState,
  useEffect,
  type JSXElementConstructor,
  type Key,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
} from "react";
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
  Trash2,
  XCircle,
  AlertCircle,
  Info,
  FileText,
} from "lucide-react";
import type { Appointment } from "../types";
import toast from "react-hot-toast";
import { ExportModal } from "../components/ExportModal";
import { FileSpreadsheet } from "lucide-react";
import { AppointmentActionsMenu } from "../components/AppointmentActionsMenu";
import { AppointmentStatusBadge } from "../components/AppointmentStatusBadge";

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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para modal de confirmación
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [appointmentToChangeStatus, setAppointmentToChangeStatus] = useState<{
    appointment: Appointment | null;
    newStatus: Appointment["status"] | null;
  }>({ appointment: null, newStatus: null });

  // Estado para modal de exportación
  const [showExportModal, setShowExportModal] = useState(false);

  // Debugging
  useEffect(() => {
    console.log(
      `Usuario actual: ${user?.email}, Rol: ${user?.role}, Es psicólogo: ${isPsychologist}`
    );
    console.log(`Citas cargadas: ${appointments.length}`);
  }, [user, isPsychologist, appointments]);

  // Filtrar citas
  const allFilteredAppointments = appointments
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

  // Calcular paginación
  const totalItems = allFilteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredAppointments = allFilteredAppointments.slice(
    startIndex,
    endIndex
  );

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedPsychologist,
    selectedProcess,
    selectedReason,
    selectedStatus,
    selectedDate,
  ]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedPsychologist) count++;
    if (selectedProcess) count++;
    if (selectedReason) count++;
    if (selectedStatus) count++;
    if (selectedDate) count++;
    return count;
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
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-success inline-flex items-center"
          >
            <FileSpreadsheet size={18} className="mr-1 md:mr-2" />
            <span>Exportar Excel</span>
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
              className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

      {/* Mensaje informativo */}
      {(isAdmin || isCoordinator || isPsychologist) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Nota importante:</strong> Para completar una cita, debe
                acceder a los detalles de la cita y llenar obligatoriamente
                todos los campos: Diagnóstico Psicológico, Recomendaciones y
                Resultados. Los documentos PDF pueden subirse manualmente desde
                los detalles de cada cita.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de citas */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        {allFilteredAppointments.length === 0 ? (
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
          <>
            {/* Información de paginación y selector de elementos por página */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)}{" "}
                  de {totalItems} resultados
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="itemsPerPage"
                    className="text-sm text-gray-700"
                  >
                    Mostrar:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="text-sm border border-gray-300 rounded pl-2 pr-6 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Navegación de páginas */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {getPageNumbers().map(
                    (
                      page:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: Key | null | undefined
                    ) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number" && handlePageChange(page)
                        }
                        disabled={page === "..."}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                          page === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : page === "..."
                            ? "cursor-default"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            {/* Cabeceras de tabla - Solo en desktop */}
            <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Cliente</div>
                <div className="col-span-2">Fecha y Hora</div>
                {!isPsychologist && <div className="col-span-2">Psicólogo</div>}
                <div className={`col-span-${isPsychologist ? "4" : "2"}`}>
                  Motivo de Consulta
                </div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-2 text-right">Acciones</div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Información del cliente */}
                  <div className="lg:col-span-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.client.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        DNI: {appointment.client.dni}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.client.situation === "ceprunsa"
                          ? "CEPRUNSA"
                          : "Particular"}
                      </div>
                    </div>
                  </div>

                  {/* Fecha y hora */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(
                          appointment.date + "T00:00:00"
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.time}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.modality === "presential"
                          ? "Presencial"
                          : "Virtual"}
                      </div>
                    </div>
                  </div>

                  {/* Psicólogo (solo si no es psicólogo) */}
                  {!isPsychologist && (
                    <div className="lg:col-span-2">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.psychologistName}
                      </div>
                    </div>
                  )}

                  {/* Motivo */}
                  <div className={`lg:col-span-${isPsychologist ? "4" : "2"}`}>
                    <div className="text-sm text-gray-900">
                      {appointment.reasonName}
                    </div>
                    {appointment.processName && (
                      <div className="text-sm text-gray-500">
                        Proceso: {appointment.processName}
                      </div>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="lg:col-span-1">
                    <div className="flex flex-col gap-1">
                      <AppointmentStatusBadge
                        status={appointment.status}
                        size="sm"
                      />
                      {/* Indicador de documento */}
                      {appointment.document && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                          <FileText size={12} className="mr-1" />
                          PDF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="lg:col-span-2 flex justify-start lg:justify-end">
                    <AppointmentActionsMenu
                      appointment={appointment}
                      isAdmin={isAdmin}
                      isCoordinator={isCoordinator}
                      isPsychologist={isPsychologist}
                      onDelete={handleDeleteClick}
                      onChangeStatus={handleChangeStatusClick}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación inferior */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-center">
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {getPageNumbers().map(
                    (
                      page:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: Key | null | undefined
                    ) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number" && handlePageChange(page)
                        }
                        disabled={page === "..."}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                          page === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : page === "..."
                            ? "cursor-default"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
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
                        <strong>{appointmentToDelete.client.fullName}</strong>?
                        Esta acción no se puede deshacer.
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

      {/* Modal de confirmación para cambio de estado */}
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
                      {appointmentToChangeStatus.newStatus === "cancelled" ? (
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
                        {appointmentToChangeStatus.newStatus === "cancelled"
                          ? "Cancelar cita"
                          : "Marcar como no asistió"}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas{" "}
                          {appointmentToChangeStatus.newStatus === "cancelled"
                            ? "cancelar la cita"
                            : "marcar la cita como no asistió"}{" "}
                          de{" "}
                          <strong>
                            {
                              appointmentToChangeStatus.appointment.client
                                .fullName
                            }
                          </strong>
                          ?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`btn ${
                      appointmentToChangeStatus.newStatus === "cancelled"
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
      {/* Modal de exportación */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        appointments={allFilteredAppointments}
        currentFiltersCount={getActiveFiltersCount()}
      />
    </div>
  );
};

export default Appointments;
