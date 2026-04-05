export function ScreenShell({ children }) {
  return (
    <div className="min-h-screen bg-paper-bg text-ink-charcoal">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-36 pt-5">
        {children}
        <p className="mt-auto pt-6 text-center font-heading text-xs tracking-[0.18em] text-ink-charcoal/60">
          Made with ❤️ By raajpatre.dev
        </p>
      </div>
    </div>
  );
}
