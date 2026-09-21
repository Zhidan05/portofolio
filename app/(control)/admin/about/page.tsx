import { requireAdmin } from "@/lib/admin";
import AboutEditor from "@/components/admin/AboutEditor";
export default async function AboutPage() {
  await requireAdmin();
  return <AboutEditor />;
}
