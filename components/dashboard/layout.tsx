import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}