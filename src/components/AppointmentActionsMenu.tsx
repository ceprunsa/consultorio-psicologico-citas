"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  AlertCircle,
  Trash2,
  CheckCircle,
} from "lucide-react";
import type { Appointment } from "../types";

interface AppointmentActionsMenuProps {
  appointment: Appointment;
  isAdmin: boolean;
  isCoordinator: boolean;
  isPsychologist: boolean;
  onDelete: (appointment: Appointment) => void;
  onChangeStatus: (
    appointment: Appointment,
    newStatus: Appointment["status"]
  ) => void;
  showPrimaryActions?: boolean;
}

export const AppointmentActionsMenu = ({
  appointment,
  isAdmin,
  isCoordinator,
  isPsychologist,
  onDelete,
  onChangeStatus,
  showPrimaryActions = true,
}: AppointmentActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"right" | "left">("right");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calcular posición del menú
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const menuWidth = 192; // w-48 = 12rem = 192px

      // Si no hay espacio a la derecha, abrir hacia la izquierda
      if (buttonRect.right + menuWidth > viewportWidth - 16) {
        setMenuPosition("left");
      } else {
        setMenuPosition("right");
      }
    }
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const canEdit =
    appointment.status === "scheduled" && (isAdmin || isCoordinator);
  const canCancel =
    appointment.status === "scheduled" && (isAdmin || isCoordinator);
  const canMarkNoShow =
    appointment.status === "scheduled" &&
    (isAdmin || isCoordinator || isPsychologist);
  const canComplete =
    appointment.status === "scheduled" &&
    (isAdmin || isCoordinator || isPsychologist);
  const canDelete = isAdmin || isCoordinator;

  // Acciones principales que se muestran como botones
  const primaryActions = [];

  // Ver siempre es acción principal
  primaryActions.push(
    <Link
      key="view"
      to={`/appointments/${appointment.id}`}
      className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
      title="Ver detalles"
    >
      <Eye size={14} />
    </Link>
  );

  // Editar si está disponible
  if (canEdit) {
    primaryActions.push(
      <Link
        key="edit"
        to={`/appointments/${appointment.id}/edit`}
        className="inline-flex items-center justify-center w-8 h-8 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
        title="Editar cita"
      >
        <Edit size={14} />
      </Link>
    );
  }

  // Completar si está disponible
  if (canComplete) {
    primaryActions.push(
      <button
        key="complete"
        onClick={() => {
          console.log("maracado para completar");
          onChangeStatus(appointment, "completed");
        }}
        className="inline-flex items-center justify-center w-8 h-8 text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
        title="Marcar como completada"
      >
        <CheckCircle size={14} />
      </button>
    );
  }

  // Acciones secundarias para el menú
  const hasSecondaryActions = canMarkNoShow || canCancel || canDelete;

  return (
    <div className="flex items-center gap-1">
      {/* Acciones principales */}
      {showPrimaryActions && (
        <div className="flex items-center gap-1">{primaryActions}</div>
      )}

      {/* Menú de acciones secundarias */}
      {hasSecondaryActions && (
        <div className="relative" ref={menuRef}>
          <button
            ref={buttonRef}
            onClick={handleToggleMenu}
            className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Más acciones"
          >
            <MoreVertical size={14} />
          </button>

          {/* Menú desplegable */}
          {isOpen && (
            <>
              {/* Overlay para móvil */}
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:hidden"
                onClick={() => setIsOpen(false)}
              />

              {/* Menú */}
              <div
                className={`absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 ${
                  menuPosition === "left" ? "right-0" : "left-0"
                } 
                sm:${menuPosition === "left" ? "right-0" : "left-0"}
                max-sm:fixed max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:mt-0`}
              >
                <div className="py-1">
                  {/* Título en móvil */}
                  <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100 sm:hidden">
                    Acciones para {appointment.client.fullName}
                  </div>

                  {/* No asistió */}
                  {canMarkNoShow && (
                    <button
                      onClick={() =>
                        handleAction(() =>
                          onChangeStatus(appointment, "no-show")
                        )
                      }
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                    >
                      <AlertCircle size={14} className="mr-2 text-yellow-500" />
                      No asistió
                    </button>
                  )}

                  {/* Cancelar */}
                  {canCancel && (
                    <button
                      onClick={() =>
                        handleAction(() =>
                          onChangeStatus(appointment, "cancelled")
                        )
                      }
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <XCircle size={14} className="mr-2 text-red-500" />
                      Cancelar
                    </button>
                  )}

                  {/* Separador si hay acciones peligrosas */}
                  {canDelete && (canMarkNoShow || canCancel) && (
                    <div className="border-t border-gray-100 my-1"></div>
                  )}

                  {/* Eliminar */}
                  {canDelete && (
                    <button
                      onClick={() => handleAction(() => onDelete(appointment))}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={14} className="mr-2 text-red-500" />
                      Eliminar
                    </button>
                  )}

                  {/* Botón cerrar en móvil */}
                  <div className="border-t border-gray-100 mt-1 sm:hidden">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
