"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface PsychologistRouteProps {
  children: ReactNode;
}

const PsychologistRoute = ({ children }: PsychologistRouteProps) => {
  const { user, loading, isAdmin, isCoordinator, isPsychologist } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Permitir acceso a administradores, coordinadores y psicólogos
  if (!isAdmin && !isCoordinator && !isPsychologist) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PsychologistRoute;
