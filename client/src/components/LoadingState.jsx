export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="paper-panel flex items-center justify-center rounded-[2rem] py-16 text-sm text-ink-charcoal/70">
      {label}
    </div>
  );
}
