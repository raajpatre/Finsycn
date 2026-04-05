import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../state/AuthContext";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" subtitle="Your identity, activity snapshot, and session controls." />

      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">You</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">@{user?.username}</h2>
        <p className="mt-2 text-sm text-slate-400">Username-based sign-in is active for this account.</p>

        <div className="mt-6">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hangouts</p>
            <p className="mt-2 text-2xl font-semibold text-white">{user?._count?.memberships ?? "—"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-2xl border border-white/10 px-4 py-4 text-base font-semibold text-white"
        >
          Log out
        </button>
      </Card>
    </>
  );
}
