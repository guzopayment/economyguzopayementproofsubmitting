import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function SessionManager() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ["/", "/submit", "/thank-you", "/admin-login"];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (isPublicPath) return;

    const checkSession = () => {
      const token = localStorage.getItem("adminToken");
      const expiresAt = Number(
        localStorage.getItem("adminSessionExpiresAt") || 0,
      );

      if (!token || !expiresAt || Date.now() > expiresAt) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminSessionExpiresAt");
        navigate("/admin-login", {
          replace: true,
          state: { sessionExpired: true },
        });
      }
    };

    checkSession();

    const interval = setInterval(checkSession, 15000);
    return () => clearInterval(interval);
  }, [location.pathname, navigate]);

  useEffect(() => {
    const publicPaths = ["/", "/submit", "/thank-you", "/admin-login"];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (isPublicPath) return;

    const refreshSession = () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const nextExpiry = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem("adminSessionExpiresAt", String(nextExpiry));
    };

    const events = ["click", "keydown", "mousemove", "scroll"];
    events.forEach((event) => window.addEventListener(event, refreshSession));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, refreshSession),
      );
    };
  }, [location.pathname]);

  return null;
}
