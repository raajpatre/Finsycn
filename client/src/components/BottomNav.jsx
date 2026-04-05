import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/hangouts", label: "Hangouts" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" }
];

export function BottomNav() {
  return (
    <nav className="paper-scrap nav-pin paper-tilt-flat fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 p-2">
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
  );
}
