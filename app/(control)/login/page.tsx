import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin";
import LoginForm from "@/components/admin/LoginForm";
export default async function LoginPage() {
  const access = await getAdminAccess();
  if (access.isAdmin) redirect("/admin");
  return <LoginForm serverError={access.user ? access.error : ""} />;
}
