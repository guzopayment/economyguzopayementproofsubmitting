// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Sidebar() {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("adminToken");
//     localStorage.removeItem("adminSessionExpiresAt");
//     navigate("/admin-login", { replace: true });
//   };
//   return (
//     <>
//       {/* Mobile Top Bar */}
//       <div
//         className="md:hidden bg-purple-600 text-white p-4
//       flex justify-between items-center"
//       >
//         <h1 className="font-semibold">Admin</h1>

//         <button onClick={() => setOpen(!open)} className="text-2xl">
//           ☰
//         </button>
//       </div>

//       {/* Overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 bg-black/40 md:hidden z-40"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//         fixed md:static z-50 top-0 left-0 h-full w-64
//         bg-purple-500 text-white p-6
//         transform transition duration-300
//         ${open ? "translate-x-0" : "-translate-x-full"}
//         md:translate-x-0
//       `}
//       >
//         <h2 className="text-3xl mb-10 font-bold">Dashboard</h2>

//         <ul className="space-y-6 text-lg">
//           <li className="hover:text-gray-200 cursor-pointer">Dashboard</li>
//           <li className="hover:text-gray-200 cursor-pointer">Users</li>
//           <li className="hover:text-gray-200 cursor-pointer">Reports</li>
//           <li className="hover:text-gray-200 cursor-pointer">Payments</li>
//           <li className="hover:text-gray-200 cursor-pointer">Settings</li>
//           <button
//             onClick={handleLogout}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
//           >
//             LogoutT
//           </button>{" "}
//         </ul>
//       </aside>
//     </>
//   );
// }
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminSessionExpiresAt");
    navigate("/admin-login", { replace: true });
  };

  const linkBase =
    "block w-full rounded-xl px-4 py-3 font-semibold transition cursor-pointer";
  const linkInactive = "text-white hover:bg-white/15 hover:text-white";
  const linkActive = "bg-white text-purple-700 shadow-md";

  const closeMobileMenu = () => setOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-purple-600 text-white p-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">Admin</h1>

        <button onClick={() => setOpen(!open)} className="text-2xl">
          ☰
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50 top-0 left-0 h-full w-64
          bg-purple-500 text-white p-6
          transform transition duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <h2 className="text-3xl mb-10 font-bold">Admin Panel</h2>

        <nav className="space-y-4 text-lg">
          {/* Dashboard hidden on purpose */}

          <NavLink
            to="/admin-questionnaire"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Questionnaire
          </NavLink>

          <NavLink
            to="/admin-stats"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Statistics
          </NavLink>

          <NavLink
            to="/admin-history"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            History Log
          </NavLink>

          <NavLink
            to="/admin-questionnaire-print"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Print
          </NavLink>

          <NavLink
            to="/questionnaire-view-dashboard"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            View Dashboard
          </NavLink>

          {/* Report hidden on purpose */}

          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
