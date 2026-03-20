import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — guards seeker/employer routes only.
 *
 * Props:
 *   allowedRole  "seeker" | "employer"
 *   children     component to render if authorized
 *
 * Rules:
 *   no token  → redirect to / (login page)
 *   wrong role → redirect to /unauthorized
 *   ok         → render children
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role !== allowedRole) return <Navigate to="/unauthorized" replace />;

  return children;
}
