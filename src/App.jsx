import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import BookingForm from "./pages/BookingForm";
import ThankYou from "./pages/ThankYou";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReport from "./pages/AdminReport";
import AdminHistory from "./pages/AdminHistory";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import SessionManager from "./components/admin/SessionManager";
import Footer from "./components/Footer";
import BackToTopButton from "./components/BackToTopButton";

export default function App() {
  return (
    <BrowserRouter>
      <SessionManager />

      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<BookingForm />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-report"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <AdminReport />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-history"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <AdminHistory />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
        <BackToTopButton />
      </div>
    </BrowserRouter>
  );
}
