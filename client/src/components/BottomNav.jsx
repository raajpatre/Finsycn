import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/hangouts", label: "Hangouts" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" }
];

export function BottomNav() {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 flex-col items-center gap-2">
      <p className="font-heading text-xs tracking-[0.18em] text-ink-charcoal/60">
        Made with ❤️ By raajpatre.dev
      </p>
      <nav className="paper-scrap nav-pin paper-tilt-flat flex w-full p-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
                isActive ? "marker-button" : "text-ink-charcoal/65"
              }`
            }
          >
            <motion.span whileTap={{ scale: 0.96, y: 1 }} whileHover={{ y: -1 }} className="block">
              {item.label}
            </motion.span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
