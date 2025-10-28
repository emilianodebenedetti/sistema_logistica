import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user } = useAuth();

  console.log("Verificando usuario en PrivateRoute:", user);

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
