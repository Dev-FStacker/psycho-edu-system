/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "./AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
