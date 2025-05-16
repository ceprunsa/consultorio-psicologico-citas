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
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";
import type {
  ConsultationReason,
  ConsultationReasonsHookReturn,
} from "../types";
import { useMemo } from "react";
import toast from "react-hot-toast";

export const useConsultationReasons = (): ConsultationReasonsHookReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Obtener todos los motivos de consulta
  const getReasons = async (): Promise<ConsultationReason[]> => {
    const reasonsRef = collection(db, "consultation_reasons");
    const snapshot = await getDocs(reasonsRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ConsultationReason)
    );
  };

  // Obtener un motivo de consulta por ID
  const getReasonById = async (
    id?: string
  ): Promise<ConsultationReason | null> => {
    if (!id) return null;
    const docRef = doc(db, "consultation_reasons", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ConsultationReason;
    }
    return null;
  };

  // Crear o actualizar motivo de consulta
  const saveReason = async (
    data: Partial<ConsultationReason>
  ): Promise<ConsultationReason> => {
    try {
      if (data.id) {
        // Actualizar motivo existente
        const reasonRef = doc(db, "consultation_reasons", data.id);
        await updateDoc(reasonRef, {
          ...data,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email || "system",
        });
        toast.success("Motivo de consulta actualizado exitosamente");
        return { ...data, id: data.id } as ConsultationReason;
      } else {
        // Crear nuevo motivo
        const newReasonRef = await addDoc(
          collection(db, "consultation_reasons"),
          {
            ...data,
            createdAt: new Date().toISOString(),
            createdBy: user?.email || "system",
          }
        );
        toast.success("Motivo de consulta creado exitosamente");
        return { ...data, id: newReasonRef.id } as ConsultationReason;
      }
    } catch (error) {
      console.error("Error al guardar motivo de consulta:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar motivo de consulta"
      );
      throw error;
    }
  };

  // Eliminar motivo de consulta
  const deleteReason = async (id: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, "consultation_reasons", id));
      toast.success("Motivo de consulta eliminado exitosamente");
      return id;
    } catch (error) {
      console.error("Error al eliminar motivo de consulta:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar motivo de consulta"
      );
      throw error;
    }
  };

  // Cambiar estado de motivo de consulta (activo/inactivo)
  const toggleReasonStatus = async (
    id: string,
    isActive: boolean
  ): Promise<string> => {
    try {
      const reasonRef = doc(db, "consultation_reasons", id);
      await updateDoc(reasonRef, {
        isActive,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || "system",
      });
      toast.success(
        `Motivo de consulta ${
          isActive ? "activado" : "desactivado"
        } exitosamente`
      );
      return id;
    } catch (error) {
      console.error("Error al cambiar estado del motivo de consulta:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar estado del motivo de consulta"
      );
      throw error;
    }
  };

  // React Query hooks
  const reasonsQuery = useQuery({
    queryKey: ["consultation_reasons"],
    queryFn: getReasons,
  });

  const reasonByIdQueryFn = async (id?: string) => {
    if (!id) return null;
    return getReasonById(id);
  };

  const reasonByIdQuery = (id?: string) => {
    return useQuery({
      queryKey: ["consultation_reasons", id],
      queryFn: () => reasonByIdQueryFn(id),
      enabled: !!id,
    });
  };

  const saveReasonMutation = useMutation({
    mutationFn: saveReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation_reasons"] });
    },
  });

  const deleteReasonMutation = useMutation({
    mutationFn: deleteReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation_reasons"] });
    },
  });

  const toggleReasonStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleReasonStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation_reasons"] });
    },
  });

  const memoizedReasonByIdQuery = useMemo(() => reasonByIdQuery, []);

  return {
    reasons: reasonsQuery.data || [],
    isLoading: reasonsQuery.isLoading,
    isError: reasonsQuery.isError,
    error: reasonsQuery.error as Error | null,
    reasonByIdQuery: memoizedReasonByIdQuery,
    saveReason: saveReasonMutation.mutate,
    deleteReason: deleteReasonMutation.mutate,
    toggleReasonStatus: (id: string, isActive: boolean) =>
      toggleReasonStatusMutation.mutate({ id, isActive }),
    isSaving: saveReasonMutation.isPending,
    isDeleting: deleteReasonMutation.isPending,
    isToggling: toggleReasonStatusMutation.isPending,
  };
};
