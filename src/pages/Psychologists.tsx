"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { usePsychologists } from "../hooks/usePsychologists";
import { Plus, Edit, Trash2, Search, Mail, Phone } from "lucide-react";
import type { Psychologist } from "../types";

const Psychologists = () => {
  const { psychologists, isLoading, isError, deletePsychologist } =
    usePsychologists();
  const [searchTerm, setSearchTerm] = useState("");
  const [psychologistToDelete, setPsychologistToDelete] =
    useState<Psychologist | null>(null);

  // Filtrar psicólogos por término de búsqueda
  const filteredPsychologists = psychologists.filter(
    (psychologist) =>
      psychologist.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psychologist.dni.includes(searchTerm) ||
      psychologist.institutionalEmail
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (psychologist: Psychologist) => {
    setPsychologistToDelete(psychologist);
  };

  const confirmDelete = async () => {
    if (!psychologistToDelete || !psychologistToDelete.id) return;

    try {
      await deletePsychologist(psychologistToDelete.id);
      setPsychologistToDelete(null);
    } catch (error) {
      console.error("Error al eliminar psicólogo:", error);
    }
  };

  const cancelDelete = () => {
    setPsychologistToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">
          {" "}
          No se pudieron cargar los psicólogos.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Psicólogos
          </h1>
          <p className="text-gray-600">Gestión de psicólogos del consultorio</p>
        </div>
        <Link
          to="/psychologists/new"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus size={18} className="mr-1 md:mr-2" />
          <span>Nuevo Psicólogo</span>
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar por nombre, DNI o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de psicólogos */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        {filteredPsychologists.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {psychologists.length === 0
              ? "No hay psicólogos registrados"
              : "No se encontraron psicólogos con el término de búsqueda"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Encabezado de la tabla (solo visible en pantallas grandes) */}
            <div className="hidden lg:grid lg:grid-cols-12 bg-gray-50 px-6 py-3 rounded-t-lg">
              <div className="lg:col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </div>
              <div className="lg:col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI
              </div>
              <div className="lg:col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo Institucional
              </div>
              <div className="lg:col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </div>
              <div className="lg:col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </div>
            </div>

            {/* Filas de psicólogos */}
            {filteredPsychologists.map((psychologist) => (
              <div
                key={psychologist.id}
                className="p-4 lg:p-0 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Vista para pantallas grandes (similar a tabla) */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:px-6 lg:py-4">
                  <div className="lg:col-span-3 text-sm font-medium text-gray-900">
                    {psychologist.fullName}
                  </div>
                  <div className="lg:col-span-2 text-sm text-gray-500">
                    {psychologist.dni}
                  </div>
                  <div className="lg:col-span-3 text-sm text-gray-500">
                    {psychologist.institutionalEmail}
                  </div>
                  <div className="lg:col-span-2 text-sm text-gray-500">
                    {psychologist.phone}
                  </div>
                  <div className="lg:col-span-2 text-right flex justify-end space-x-2">
                    <Link
                      to={`/psychologists/${psychologist.id}`}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      title="Editar psicólogo"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(psychologist)}
                      className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                      title="Eliminar psicólogo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Vista para pantallas pequeñas y medianas (tarjetas) */}
                <div className="lg:hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {psychologist.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        DNI: {psychologist.dni}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/psychologists/${psychologist.id}`}
                        className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        title="Editar psicólogo"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(psychologist)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Eliminar psicólogo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {psychologist.institutionalEmail}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {psychologist.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {psychologistToDelete && (
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
                      Eliminar psicólogo
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar a{" "}
                        <span className="font-semibold">
                          {psychologistToDelete.fullName}
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
    </div>
  );
};

export default Psychologists;
