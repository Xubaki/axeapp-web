import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (!isAdmin(user)) {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
