import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import api from "../services/api";
import Pagination from "../components/Pagination";
import MessageModal from "../components/MessageModal";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 hover:shadow-2xl hover:-translate-y-1 transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-3xl font-extrabold text-purple-700 mt-2">{value}</h3>
      {subtitle ? (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}

function StatusBadge({ value }) {
  const safe = value || "Pending";
  const cls =
    safe === "Confirmed"
      ? "bg-green-100 text-green-700"
      : safe === "Rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>
      {safe}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmLabel: "እሺ",
    cancelLabel: "አይ",
  });
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [bookingSummary, setBookingSummary] = useState({
    total: 0,
    totalParticipants: 0,
    pendingCount: 0,
    confirmedCount: 0,
    rejectedCount: 0,
  });

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [navigate]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const loadStats = async () => {
    const res = await api.get("/admin/stats");
    setStats(res.data || {});
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/bookings", {
        params: {
          page,
          limit: perPage,
          q: search,
          status: statusFilter,
        },
      });

      const payload = res.data || {};
      setBookings(Array.isArray(payload.bookings) ? payload.bookings : []);
      setMeta({
        currentPage: payload.currentPage || page,
        totalPages: payload.totalPages || 1,
        total: payload.total || 0,
      });
      setBookingSummary({
        total: payload.total || 0,
        totalParticipants: payload.totalParticipants || 0,
        pendingCount: payload.pendingCount || 0,
        confirmedCount: payload.confirmedCount || 0,
        rejectedCount: payload.rejectedCount || 0,
      });
    } catch (err) {
      console.error(
        "Booking dashboard load error:",
        err.response?.data || err.message,
      );
      setError(err.response?.data?.message || "የዳሽቦርድ መረጃዎችን መጫን አልተቻለም።");
      setBookings([]);
      setMeta({ currentPage: 1, totalPages: 1, total: 0 });
      setBookingSummary({
        total: 0,
        totalParticipants: 0,
        pendingCount: 0,
        confirmedCount: 0,
        rejectedCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    try {
      await Promise.all([loadStats(), loadBookings()]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [page, search, statusFilter]);

  useEffect(() => {
    const onNewBooking = async () => {
      setNotifCount((prev) => prev + 1);
      await refreshAll();
    };

    const onHistory = () => setNotifCount((prev) => prev + 1);
    const onBookingUpdated = async () => {
      await refreshAll();
    };

    socket.on("newBooking", onNewBooking);
    socket.on("history", onHistory);
    socket.on("bookingUpdated", onBookingUpdated);

    return () => {
      socket.off("newBooking", onNewBooking);
      socket.off("history", onHistory);
      socket.off("bookingUpdated", onBookingUpdated);
    };
  }, []);

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
      localStorage.removeItem("adminSessionExpiresAt");
      navigate("/admin-login");
      return;
    }
    if (item.path) navigate(item.path);
  };

  const submitSearch = () => {
    setPage(1);
    setSearch(searchDraft.trim());
  };

  const clearSearch = () => {
    setSearchDraft("");
    setSearch("");
    setStatusFilter("All");
    setPage(1);
  };

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const showModal = (
    title,
    message,
    type = "info",
    onConfirm = null,
    confirmLabel = "እሺ",
    cancelLabel = "አይ",
  ) =>
    setModal({
      open: true,
      title,
      message,
      type,
      onConfirm,
      confirmLabel,
      cancelLabel,
    });

  const closeModal = () =>
    setModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
      confirmLabel: "እሺ",
      cancelLabel: "አይ",
    });

  const approveBooking = (booking) => {
    if (!booking?._id) {
      showModal("ማስጠንቀቂያ", "የሚፀድቀው መረጃ አልተገኘም።", "error");
      return;
    }

    if (booking.status === "Confirmed") {
      showModal("ማስጠንቀቂያ", "ይህ ክፍያ አስቀድሞ ጸድቋል።", "warning");
      return;
    }

    showModal(
      "ማረጋገጫ",
      "ይህን የክፍያ ማስረጃ ለማጽደቅ እርግጠኛ ነዎት?",
      "warning",
      async () => {
        closeModal();
        try {
          await api.put(`/admin/confirm/${booking._id}`);
          await refreshAll();
          showModal("ተሳክቷል", "የክፍያ ማስረጃው በተሳካ ሁኔታ ጸድቋል።", "success");
        } catch (err) {
          console.error(err.response?.data || err.message);
          showModal(
            "ስህተት",
            err.response?.data?.message || "የክፍያ ማስረጃውን ማጽደቅ አልተቻለም።",
            "error",
          );
        }
      },
      "አዎን",
      "አይ",
    );
  };

  const rejectBooking = (booking) => {
    if (!booking?._id) {
      showModal("ማስጠንቀቂያ", "የሚውደቀው መረጃ አልተገኘም።", "error");
      return;
    }

    if (booking.status === "Rejected") {
      showModal("ማስጠንቀቂያ", "ይህ ክፍያ አስቀድሞ ውድቅ ተደርጓል።", "warning");
      return;
    }

    showModal(
      "ማረጋገጫ",
      "ይህን የክፍያ ማስረጃ ውድቅ ለማድረግ እርግጠኛ ነዎት?",
      "warning",
      async () => {
        closeModal();
        try {
          await api.put(`/admin/reject/${booking._id}`);
          await refreshAll();
          showModal("ተሳክቷል", "የክፍያ ማስረጃው በተሳካ ሁኔታ ውድቅ ተደርጓል።", "success");
        } catch (err) {
          console.error(err.response?.data || err.message);
          showModal(
            "ስህተት",
            err.response?.data?.message || "የክፍያ ማስረጃውን ውድቅ ማድረግ አልተቻለም።",
            "error",
          );
        }
      },
      "አዎን",
      "አይ",
    );
  };

  const deleteBooking = (booking) => {
    if (!booking?._id) {
      showModal("ማስጠንቀቂያ", "የሚሰረዘው መረጃ አልተገኘም።", "error");
      return;
    }

    showModal(
      "ማረጋገጫ",
      "ይህን የመረጃ ለመሰረዝ እርግጠኛ ነዎት?",
      "error",
      async () => {
        closeModal();
        try {
          await api.delete(`/admin/bookings/${booking._id}`);
          await refreshAll();
          showModal("ተሳክቷል", "የክፍያ መረጃው በተሳካ ሁኔታ ተሰርዟል።", "success");
        } catch (err) {
          console.error(err.response?.data || err.message);
          showModal(
            "ስህተት",
            err.response?.data?.message || "የክፍያ መረጃውን መሰረዝ አልተቻለም።",
            "error",
          );
        }
      },
      "አዎን",
      "አይ",
    );
  };

  const openNotifications = () => setNotifCount(0);

  const summaryCards = useMemo(() => {
    const safeStats = stats || {};
    const pickValue = (primary, fallback = 0) =>
      Number(primary || 0) > 0 ? Number(primary || 0) : Number(fallback || 0);

    return {
      totalBookings: pickValue(
        safeStats.totalBookings,
        bookingSummary.total || meta.total || bookings.length,
      ),
      totalParticipants: pickValue(
        safeStats.totalParticipants,
        bookingSummary.totalParticipants,
      ),
      pendingCount: pickValue(
        safeStats.pendingPayments,
        bookingSummary.pendingCount,
      ),
      confirmedCount: pickValue(
        safeStats.confirmedCount,
        bookingSummary.confirmedCount,
      ),
      rejectedCount: pickValue(
        safeStats.rejectedCount,
        bookingSummary.rejectedCount,
      ),
    };
  }, [stats, bookingSummary, meta.total, bookings.length]);

  return (
    <div className="flex min-h-screen bg-gray-200 min-w-0 overflow-x-hidden">
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-purple-600 text-white w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300"
        onClick={() => setSidebarOpen((v) => !v)}
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
        className={`fixed md:sticky md:top-0 self-start z-40 h-screen w-64 bg-purple-400 text-white pt-16 md:pt-6 p-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>
        <ul className="space-y-4">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => handleMenu(item)}
              className={`cursor-pointer p-3 rounded-xl transition-all duration-300 ${
                item.id === "dashboard"
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-purple-600">
              Booking Payment Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              Review submissions, proof images, participant totals, and extra
              participant details.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openNotifications}
              className="relative bg-white text-purple-700 px-4 py-2 rounded-full shadow hover:shadow-xl hover:-translate-y-[1px] transition font-semibold"
              title="Notifications"
            >
              🔔
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow">
                  {notifCount}
                </span>
              )}
            </button>
            <button
              onClick={refreshAll}
              className="bg-white text-purple-700 px-5 py-2 rounded-full shadow font-semibold hover:shadow-xl hover:-translate-y-[1px] transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
          <StatCard
            title="Total Submissions"
            value={summaryCards.totalBookings}
          />
          <StatCard
            title="Confirmed Participants"
            value={summaryCards.totalParticipants}
            subtitle="Participants from confirmed payments"
          />
          <StatCard title="Pending" value={summaryCards.pendingCount} />
          <StatCard title="Confirmed" value={summaryCards.confirmedCount} />
          <StatCard title="Rejected" value={summaryCards.rejectedCount} />
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search name / organization / phone / sub city..."
              className="w-full md:w-[420px] bg-gray-50 rounded-full px-5 py-3 border focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 rounded-full px-5 py-3 border focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={submitSearch}
              className="bg-purple-600 text-white px-5 py-3 rounded-full font-bold hover:bg-purple-700 transition"
            >
              Search
            </button>
            <button
              onClick={clearSearch}
              className="bg-gray-200 text-gray-700 px-5 py-3 rounded-full font-bold hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {error ? (
            <div className="p-6 text-red-600 font-semibold">{error}</div>
          ) : loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading dashboard...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No booking records found.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-3 [scrollbar-gutter:stable]">
              <table className="min-w-[1700px] w-max table-auto">
                <thead className="bg-purple-700 text-white">
                  <tr>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      ID
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Name
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Organization
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Phone
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Sex
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Sub City
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Participants
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Payment Proof
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Submitted
                    </th>
                    <th className="p-3 text-left text-sm whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((item, index) => (
                    <Fragment key={item._id}>
                      <tr className="border-b hover:bg-purple-50 transition align-top">
                        <td className="p-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {(meta.currentPage - 1) * perPage + index + 1}
                        </td>

                        <td className="p-3 text-sm font-semibold text-gray-800 min-w-[120px]">
                          {item.name || "—"}
                        </td>

                        <td className="p-3 text-sm min-w-[220px]">
                          {item.organization || "—"}
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap">
                          {item.phone || "—"}
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap">
                          {item.sex || "—"}
                        </td>

                        <td className="p-3 text-sm min-w-[130px]">
                          {item.subCity || "—"}
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <span className="font-bold">
                              {item.participants || 0}
                            </span>

                            {Array.isArray(item.participantDetails) &&
                            item.participantDetails.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(item._id)}
                                className="text-purple-700 underline text-xs text-left"
                              >
                                {expandedId === item._id
                                  ? "Hide extra participants"
                                  : `View extra participants (${item.participantDetails.length})`}
                              </button>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap">
                          <StatusBadge value={item.status} />
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap">
                          {item.paymentProof ? (
                            <a
                              href={item.paymentProof}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-3 whitespace-nowrap"
                            >
                              <img
                                src={item.paymentProof}
                                alt="payment proof"
                                className="w-16 h-16 rounded-xl object-cover border shrink-0"
                              />
                              <span className="text-purple-700 font-semibold underline">
                                View proof
                              </span>
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap min-w-[140px] text-gray-500">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "—"}
                        </td>

                        <td className="p-3 text-sm whitespace-nowrap">
                          <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={() => approveBooking(item)}
                              className="shrink-0 bg-green-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => rejectBooking(item)}
                              className="shrink-0 bg-red-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-red-700 transition"
                            >
                              Reject
                            </button>

                            <button
                              onClick={() => deleteBooking(item)}
                              className="shrink-0 bg-gray-700 text-white px-3 py-2 rounded-xl font-semibold hover:bg-black transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedId === item._id &&
                      Array.isArray(item.participantDetails) &&
                      item.participantDetails.length > 0 ? (
                        <tr className="bg-purple-50/60">
                          <td colSpan="11" className="p-4">
                            <div className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-3 [scrollbar-gutter:stable]">
                              <table className="min-w-[900px] w-max table-auto border rounded-xl overflow-hidden">
                                <thead className="bg-purple-100">
                                  <tr>
                                    <th className="p-2 text-left text-xs whitespace-nowrap">
                                      #
                                    </th>
                                    <th className="p-2 text-left text-xs whitespace-nowrap">
                                      Name
                                    </th>
                                    <th className="p-2 text-left text-xs whitespace-nowrap">
                                      Phone
                                    </th>
                                    <th className="p-2 text-left text-xs whitespace-nowrap">
                                      Sex
                                    </th>
                                    <th className="p-2 text-left text-xs whitespace-nowrap">
                                      Organization
                                    </th>
                                    <th className="p-2 text-left text-xs whitespace-nowrap">
                                      Sub City
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.participantDetails.map(
                                    (participant, pIndex) => (
                                      <tr
                                        key={`${item._id}-participant-${pIndex}`}
                                        className="border-t"
                                      >
                                        <td className="p-2 text-xs whitespace-nowrap">
                                          {pIndex + 2}
                                        </td>
                                        <td className="p-2 text-xs min-w-[140px]">
                                          {participant.name || "—"}
                                        </td>
                                        <td className="p-2 text-xs whitespace-nowrap">
                                          {participant.phone || "—"}
                                        </td>
                                        <td className="p-2 text-xs whitespace-nowrap">
                                          {participant.sex || "—"}
                                        </td>
                                        <td className="p-2 text-xs min-w-[220px]">
                                          {participant.organization || "—"}
                                        </td>
                                        <td className="p-2 text-xs min-w-[130px]">
                                          {participant.subCity || "—"}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination
          page={meta.currentPage}
          totalPages={meta.totalPages}
          onChange={setPage}
        />
        <MessageModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          confirmLabel={modal.confirmLabel}
          cancelLabel={modal.cancelLabel}
        />
      </main>
    </div>
  );
}
