"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface CoordinatorRouteProps {
  children: ReactNode;
}

const CoordinatorRoute = ({ children }: CoordinatorRouteProps) => {
  const { user, loading, isAdmin, isCoordinator } = useAuth();

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

  // Permitir acceso a administradores y coordinadores
  if (!isAdmin && !isCoordinator) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default CoordinatorRoute;
