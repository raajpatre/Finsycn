import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { Pressable } from "../components/Pressable";
import { useAuth } from "../state/AuthContext";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" subtitle="Your identity, activity snapshot, and session controls." />

      <Card className="bg-[#fffef8]" tilt="left">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">You</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-ink-dark">@{user?.username}</h2>
        <p className="mt-2 text-sm text-ink-charcoal/70">Username-based sign-in is active for this account.</p>

        <div className="mt-6">
          <div className="paper-scrap paper-tilt-right bg-[#fff8cf] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">Hangouts</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-ink-dark">{user?._count?.memberships ?? "—"}</p>
          </div>
        </div>

        <Pressable
          as="button"
          onClick={logout}
          className="paper-button mt-6 w-full px-4 py-4 text-base font-semibold"
        >
          Log out
        </Pressable>
      </Card>
    </>
  );
}
