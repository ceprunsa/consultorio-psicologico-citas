"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { validatePDFFile, formatFileSize } from "../utils/fileUpload";
import type { AppointmentDocument } from "../types";

interface DocumentUploadProps {
  appointmentId: string;
  currentDocument?: AppointmentDocument;
  onUpload: (appointmentId: string, file: File) => void;
  isUploading: boolean;
  disabled?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  appointmentId,
  currentDocument,
  onUpload,
  isUploading,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const validation = validatePDFFile(file);

    if (!validation.isValid) {
      setValidationError(validation.error || "Archivo inválido");
      setSelectedFile(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && !isUploading) {
      onUpload(appointmentId, selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Documento actual */}
      {currentDocument && !selectedFile && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {currentDocument.originalName}
                </p>
                <p className="text-xs text-green-700">
                  {formatFileSize(currentDocument.fileSize)} • Subido el{" "}
                  {new Date(currentDocument.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href={currentDocument.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Ver documento
            </a>
          </div>
        </div>
      )}

      {/* Área de subida */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : disabled || isUploading
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {selectedFile ? (
          /* Archivo seleccionado */
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-blue-500 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {formatFileSize(selectedFile.size)}
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary inline-flex items-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir documento
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="btn btn-secondary inline-flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* Estado inicial */
          <div className="text-center">
            <Upload
              className={`mx-auto h-12 w-12 mb-3 ${
                disabled || isUploading ? "text-gray-300" : "text-gray-400"
              }`}
            />
            <p
              className={`text-sm font-medium mb-1 ${
                disabled || isUploading ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {currentDocument ? "Reemplazar documento" : "Subir documento PDF"}
            </p>
            <p
              className={`text-xs mb-4 ${
                disabled || isUploading ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Arrastra y suelta un archivo PDF aquí, o{" "}
              <button
                onClick={openFileDialog}
                disabled={disabled || isUploading}
                className={`font-medium ${
                  disabled || isUploading
                    ? "text-gray-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                selecciona un archivo
              </button>
            </p>
            <p
              className={`text-xs ${
                disabled || isUploading ? "text-gray-300" : "text-gray-400"
              }`}
            >
              Máximo 10MB • Solo archivos PDF
            </p>
          </div>
        )}

        {/* Error de validación */}
        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-3 text-xs text-gray-500">
        <p>• Solo se permiten archivos PDF</p>
        <p>• Tamaño máximo: 10MB</p>
        <p>• El documento se asociará permanentemente a esta cita</p>
      </div>
    </div>
  );
};

export default DocumentUpload;
