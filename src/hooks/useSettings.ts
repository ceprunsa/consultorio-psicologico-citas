"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

// Definir la estructura de las configuraciones del sistema
export interface SystemSettings {
  general: {
    centerName: string;
    centerEmail: string;
    centerPhone: string;
    centerAddress: string;
  };
  appointments: {
    defaultDuration: string;
    minTimeAdvance: string;
    maxAppointmentsPerDay: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: string[];
  };
}

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const settingsDocRef = doc(db, "settings", "systemConfig");

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SystemSettings);
        } else {
          // Si no existe el documento, inicializar con valores por defecto
          const defaultSettings: SystemSettings = {
            general: {
              centerName: "Consultorio Psicológico CEPRUNSA",
              centerEmail: "consultorio.psicologico@ceprunsa.edu.pe",
              centerPhone: "054-123456",
              centerAddress: "Local CEPRUNSA",
            },
            appointments: {
              defaultDuration: "60",
              minTimeAdvance: "24",
              maxAppointmentsPerDay: "8",
              workingHoursStart: "08:00",
              workingHoursEnd: "18:00",
              workingDays: ["1", "2", "3", "4", "5"], // Lunes a viernes
            },
          };
          setSettings(defaultSettings);
          // Guardar la configuración por defecto en Firestore
          await setDoc(settingsDocRef, defaultSettings);
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error);
        toast.error("Error al cargar la configuración del sistema");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: SystemSettings) => {
    setIsSaving(true);
    try {
      await setDoc(settingsDocRef, newSettings);
      setSettings(newSettings);
      toast.success("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      toast.error("Error al guardar la configuración del sistema");
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, saveSettings, isLoading, isSaving };
};

export default useSettings;
