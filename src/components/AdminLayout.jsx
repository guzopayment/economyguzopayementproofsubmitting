import { useNavigate, useLocation } from "react-router-dom";
import MobileBottomNav from "../pages/MobileBottomNav";
import "../pages/mobileNav.css";
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path) =>
    `cursor-pointer p-2 rounded ${
      location.pathname === path ? "bg-white text-purple-600" : "text-white"
    }`;
  // const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminSessionExpiresAt");
    navigate("/admin-login", { replace: true });
  };
  return (
    <div className="flex min-h-screen bg-gray-200">
      {/* Sidebar */}
      <div className="w-64 bg-purple-400 p-6 rounded-r-3xl">
        <h2 className="text-3xl text-white mb-8">Admin</h2>

        <ul className="space-y-6 text-xl">
          <li
            className={linkClass("/admin-dashboard")}
            onClick={() => navigate("/admin-dashboard")}
          >
            Dashboard
          </li>

          <li
            className={linkClass("/admin-report")}
            onClick={() => navigate("/admin-report")}
          >
            Travel Report
          </li>
          <li
            className={linkClass("/admin-history")}
            onClick={() => navigate("/admin-history")}
          >
            History
          </li>
          <li
            className={linkClass("/admin-logout")}
            onClick={() => navigate("/admin-logout")}
          >
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              LOGOUTT
            </button>
          </li>
        </ul>
      </div>
      <MobileBottomNav />
      {/* Main Body */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
