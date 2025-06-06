"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";
import type { Appointment, AppointmentsHookReturn } from "../types";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { uploadPDFDocument } from "../utils/fileUpload";

export const useAppointments = (): AppointmentsHookReturn => {
  const queryClient = useQueryClient();
  const { user, isPsychologist } = useAuth();

  // Obtener todas las citas
  const getAppointments = async (): Promise<Appointment[]> => {
    try {
      let appointmentsQuery;

      // Si el usuario es psicólogo, primero necesitamos encontrar su registro de psicólogo
      if (isPsychologist && user) {
        // Buscar el registro del psicólogo que tiene este userId
        const psychologistsRef = collection(db, "psychologists");
        const psychologistQuery = query(
          psychologistsRef,
          where("userId", "==", user.id)
        );
        const psychologistSnapshot = await getDocs(psychologistQuery);

        if (!psychologistSnapshot.empty) {
          // Encontramos el psicólogo, ahora obtenemos sus citas
          const psychologistId = psychologistSnapshot.docs[0].id;
          appointmentsQuery = query(
            collection(db, "appointments"),
            where("psychologistId", "==", psychologistId)
          );

          console.log(
            `Psicólogo encontrado con ID: ${psychologistId}, buscando citas...`
          );
        } else {
          console.log("No se encontró registro de psicólogo para este usuario");
          return []; // No hay psicólogo asociado, devolver array vacío
        }
      } else {
        // Para admin y coordinador, obtener todas las citas
        appointmentsQuery = collection(db, "appointments");
      }

      const snapshot = await getDocs(appointmentsQuery);
      const appointments = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Appointment)
      );

      console.log(`Se encontraron ${appointments.length} citas`);
      return appointments;
    } catch (error) {
      console.error("Error al obtener citas:", error);
      return [];
    }
  };

  // Obtener una cita por ID
  const getAppointmentById = async (
    id?: string
  ): Promise<Appointment | null> => {
    if (!id) return null;
    const docRef = doc(db, "appointments", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }
    return null;
  };

  // Crear o actualizar cita
  const saveAppointment = async (
    data: Partial<Appointment>
  ): Promise<Appointment> => {
    try {
      if (data.id) {
        // Actualizar cita existente
        const appointmentRef = doc(db, "appointments", data.id);
        await updateDoc(appointmentRef, {
          ...data,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email || "system",
        });
        toast.success("Cita actualizada exitosamente");
        return { ...data, id: data.id } as Appointment;
      } else {
        // Crear nueva cita
        const newAppointmentRef = await addDoc(collection(db, "appointments"), {
          ...data,
          status: "scheduled", // Estado por defecto
          createdAt: new Date().toISOString(),
          createdBy: user?.email || "system",
        });
        toast.success("Cita creada exitosamente");
        return { ...data, id: newAppointmentRef.id } as Appointment;
      }
    } catch (error) {
      console.error("Error al guardar cita:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar cita"
      );
      throw error;
    }
  };

  // Eliminar cita
  const deleteAppointment = async (id: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, "appointments", id));
      toast.success("Cita eliminada exitosamente");
      return id;
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar cita"
      );
      throw error;
    }
  };

  // Actualizar estado de cita
  const updateAppointmentStatus = async (
    id: string,
    status: Appointment["status"],
    data?: Partial<Appointment>
  ): Promise<string> => {
    try {
      const appointmentRef = doc(db, "appointments", id);

      // Actualizar la cita en Firestore (sin generar PDF automáticamente)
      const updateData: any = {
        status,
        ...(data || {}),
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || "system",
      };

      await updateDoc(appointmentRef, updateData);

      const statusMessages = {
        scheduled: "programada",
        completed: "completada",
        cancelled: "cancelada",
        "no-show": "marcada como no asistida",
      };

      toast.success(`Cita ${statusMessages[status]} exitosamente`);
      return id;
    } catch (error) {
      console.error("Error al actualizar estado de la cita:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar estado de la cita"
      );
      throw error;
    }
  };

  // Subir documento PDF a una cita
  const uploadDocumentToAppointment = async (
    appointmentId: string,
    file: File
  ): Promise<void> => {
    try {
      if (!user?.email) {
        throw new Error("Usuario no autenticado");
      }

      // Subir archivo y obtener información del documento
      const documentInfo = await uploadPDFDocument(
        file,
        appointmentId,
        user.email
      );

      // Actualizar la cita con la información del documento
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        document: documentInfo,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email,
      });

      toast.success("Documento subido exitosamente");
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir documento"
      );
      throw error;
    }
  };

  // React Query hooks
  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  const appointmentByIdQueryFn = async (id?: string) => {
    if (!id) return null;
    return getAppointmentById(id);
  };

  const useAppointmentByIdQuery = (id?: string) => {
    return useQuery({
      queryKey: ["appointments", id],
      queryFn: () => appointmentByIdQueryFn(id),
      enabled: !!id,
    });
  };

  const saveAppointmentMutation = useMutation({
    mutationFn: saveAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      data,
    }: {
      id: string;
      status: Appointment["status"];
      data?: Partial<Appointment>;
    }) => updateAppointmentStatus(id, status, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({
      appointmentId,
      file,
    }: {
      appointmentId: string;
      file: File;
    }) => uploadDocumentToAppointment(appointmentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const memoizedAppointmentByIdQuery = useMemo(
    () => useAppointmentByIdQuery,
    []
  );

  // Funciones de filtrado
  const filterByPsychologist = (psychologistId: string): Appointment[] => {
    return (appointmentsQuery.data || []).filter(
      (appointment) => appointment.psychologistId === psychologistId
    );
  };

  const filterByDateRange = (
    startDate: string,
    endDate: string
  ): Appointment[] => {
    return (appointmentsQuery.data || []).filter(
      (appointment) =>
        appointment.date >= startDate && appointment.date <= endDate
    );
  };

  const filterByStatus = (status: Appointment["status"]): Appointment[] => {
    return (appointmentsQuery.data || []).filter(
      (appointment) => appointment.status === status
    );
  };

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    isError: appointmentsQuery.isError,
    error: appointmentsQuery.error as Error | null,
    appointmentByIdQuery: memoizedAppointmentByIdQuery,
    saveAppointment: saveAppointmentMutation.mutate,
    deleteAppointment: deleteAppointmentMutation.mutate,
    updateAppointmentStatus: (
      id: string,
      status: Appointment["status"],
      data?: Partial<Appointment>
    ) => updateAppointmentStatusMutation.mutate({ id, status, data }),
    uploadDocument: uploadDocumentMutation.mutate,
    isSaving: saveAppointmentMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending,
    isUpdatingStatus: updateAppointmentStatusMutation.isPending,
    isUploadingDocument: uploadDocumentMutation.isPending,
    filterByPsychologist,
    filterByDateRange,
    filterByStatus,
  };
};
