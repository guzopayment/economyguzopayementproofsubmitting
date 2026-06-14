export default function MessageModal({
  open,
  title = "መልዕክት",
  message = "",
  type = "info",
  onClose,
  onConfirm = null,
  confirmLabel = "እሺ",
  cancelLabel = "አይ",
}) {
  if (!open) return null;

  const tone =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : type === "warning"
          ? "bg-amber-500"
          : "bg-purple-500";

  const isConfirmMode = typeof onConfirm === "function";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_.2s_ease]">
        <div className={`${tone} px-5 py-4 text-white`}>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        <div className="px-5 py-5">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="px-5 pb-5 flex flex-wrap justify-end gap-3">
          {isConfirmMode ? (
            <>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl shadow hover:bg-gray-300 hover:scale-105 transition"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="bg-purple-600 text-white px-5 py-2 rounded-xl shadow hover:bg-purple-700 hover:scale-105 transition"
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-5 py-2 rounded-xl shadow hover:bg-purple-700 hover:scale-105 transition"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
