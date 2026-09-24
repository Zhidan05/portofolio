"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminContactData, ContactChannel, ContactMessage, ContactSettings, ContactSubject, ContactMessageStatus } from "@/lib/contact";
import {
  archiveContactMessageAction, deleteContactChannelAction, deleteContactSubjectAction,
  markContactMessageReadAction, reorderContactChannelsAction, reorderContactSubjectsAction,
  saveContactChannelAction, saveContactSettingsAction, saveContactSubjectAction,
} from "@/app/(control)/admin/contact/actions";

type Tab = "CONTENT" | "CHANNELS" | "SUBJECTS" | "INBOX";
type RemoveTarget = { kind: "channel"; item: ContactChannel } | { kind: "subject"; item: ContactSubject };
const blankChannel = (contactId: string, order: number): ContactChannel => ({ id: crypto.randomUUID(), contact_id: contactId, type: "other", label: "", value: null, url: null, status: "pending", status_label: "PENDING", accent: "primary", sort_order: order, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
const blankSubject = (contactId: string, order: number): ContactSubject => ({ id: crypto.randomUUID(), contact_id: contactId, value: "", label: "", enabled: true, sort_order: order, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
const subjectLabel = (message: ContactMessage, subjects: ContactSubject[]) => subjects.find((item) => item.value === message.subject_value)?.label || message.subject_value;

export function ContactManager({ initialData }: { initialData: AdminContactData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("CONTENT");
  const [settings, setSettings] = useState(initialData.settings);
  const [channels, setChannels] = useState(initialData.channels);
  const [subjects, setSubjects] = useState(initialData.subjects);
  const [messages, setMessages] = useState(initialData.messages);
  const [channelDraft, setChannelDraft] = useState<ContactChannel | null>(null);
  const [subjectDraft, setSubjectDraft] = useState<ContactSubject | null>(null);
  const [openedMessage, setOpenedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | ContactMessageStatus>("all");
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("> READY_");
  const newCount = messages.filter((message) => message.status === "new").length;
  const visibleMessages = useMemo(() => filter === "all" ? messages : messages.filter((message) => message.status === filter), [filter, messages]);

  async function run(operation: () => Promise<{ ok: boolean; message?: string }>, success: string) {
    setBusy(true); setFeedback("> PROCESSING...");
    try {
      const result = await operation();
      if (!result.ok) { setFeedback(`> ERROR: ${result.message || "OPERATION_FAILED"}`); return false; }
      setFeedback(`> ${success}`); router.refresh(); return true;
    } catch { setFeedback("> ERROR: OPERATION_FAILED"); return false; }
    finally { setBusy(false); }
  }

  async function saveSettings() {
    const saved = await run(() => saveContactSettingsAction(settings), "CONTACT_CONTENT_SAVED");
    if (saved) setSettings((current) => ({ ...current, updated_at: new Date().toISOString() }));
  }
  async function saveChannel() {
    if (!channelDraft) return;
    const saved = await run(() => saveContactChannelAction(channelDraft), "CHANNEL_SAVED");
    if (saved) { setChannels((items) => [...items.filter((item) => item.id !== channelDraft.id), channelDraft].sort((a, b) => a.sort_order - b.sort_order)); setChannelDraft(null); }
  }
  async function saveSubject() {
    if (!subjectDraft) return;
    const saved = await run(() => saveContactSubjectAction(subjectDraft), "SUBJECT_SAVED");
    if (saved) { setSubjects((items) => [...items.filter((item) => item.id !== subjectDraft.id), subjectDraft].sort((a, b) => a.sort_order - b.sort_order)); setSubjectDraft(null); }
  }
  async function moveChannel(index: number, offset: number) {
    const target = index + offset; if (target < 0 || target >= channels.length) return;
    const next = [...channels]; [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((item, position) => ({ ...item, sort_order: position })); setChannels(ordered);
    if (!await run(() => reorderContactChannelsAction(ordered.map((item) => item.id)), "CHANNEL_ORDER_SAVED")) setChannels(channels);
  }
  async function moveSubject(index: number, offset: number) {
    const target = index + offset; if (target < 0 || target >= subjects.length) return;
    const next = [...subjects]; [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((item, position) => ({ ...item, sort_order: position })); setSubjects(ordered);
    if (!await run(() => reorderContactSubjectsAction(ordered.map((item) => item.id)), "SUBJECT_ORDER_SAVED")) setSubjects(subjects);
  }
  async function quickSaveChannel(channel: ContactChannel) {
    setChannels((items) => items.map((item) => item.id === channel.id ? channel : item));
    if (!await run(() => saveContactChannelAction(channel), "CHANNEL_STATUS_SAVED")) router.refresh();
  }
  async function quickSaveSubject(subject: ContactSubject) {
    setSubjects((items) => items.map((item) => item.id === subject.id ? subject : item));
    if (!await run(() => saveContactSubjectAction(subject), "SUBJECT_STATUS_SAVED")) router.refresh();
  }
  async function confirmRemove() {
    if (!removeTarget) return;
    const result = removeTarget.kind === "channel"
      ? await run(() => deleteContactChannelAction(removeTarget.item.id), "CHANNEL_REMOVED")
      : await run(() => deleteContactSubjectAction(removeTarget.item.id), "SUBJECT_REMOVED");
    if (result) {
      if (removeTarget.kind === "channel") setChannels((items) => items.filter((item) => item.id !== removeTarget.item.id));
      else setSubjects((items) => items.filter((item) => item.id !== removeTarget.item.id));
      setRemoveTarget(null);
    }
  }
  async function openMessage(message: ContactMessage) {
    let next = message;
    if (message.status === "new") {
      next = { ...message, status: "read", read_at: new Date().toISOString() };
      setMessages((items) => items.map((item) => item.id === message.id ? next : item));
      await run(() => markContactMessageReadAction(message.id), "MESSAGE_MARKED_READ");
    }
    setOpenedMessage(next);
  }
  async function archiveMessage(message: ContactMessage) {
    const archived = { ...message, status: "archived" as const, archived_at: new Date().toISOString() };
    if (await run(() => archiveContactMessageAction(message.id), "MESSAGE_ARCHIVED")) {
      setMessages((items) => items.map((item) => item.id === message.id ? archived : item)); setOpenedMessage(archived);
    }
  }

  return <div className="contact-manager">
    <div className="admin-tabs" role="tablist" aria-label="Contact administration">
      {(["CONTENT", "CHANNELS", "SUBJECTS", "INBOX"] as Tab[]).map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}{item === "INBOX" && newCount > 0 ? ` [${newCount}]` : ""}</button>)}
    </div>

    {tab === "CONTENT" && <ContentTab settings={settings} setSettings={setSettings} onSave={saveSettings} busy={busy} />}
    {tab === "CHANNELS" && <ChannelsTab channels={channels} draft={channelDraft} setDraft={setChannelDraft} onSave={saveChannel} onMove={moveChannel} onStatus={quickSaveChannel} onRemove={(item) => setRemoveTarget({ kind: "channel", item })} onAdd={() => setChannelDraft(blankChannel(settings.id, channels.length))} busy={busy} />}
    {tab === "SUBJECTS" && <SubjectsTab subjects={subjects} draft={subjectDraft} setDraft={setSubjectDraft} onSave={saveSubject} onMove={moveSubject} onToggle={quickSaveSubject} onRemove={(item) => setRemoveTarget({ kind: "subject", item })} onAdd={() => setSubjectDraft(blankSubject(settings.id, subjects.length))} busy={busy} />}
    {tab === "INBOX" && <InboxTab messages={visibleMessages} subjects={subjects} newCount={newCount} filter={filter} setFilter={setFilter} opened={openedMessage} onOpen={openMessage} onClose={() => setOpenedMessage(null)} onArchive={archiveMessage} busy={busy} />}

    <p className="code cyan admin-feedback" role="status" aria-live="polite">{feedback}</p>
    <ConfirmDialog isOpen={Boolean(removeTarget)} title="[ SYSTEM WARNING // REMOVE CONTACT RECORD ]" message="> CONFIRM_RECORD_REMOVAL" itemName={removeTarget?.item.label} description="This removes the configured item. Existing inbox messages are retained." confirmLabel="REMOVE" destructive loading={busy} onConfirm={confirmRemove} onCancel={() => setRemoveTarget(null)} />
  </div>;
}

function ContentTab({ settings, setSettings, onSave, busy }: { settings: ContactSettings; setSettings: (value: ContactSettings) => void; onSave: () => void; busy: boolean }) {
  const update = <K extends keyof ContactSettings>(key: K, value: ContactSettings[K]) => setSettings({ ...settings, [key]: value });
  return <form className="control-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <fieldset className="panel control-fields"><legend className="code cyan">PUBLIC SECTION</legend><div className="form-grid">
      <label><span>SECTION LABEL</span><input required maxLength={100} value={settings.section_label} onChange={(e) => update("section_label", e.target.value)} /></label>
      <label><span>HEADING</span><input required maxLength={200} value={settings.heading} onChange={(e) => update("heading", e.target.value)} /></label>
      <label className="full-width"><span>DESCRIPTION</span><textarea required maxLength={1000} rows={4} value={settings.description} onChange={(e) => update("description", e.target.value)} /></label>
    </div></fieldset>
    <fieldset className="panel control-fields"><legend className="code cyan">DIRECT CHANNELS COPY</legend><div className="form-grid">
      <label><span>CHANNELS HEADING</span><input required maxLength={100} value={settings.channels_heading} onChange={(e) => update("channels_heading", e.target.value)} /></label>
      <label><span>CHANNEL STATUS LABEL</span><input maxLength={100} value={settings.channels_status_label || ""} onChange={(e) => update("channels_status_label", e.target.value || null)} /></label>
      <label><span>CHANNEL FOOTER TITLE</span><input maxLength={100} value={settings.channels_footer_title || ""} onChange={(e) => update("channels_footer_title", e.target.value || null)} /></label>
      <label><span>CHANNEL FOOTER TEXT</span><input maxLength={500} value={settings.channels_footer_text || ""} onChange={(e) => update("channels_footer_text", e.target.value || null)} /></label>
    </div></fieldset>
    <fieldset className="panel control-fields"><legend className="code cyan">MESSAGE FORM</legend><div className="form-grid">
      <label><span>FORM HEADING</span><input required maxLength={100} value={settings.form_heading} onChange={(e) => update("form_heading", e.target.value)} /></label>
      <label><span>SUBMIT LABEL</span><input required maxLength={100} value={settings.submit_label} onChange={(e) => update("submit_label", e.target.value)} /></label>
      <label className="full-width"><span>FORM INTRO</span><textarea maxLength={500} rows={3} value={settings.form_intro || ""} onChange={(e) => update("form_intro", e.target.value || null)} /></label>
      <label><span>MESSAGE MAX LENGTH</span><input type="number" min={100} max={5000} required value={settings.max_message_length} onChange={(e) => update("max_message_length", Number(e.target.value))} /></label>
    </div></fieldset>
    <button type="submit" className="pixel-button" disabled={busy}>SAVE CONTACT CONTENT</button>
  </form>;
}

function ChannelsTab({ channels, draft, setDraft, onSave, onMove, onStatus, onRemove, onAdd, busy }: { channels: ContactChannel[]; draft: ContactChannel | null; setDraft: (value: ContactChannel | null) => void; onSave: () => void; onMove: (index: number, offset: number) => void; onStatus: (item: ContactChannel) => void; onRemove: (item: ContactChannel) => void; onAdd: () => void; busy: boolean }) {
  return <div className="admin-stack"><button type="button" className="pixel-button secondary" onClick={onAdd} disabled={busy}>[ + ADD CHANNEL ]</button>
    {channels.map((item, index) => <article className="panel admin-compact-card" key={item.id}><div><h3>{item.label}</h3><p className="micro muted">TYPE: {item.type.toUpperCase()} {"//"} VALUE: {item.value || "DETAILS COMING SOON"}</p><p className="micro" style={{ color: item.accent.startsWith("#") ? item.accent : `var(--${item.accent})` }}>STATUS: {item.status.toUpperCase()} {"//"} ACCENT: ■ {item.accent.toUpperCase()}</p></div><div className="editor-actions"><button onClick={() => setDraft(item)} disabled={busy}>[ EDIT ]</button><button onClick={() => onMove(index, -1)} disabled={busy || index === 0}>[ UP ]</button><button onClick={() => onMove(index, 1)} disabled={busy || index === channels.length - 1}>[ DOWN ]</button><button onClick={() => onStatus({ ...item, status: item.status === "hidden" ? "pending" : "hidden" })} disabled={busy}>[ {item.status === "hidden" ? "SHOW" : "HIDE"} ]</button><button className="danger" onClick={() => onRemove(item)} disabled={busy}>[ REMOVE ]</button></div></article>)}
    {draft && <ChannelEditor draft={draft} setDraft={setDraft} onSave={onSave} busy={busy} />}
  </div>;
}

function ChannelEditor({ draft, setDraft, onSave, busy }: { draft: ContactChannel; setDraft: (value: ContactChannel | null) => void; onSave: () => void; busy: boolean }) {
  const update = <K extends keyof ContactChannel>(key: K, value: ContactChannel[K]) => setDraft({ ...draft, [key]: value });
  const customAccent = draft.accent.startsWith("#");
  return <form className="panel control-form admin-editor" onSubmit={(event) => { event.preventDefault(); onSave(); }}><h3>{draft.label || "NEW CHANNEL"}</h3><div className="form-grid">
    <label><span>TYPE</span><input list="channel-types" required maxLength={40} value={draft.type} onChange={(e) => update("type", e.target.value)} /><datalist id="channel-types"><option value="email"/><option value="github"/><option value="linkedin"/><option value="instagram"/><option value="website"/><option value="other"/></datalist></label>
    <label><span>LABEL</span><input required maxLength={100} value={draft.label} onChange={(e) => update("label", e.target.value)} /></label>
    <label><span>VALUE</span><input maxLength={320} value={draft.value || ""} onChange={(e) => update("value", e.target.value || null)} /></label>
    <label><span>URL {draft.type === "email" ? "(GENERATED FROM EMAIL)" : ""}</span><input maxLength={2048} disabled={draft.type === "email"} value={draft.type === "email" ? (draft.value ? `mailto:${draft.value}` : "") : (draft.url || "")} onChange={(e) => update("url", e.target.value || null)} /></label>
    <label><span>STATUS</span><select value={draft.status} onChange={(e) => update("status", e.target.value as ContactChannel["status"])}><option value="active">ACTIVE</option><option value="pending">PENDING</option><option value="hidden">HIDDEN</option></select></label>
    <label><span>STATUS LABEL</span><input maxLength={80} value={draft.status_label || ""} onChange={(e) => update("status_label", e.target.value || null)} /></label>
    <label><span>ACCENT</span><select value={customAccent ? "custom" : draft.accent} onChange={(e) => update("accent", e.target.value === "custom" ? "#ffb86c" : e.target.value)}><option value="primary">Helsinki Green</option><option value="secondary">Helsinki Cyan</option><option value="tertiary">Helsinki Violet</option><option value="custom">Custom</option></select></label>
    {customAccent && <label><span>CUSTOM COLOR</span><input type="color" value={draft.accent} onChange={(e) => update("accent", e.target.value)} /></label>}
  </div><div className="editor-actions"><button type="button" onClick={() => setDraft(null)} disabled={busy}>[ CANCEL ]</button><button type="submit" className="primary" disabled={busy}>[ SAVE CHANNEL ]</button></div></form>;
}

function SubjectsTab({ subjects, draft, setDraft, onSave, onMove, onToggle, onRemove, onAdd, busy }: { subjects: ContactSubject[]; draft: ContactSubject | null; setDraft: (value: ContactSubject | null) => void; onSave: () => void; onMove: (index: number, offset: number) => void; onToggle: (item: ContactSubject) => void; onRemove: (item: ContactSubject) => void; onAdd: () => void; busy: boolean }) {
  return <div className="admin-stack"><button type="button" className="pixel-button secondary" onClick={onAdd} disabled={busy}>[ + ADD SUBJECT ]</button>
    {subjects.map((item, index) => <article className="panel admin-compact-card" key={item.id}><div><span className="code cyan">{String(index + 1).padStart(2, "0")}</span><h3>{item.label}</h3><p className="micro muted">VALUE: {item.value} {"//"} {item.enabled ? "ENABLED" : "DISABLED"}</p></div><div className="editor-actions"><button onClick={() => setDraft(item)} disabled={busy}>[ EDIT ]</button><button onClick={() => onMove(index, -1)} disabled={busy || index === 0}>[ UP ]</button><button onClick={() => onMove(index, 1)} disabled={busy || index === subjects.length - 1}>[ DOWN ]</button><button onClick={() => onToggle({ ...item, enabled: !item.enabled })} disabled={busy}>[ {item.enabled ? "DISABLE" : "ENABLE"} ]</button><button className="danger" onClick={() => onRemove(item)} disabled={busy}>[ REMOVE ]</button></div></article>)}
    {draft && <form className="panel control-form admin-editor" onSubmit={(event) => { event.preventDefault(); onSave(); }}><h3>{draft.label || "NEW SUBJECT"}</h3><div className="form-grid"><label><span>VALUE</span><input required maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9_-]*" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} /></label><label><span>LABEL</span><input required maxLength={120} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></label><label><span>VISIBILITY</span><select value={draft.enabled ? "enabled" : "disabled"} onChange={(e) => setDraft({ ...draft, enabled: e.target.value === "enabled" })}><option value="enabled">ENABLED</option><option value="disabled">DISABLED</option></select></label></div><div className="editor-actions"><button type="button" onClick={() => setDraft(null)} disabled={busy}>[ CANCEL ]</button><button type="submit" className="primary" disabled={busy}>[ SAVE SUBJECT ]</button></div></form>}
  </div>;
}

function InboxTab({ messages, subjects, newCount, filter, setFilter, opened, onOpen, onClose, onArchive, busy }: { messages: ContactMessage[]; subjects: ContactSubject[]; newCount: number; filter: "all" | ContactMessageStatus; setFilter: (value: "all" | ContactMessageStatus) => void; opened: ContactMessage | null; onOpen: (item: ContactMessage) => void; onClose: () => void; onArchive: (item: ContactMessage) => void; busy: boolean }) {
  return <div className="admin-stack"><div className="panel inbox-summary"><span className="micro muted">NEW MESSAGE COUNT</span><strong>{newCount}</strong></div><div className="inbox-filters">{(["all", "new", "read", "archived"] as const).map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item.toUpperCase()}</button>)}</div>
    {!opened && messages.map((message) => <article className="panel inbox-card" key={message.id}><div className="inbox-meta"><span className={`message-status ${message.status}`}>{message.status.toUpperCase()}</span><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time></div><h3>{message.sender_name}</h3><p className="code cyan">{message.sender_email}</p><p className="micro muted">{subjectLabel(message, subjects)}</p><p className="inbox-preview">“{message.message}”</p><button className="admin-action-btn primary" onClick={() => onOpen(message)}>[ OPEN ]</button></article>)}
    {!opened && messages.length === 0 && <div className="panel muted">NO MESSAGES IN THIS FILTER</div>}
    {opened && <article className="panel message-detail"><p className="code green">[ INCOMING_TRANSMISSION ]</p><dl><div><dt>STATUS</dt><dd>{opened.status.toUpperCase()}</dd></div><div><dt>SENDER</dt><dd>{opened.sender_name}</dd></div><div><dt>EMAIL</dt><dd>{opened.sender_email}</dd></div><div><dt>SUBJECT</dt><dd>{subjectLabel(opened, subjects)}</dd></div><div><dt>TIMESTAMP</dt><dd><time dateTime={opened.created_at}>{new Date(opened.created_at).toLocaleString()}</time></dd></div></dl><pre>{opened.message}</pre><div className="editor-actions"><button onClick={onClose} disabled={busy}>[ BACK TO INBOX ]</button><a href={`mailto:${opened.sender_email}`} className="primary">[ REPLY VIA EMAIL ↗ ]</a>{opened.status !== "archived" && <button onClick={() => onArchive(opened)} disabled={busy}>[ ARCHIVE ]</button>}</div></article>}
  </div>;
}
