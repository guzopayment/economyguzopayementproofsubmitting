import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-lg">Vacation Ticket Tracker</h1>

      <div className="space-x-4">
        <Link to="/">Book Ticket</Link>
        <Link to="/admin">Admin</Link>
      </div>
    </nav>
  );
}
