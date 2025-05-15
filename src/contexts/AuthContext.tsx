"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import type { AuthContextType, User } from "../types";

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: FirebaseUser | null) => {
        if (currentUser) {
          try {
            // Buscar usuario por email en lugar de por UID
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", currentUser.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              // Usar el primer documento que coincida con el email
              const userDoc = querySnapshot.docs[0];
              const userData = userDoc.data() as Omit<User, "id">;

              // Verificar si necesitamos actualizar photoURL o displayName
              let needsUpdate = false;
              const updates: Partial<User> = {};

              if (
                currentUser.photoURL &&
                currentUser.photoURL !== userData.photoURL
              ) {
                updates.photoURL = currentUser.photoURL;
                needsUpdate = true;
              }

              if (
                currentUser.displayName &&
                currentUser.displayName !== userData.displayName
              ) {
                updates.displayName = currentUser.displayName;
                needsUpdate = true;
              }

              // Actualizar el documento si es necesario
              if (needsUpdate) {
                await setDoc(doc(db, "users", userDoc.id), updates, {
                  merge: true,
                });
              }

              // Establecer el usuario en el estado
              setUser({
                id: userDoc.id,
                email: currentUser.email || "",
                displayName: currentUser.displayName || userData.displayName,
                photoURL: currentUser.photoURL || userData.photoURL,
                role: userData.role,
                createdAt: userData.createdAt,
                createdBy: userData.createdBy,
              });
            } else {
              // Si el usuario no existe en Firestore, cerrar sesión
              await signOut(auth);
              setUser(null);
            }
          } catch (error) {
            console.error("Error al buscar usuario:", error);
            await signOut(auth);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (!result.user.email) {
        throw new Error("No se pudo obtener el correo electrónico del usuario");
      }

      // Verificar si el usuario está registrado en Firestore por email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", result.user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Si el usuario no existe, cerrar sesión
        await signOut(auth);
        throw new Error("Usuario no autorizado. Contacte al administrador.");
      }

      return result.user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  // Actualizar la función createUser para usar IDs automáticos
  const createUser = async (userData: Partial<User>) => {
    try {
      if (!userData.email) {
        throw new Error(
          "El correo electrónico es requerido para crear un usuario"
        );
      }

      // Verificar si el usuario ya existe
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error(`El usuario con correo ${userData.email} ya existe`);
      }

      // Crear un nuevo documento con ID automático
      const newUserRef = await addDoc(collection(db, "users"), {
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        role: userData.role || "user", // Default role is user
        createdAt: new Date().toISOString(),
        createdBy: user?.email || "system",
      });

      console.log(
        `Usuario creado con éxito: ${userData.email}, ID: ${newUserRef.id}`
      );
      return true;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    loginWithGoogle,
    logout,
    createUser,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
