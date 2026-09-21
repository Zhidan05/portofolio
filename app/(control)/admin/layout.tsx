import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { AccessDenied } from "@/components/admin/AccessDenied";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();
  if (!access.user) redirect("/login");
  if (!access.isAdmin) return <AccessDenied message={access.error} />;
  return <AdminShell>{children}</AdminShell>;
}
