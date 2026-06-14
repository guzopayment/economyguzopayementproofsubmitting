// import "./TopTicker.css";

// export default function TopTicker({ items = [], bgClass = "bg-purple-600", textClass = "text-white" }) {
//   const safeItems = Array.isArray(items) ? items.flat().filter(Boolean) : [];
//   const tickerText = safeItems.length ? safeItems.join("   •   ") : "Welcome";
//   return (
//     <div className={`top-ticker-fixed w-full overflow-hidden ${bgClass} ${textClass} shadow-sm border-b border-white/10`}>
//       <div className="top-ticker-viewport">
//         <div className="top-ticker-track">
//           <span className="top-ticker-text">{tickerText}</span>
//           <span className="top-ticker-text" aria-hidden="true">{tickerText}</span>
//         </div>
//       </div>
//     </div>
//   );
// }
import "./TopTicker.css";

export default function TopTicker({
  items = [],
  bgClass = "bg-purple-600",
  textClass = "text-white",
}) {
  return (
    <div
      className={`top-ticker fixed top-0 left-0 right-0 z-[100] h-[28px] sm:h-[32px] md:h-[38px] overflow-hidden shadow ${bgClass} ${textClass}`}
    >
      <div className="top-ticker-track">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center px-6 text-[9px] sm:text-[10px] md:text-sm font-medium whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
