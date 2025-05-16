"use client";

import type React from "react";

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { usePsychologists } from "../hooks/usePsychologists";
import { useProcesses } from "../hooks/useProcesses";
import { useConsultationReasons } from "../hooks/useConsultationReasons";
import { Save, X, Calendar, Clock, MapPin, LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { Appointment, Client } from "../types";

const AppointmentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointmentByIdQuery, saveAppointment, isSaving } = useAppointments();
  const { psychologists, isLoading: isLoadingPsychologists } =
    usePsychologists();
  const { processes, isLoading: isLoadingProcesses } = useProcesses();
  const { reasons, isLoading: isLoadingReasons } = useConsultationReasons();

  const { data: existingAppointment, isLoading: isLoadingAppointment } =
    appointmentByIdQuery(id);

  // Estado inicial para el formulario
  const [formData, setFormData] = useState<Partial<Appointment>>({
    client: {
      fullName: "",
      dni: "",
      situation: "ceprunsa",
      phone: "",
      email: "",
    } as Client,
    processId: "",
    processName: "",
    reasonId: "",
    reasonName: "",
    date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
    time: "08:00",
    modality: "presential",
    location: "Local CEPRUNSA",
    psychologistId: "",
    psychologistName: "",
    status: "scheduled",
  });

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (existingAppointment) {
      setFormData(existingAppointment);
    }
  }, [existingAppointment]);

  // Manejar cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Manejar campos anidados (client)
    if (name.startsWith("client.")) {
      const clientField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        client: {
          ...prev.client!,
          [clientField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Manejar cambios en selects con nombres adicionales
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    idField: string,
    nameField: string
  ) => {
    const { value } = e.target;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const name = selectedOption.text;

    setFormData((prev) => ({
      ...prev,
      [idField]: value,
      [nameField]: name,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.client?.fullName || !formData.client?.dni) {
      toast.error("El nombre y DNI del cliente son obligatorios");
      return;
    }

    if (!formData.psychologistId) {
      toast.error("Debe seleccionar un psicólogo");
      return;
    }

    if (!formData.reasonId) {
      toast.error("Debe seleccionar un motivo de consulta");
      return;
    }

    try {
      // Si es modalidad virtual, asegurarse de que haya un enlace
      if (formData.modality === "virtual" && !formData.location) {
        toast.error("Debe proporcionar un enlace para la cita virtual");
        return;
      }

      // Preparar datos para guardar
      const appointmentData: Partial<Appointment> = {
        ...formData,
        ...(id && { id }),
      };

      // Guardar cita
      await saveAppointment(appointmentData);
      navigate("/appointments");
    } catch (error) {
      console.error("Error al guardar cita:", error);
      toast.error("Error al guardar la cita");
    }
  };

  if (
    id &&
    (isLoadingAppointment ||
      isLoadingPsychologists ||
      isLoadingProcesses ||
      isLoadingReasons)
  ) {
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
          {id ? "Editar Cita" : "Nueva Cita"}
        </h1>
        <p className="text-gray-600">
          {id
            ? "Actualiza la información de la cita psicológica"
            : "Completa el formulario para agendar una nueva cita psicológica"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg overflow-hidden"
      >
        {/* Información del cliente */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="client.fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombres y Apellidos *
              </label>
              <input
                type="text"
                id="client.fullName"
                name="client.fullName"
                value={formData.client?.fullName || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="client.dni"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                DNI *
              </label>
              <input
                type="text"
                id="client.dni"
                name="client.dni"
                value={formData.client?.dni || ""}
                onChange={handleChange}
                required
                maxLength={8}
                pattern="[0-9]{8}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="client.situation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Situación *
              </label>
              <select
                id="client.situation"
                name="client.situation"
                value={formData.client?.situation || "ceprunsa"}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ceprunsa">Postulante CEPRUNSA</option>
                <option value="particular">Particular</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="processId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Proceso CEPRUNSA
              </label>
              <select
                id="processId"
                name="processId"
                value={formData.processId || ""}
                onChange={(e) =>
                  handleSelectChange(e, "processId", "processName")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={formData.client?.situation !== "ceprunsa"}
              >
                <option value="">Seleccione un proceso</option>
                {processes
                  .filter((process) => process.isActive)
                  .map((process) => (
                    <option key={process.id} value={process.id}>
                      {process.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="client.phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono de contacto *
              </label>
              <input
                type="tel"
                id="client.phone"
                name="client.phone"
                value={formData.client?.phone || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="client.email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico *
              </label>
              <input
                type="email"
                id="client.email"
                name="client.email"
                value={formData.client?.email || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Detalles de la cita */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de la Cita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reasonId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motivo de consulta *
              </label>
              <select
                id="reasonId"
                name="reasonId"
                value={formData.reasonId || ""}
                onChange={(e) =>
                  handleSelectChange(e, "reasonId", "reasonName")
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un motivo</option>
                {reasons
                  .filter((reason) => reason.isActive)
                  .map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="psychologistId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Psicólogo asignado *
              </label>
              <select
                id="psychologistId"
                name="psychologistId"
                value={formData.psychologistId || ""}
                onChange={(e) =>
                  handleSelectChange(e, "psychologistId", "psychologistName")
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un psicólogo</option>
                {psychologists.map((psychologist) => (
                  <option key={psychologist.id} value={psychologist.id}>
                    {psychologist.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hora *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time || ""}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="modality"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Modalidad *
              </label>
              <select
                id="modality"
                name="modality"
                value={formData.modality || "presential"}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="presential">Presencial</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {formData.modality === "presential"
                  ? "Dirección"
                  : "Enlace de reunión"}{" "}
                *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.modality === "presential" ? (
                    <MapPin className="h-5 w-5 text-gray-400" />
                  ) : (
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type={formData.modality === "virtual" ? "url" : "text"}
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder={
                    formData.modality === "presential"
                      ? "Local CEPRUNSA"
                      : "https://meet.google.com/..."
                  }
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className="btn btn-secondary mr-3 inline-flex items-center"
          >
            <X size={18} className="mr-2" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary inline-flex items-center"
          >
            <Save size={18} className="mr-2" />
            <span>{isSaving ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
