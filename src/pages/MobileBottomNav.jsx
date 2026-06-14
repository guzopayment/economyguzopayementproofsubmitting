import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, Settings } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/bookings", icon: Calendar, label: "Bookings" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map(({ path, icon: Icon, label }) => (
        <Link
          key={path}
          to={path}
          className={`nav-item ${location.pathname === path ? "active" : ""}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
