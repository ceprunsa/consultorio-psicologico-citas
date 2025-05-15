"use client";

import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useState } from "react";

function App() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4">
          <Outlet />
        </main>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          onOpenSidebar={handleOpenSidebar}
          appName="Aplicación-base"
        />

        <main className="container mx-auto px-4 py-8 flex-1">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
// export default App;
