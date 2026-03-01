import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Zap, BarChart3, MousePointerClick, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-zinc-50">UpgradeKit</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">
              {session.user.name ?? session.user.email}
            </span>
            {session.user.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-8 h-8 rounded-full ring-2 ring-zinc-700"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">
            Welcome back, {session.user.name?.split(" ")[0] ?? "there"}! 👋
          </h1>
          <p className="mt-1 text-zinc-400">
            Manage your feature gates and paywall widgets
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Gates</CardTitle>
              <Zap className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">0</div>
              <p className="text-xs text-zinc-500 mt-1">Create your first gate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Impressions</CardTitle>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">0</div>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Conversions</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">0</div>
              <p className="text-xs text-zinc-500 mt-1">Upgrade clicks</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty state */}
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 mb-4">
            <MousePointerClick className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-50 mb-2">No gates yet</h3>
          <p className="text-zinc-400 max-w-sm mx-auto text-sm">
            Create your first feature gate to start showing upgrade prompts to your users.
          </p>
          <button className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 rounded-xl font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-500/25">
            Create Gate
          </button>
        </div>
      </main>
    </div>
  );
}
