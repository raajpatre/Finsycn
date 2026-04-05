export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="mb-5">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">{eyebrow}</p> : null}
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-dark">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-ink-charcoal/70">{subtitle}</p> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </header>
  );
}
