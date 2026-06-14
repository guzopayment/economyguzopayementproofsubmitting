// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Sidebar({ admin }) {
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
//         className="md:hidden flex items-center justify-between
//       bg-purple-500 text-white p-4 h-screen"
//       >
//         <h1 className="text-xl font-semibold">
//           {admin ? "Admin Dashboard" : "Dashboard"}
//         </h1>

//         <button onClick={() => setOpen(!open)} className="text-3xl">
//           ☰
//         </button>
//       </div>

//       {/* Overlay */}
//       {open && (
//         <div
//           onClick={() => setOpen(false)}
//           className="fixed inset-0 bg-black/40 md:hidden z-40"
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`
//         fixed md:static z-50
//         top-0 left-0 h-full w-72
//         bg-purple-300 p-6
//         transform transition-transform duration-300
//         ${open ? "translate-x-0" : "-translate-x-full"}
//         md:translate-x-0
//         rounded-r-[40px] shadow-lg
//       `}
//       >
//         <h2 className="text-white text-3xl mb-10">
//           {admin ? "Admin Dashboard" : "Dashboard"}
//         </h2>

//         <ul className="space-y-6 text-lg">
//           <li className="cursor-pointer hover:text-white">Dashboard</li>

//           {admin && <li className="cursor-pointer hover:text-white">Users</li>}

//           <li className="cursor-pointer hover:text-white">Report</li>
//           <li className="cursor-pointer hover:text-white">History Log</li>

//           {admin && (
//             <button
//               onClick={handleLogout}
//               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
//             >
//               Logout
//             </button>
//           )}
//         </ul>
//       </div>
//     </>
//   );
// }
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ admin }) {
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

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-purple-500 text-white p-4">
        <h1 className="text-xl font-semibold">
          {admin ? "Admin Panel" : "Menu"}
        </h1>

        <button onClick={() => setOpen(!open)} className="text-3xl">
          ☰
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-40"
        />
      )}

      <div
        className={`
          fixed md:static z-50
          top-0 left-0 h-full w-72
          bg-purple-300 p-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          rounded-r-[40px] shadow-lg
        `}
      >
        <h2 className="text-white text-3xl mb-10">
          {admin ? "Admin Panel" : "Dashboard"}
        </h2>

        <nav className="space-y-4 text-lg">
          <NavLink
            to="/admin-questionnaire"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Questionnaire
          </NavLink>

          <NavLink
            to="/admin-stats"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Statistics
          </NavLink>

          <NavLink
            to="/admin-history"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            History Log
          </NavLink>

          {admin && (
            <button
              onClick={handleLogout}
              className="mt-6 w-full bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
