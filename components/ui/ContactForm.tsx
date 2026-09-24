"use client";
import { useState, type FormEvent } from "react";
import { submitContactAction } from "@/app/contact/actions";
import type { ContactSettings, ContactSubject, ContactSubmission } from "@/lib/contact";

type Props = { settings: ContactSettings; subjects: ContactSubject[]; submissionAvailable: boolean };
export function ContactForm({ settings, subjects, submissionAvailable }: Props) {
  const initialSubject = subjects[0]?.value || "";
  const [fields, setFields] = useState<ContactSubmission>({
    name: "",
    email: "",
    subject: initialSubject,
    message: "",
    company_website: "",
    initialized_at: 0,
  });
  const [feedback, setFeedback] = useState(submissionAvailable ? "> READY_FOR_TRANSMISSION" : "> DISPATCH_SERVICE_UNAVAILABLE");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "subject" | "message", string>>>({});
  const [pending, setPending] = useState(false);
  function update(field: keyof ContactSubmission, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    if (field in fieldErrors) setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFeedback("> READY_FOR_TRANSMISSION");
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await submitContactAction(fields);
      setFeedback(result.message);
      setFieldErrors(result.ok ? {} : (result.fieldErrors || {}));
      if (result.ok) setFields({ name: "", email: "", subject: initialSubject, message: "", company_website: "", initialized_at: Date.now() });
    } catch {
      setFeedback(
          "> TRANSMISSION_FAILED",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="panel contact-form-panel">
      <div className="window-bar">
        <span className="green">&gt; {settings.form_heading}</span>
        <span className={fields.message.length >= settings.max_message_length * 0.9 ? "buffer-warning" : undefined}>BUFFER: {fields.message.length} / {settings.max_message_length}</span>
      </div>
      <p id="delivery-notice" className="form-notice">
        {submissionAvailable
          ? (settings.form_intro && settings.form_intro !== "Contact form preview — delivery is not connected yet." ? settings.form_intro : "Messages are securely stored in the portfolio inbox.")
          : "Dispatch service is unavailable. Your draft will remain in this form."}
      </p>
      <form
        onSubmit={handleSubmit}
        onFocusCapture={() => setFields((current) => current.initialized_at ? current : { ...current, initialized_at: Date.now() })}
        aria-describedby="delivery-notice"
        className="contact-form"
      >
        <div className="contact-honeypot" aria-hidden="true">
          <label htmlFor="company-website">Company website</label>
          <input id="company-website" name="company_website" tabIndex={-1} autoComplete="off" value={fields.company_website} onChange={(e) => update("company_website", e.target.value)} />
        </div>
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
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "sender-name-error" : undefined}
            />
          </div>
          {fieldErrors.name && <p className="field-error" id="sender-name-error">{fieldErrors.name}</p>}
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
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "sender-email-error" : undefined}
            />
          </div>
          {fieldErrors.email && <p className="field-error" id="sender-email-error">{fieldErrors.email}</p>}
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
              required
              aria-invalid={Boolean(fieldErrors.subject)}
              aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
            >
              {subjects.map((subject) => <option value={subject.value} key={subject.id}>{subject.label}</option>)}
            </select>
          </div>
          {fieldErrors.subject && <p className="field-error" id="subject-error">{fieldErrors.subject}</p>}
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
              minLength={10}
              maxLength={settings.max_message_length}
              value={fields.message}
              onChange={(e) => update("message", e.target.value)}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "message-error" : undefined}
            />
          </div>
          {fieldErrors.message && <p className="field-error" id="message-error">{fieldErrors.message}</p>}
        </div>
        <button className="pixel-button" disabled={pending || !submissionAvailable || !subjects.length || fields.initialized_at === 0} type="submit">
          {pending ? "> TRANSMITTING_PACKET..." : `> ${settings.submit_label}`}
        </button>
        <p role="status" className="form-feedback" aria-live="polite">
          {feedback}
        </p>
      </form>
    </div>
  );
}
