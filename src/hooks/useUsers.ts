"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";
import type { User, UsersHookReturn } from "../types";
import { useMemo } from "react";
import toast from "react-hot-toast";

export const useUsers = (): UsersHookReturn => {
  const queryClient = useQueryClient();
  const { createUser } = useAuth();

  // Obtener todos los usuarios
  const getUsers = async (): Promise<User[]> => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );
  };

  // Obtener un usuario por ID
  const getUserById = async (id?: string): Promise<User | null> => {
    if (!id) return null;
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  };

  // Crear o actualizar usuario
  const saveUser = async (userData: Partial<User>): Promise<Partial<User>> => {
    if (!userData.email) {
      throw new Error("El correo electrónico es requerido");
    }

    // Asegurarse de que el rol sea del tipo correcto
    const validatedUserData: Partial<User> = {
      ...userData,
      role: userData.role === "admin" ? "admin" : "user",
    };

    try {
      // Crear usuario en Firestore
      await createUser(validatedUserData);
      toast.success(`Usuario ${userData.email} creado exitosamente`);
      return validatedUserData;
    } catch (error) {
      console.error("Error en saveUser:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear usuario"
      );
      throw error;
    }
  };

  // Actualizar rol de usuario
  const updateUserRole = async ({
    userId,
    newRole,
  }: {
    userId: string;
    newRole: "admin" | "user";
  }): Promise<void> => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
      });
      toast.success(
        `Rol actualizado exitosamente a ${
          newRole === "admin" ? "Administrador" : "Usuario"
        }`
      );
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar rol"
      );
      throw error;
    }
  };

  // Eliminar usuario
  const deleteUser = async (id: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Usuario eliminado exitosamente");
      return id;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar usuario"
      );
      throw error;
    }
  };

  // React Query hooks
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const userByIdQueryFn = async (id?: string) => {
    if (!id) return null;
    return getUserById(id);
  };

  const userByIdQuery = (id?: string) => {
    return useQuery({
      queryKey: ["users", id],
      queryFn: () => userByIdQueryFn(id),
      enabled: !!id,
    });
  };

  const saveUserMutation = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const memoizedUserByIdQuery = useMemo(() => userByIdQuery, []);

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error as Error | null,
    userByIdQuery: memoizedUserByIdQuery,
    saveUser: saveUserMutation.mutate,
    updateUserRole: updateRoleMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isSaving: saveUserMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};
