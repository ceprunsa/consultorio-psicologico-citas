"use client";

import type React from "react";

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePsychologists } from "../hooks/usePsychologists";
import { useUsers } from "../hooks/useUsers";
import { Save, X, User, Mail, Phone, BadgeIcon as IdCard } from "lucide-react";
import toast from "react-hot-toast";
import type { Psychologist } from "../types";

const PsychologistForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { psychologistByIdQuery, savePsychologist, isSaving } =
    usePsychologists();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { data: existingPsychologist, isLoading: isLoadingPsychologist } =
    psychologistByIdQuery(id);

  // Estado inicial para el formulario
  const [formData, setFormData] = useState<Partial<Psychologist>>({
    fullName: "",
    dni: "",
    institutionalEmail: "",
    personalEmail: "",
    phone: "",
    userId: "",
  });

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (existingPsychologist) {
      setFormData(existingPsychologist);
    }
  }, [existingPsychologist]);

  // Manejar cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !formData.fullName ||
      !formData.dni ||
      !formData.institutionalEmail ||
      !formData.phone
    ) {
      toast.error("Todos los campos marcados con * son obligatorios");
      return;
    }

    try {
      // Preparar datos para guardar
      const psychologistData: Partial<Psychologist> = {
        ...formData,
        ...(id && { id }),
      };

      // Guardar psicólogo
      await savePsychologist(psychologistData);
      navigate("/psychologists");
    } catch (error) {
      console.error("Error al guardar psicólogo:", error);
      toast.error("Error al guardar el psicólogo");
    }
  };

  if (id && (isLoadingPsychologist || isLoadingUsers)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Filtrar usuarios con rol de psicólogo
  const psychologistUsers = users.filter(
    (user) => user.role === "psychologist"
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? "Editar Psicólogo" : "Nuevo Psicólogo"}
        </h1>
        <p className="text-gray-600">
          {id
            ? "Actualiza la información del psicólogo"
            : "Completa el formulario para registrar un nuevo psicólogo"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombres y Apellidos *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="dni"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                DNI *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  value={formData.dni || ""}
                  onChange={handleChange}
                  required
                  maxLength={8}
                  pattern="[0-9]{8}"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="institutionalEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Institucional *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="institutionalEmail"
                  name="institutionalEmail"
                  value={formData.institutionalEmail || ""}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="personalEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Personal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="personalEmail"
                  name="personalEmail"
                  value={formData.personalEmail || ""}
                  onChange={handleChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono de contacto *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Usuario del sistema (opcional)
              </label>
              <select
                id="userId"
                name="userId"
                value={formData.userId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin usuario asignado</option>
                {psychologistUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName || user.email}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Asignar un usuario con rol de psicólogo para permitir acceso al
                sistema
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            type="button"
            onClick={() => navigate("/psychologists")}
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

export default PsychologistForm;
