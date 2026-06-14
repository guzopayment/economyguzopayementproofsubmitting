import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/qineeSocialDeputs.jpg";
import clickOn from "../assets/clickOn.gif";
import api from "../services/api";
import socket from "../socket";
import MessageModal from "../components/MessageModal";
import { ORGANIZATIONS } from "../constants/bookingOptions";
import {
  sanitizeAlphabeticInput,
  sanitizePhoneInput,
  buildStatusMessage,
} from "../utils/bookingValidation";

function StatusBadge({ status }) {
  const cls =
    status === "Confirmed"
      ? "bg-green-100 text-green-700"
      : status === "Rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>
      {status || "Pending"}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [lookup, setLookup] = useState({
    name: "",
    phone: "",
    organization: "",
  });
  const [tooltip, setTooltip] = useState("");
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [lookupResults, setLookupResults] = useState([]);
  const [checking, setChecking] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });
  const scrollRef = useRef(null);

  const showModal = (title, message, type = "info") =>
    setModal({ open: true, title, message, type });

  const fetchRecentUpdates = async () => {
    try {
      const res = await api.get("/bookings/public/recent", {
        params: { limit: 16 },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setRecentUpdates(data);
    } catch (error) {
      console.error(
        "Recent updates error:",
        error.response?.data || error.message,
      );
      setRecentUpdates([]);
    }
  };

  useEffect(() => {
    fetchRecentUpdates();
  }, []);

  useEffect(() => {
    const onBookingUpdate = () => fetchRecentUpdates();
    socket.on("bookingStatusUpdated", onBookingUpdate);
    socket.on("newBooking", onBookingUpdate);
    return () => {
      socket.off("bookingStatusUpdated", onBookingUpdate);
      socket.off("newBooking", onBookingUpdate);
    };
  }, []);

  useEffect(() => {
    if (!tooltip) return undefined;
    const timer = setTimeout(() => setTooltip(""), 2000);
    return () => clearTimeout(timer);
  }, [tooltip]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || recentUpdates.length <= 1) return undefined;

    const interval = setInterval(() => {
      const half = container.scrollHeight / 2;
      if (container.scrollTop >= half) {
        container.scrollTop = 0;
      } else {
        container.scrollTop += 1;
      }
    }, 35);

    return () => clearInterval(interval);
  }, [recentUpdates]);

  const handleNameChange = (value) => {
    const sanitized = sanitizeAlphabeticInput(value);
    if (value !== sanitized) setTooltip("ስም ፊደላትን እና ክፍተትን ብቻ ይቀበላል።");
    setLookup((prev) => ({ ...prev, name: sanitized }));
  };

  const handlePhoneChange = (value) => {
    const sanitized = sanitizePhoneInput(value);
    if (value !== sanitized)
      setTooltip("ስልክ ቁጥር ቁጥሮችን ብቻ ይቀበላል፤ ከ10 ዲጂት መብለጥ አይችልም።");
    setLookup((prev) => ({ ...prev, phone: sanitized }));
  };

  const checkStatus = async () => {
    if (
      !lookup.name.trim() &&
      !lookup.phone.trim() &&
      !lookup.organization.trim()
    ) {
      showModal(
        "ማስጠንቀቂያ",
        "የሁኔታ ምርመራ ለማድረግ እባክዎ ስም፣ ስልክ ወይም ድርጅት ያስገቡ።",
        "error",
      );
      return;
    }

    try {
      setChecking(true);
      const res = await api.get("/bookings/public/status", { params: lookup });
      const data = Array.isArray(res.data) ? res.data : [];
      setLookupResults(data);
      if (!data.length) {
        showModal("ማስጠንቀቂያ", "በገባው መረጃ መሰረት ምንም ማስገባት አልተገኘም።", "error");
      }
    } catch (error) {
      setLookupResults([]);
      showModal(
        "ማስጠንቀቂያ",
        error.response?.data?.message || "በገባው መረጃ መሰረት ምንም ማስገባት አልተገኘም።",
        "error",
      );
    } finally {
      setChecking(false);
    }
  };

  const duplicatedUpdates = useMemo(() => {
    if (!recentUpdates.length) return [];
    return [...recentUpdates, ...recentUpdates];
  }, [recentUpdates]);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-center overflow-x-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-purple-50/90 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center overflow-x-hidden">
        <div className="w-full max-w-5xl mx-auto text-center">
          <div className="backdrop-blur-xl shadow-xl py-5 px-3 md:px-5 mb-7 rounded-3xl bg-white/50">
            <h1 className="text-xl md:text-3xl font-bold text-purple-700 tracking-wide leading-tight">
              የዝክረ ቅዱሳን ጉዞ ወደ መናገሻ ጋራው መድኃኔዓለም አንድነት ገዳም!!
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-purple-700 font-semibold">
              Zikre Kidusan Traveling To Menagesha Garaw Medhanealem Unity
              Monastery!
            </p>
          </div>

          <div className="flex justify-center items-center mb-8">
            <div className="w-full max-w-3xl">
              <h2 className="text-purple-700 text-xl md:text-2xl px-3 py-4 rounded-[30px] font-bold">
                ውድ ቤተሰባችን እንኳን ደኅና መጡ፤ የጉዞ ትኬት የክፍያ ማስረጃ ማስገቢያ ቅጽን ለመሙላት ፥
              </h2>
              <h5 className="text-green-700 font-bold place-items-center mb-4">
                ከታች የክፍያ ደረሰኝ ያስገቡ / Submit Payment የሚለውን ይንኩ
                <img
                  src={clickOn}
                  alt="Click On"
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto"
                />
              </h5>
              <button
                onClick={() => navigate("/submit")}
                className="bg-purple-700 text-white text-xl md:text-3xl px-8 md:px-16 py-5 md:py-7 rounded-[30px] shadow-lg hover:scale-105 hover:bg-purple-800 transition duration-300 border border-white/30 w-full"
              >
                የክፍያ ደረሰኝ ያስገቡ / Submit Payment
              </button>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto bg-white/80 rounded-3xl shadow-xl p-5 md:p-6 mb-8 text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-2xl font-bold text-purple-700">
                Find submission status
              </h3>
              <p className="text-sm text-gray-500">
                Search by full name, phone number, or organization.
              </p>
            </div>

            {tooltip ? (
              <p className="mb-3 text-sm text-red-500 font-medium">{tooltip}</p>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <input
                value={lookup.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Full name / ሙሉ ስም"
                className="w-full bg-white rounded-2xl px-4 py-3 shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                value={lookup.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Phone number / ስልክ ቁጥር"
                inputMode="numeric"
                className="w-full bg-white rounded-2xl px-4 py-3 shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <select
                value={lookup.organization}
                onChange={(e) =>
                  setLookup((prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
                className="w-full bg-white rounded-2xl px-4 py-3 shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Organization / ድርጅት</option>
                {ORGANIZATIONS.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={checkStatus}
                disabled={checking}
                className="bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-800 transition disabled:opacity-60"
              >
                {checking ? "Checking..." : "Check Status"}
              </button>
              <button
                onClick={() => {
                  setLookup({ name: "", phone: "", organization: "" });
                  setLookupResults([]);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-300 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {lookupResults.length > 0 && (
            <div className="w-full max-w-4xl mx-auto bg-white/85 rounded-3xl shadow-xl p-5 md:p-6 mb-8 text-left">
              <h3 className="text-2xl font-bold text-purple-700 mb-4">
                Status result
              </h3>
              <div className="space-y-4">
                {lookupResults.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-purple-100 bg-white p-4 md:p-5 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-purple-700">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.organization} • {item.phone} •{" "}
                          {item.subCity || "—"}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {item.message || buildStatusMessage(item.status)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Updated: {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full max-w-4xl mx-auto bg-white/85 rounded-3xl shadow-xl p-5 md:p-6 text-left">
            <h3 className="text-2xl font-bold text-purple-700 mb-4">
              Recently submitted updates
            </h3>
            <div
              ref={scrollRef}
              className="h-[280px] overflow-hidden relative rounded-2xl"
            >
              <div className="space-y-4 pb-4">
                {duplicatedUpdates.length ? (
                  duplicatedUpdates.map((item, index) => (
                    <div
                      key={`${item._id}-${index}`}
                      className="rounded-2xl border border-purple-100 bg-white p-4 md:p-5 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-purple-700">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.organization} • {item.phone} •{" "}
                            {item.subCity || "—"}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-gray-700">
                        {item.message || buildStatusMessage(item.status)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Updated: {new Date(item.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-purple-100 bg-white p-6 text-center text-gray-500 shadow-sm">
                    No recent updates yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MessageModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
