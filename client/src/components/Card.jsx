export function Card({ children, className = "", tilt = "left" }) {
  const tiltClass =
    tilt === "right" ? "paper-tilt-right" : tilt === "flat" ? "paper-tilt-flat" : "paper-tilt-left";

  return (
    <section
      className={`paper-scrap ${tiltClass} p-4 ${className}`}
    >
      {children}
    </section>
  );
}
