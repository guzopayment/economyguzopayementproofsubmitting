
import { useMemo } from "react";

function buildPages(currentPage, totalPages, boundaryCount = 2, siblingCount = 1) {
  if (totalPages <= 1) return [1];

  const pages = new Set();

  for (let i = 1; i <= Math.min(boundaryCount, totalPages); i += 1) pages.add(i);
  for (let i = Math.max(totalPages - boundaryCount + 1, 1); i <= totalPages; i += 1) pages.add(i);
  for (let i = Math.max(currentPage - siblingCount, 1); i <= Math.min(currentPage + siblingCount, totalPages); i += 1) {
    pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("...");
    result.push(page);
    previous = page;
  }

  return result;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "",
}) {
  const pages = useMemo(
    () => buildPages(page, totalPages),
    [page, totalPages],
  );

  if (!totalPages || totalPages < 1) return null;

  const goTo = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onChange(nextPage);
  };

  return (
    <div className={`flex flex-wrap justify-center items-center gap-2 mt-6 px-2 ${className}`}>
      <button
        disabled={page === 1}
        onClick={() => goTo(page - 1)}
        className="bg-emerald-700 text-white px-3 md:px-4 py-2 rounded-full shadow disabled:opacity-40 hover:bg-emerald-800 transition text-sm"
      >
        Prev
      </button>

      {pages.map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-emerald-700 font-semibold">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => goTo(item)}
            className={`min-w-[38px] md:min-w-[42px] px-3 py-2 rounded-full shadow transition font-semibold text-sm ${
              item === page
                ? "bg-emerald-800 text-white"
                : "bg-white text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        disabled={page === totalPages}
        onClick={() => goTo(page + 1)}
        className="bg-emerald-700 text-white px-3 md:px-4 py-2 rounded-full shadow disabled:opacity-40 hover:bg-emerald-800 transition text-sm"
      >
        Next
      </button>
    </div>
  );
}
