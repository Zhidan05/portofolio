"use client";
import { useState, type FormEvent } from "react";
import { submitContact, type ContactPayload } from "@/lib/contact";
export function ContactForm() {
  const [fields, setFields] = useState<ContactPayload>({
    name: "",
    email: "",
    subject: "project",
    message: "",
  });
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  function update(field: keyof ContactPayload, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setFeedback("");
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await submitContact(fields);
      setFeedback(result.message);
    } catch {
      setFeedback(
        "Message not sent. Delivery is unavailable; your draft has been kept.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="panel contact-form-panel">
      <div className="window-bar">
        <span className="green">&gt; TRANSMIT_MESSAGE.SH</span>
        <span>BUFFER: {fields.message.length} / 1024</span>
      </div>
      <p id="delivery-notice" className="form-notice">
        Contact form preview — delivery is not connected yet.
      </p>
      <form
        onSubmit={handleSubmit}
        aria-describedby="delivery-notice"
        className="contact-form"
      >
        <div className="field">
          <label htmlFor="sender-name">&gt; IDENTIFIER // SENDER_NAME:</label>
          <div className="input-shell">
            <span className="green" aria-hidden="true">
              $
            </span>
            <input
              id="sender-name"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              required
              maxLength={100}
              value={fields.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="sender-email">&gt; ROUTING // SENDER_EMAIL:</label>
          <div className="input-shell">
            <span className="cyan" aria-hidden="true">
              $
            </span>
            <input
              id="sender-email"
              name="email"
              autoComplete="email"
              placeholder="name@domain.com"
              type="email"
              required
              maxLength={254}
              value={fields.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="subject">&gt; PROTOCOL // SUBJECT_INTENT:</label>
          <div className="input-shell">
            <span className="violet" aria-hidden="true">
              $
            </span>
            <select
              id="subject"
              name="subject"
              value={fields.subject}
              onChange={(e) => update("subject", e.target.value)}
            >
              <option value="project">Project Inquiry / Contract</option>
              <option value="opportunity">Internship / Job Opportunity</option>
              <option value="research">Computer Vision / AI Research</option>
              <option value="other">General Dev Discussion</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="message">&gt; PAYLOAD // MESSAGE_BUFFER:</label>
          <div className="input-shell message-shell">
            <span className="green" aria-hidden="true">
              &gt;
            </span>
            <textarea
              id="message"
              name="message"
              placeholder="Type your project brief or query here…"
              rows={5}
              required
              maxLength={1024}
              value={fields.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </div>
        </div>
        <button className="pixel-button" disabled={pending} type="submit">
          {pending ? "> CHECKING DELIVERY…" : "> DISPATCH MESSAGE →"}
        </button>
        <p role="status" className="form-feedback" aria-live="polite">
          {feedback}
        </p>
      </form>
    </div>
  );
}
