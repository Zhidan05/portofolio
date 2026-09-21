import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
export default async function Dashboard() {
  const { client } = await requireAdmin();
  const result = await client!.rpc("read_about");
  const connected = !result.error;
  return <section className="panel"><p className="code green">[ CONTENT MANAGEMENT ]</p><h1>Control panel</h1>
    <dl className="system-status code">
      <div><dt>AUTH</dt><dd className="green">ADMIN VERIFIED</dd></div>
      <div><dt>DATABASE</dt><dd className={connected ? "green" : "cyan"}>{connected ? "CONNECTED" : "UNAVAILABLE"}</dd></div>
      <div><dt>ABOUT</dt><dd>{connected ? result.data ? "ONLINE" : "EMPTY RECORD" : "CHECK MIGRATION / CONNECTION"}</dd></div>
    </dl>
    <p>Edit the published player profile, biography, directive, interests, tools, and focus cards.</p>
    <Link className="pixel-button" href="/admin/about">EDIT ABOUT →</Link>
    <div style={{ marginTop: "1rem" }}>
      <p>Manage the published projects.</p>
      <Link className="pixel-button" href="/admin/projects">EDIT PROJECTS →</Link>
    </div>
    <p className="micro muted" style={{ marginTop: "1rem" }}>EXPERIENCE / TECH STACK — NOT CONFIGURED</p>
  </section>;
}
