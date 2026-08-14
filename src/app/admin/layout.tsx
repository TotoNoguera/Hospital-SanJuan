import { getStaffSession } from "@/lib/auth-staff";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();

  return (
    <div className="min-h-full bg-background">
      {session && <AdminNav name={session.name} role={session.role} />}
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
