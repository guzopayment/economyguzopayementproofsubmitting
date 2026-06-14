import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../socket";
import Pagination from "../components/Pagination";

export default function AdminHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [page, setPage] = useState(1);
  const perPage = 12;

  const openNotifications = () => {
    setNotifCount(0);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/");
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/history");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.history || res.data?.results || [];

      const sorted = (data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setHistory(sorted);
    } catch (err) {
      console.error("History fetch error:", err.response?.data || err.message);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    socket.off("history");
    socket.off("newBooking");

    socket.on("history", (item) => {
      setHistory((prev) => [item, ...prev]);
      setPage(1);
      setNotifCount((c) => c + 1);
    });

    socket.on("newBooking", () => {
      setNotifCount((c) => c + 1);
    });

    return () => {
      socket.off("history");
      socket.off("newBooking");
    };
  }, []);

  const actorOptions = useMemo(() => {
    const set = new Set(history.map((item) => item.actor).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [history]);

  const typeOptions = useMemo(() => {
    const set = new Set(history.map((item) => item.entityType).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [history]);

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();

    return history.filter((item) => {
      const actorOk = actorFilter === "All" ? true : item.actor === actorFilter;
      const typeOk =
        typeFilter === "All" ? true : item.entityType === typeFilter;

      if (!q) return actorOk && typeOk;

      const hay = [
        item.title,
        item.message,
        item.actor,
        item.entityType,
        item.entityId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return actorOk && typeOk && hay.includes(q);
    });
  }, [history, search, actorFilter, typeFilter]);

  const totalPages = Math.ceil(filteredHistory.length / perPage) || 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredHistory.slice(start, start + perPage);
  }, [filteredHistory, page]);

  const menu = [
    { id: "dashboard", label: "Booking Overview", path: "/admin-dashboard" },
    { id: "report", label: "Booking Report", path: "/admin-report" },
    { id: "history", label: "History Log", path: "/admin-history" },
    { id: "logout", label: "LOGOUT", action: "logout" },
  ];

  const handleMenu = (item) => {
    setSidebarOpen(false);
    if (item.action === "logout") {
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
      return;
    }
    if (item.path) navigate(item.path);
  };

  return (
    <div className="flex min-h-screen bg-gray-200 min-w-0 overflow-x-hidden">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-purple-600 text-white w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <span
            className={`absolute left-0 top-1 w-6 h-[2px] bg-white transition-all duration-300 ${
              sidebarOpen ? "rotate-45 top-3" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-3 w-6 h-[2px] bg-white transition-all duration-300 ${
              sidebarOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-5 w-6 h-[2px] bg-white transition-all duration-300 ${
              sidebarOpen ? "-rotate-45 top-3" : ""
            }`}
          />
        </div>
      </button>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 self-start z-40 h-screen w-64 bg-purple-400 text-white p-6 shadow-xl
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <ul className="space-y-4">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => handleMenu(item)}
              className={`cursor-pointer p-3 rounded-xl transition-all duration-300 ${
                item.id === "history"
                  ? "bg-white text-purple-600 font-bold shadow"
                  : "hover:bg-white/20 hover:backdrop-blur hover:scale-105 hover:shadow-lg"
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-purple-600">
            History Log
          </h1>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={openNotifications}
              className="relative bg-white text-purple-700 px-4 py-2 rounded-full shadow hover:shadow-xl hover:-translate-y-[1px] transition font-semibold"
              title="Notifications"
            >
              🔔
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow">
                {notifCount}
              </span>
            </button>

            <button
              onClick={fetchHistory}
              className="bg-white text-purple-700 px-6 py-2 rounded-full shadow hover:shadow-xl hover:-translate-y-[1px] transition font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title / message / actor / type..."
            className="w-full md:w-[420px] bg-white rounded-full px-5 py-2 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <select
            value={actorFilter}
            onChange={(e) => {
              setActorFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white rounded-full px-5 py-2 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {actorOptions.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Actors" : item}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white rounded-full px-5 py-2 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {typeOptions.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Types" : item}
              </option>
            ))}
          </select>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
            No history yet
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((item, i) => (
              <div
                key={item._id || i}
                className="bg-white p-4 rounded-2xl shadow hover:shadow-2xl hover:-translate-y-1 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h2 className="text-lg font-bold text-purple-700">
                    {item.title || "Activity"}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>

                <p className="text-gray-700 mt-2">{item.message || "—"}</p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    Who: {item.actor || "system"}
                  </span>

                  {item.entityType ? (
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      What: {item.entityType}
                    </span>
                  ) : null}

                  {item.entityId ? (
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      ID: {item.entityId}
                    </span>
                  ) : null}

                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    When:{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredHistory.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </main>
    </div>
  );
}
