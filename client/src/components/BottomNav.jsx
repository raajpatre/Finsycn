import { NavLink } from "react-router-dom";

const items = [
  { to: "/hangouts", label: "Hangouts" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" }
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/80 p-2 backdrop-blur">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
              isActive ? "bg-brand-600 text-white" : "text-slate-400"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
