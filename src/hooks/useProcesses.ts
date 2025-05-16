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
import type { Process, ProcessesHookReturn } from "../types";
import { useMemo } from "react";
import toast from "react-hot-toast";

export const useProcesses = (): ProcessesHookReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Obtener todos los procesos
  const getProcesses = async (): Promise<Process[]> => {
    const processesRef = collection(db, "processes");
    const snapshot = await getDocs(processesRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Process)
    );
  };

  // Obtener un proceso por ID
  const getProcessById = async (id?: string): Promise<Process | null> => {
    if (!id) return null;
    const docRef = doc(db, "processes", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Process;
    }
    return null;
  };

  // Crear o actualizar proceso
  const saveProcess = async (data: Partial<Process>): Promise<Process> => {
    try {
      if (data.id) {
        // Actualizar proceso existente
        const processRef = doc(db, "processes", data.id);
        await updateDoc(processRef, {
          ...data,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email || "system",
        });
        toast.success("Proceso actualizado exitosamente");
        return { ...data, id: data.id } as Process;
      } else {
        // Crear nuevo proceso
        const newProcessRef = await addDoc(collection(db, "processes"), {
          ...data,
          createdAt: new Date().toISOString(),
          createdBy: user?.email || "system",
        });
        toast.success("Proceso creado exitosamente");
        return { ...data, id: newProcessRef.id } as Process;
      }
    } catch (error) {
      console.error("Error al guardar proceso:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar proceso"
      );
      throw error;
    }
  };

  // Eliminar proceso
  const deleteProcess = async (id: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, "processes", id));
      toast.success("Proceso eliminado exitosamente");
      return id;
    } catch (error) {
      console.error("Error al eliminar proceso:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar proceso"
      );
      throw error;
    }
  };

  // Cambiar estado de proceso (activo/inactivo)
  const toggleProcessStatus = async (
    id: string,
    isActive: boolean
  ): Promise<string> => {
    try {
      const processRef = doc(db, "processes", id);
      await updateDoc(processRef, {
        isActive,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || "system",
      });
      toast.success(
        `Proceso ${isActive ? "activado" : "desactivado"} exitosamente`
      );
      return id;
    } catch (error) {
      console.error("Error al cambiar estado del proceso:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar estado del proceso"
      );
      throw error;
    }
  };

  // React Query hooks
  const processesQuery = useQuery({
    queryKey: ["processes"],
    queryFn: getProcesses,
  });

  const processByIdQueryFn = async (id?: string) => {
    if (!id) return null;
    return getProcessById(id);
  };

  const processByIdQuery = (id?: string) => {
    return useQuery({
      queryKey: ["processes", id],
      queryFn: () => processByIdQueryFn(id),
      enabled: !!id,
    });
  };

  const saveProcessMutation = useMutation({
    mutationFn: saveProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
  });

  const deleteProcessMutation = useMutation({
    mutationFn: deleteProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
  });

  const toggleProcessStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleProcessStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
  });

  const memoizedProcessByIdQuery = useMemo(() => processByIdQuery, []);

  return {
    processes: processesQuery.data || [],
    isLoading: processesQuery.isLoading,
    isError: processesQuery.isError,
    error: processesQuery.error as Error | null,
    processByIdQuery: memoizedProcessByIdQuery,
    saveProcess: saveProcessMutation.mutate,
    deleteProcess: deleteProcessMutation.mutate,
    toggleProcessStatus: (id: string, isActive: boolean) =>
      toggleProcessStatusMutation.mutate({ id, isActive }),
    isSaving: saveProcessMutation.isPending,
    isDeleting: deleteProcessMutation.isPending,
    isToggling: toggleProcessStatusMutation.isPending,
  };
};
