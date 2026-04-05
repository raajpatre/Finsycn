export function EmptyState({ title, body }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}
