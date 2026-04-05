import { Pressable } from "./Pressable";

export function Modal({ open, title, onClose, children, panelClassName = "" }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(51,51,51,0.18)] p-4 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className={`paper-scrap taped-paper paper-tilt-right max-h-[85vh] w-full max-w-md overflow-y-auto p-5 ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-ink-dark">{title}</h2>
          <Pressable as="button" type="button" onClick={onClose} className="paper-button rounded-full px-3 py-2 text-sm">
            Close
          </Pressable>
        </div>
        {children}
      </div>
    </div>
  );
}
