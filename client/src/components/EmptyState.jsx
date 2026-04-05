export function EmptyState({ title, body }) {
  return (
    <div className="paper-panel rounded-[2rem] border-dashed px-5 py-10 text-center">
      <h3 className="font-heading text-lg font-semibold text-ink-dark">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-charcoal/70">{body}</p>
    </div>
  );
}
