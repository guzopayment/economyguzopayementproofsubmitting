// import { Navigate, useLocation } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const location = useLocation();
//   const token = localStorage.getItem("adminToken");

//   if (!token) {
//     return (
//       <Navigate to="/admin-login" replace state={{ from: location.pathname }} />
//     );
//   }

//   return children;
// }
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");
  const expiresAt = Number(localStorage.getItem("adminSessionExpiresAt") || 0);

  const isExpired = !expiresAt || Date.now() > expiresAt;

  if (!token || isExpired) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminSessionExpiresAt");

    return (
      <Navigate
        to="/admin-login"
        replace
        state={{ from: location.pathname, sessionExpired: isExpired }}
      />
    );
  }

  return children;
}
