"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import toast from "react-hot-toast";
import type { User } from "../types";
import { Save, X } from "lucide-react";

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userByIdQuery, saveUser, isSaving } = useUsers();
  const { data: existingUser, isLoading } = userByIdQuery(id);

  // Cambiar el estado inicial para incluir solo email y rol
  const [formData, setFormData] = useState<Partial<User>>({
    email: "",
    role: "user" as const, // Especificar el tipo literal
  });

  useEffect(() => {
    if (existingUser) {
      setFormData({
        id: existingUser.id,
        email: existingUser.email || "",
        role: existingUser.role || "user",
      });
    }
  }, [existingUser]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("El correo electrónico es requerido");
      return;
    }

    try {
      // Para usuarios administradores, establecer explícitamente el rol
      const userData: Partial<User> = {
        ...formData,
        // Asegurar que el rol sea del tipo correcto
        role: formData.role === "admin" ? "admin" : "user",
      };

      // Llamar a saveUser y manejar la promesa correctamente
      saveUser(userData);

      // No necesitamos await aquí porque saveUser es una función de mutación de React Query
      // que no devuelve una promesa directamente, sino que maneja la mutación internamente

      navigate("/users");
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar usuario"
      );
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
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {id ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {id
                ? "Actualiza la información del usuario"
                : "Completa la información para crear un nuevo usuario"}
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-4">
                    <div className="flex items-center mt-4">
                      <input
                        id="isAdmin"
                        name="isAdmin"
                        type="checkbox"
                        checked={formData.role === "admin"}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            role: e.target.checked ? "admin" : "user",
                          }));
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isAdmin"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Crear como administrador
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate("/users")}
                  className="btn btn-secondary mr-3 inline-flex items-center"
                  title="Cancelar"
                >
                  <X size={18} className="mr-2" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary inline-flex items-center"
                  title="Guardar usuario"
                >
                  <Save size={18} className="mr-2" />
                  <span>{isSaving ? "Guardando..." : "Guardar"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
