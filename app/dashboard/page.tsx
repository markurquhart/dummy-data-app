import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {session.user.name || session.user.email}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Data Configurations</h2>
          <p className="text-gray-600">Create and manage your data generation configs</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Recent Runs</h2>
          <p className="text-gray-600">View your recent data generation runs</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Usage Metrics</h2>
          <p className="text-gray-600">Monitor your data generation usage</p>
        </div>
      </div>
    </div>
  );
}