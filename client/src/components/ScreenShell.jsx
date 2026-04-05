export function ScreenShell({ children }) {
  return (
    <div className="min-h-screen bg-paper-bg text-ink-charcoal">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-5">
        {children}
      </div>
    </div>
  );
}
