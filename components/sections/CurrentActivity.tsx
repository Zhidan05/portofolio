import { activities } from "@/data/activities";
import { SectionHeader } from "@/components/ui/SectionHeader";
export function CurrentActivity() {
  return (
    <section id="activity" className="section section-dark">
      <div className="container">
        <SectionHeader
          label="ACTIVE_SIDE_QUESTS"
          title="Current campaigns"
          meta="IN_PROGRESS_TASKS"
          description="What I am learning, experimenting with, and refining in the lab."
        />
        <div className="activities-grid">
          {activities.map((activity, i) => (
            <article
              className={`panel activity-card accent-${activity.accent}`}
              key={activity.title}
            >
              <div className="card-meta">
                <span>QUEST #0{i + 1}</span>
                <span aria-hidden="true">⌑</span>
              </div>
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <div className="activity-status micro">
                <span className="muted">STATUS:</span>
                <span>{activity.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
