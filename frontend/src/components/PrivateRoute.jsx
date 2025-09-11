import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute() {
  const { userInfo } = useSelector((state) => state.auth);

  // If user is logged in, render the protected route
  // Otherwise, redirect to login
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
}
