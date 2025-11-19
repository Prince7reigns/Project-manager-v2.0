import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/userContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    return user.role === "admin"
      ? <Navigate to="/admin/dashboard" />
      : <Navigate to="/user/dashboard" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
