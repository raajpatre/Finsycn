export function Modal({ open, title, onClose, children, panelClassName = "" }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-5 ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-2 text-slate-400">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
