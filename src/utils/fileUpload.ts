import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import type { AppointmentDocument } from "../types";

/**
 * Sube un archivo PDF a Firebase Storage y retorna la información del documento
 */
export const uploadPDFDocument = async (
  file: File,
  appointmentId: string,
  uploadedBy: string
): Promise<AppointmentDocument> => {
  // Validar que el archivo sea PDF
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF");
  }

  // Validar tamaño del archivo (máximo 10MB)
  const maxSize = 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("El archivo no puede ser mayor a 1MB");
  }

  try {
    // Crear referencia única para el archivo
    const timestamp = new Date().getTime();
    const fileName = `appointment_${appointmentId}_${timestamp}.pdf`;
    const storageRef = ref(
      storage,
      `appointments/${appointmentId}/${fileName}`
    );

    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Crear objeto de documento
    const document: AppointmentDocument = {
      id: snapshot.ref.name,
      fileName: fileName,
      originalName: file.name,
      fileUrl: downloadURL,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploadedBy,
    };

    return document;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw new Error(
      "Error al subir el archivo. Por favor, inténtelo de nuevo."
    );
  }
};

/**
 * Formatea el tamaño del archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

/**
 * Valida si un archivo es PDF válido
 */
export const validatePDFFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Verificar tipo MIME
  if (file.type !== "application/pdf") {
    return { isValid: false, error: "Solo se permiten archivos PDF" };
  }

  // Verificar extensión
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf") {
    return { isValid: false, error: "El archivo debe tener extensión .pdf" };
  }

  // Verificar tamaño
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: "El archivo no puede ser mayor a 10MB" };
  }

  // Verificar que no esté vacío
  if (file.size === 0) {
    return { isValid: false, error: "El archivo no puede estar vacío" };
  }

  return { isValid: true };
};
