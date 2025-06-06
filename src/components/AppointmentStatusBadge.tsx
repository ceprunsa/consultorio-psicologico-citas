"use client";

import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { Appointment } from "../types";

interface AppointmentStatusBadgeProps {
  status: Appointment["status"];
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const AppointmentStatusBadge = ({
  status,
  size = "md",
  showIcon = true,
}: AppointmentStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          label: "Programada",
          icon: Calendar,
          classes: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "completed":
        return {
          label: "Completada",
          icon: CheckCircle,
          classes: "bg-green-100 text-green-800 border-green-200",
        };
      case "cancelled":
        return {
          label: "Cancelada",
          icon: XCircle,
          classes: "bg-red-100 text-red-800 border-red-200",
        };
      case "no-show":
        return {
          label: "No asistió",
          icon: AlertCircle,
          classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      default:
        return {
          label: "Desconocido",
          icon: Clock,
          classes: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.classes} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon size={iconSizes[size]} className="mr-1.5" />}
      {config.label}
    </span>
  );
};
