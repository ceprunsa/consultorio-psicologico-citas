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
import type { Psychologist, PsychologistsHookReturn } from "../types";
import { useMemo } from "react";
import toast from "react-hot-toast";

export const usePsychologists = (): PsychologistsHookReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Obtener todos los psicólogos
  const getPsychologists = async (): Promise<Psychologist[]> => {
    const psychologistsRef = collection(db, "psychologists");
    const snapshot = await getDocs(psychologistsRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Psychologist)
    );
  };

  // Obtener un psicólogo por ID
  const getPsychologistById = async (
    id?: string
  ): Promise<Psychologist | null> => {
    if (!id) return null;
    const docRef = doc(db, "psychologists", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Psychologist;
    }
    return null;
  };

  // Crear o actualizar psicólogo
  const savePsychologist = async (
    data: Partial<Psychologist>
  ): Promise<Psychologist> => {
    try {
      if (data.id) {
        // Actualizar psicólogo existente
        const psychologistRef = doc(db, "psychologists", data.id);
        await updateDoc(psychologistRef, {
          ...data,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email || "system",
        });
        toast.success("Psicólogo actualizado exitosamente");
        return { ...data, id: data.id } as Psychologist;
      } else {
        // Crear nuevo psicólogo
        const newPsychologistRef = await addDoc(
          collection(db, "psychologists"),
          {
            ...data,
            createdAt: new Date().toISOString(),
            createdBy: user?.email || "system",
          }
        );
        toast.success("Psicólogo creado exitosamente");
        return { ...data, id: newPsychologistRef.id } as Psychologist;
      }
    } catch (error) {
      console.error("Error al guardar psicólogo:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar psicólogo"
      );
      throw error;
    }
  };

  // Eliminar psicólogo
  const deletePsychologist = async (id: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, "psychologists", id));
      toast.success("Psicólogo eliminado exitosamente");
      return id;
    } catch (error) {
      console.error("Error al eliminar psicólogo:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar psicólogo"
      );
      throw error;
    }
  };

  // React Query hooks
  const psychologistsQuery = useQuery({
    queryKey: ["psychologists"],
    queryFn: getPsychologists,
  });

  const psychologistByIdQueryFn = async (id?: string) => {
    if (!id) return null;
    return getPsychologistById(id);
  };

  const psychologistByIdQuery = (id?: string) => {
    return useQuery({
      queryKey: ["psychologists", id],
      queryFn: () => psychologistByIdQueryFn(id),
      enabled: !!id,
    });
  };

  const savePsychologistMutation = useMutation({
    mutationFn: savePsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologists"] });
    },
  });

  const deletePsychologistMutation = useMutation({
    mutationFn: deletePsychologist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologists"] });
    },
  });

  const memoizedPsychologistByIdQuery = useMemo(
    () => psychologistByIdQuery,
    [psychologistByIdQuery]
  );

  return {
    psychologists: psychologistsQuery.data || [],
    isLoading: psychologistsQuery.isLoading,
    isError: psychologistsQuery.isError,
    error: psychologistsQuery.error as Error | null,
    psychologistByIdQuery: memoizedPsychologistByIdQuery,
    savePsychologist: savePsychologistMutation.mutate,
    deletePsychologist: deletePsychologistMutation.mutate,
    isSaving: savePsychologistMutation.isPending,
    isDeleting: deletePsychologistMutation.isPending,
  };
};
