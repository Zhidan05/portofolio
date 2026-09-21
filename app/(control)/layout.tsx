import { AuthProvider } from "@/components/admin/AuthProvider";
import type { Metadata } from "next";
import "./control.css";
export const metadata: Metadata = { title: "HELSINKI // ADMIN TERMINAL", robots: { index: false, follow: false } };
export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
