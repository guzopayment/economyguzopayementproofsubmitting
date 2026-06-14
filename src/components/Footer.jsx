// Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-purple-200/60 bg-white/70 backdrop-blur-sm mt-10">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center break-words">
        <h4 className="text-sm md:text-base text-purple-700 font-medium">
          &copy; {year} Powered by{" "}
          <a
            href="https://mulutilacodecomp.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-purple-800 hover:text-purple-600 underline underline-offset-4 transition"
          >
            MuluTilaCodeComp
          </a>
          .|.std.
        </h4>
      </div>
    </footer>
  );
}
