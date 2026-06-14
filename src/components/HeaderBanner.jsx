export default function HeaderBanner({ title }) {
  return (
    <div
      className="bg-gradient-to-r from-purple-400 to-purple-500 
      rounded-[40px] shadow-lg p-10 text-center mb-12"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wide">
        {title}
      </h1>
    </div>
  );
}
