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

  const [formData, setFormData] = useState<Partial<User>>({
    email: "",
    role: "user" as const,
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
      const userData: Partial<User> = {
        ...formData,
        role: formData.role as
          | "admin"
          | "coordinator"
          | "psychologist"
          | "user",
      };

      saveUser(userData);
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
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rol
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role || "user"}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="user">Usuario</option>
                      <option value="psychologist">Psicólogo</option>
                      <option value="coordinator">Coordinador</option>
                      <option value="admin">Administrador</option>
                    </select>
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
