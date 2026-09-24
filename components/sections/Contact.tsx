import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/ui/ContactForm";
import { readPublicContact } from "@/services/publicContactService";

const icons: Record<string, string> = { email: "@", github: "</>", linkedin: "in", instagram: "◎", website: "//" };
function sectionParts(label: string) {
  const match = label.match(/^\s*(\d+)\s*\/\/\s*(.+)$/);
  return match ? { index: match[1], label: match[2] } : { index: "07", label };
}

export async function Contact() {
  const contact = await readPublicContact();
  const section = sectionParts(contact.settings.section_label);
  return (
    <section id="contact" className="section section-dark">
      <div className="container">
        <SectionHeader
          index={section.index}
          label={section.label}
          title={contact.settings.heading}
          meta="LET'S CONNECT"
          description={contact.settings.description}
        />
        <div className="contact-grid">
          <div>
            <div className="panel direct-channels">
              <h3 className="code cyan">{`// ${contact.settings.channels_heading}`}</h3>
              {contact.channels.map((channel) => {
                const href = channel.status === "active" ? channel.url : null;
                const external = Boolean(href?.startsWith("http://") || href?.startsWith("https://"));
                const content = (
                  <>
                    <span className="channel-icon" aria-hidden="true" style={{ color: channel.accent.startsWith("#") ? channel.accent : `var(--${channel.accent})` }}>
                      {icons[channel.type] || "◇"}
                    </span>
                    <span>
                      <span className="micro muted">{channel.label}</span>
                      <span className="code">
                        {channel.value || "Details coming soon"}
                      </span>
                    </span>
                    <span className="micro muted">
                      {href ? "[ ↗ ]" : `[ ${channel.status_label || "PENDING"} ]`}
                    </span>
                  </>
                );
                return href ? (
                  <a
                    className="channel"
                    href={href}
                    key={channel.id}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={`${channel.label}: ${channel.value || "open channel"}`}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="channel" key={channel.id}>
                    {content}
                  </div>
                );
              })}
            </div>
            {(contact.settings.channels_footer_title || contact.settings.channels_footer_text) && <div className="contact-note micro">
              {contact.settings.channels_footer_title && <span className="cyan">[ {contact.settings.channels_footer_title} ]</span>}
              {contact.settings.channels_footer_text && <p>{contact.settings.channels_footer_text}</p>}
            </div>}
          </div>
          <ContactForm settings={contact.settings} subjects={contact.subjects} submissionAvailable={contact.submissionAvailable} />
        </div>
      </div>
    </section>
  );
}
