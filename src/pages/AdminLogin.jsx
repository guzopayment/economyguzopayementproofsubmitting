import { useState } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import MessageModal from "../components/MessageModal";

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");

  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/admin-dashboard";
  const sessionExpired = location.state?.sessionExpired;

  const showModal = (title, message, type = "info") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email.trim() || !password.trim()) {
      showModal("ማስጠንቀቂያ", "እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ።", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const expiresAt = Date.now() + SESSION_DURATION_MS;

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminSessionExpiresAt", String(expiresAt));

      showModal("ተሳክቷል", "በተሳካ ሁኔታ መግባት ተችሏል።", "success");

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (err) {
      showModal(
        "ማስጠንቀቂያ",
        err.response?.data?.message || "ለመግባት ውድቅ ሆኗል!",
        "error",
      );
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-200 px-4 py-6 overflow-x-hidden">
      <form
        onSubmit={handleLogin}
        className="bg-white p-5 md:p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl mb-3 text-center font-bold">
          ወደ የጉዞ ማረጋገጫ አስተዳደር መግቢያ | Booking Admin Login.
        </h2>

        {sessionExpired && (
          <p className="mb-4 text-sm text-red-600 font-semibold text-center">
            የቆይታዎ ጊዜ አብቅቷል። እባክዎ እንደገና ይግቡ! | Session expired. Please log in
            again.
          </p>
        )}

        <input
          type="email"
          placeholder="ኢሜይል"
          className="border p-3 mb-3 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="የይለፍ ቃል"
          className="border p-3 mb-5 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 text-white w-full py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
        >
          {loading ? "በመግባት ላይ..." : "ግቡ | Login"}
        </button>
      </form>

      <MessageModal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
