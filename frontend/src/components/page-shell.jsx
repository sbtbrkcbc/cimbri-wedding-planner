import React from "react";

export function PageHeader({ eyebrow, title, description, children, testId }) {
  return (
    <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-testid={testId}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mt-2 text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-ink-soft max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {children && <div className="flex gap-3 items-center shrink-0">{children}</div>}
    </header>
  );
}

export function PageContainer({ children, className = "" }) {
  return (
    <div className={`px-6 md:px-10 lg:px-14 py-10 md:py-14 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="font-heading text-2xl md:text-3xl mt-1">{title}</h2>}
      </div>
      {children}
    </div>
  );
}
