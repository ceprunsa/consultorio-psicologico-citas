"use client";

import type React from "react";

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { usePsychologists } from "../hooks/usePsychologists";
import { useProcesses } from "../hooks/useProcesses";
import { useConsultationReasons } from "../hooks/useConsultationReasons";
import { useAuth } from "../hooks/useAuth";
import {
  Save,
  X,
  Calendar,
  Clock,
  MapPin,
  LinkIcon,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
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
  const { isAdmin, isCoordinator, isPsychologist } = useAuth();

  const { data: existingAppointment, isLoading: isLoadingAppointment } =
    appointmentByIdQuery(id);
  const [copied, setCopied] = useState(false);

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

  // Verificar permisos de acceso
  useEffect(() => {
    // Los psicólogos no pueden crear ni editar citas
    if (isPsychologist && !isAdmin && !isCoordinator) {
      toast.error("No tienes permisos para crear o editar citas");
      navigate("/appointments");
    }

    // Si estamos editando una cita, verificar que el usuario tenga permisos
    if (id && existingAppointment) {
      // Solo admin y coordinador pueden editar cualquier cita
      if (!isAdmin && !isCoordinator) {
        toast.error("No tienes permisos para editar esta cita");
        navigate("/appointments");
      }
    }
  }, [
    id,
    existingAppointment,
    isAdmin,
    isCoordinator,
    isPsychologist,
    navigate,
  ]);

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
        ...(id ? { id } : {}),
      };

      // Guardar cita
      await saveAppointment(appointmentData);
      toast.success(
        id ? "Cita actualizada correctamente" : "Cita creada correctamente"
      );
      navigate("/appointments");
    } catch (error) {
      console.error("Error al guardar cita:", error);
      toast.error("Error al guardar la cita");
    }
  };

  // Función para formatear la fecha en formato legible
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para convertir hora de formato 24h a 12h con AM/PM
  const formatTime12h = (time24h: string) => {
    if (!time24h) return "";

    // Extraer horas y minutos
    const [hours, minutes] = time24h.split(":").map(Number);

    // Determinar AM o PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convertir a formato 12h
    const hours12 = hours % 12 || 12;

    // Formatear la hora con minutos y periodo
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Generar mensaje de correo electrónico
  const generateEmailMessage = () => {
    if (!formData.client?.fullName || !formData.date || !formData.time)
      return "";

    const formattedDate = formatDate(formData.date);
    const formattedTime = formatTime12h(formData.time);

    let locationInfo = "";
    if (formData.modality === "virtual") {
      locationInfo = `Enlace para la reunión : ${formData.location}`;
    } else {
      locationInfo = "Lugar:  Local Ceprunsa - Calle San Agustín 108, Arequipa";
    }

    return `Estimado/a postulante: ${formData.client.fullName}
Reciba un cordial saludo.
Por medio del presente, nos es grato confirmar su cita en el Consultorio Psicológico del CEPRUNSA, la cual se llevará a cabo de manera ${
      formData.modality === "virtual" ? "virtual" : "presencial"
    }. A continuación, le proporcionamos los detalles de su cita:

Fecha : ${formattedDate}
Hora : ${formattedTime}
${locationInfo}

${
  formData.modality === "virtual"
    ? "Le solicitamos acceder al enlace con unos minutos de anticipación para garantizar el buen desarrollo de la sesión. "
    : ""
}En caso de requerir asistencia técnica o tener alguna duda, no dude en contactarnos a través de este medio.
Agradecemos su puntualidad y compromiso.

Atentamente,
Consultorio Psicológico CEPRUNSA`;
  };

  // Copiar mensaje al portapapeles - Implementación completamente nueva y robusta
  const copyToClipboard = () => {
    try {
      // Crear un elemento textarea temporal
      const textarea = document.createElement("textarea");

      // Establecer el valor del textarea con el mensaje generado
      textarea.value = generateEmailMessage();

      // Asegurarse de que el textarea mantenga los saltos de línea
      textarea.style.whiteSpace = "pre-wrap";

      // Hacer que el textarea sea parte del DOM pero no visible
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";

      // Añadir el textarea al documento
      document.body.appendChild(textarea);

      // Seleccionar todo el texto
      textarea.select();
      textarea.setSelectionRange(0, 99999); // Para dispositivos móviles

      // Ejecutar el comando de copia
      const successful = document.execCommand("copy");

      // Eliminar el textarea temporal
      document.body.removeChild(textarea);

      // Mostrar mensaje de éxito o error
      if (successful) {
        setCopied(true);
        toast.success("Mensaje copiado al portapapeles");

        // Resetear el estado después de 3 segundos
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } else {
        toast.error(
          "No se pudo copiar el mensaje. Intente seleccionarlo manualmente."
        );
      }
    } catch (err) {
      console.error("Error al copiar:", err);
      toast.error(
        "Error al copiar el mensaje. Intente seleccionarlo manualmente."
      );
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

  // Si el usuario no tiene permisos, mostrar mensaje
  if (!isAdmin && !isCoordinator) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center text-amber-600 mb-4">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Acceso restringido</h2>
        </div>
        <p className="text-gray-600 mb-4">
          No tienes permisos para crear o editar citas. Solo los administradores
          y coordinadores pueden realizar esta acción.
        </p>
        <button
          onClick={() => navigate("/appointments")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver a la lista de citas
        </button>
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
                  Hora *{" "}
                  <span className="text-xs text-gray-500">
                    ({formData.time ? formatTime12h(formData.time) : ""})
                  </span>
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

        {/* Mensaje para correo electrónico */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Mensaje para el Cliente
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "¡Copiado!" : "Copiar mensaje"}
              </button>
            </div>
          </div>
          <div className="bg-white border border-gray-300 rounded-md p-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-blue-800 text-sm">
              <p className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Copie este mensaje y péguelo en su cliente de correo
                  electrónico para enviarlo al paciente.
                </span>
              </p>
            </div>
            <div className="email-preview p-5 border rounded-md bg-white">
              <div
                className="email-content"
                style={{ lineHeight: "1.6", fontFamily: "Arial, sans-serif" }}
              >
                <p style={{ marginBottom: "16px" }}>
                  <strong>Estimado/a postulante:</strong>{" "}
                  {formData.client?.fullName}
                </p>
                <p style={{ marginBottom: "16px" }}>
                  Reciba un cordial saludo.
                </p>
                <p style={{ marginBottom: "16px" }}>
                  Por medio del presente, nos es grato confirmar su cita en el
                  Consultorio Psicológico del CEPRUNSA, la cual se llevará a
                  cabo de manera{" "}
                  <strong>
                    {formData.modality === "virtual" ? "virtual" : "presencial"}
                  </strong>
                  . A continuación, le proporcionamos los detalles de su cita:
                </p>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "16px",
                    borderRadius: "4px",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ margin: "8px 0" }}>
                    <strong>Fecha:</strong> {formatDate(formData.date || "")}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Hora:</strong> {formatTime12h(formData.time || "")}
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>
                      {formData.modality === "virtual"
                        ? "Enlace para la reunión:"
                        : "Lugar:"}
                    </strong>{" "}
                    {formData.modality === "virtual"
                      ? formData.location
                      : "Local Ceprunsa - Calle San Agustín 108, Arequipa"}
                  </p>
                </div>
                <p style={{ marginBottom: "16px" }}>
                  {formData.modality === "virtual"
                    ? "Le solicitamos acceder al enlace con unos minutos de anticipación para garantizar el buen desarrollo de la sesión. "
                    : ""}
                  En caso de requerir asistencia técnica o tener alguna duda, no
                  dude en contactarnos a través de este medio.
                </p>
                <p style={{ marginBottom: "16px" }}>
                  Agradecemos su puntualidad y compromiso.
                </p>
                <p style={{ marginBottom: "8px" }}>Atentamente,</p>
                <p style={{ fontWeight: "bold" }}>
                  Consultorio Psicológico CEPRUNSA
                </p>
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
