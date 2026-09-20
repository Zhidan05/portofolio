import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/ui/ContactForm";
import { profile } from "@/data/profile";
export function Contact() {
  const channels = [
    {
      label: "PRIMARY EMAIL",
      icon: "@",
      value: profile.email,
      href: profile.email ? `mailto:${profile.email}` : null,
    },
    {
      label: "CODE REPOSITORY",
      icon: "</>",
      value: profile.github,
      href: profile.github,
    },
    {
      label: "PROFESSIONAL NETWORK",
      icon: "in",
      value: profile.linkedin,
      href: profile.linkedin,
    },
    {
      label: "DEVELOPER DISPATCH",
      icon: "◎",
      value: profile.instagram,
      href: profile.instagram,
    },
  ];
  return (
    <section id="contact" className="section section-dark">
      <div className="container">
        <SectionHeader
          index="07"
          label="DISPATCH_CONSOLE"
          title="Let's build something useful"
          meta="LET'S CONNECT"
          description="Interested in software engineering collaboration, computer vision research, or full-stack applications? Let's turn a useful idea into something real."
        />
        <div className="contact-grid">
          <div>
            <div className="panel direct-channels">
              <h3 className="code cyan">{"// DIRECT_CHANNELS"}</h3>
              {channels.map((channel) => {
                const content = (
                  <>
                    <span className="channel-icon" aria-hidden="true">
                      {channel.icon}
                    </span>
                    <span>
                      <span className="micro muted">{channel.label}</span>
                      <span className="code">
                        {channel.value || "Details coming soon"}
                      </span>
                    </span>
                    <span className="micro muted">
                      {channel.href ? "[ ↗ ]" : "[ PENDING ]"}
                    </span>
                  </>
                );
                return channel.href ? (
                  <a
                    className="channel"
                    href={channel.href}
                    key={channel.label}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="channel" key={channel.label}>
                    {content}
                  </div>
                );
              })}
            </div>
            <div className="contact-note micro">
              <span className="cyan">[ CHANNELS PENDING ]</span>
              <p>Verified contact details will be published here.</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
