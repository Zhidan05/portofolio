import { requireAdmin } from "@/lib/admin";
import HomeEditor from "@/components/admin/HomeEditor";

export default async function HomePage() {
  await requireAdmin();
  return <HomeEditor />;
}
