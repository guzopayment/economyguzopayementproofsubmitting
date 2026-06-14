export default function Navbar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between">
      <h1 className="text-xl font-semibold text-purple-600">Admin Panel</h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">Admin</span>
        <div className="w-10 h-10 rounded-full bg-purple-400" />
      </div>
    </header>
  );
}
