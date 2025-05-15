"use client";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "./Logo";
import { Home, Users, X, LogOut, ChevronRight, User } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } bg-white shadow-lg w-64 md:sticky rounded-r-lg`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-center p-4 border-b text-white rounded-tr-lg">
            <Link
              to="/dashboard"
              className="flex items-center"
              onClick={closeSidebar}
            >
              <Logo className="h-10 w-auto" />
            </Link>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md text-white hover:bg-[#3A4875] md:hidden transition-colors duration-200"
              aria-label="Cerrar sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL || "/placeholder.svg"}
                  alt={user.displayName || "Usuario"}
                  className="h-10 w-10 rounded-full mr-3 border border-gray-200 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-medium mr-3 border border-gray-200">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-medium text-gray-800 truncate">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === "admin"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                    isActive("/dashboard")
                      ? "bg-[#1A2855]/10 text-[#1A2855] font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={closeSidebar}
                >
                  <Home size={18} className="mr-3" />
                  <span>Dashboard</span>
                  {isActive("/dashboard") && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/users"
                    className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                      isActive("/users")
                        ? "bg-[#1A2855]/10 text-[#1A2855] font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={closeSidebar}
                  >
                    <Users size={18} className="mr-3" />
                    <span>Usuarios</span>
                    {isActive("/users") && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/profile"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                    isActive("/profile")
                      ? "bg-[#1A2855]/10 text-[#1A2855] font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={closeSidebar}
                >
                  <User size={18} className="mr-3" />
                  <span>Perfil</span>
                  {isActive("/profile") && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center w-full p-2 rounded-md text-[#7A1A2B] hover:bg-[#7A1A2B]/10 transition-colors duration-200"
            >
              <LogOut size={18} className="mr-3" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
      {/* Modal de confirmación para cerrar sesión */}
      {showLogoutConfirm && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <LogOut className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Cerrar sesión
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas cerrar sesión? Tendrás que
                        volver a iniciar sesión para acceder a tu cuenta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-danger sm:ml-3"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mt-3 sm:mt-0 sm:ml-3"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
