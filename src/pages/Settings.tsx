"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSettings, type SystemSettings } from "../hooks/useSettings";
import {
  SettingsIcon,
  Save,
  Database,
  Calendar,
  Info,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const { isAdmin } = useAuth();
  const { settings, saveSettings, isLoading, isSaving } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  // Estado local para configuraciones
  const [generalSettings, setGeneralSettings] = useState<
    SystemSettings["general"]
  >({
    centerName: "",
    centerEmail: "",
    centerPhone: "",
    centerAddress: "",
  });

  // Estado para configuraciones de citas
  const [appointmentSettings, setAppointmentSettings] = useState<
    SystemSettings["appointments"]
  >({
    defaultDuration: "",
    minTimeAdvance: "",
    maxAppointmentsPerDay: "",
    workingHoursStart: "",
    workingHoursEnd: "",
    workingDays: [],
  });

  // Cargar configuraciones cuando estén disponibles
  useEffect(() => {
    if (settings) {
      setGeneralSettings(settings.general);
      setAppointmentSettings(settings.appointments);
      setHasChanges(false); // Resetear el estado de cambios al cargar nuevos datos
    }
  }, [settings]);

  // Manejar cambios en configuraciones generales
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  // Manejar cambios en configuraciones de citas
  const handleAppointmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAppointmentSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  // Manejar cambios en días laborables
  const handleWorkingDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setAppointmentSettings((prev) => {
      const newWorkingDays = checked
        ? [...prev.workingDays, value]
        : prev.workingDays.filter((day) => day !== value);

      return {
        ...prev,
        workingDays: newWorkingDays,
      };
    });
    setHasChanges(true);
  };

  // Validar configuraciones antes de guardar
  const validateSettings = () => {
    // Validar configuraciones generales
    if (!generalSettings.centerName.trim()) {
      toast.error("El nombre del centro es obligatorio");
      setActiveTab("general");
      return false;
    }

    if (!generalSettings.centerEmail.trim()) {
      toast.error("El correo electrónico del centro es obligatorio");
      setActiveTab("general");
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(generalSettings.centerEmail)) {
      toast.error("El formato del correo electrónico no es válido");
      setActiveTab("general");
      return false;
    }

    // Validar configuraciones de citas
    if (
      !appointmentSettings.defaultDuration ||
      Number.parseInt(appointmentSettings.defaultDuration) < 15
    ) {
      toast.error("La duración predeterminada debe ser al menos 15 minutos");
      setActiveTab("appointments");
      return false;
    }

    if (!appointmentSettings.minTimeAdvance) {
      toast.error("El tiempo mínimo de anticipación es obligatorio");
      setActiveTab("appointments");
      return false;
    }

    if (!appointmentSettings.maxAppointmentsPerDay) {
      toast.error("El máximo de citas por día es obligatorio");
      setActiveTab("appointments");
      return false;
    }

    if (
      !appointmentSettings.workingHoursStart ||
      !appointmentSettings.workingHoursEnd
    ) {
      toast.error("Las horas de trabajo son obligatorias");
      setActiveTab("appointments");
      return false;
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    if (
      appointmentSettings.workingHoursStart >=
      appointmentSettings.workingHoursEnd
    ) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio");
      setActiveTab("appointments");
      return false;
    }

    if (appointmentSettings.workingDays.length === 0) {
      toast.error("Debe seleccionar al menos un día laborable");
      setActiveTab("appointments");
      return false;
    }

    return true;
  };

  // Guardar configuraciones
  const handleSaveSettings = async () => {
    if (!isAdmin) {
      toast.error("No tienes permisos para modificar la configuración");
      return;
    }

    if (!validateSettings()) {
      return;
    }

    try {
      const updatedSettings: SystemSettings = {
        general: generalSettings,
        appointments: appointmentSettings,
      };

      await saveSettings(updatedSettings);
      setHasChanges(false);
    } catch (error) {
      console.error("Error al guardar configuraciones:", error);
      toast.error("Error al guardar configuraciones");
    }
  };

  // Cancelar cambios
  const handleCancelChanges = () => {
    if (settings) {
      setGeneralSettings(settings.general);
      setAppointmentSettings(settings.appointments);
      setHasChanges(false);
      toast.success("Cambios descartados");
    }
  };

  // Renderizar pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información del Centro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="centerName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre del Centro <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="centerName"
                    name="centerName"
                    value={generalSettings.centerName}
                    onChange={handleGeneralChange}
                    disabled={!isAdmin || isSaving}
                    placeholder="Ej: Consultorio Psicológico CEPRUNSA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="centerEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="centerEmail"
                    name="centerEmail"
                    value={generalSettings.centerEmail}
                    onChange={handleGeneralChange}
                    disabled={!isAdmin || isSaving}
                    placeholder="Ej: consultorio.psicologico@ceprunsa.edu.pe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="centerPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="centerPhone"
                    name="centerPhone"
                    value={generalSettings.centerPhone}
                    onChange={handleGeneralChange}
                    disabled={!isAdmin || isSaving}
                    placeholder="Ej: 054-123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="centerAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="centerAddress"
                    name="centerAddress"
                    value={generalSettings.centerAddress}
                    onChange={handleGeneralChange}
                    disabled={!isAdmin || isSaving}
                    placeholder="Ej: Local CEPRUNSA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case "appointments":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configuración de Citas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="defaultDuration"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Duración predeterminada (minutos){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="defaultDuration"
                    name="defaultDuration"
                    value={appointmentSettings.defaultDuration}
                    onChange={handleAppointmentChange}
                    disabled={!isAdmin || isSaving}
                    min="15"
                    max="120"
                    step="15"
                    placeholder="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valores recomendados: 30, 45, 60 minutos
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="minTimeAdvance"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tiempo mínimo de anticipación (horas){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="minTimeAdvance"
                    name="minTimeAdvance"
                    value={appointmentSettings.minTimeAdvance}
                    onChange={handleAppointmentChange}
                    disabled={!isAdmin || isSaving}
                    min="1"
                    max="72"
                    placeholder="24"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo mínimo para programar una cita
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="maxAppointmentsPerDay"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Máximo de citas por día{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="maxAppointmentsPerDay"
                    name="maxAppointmentsPerDay"
                    value={appointmentSettings.maxAppointmentsPerDay}
                    onChange={handleAppointmentChange}
                    disabled={!isAdmin || isSaving}
                    min="1"
                    max="20"
                    placeholder="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="workingHoursStart"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hora de inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="workingHoursStart"
                      name="workingHoursStart"
                      value={appointmentSettings.workingHoursStart}
                      onChange={handleAppointmentChange}
                      disabled={!isAdmin || isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="workingHoursEnd"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hora de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="workingHoursEnd"
                      name="workingHoursEnd"
                      value={appointmentSettings.workingHoursEnd}
                      onChange={handleAppointmentChange}
                      disabled={!isAdmin || isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días laborables <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: "1", label: "Lunes" },
                      { value: "2", label: "Martes" },
                      { value: "3", label: "Miércoles" },
                      { value: "4", label: "Jueves" },
                      { value: "5", label: "Viernes" },
                      { value: "6", label: "Sábado" },
                      { value: "0", label: "Domingo" },
                    ].map((day) => (
                      <div key={day.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`day-${day.value}`}
                          name="workingDays"
                          value={day.value}
                          checked={appointmentSettings.workingDays.includes(
                            day.value
                          )}
                          onChange={handleWorkingDayChange}
                          disabled={!isAdmin || isSaving}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label
                          htmlFor={`day-${day.value}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acerca del Sistema
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-[#1A2855] text-white p-2 rounded-lg mr-3">
                    <SettingsIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Sistema de Gestión de Citas Psicológicas
                    </h4>
                    <p className="text-sm text-gray-500">Versión 1.0.0</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Sistema desarrollado para el Consultorio Psicológico del
                  Centro Pre-Universitario de la Universidad Nacional de San
                  Agustín (CEPRUNSA).
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Características principales:
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Gestión de citas psicológicas</li>
                    <li>Registro de psicólogos</li>
                    <li>Administración de procesos CEPRUNSA</li>
                    <li>Gestión de motivos de consulta</li>
                    <li>Control de acceso por roles</li>
                    <li>Reportes y estadísticas</li>
                  </ul>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Tecnologías utilizadas:
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>React</li>
                    <li>TypeScript</li>
                    <li>Firebase (Firestore, Authentication)</li>
                    <li>React Query</li>
                    <li>Tailwind CSS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600">
          {isAdmin
            ? "Administra las configuraciones generales del sistema"
            : "Visualiza las configuraciones generales del sistema"}
        </p>
      </div>

      {hasChanges && isAdmin && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Hay cambios sin guardar. Asegúrate de guardar los cambios antes de
              salir de esta página.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar de navegación */}
          <div className="w-full md:w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "general"
                    ? "bg-[#1A2855] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Database className="mr-3 h-5 w-5" />
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "appointments"
                    ? "bg-[#1A2855] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="mr-3 h-5 w-5" />
                <span>Citas</span>
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "about"
                    ? "bg-[#1A2855] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Info className="mr-3 h-5 w-5" />
                <span>Acerca de</span>
              </button>
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-6">
            {renderActiveTab()}

            {/* Botones de acción (solo para pestañas con formularios y solo para admin) */}
            {activeTab !== "about" && isAdmin && (
              <div className="mt-6 flex justify-end space-x-3">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleCancelChanges}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving || !hasChanges}
                  className="btn btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      <span>Guardar Configuración</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
