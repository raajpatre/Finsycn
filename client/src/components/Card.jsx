export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/10 backdrop-blur ${className}`}>
      {children}
    </section>
  );
}
