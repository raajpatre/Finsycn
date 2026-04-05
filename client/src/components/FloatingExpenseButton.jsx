import { Pressable } from "./Pressable";

export function FloatingExpenseButton({ onClick }) {
  return (
    <Pressable
      as="button"
      onClick={onClick}
      className="fixed bottom-24 left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-marker-red font-heading text-4xl font-light text-white shadow-fab transition"
      aria-label="Add expense"
      whileTap={{ scale: 0.92, rotate: -4, y: 1 }}
      whileHover={{ y: -2, rotate: -1 }}
    >
      +
    </Pressable>
  );
}
