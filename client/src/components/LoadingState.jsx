export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-slate-400">
      {label}
    </div>
  );
}
