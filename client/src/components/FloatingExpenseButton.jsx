export function FloatingExpenseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-brand-500 text-4xl font-light text-white shadow-fab transition active:scale-95"
      aria-label="Add expense"
    >
      +
    </button>
  );
}
