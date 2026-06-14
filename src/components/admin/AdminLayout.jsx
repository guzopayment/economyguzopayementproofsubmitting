import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
