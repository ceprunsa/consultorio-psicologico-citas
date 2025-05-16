"use client";

import type React from "react";

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConsultationReasons } from "../hooks/useConsultationReasons";
import { Save, X, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import type { ConsultationReason } from "../types";

const ConsultationReasonForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reasonByIdQuery, saveReason, isSaving } = useConsultationReasons();
  const { data: existingReason, isLoading } = reasonByIdQuery(id);

  // Estado inicial para el formulario
  const [formData, setFormData] = useState<Partial<ConsultationReason>>({
    name: "",
    description: "",
    isActive: true,
  });

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (existingReason) {
      setFormData(existingReason);
    }
  }, [existingReason]);

  // Manejar cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Manejar cambio en el toggle de estado activo
  const handleToggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.name) {
      toast.error("El nombre del motivo es obligatorio");
      return;
    }

    try {
      // Preparar datos para guardar
      const reasonData: Partial<ConsultationReason> = {
        ...formData,
        ...(id && { id }), // Solo incluir id si estamos editando
      };

      // Guardar motivo
      await saveReason(reasonData);
      navigate("/reasons");
    } catch (error) {
      console.error("Error al guardar motivo:", error);
      toast.error("Error al guardar el motivo de consulta");
    }
  };

  if (id && isLoading) {
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
          {id ? "Editar Motivo de Consulta" : "Nuevo Motivo de Consulta"}
        </h1>
        <p className="text-gray-600">
          {id
            ? "Actualiza la información del motivo de consulta"
            : "Completa el formulario para registrar un nuevo motivo de consulta"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Motivo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Ansiedad, Depresión, Orientación vocacional"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Descripción detallada del motivo de consulta"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`flex items-center text-sm font-medium ${
                    formData.isActive ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {formData.isActive ? (
                    <ToggleRight className="h-6 w-6 mr-2" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 mr-2" />
                  )}
                  {formData.isActive ? "Motivo Activo" : "Motivo Inactivo"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Los motivos activos aparecerán en las listas de selección al
                crear citas
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            type="button"
            onClick={() => navigate("/reasons")}
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

export default ConsultationReasonForm;
