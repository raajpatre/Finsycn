export function ScreenShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_28%),linear-gradient(180deg,_#08101d_0%,_#0f172a_50%,_#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-4">
        {children}
      </div>
    </div>
  );
}
