import { SectionHeader } from "@/components/ui/SectionHeader";
export function GithubActivity() {
  return (
    <section id="github-activity" className="section">
      <div className="container">
        <SectionHeader
          index="06"
          label="DEV_ACTIVITY"
          title="Terminal mainframe & heatmap"
          meta="CONNECTION PENDING"
        />
        <div className="panel activity-terminal">
          <div className="window-bar">
            <span className="window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>bash — zhidan@helsinki: ~</span>
          </div>
          <div className="terminal-output code">
            <p>
              <span className="green">zhidan@helsinki:~$</span> git activity
              --connect
            </p>
            <p className="muted">Waiting for a verified GitHub profile.</p>
            <p className="cyan">
              No contribution data or commit history loaded.
            </p>
            <p className="muted">
              The contribution matrix will appear here once connected.
            </p>
            <p className="green">
              &gt; awaiting_connection
              <span className="cursor" aria-hidden="true" />
            </p>
          </div>
          <div className="card-meta">
            <span className="muted">CONTRIBUTION MATRIX // NO DATA</span>
            <span className="muted">[ NOT CONNECTED ]</span>
          </div>
          <div className="heatmap" aria-hidden="true">
            {Array.from({ length: 252 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <p className="micro muted">
            Contribution history is unavailable. Empty cells are placeholders,
            not activity records.
          </p>
        </div>
      </div>
    </section>
  );
}
