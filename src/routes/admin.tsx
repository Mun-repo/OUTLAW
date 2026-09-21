import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { LoginForm } from "@/components/admin/login-form";
import { useAdminSession } from "@/lib/admin-session";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — Outlaw" }],
  }),
});

function AdminPage() {
  const token = useAdminSession((s) => s.token);
  const ready = useAdminSession((s) => s.ready);
  const hydrate = useAdminSession((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!ready) {
    return <main className="min-h-screen bg-background" />;
  }

  if (!token) {
    return <LoginForm />;
  }

  return <AdminDashboard token={token} />;
}
