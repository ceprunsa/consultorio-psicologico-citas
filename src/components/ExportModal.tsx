"use client";

import { useState } from "react";
import {
  X,
  Download,
  Calendar,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import type { Appointment } from "../types";
import {
  exportAppointmentsToExcel,
  validateDateRange,
} from "../utils/excelExport";
import toast from "react-hot-toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  currentFiltersCount: number;
}

export const ExportModal = ({
  isOpen,
  onClose,
  appointments,
  currentFiltersCount,
}: ExportModalProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<
    "all" | "filtered" | "dateRange"
  >("filtered");

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const appointmentsToExport = appointments;
      const exportOptions: any = {};

      // Validar rango de fechas si se especifica
      if (exportType === "dateRange") {
        const dateError = validateDateRange(startDate, endDate);
        if (dateError) {
          toast.error(dateError);
          return;
        }

        if (!startDate && !endDate) {
          toast.error("Debe especificar al menos una fecha para el rango");
          return;
        }

        exportOptions.startDate = startDate;
        exportOptions.endDate = endDate;
      }

      // Exportar según el tipo seleccionado
      const result = exportAppointmentsToExcel(
        appointmentsToExport,
        exportOptions
      );

      if ((await result).success) {
        toast.success(
          `Excel generado exitosamente. ${
            (await result).recordsExported
          } registros exportados.`
        );
        onClose();

        // Limpiar formulario
        setStartDate("");
        setEndDate("");
        setExportType("filtered");
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al generar el archivo Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const getExportDescription = () => {
    switch (exportType) {
      case "all":
        return `Se exportarán todas las ${appointments.length} citas del sistema`;
      case "filtered":
        return currentFiltersCount > 0
          ? `Se exportarán las ${appointments.length} citas que coinciden con los filtros actuales`
          : `Se exportarán todas las ${appointments.length} citas (no hay filtros activos)`;
      case "dateRange":
        return "Se exportarán las citas dentro del rango de fechas especificado";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Exportar a Excel
                  </h3>
                  <p className="text-sm text-gray-500">
                    Descargar datos de citas en formato Excel
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Opciones de exportación */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Seleccionar datos a exportar:
                </label>

                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="exportType"
                      value="filtered"
                      checked={exportType === "filtered"}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Citas con filtros actuales
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentFiltersCount > 0
                          ? `${appointments.length} citas que coinciden con los filtros`
                          : `Todas las ${appointments.length} citas (no hay filtros activos)`}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="exportType"
                      value="all"
                      checked={exportType === "all"}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Todas las citas
                      </div>
                      <div className="text-sm text-gray-500">
                        Ignorar filtros y exportar todas las{" "}
                        {appointments.length} citas
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="exportType"
                      value="dateRange"
                      checked={exportType === "dateRange"}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Rango de fechas específico
                      </div>
                      <div className="text-sm text-gray-500">
                        Exportar citas dentro de un rango de fechas
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Selector de rango de fechas */}
              {exportType === "dateRange" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Calendar size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Seleccionar rango de fechas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fecha de fin
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Puede especificar solo una fecha para un rango abierto
                  </div>
                </div>
              )}

              {/* Información sobre los datos exportados */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Información del archivo Excel
                    </h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <p className="mb-2">{getExportDescription()}</p>
                      <p className="text-xs">
                        <strong>Incluye:</strong> Datos del cliente, información
                        de la cita, psicólogo, proceso, motivo, estado,
                        diagnóstico, recomendaciones, resultados y metadatos de
                        auditoría.
                      </p>
                      <p className="text-xs mt-1">
                        <strong>Excluye:</strong> Contenido de documentos
                        PDF/Word adjuntos (solo se indica si existe documento).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Descargar Excel
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
