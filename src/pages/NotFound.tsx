import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <Logo className="h-20 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          404 - Página no encontrada
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
