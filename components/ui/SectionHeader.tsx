export function SectionHeader({
  index,
  label,
  title,
  meta,
  description,
}: {
  index?: string;
  label: string;
  title: string;
  meta?: string;
  description?: string;
}) {
  return (
    <header className="section-header">
      <div className="section-eyebrow">
        <span>
          [ {index ? `${index} // ` : ""}
          {label} ]
        </span>
        <span className="section-rule" />
        {meta && <span className="section-meta">{meta}</span>}
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
