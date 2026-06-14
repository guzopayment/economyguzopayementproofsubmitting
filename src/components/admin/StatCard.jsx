export default function StatCard({ number, label }) {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-md
      text-center w-full md:w-60"
    >
      <h2 className="text-4xl font-bold text-purple-600">{number}</h2>
      <p className="mt-2 text-gray-600">{label}</p>
    </div>
  );
}
