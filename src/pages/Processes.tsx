"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useProcesses } from "../hooks/useProcesses";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { Process } from "../types";

const Processes = () => {
  const { processes, isLoading, isError, deleteProcess, toggleProcessStatus } =
    useProcesses();
  const [searchTerm, setSearchTerm] = useState("");
  const [processToDelete, setProcessToDelete] = useState<Process | null>(null);

  // Filtrar procesos por término de búsqueda
  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (process: Process) => {
    setProcessToDelete(process);
  };

  const handleToggleStatus = async (process: Process) => {
    try {
      await toggleProcessStatus(process.id, !process.isActive);
    } catch (error) {
      console.error("Error al cambiar estado del proceso:", error);
    }
  };

  const confirmDelete = async () => {
    if (!processToDelete || !processToDelete.id) return;

    try {
      await deleteProcess(processToDelete.id);
      setProcessToDelete(null);
    } catch (error) {
      console.error("Error al eliminar proceso:", error);
    }
  };

  const cancelDelete = () => {
    setProcessToDelete(null);
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
          No se pudieron cargar los procesos.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Procesos CEPRUNSA
          </h1>
          <p className="text-gray-600">Gestión de procesos de admisión</p>
        </div>
        <Link
          to="/processes/new"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus size={18} className="mr-1 md:mr-2" />
          <span>Nuevo Proceso</span>
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
            placeholder="Buscar proceso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de procesos */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        {filteredProcesses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {processes.length === 0
              ? "No hay procesos registrados"
              : "No se encontraron procesos con el término de búsqueda"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Encabezado de la tabla (solo visible en pantallas grandes) */}
            <div className="hidden lg:grid lg:grid-cols-12 bg-gray-50 px-6 py-3 rounded-t-lg">
              <div className="lg:col-span-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </div>
              <div className="lg:col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </div>
              <div className="lg:col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Fin
              </div>
              <div className="lg:col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </div>
            </div>

            {/* Filas de procesos */}
            {filteredProcesses.map((process) => (
              <div
                key={process.id}
                className="p-4 lg:p-0 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Vista para pantallas grandes (similar a tabla) */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:px-6 lg:py-4">
                  <div className="lg:col-span-4">
                    <div className="flex items-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          process.isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="text-sm font-medium text-gray-900">
                        {process.name}
                      </span>
                    </div>
                  </div>
                  <div className="lg:col-span-3 text-sm text-gray-500">
                    {new Date(process.startDate).toLocaleDateString()}
                  </div>
                  <div className="lg:col-span-3 text-sm text-gray-500">
                    {new Date(process.endDate).toLocaleDateString()}
                  </div>
                  <div className="lg:col-span-2 text-right flex justify-end space-x-2">
                    <button
                      onClick={() => handleToggleStatus(process)}
                      className={`p-2 rounded-md ${
                        process.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-600 hover:bg-gray-50"
                      } transition-colors duration-200`}
                      title={
                        process.isActive
                          ? "Desactivar proceso"
                          : "Activar proceso"
                      }
                    >
                      {process.isActive ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                    </button>
                    <Link
                      to={`/processes/${process.id}`}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      title="Editar proceso"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(process)}
                      className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                      title="Eliminar proceso"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Vista para pantallas pequeñas y medianas (tarjetas) */}
                <div className="lg:hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          process.isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                      <h3 className="text-base font-medium text-gray-900">
                        {process.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(process)}
                        className={`p-2 rounded-md ${
                          process.isActive
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-600 hover:bg-gray-50"
                        } transition-colors duration-200`}
                        title={
                          process.isActive
                            ? "Desactivar proceso"
                            : "Activar proceso"
                        }
                      >
                        {process.isActive ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>
                      <Link
                        to={`/processes/${process.id}`}
                        className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        title="Editar proceso"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(process)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Eliminar proceso"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        Inicio:{" "}
                        {new Date(process.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        Fin: {new Date(process.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        process.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {process.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {processToDelete && (
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
                      Eliminar proceso
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar el proceso{" "}
                        <span className="font-semibold">
                          {processToDelete.name}
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

export default Processes;
