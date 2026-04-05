import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useHangouts } from "../hooks/useHangouts";
import { useAuth } from "../state/AuthContext";
import { formatPaise } from "../utils/money";

function DebtBreakdownSheet({ title, totalPaise, breakdown, emptyBody, open, onClose, tone }) {
  return (
    <Modal open={open} title={title} onClose={onClose} panelClassName="pb-8">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Archived remaining total</p>
        <p className={`mt-3 text-3xl font-bold ${tone}`}>{formatPaise(totalPaise)}</p>
      </div>

      {!breakdown.length ? (
        <EmptyState title="Nothing pending" body={emptyBody} />
      ) : (
        <div className="mt-5 space-y-4">
          {breakdown.map((entry) => (
            <div key={entry.counterpartyUserId} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">@{entry.counterpartyName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                    {entry.hangouts.length} archived hangout{entry.hangouts.length === 1 ? "" : "s"}
                  </p>
                </div>
                <p className={`text-lg font-bold ${tone}`}>{formatPaise(entry.totalPaise)}</p>
              </div>

              <div className="mt-4 space-y-3">
                {entry.hangouts.map((hangout) => (
                  <div
                    key={`${entry.counterpartyUserId}-${hangout.hangoutId}`}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{hangout.hangoutName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                        {hangout.roomCode}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{formatPaise(hangout.amountPaise)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function ActiveHangoutsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { hangouts, archivedDebtSummary, loading, error, refresh } = useHangouts("ACTIVE");
  const [modal, setModal] = useState("");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openModal(nextModal) {
    setActionError("");
    setModal(nextModal);
  }

  function closeModal() {
    setActionError("");
    setModal("");
  }

  async function handleCreate(event) {
    event.preventDefault();
    setActionError("");
    setSubmitting(true);

    try {
      const payload = await apiFetch("/hangouts", {
        token,
        method: "POST",
        body: { name }
      });
      closeModal();
      setName("");
      await refresh();
      navigate(`/hangouts/${payload.hangout.id}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    setActionError("");
    setSubmitting(true);

    try {
      const payload = await apiFetch("/hangouts/join", {
        token,
        method: "POST",
        body: { roomCode }
      });
      closeModal();
      setRoomCode("");
      await refresh();
      navigate(`/hangouts/${payload.hangout.id}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Now Splitting"
        title="Active Hangouts"
        subtitle="Create a session for the squad or jump in using a room code."
        action={
          <button
            type="button"
            onClick={() => openModal("create")}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            New
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openModal("owe")}
          className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-4 text-left text-white"
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-rose-200/80">I owe</span>
          <span className="mt-2 block text-lg font-semibold">
            {formatPaise(archivedDebtSummary.totalIOwePaise)}
          </span>
          <span className="mt-1 block text-sm text-rose-100/80">Closed hangouts only</span>
        </button>
        <button
          type="button"
          onClick={() => openModal("owed")}
          className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-left text-white"
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-emerald-200/80">Owed to me</span>
          <span className="mt-2 block text-lg font-semibold">
            {formatPaise(archivedDebtSummary.totalOwedToMePaise)}
          </span>
          <span className="mt-1 block text-sm text-emerald-100/80">Closed hangouts only</span>
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openModal("create")}
          className="rounded-3xl bg-brand-600 px-4 py-4 text-left text-white"
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-brand-100">Create</span>
          <span className="mt-2 block text-lg font-semibold">Start a hangout</span>
        </button>
        <button
          type="button"
          onClick={() => openModal("join")}
          className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-white"
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">Join</span>
          <span className="mt-2 block text-lg font-semibold">Use room code</span>
        </button>
      </div>

      {loading ? <LoadingState label="Loading your active hangouts..." /> : null}
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      {!loading && hangouts.length === 0 ? (
        <EmptyState
          title="No active hangouts yet"
          body="Start one for dinner, fuel, movie night, or any shared spend with friends."
        />
      ) : null}

      <div className="space-y-3">
        {hangouts.map((hangout) => (
          <Card
            key={hangout.id}
            className="cursor-pointer bg-white/5 transition active:scale-[0.99]"
          >
            <button
              type="button"
              onClick={() => navigate(`/hangouts/${hangout.id}`)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">{hangout.roomCode}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{hangout.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">Created by @{hangout.creator.username}</p>
                </div>
                <div className="rounded-full bg-brand-500/15 px-3 py-2 text-xs font-semibold text-brand-100">
                  {hangout.memberCount} members
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                <span>{hangout.expenseCount} expenses</span>
                <span>{hangout.summary.settlements.length} settlements</span>
              </div>
              {hangout.summary.settlements[0] ? (
                <p className="mt-3 text-sm text-slate-200">
                  Next up: {hangout.summary.settlements[0].fromName} pays{" "}
                  {hangout.summary.settlements[0].toName}{" "}
                  {formatPaise(
                    hangout.summary.settlements[0].remainingAmountPaise ??
                      hangout.summary.settlements[0].amountPaise
                  )}
                </p>
              ) : (
                <p className="mt-3 text-sm text-emerald-300">All balances are even right now.</p>
              )}
            </button>
          </Card>
        ))}
      </div>

      <Modal open={modal === "create"} title="Create Hangout" onClose={closeModal}>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Trip to Goa"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none"
          />
          {actionError ? <p className="text-sm text-rose-300">{actionError}</p> : null}
          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-600 px-4 py-4 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create hangout"}
          </button>
        </form>
      </Modal>

      <Modal open={modal === "join"} title="Join Hangout" onClose={closeModal}>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="AB12CD"
            maxLength={6}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base uppercase tracking-[0.4em] text-white outline-none"
          />
          {actionError ? <p className="text-sm text-rose-300">{actionError}</p> : null}
          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-600 px-4 py-4 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Joining..." : "Join hangout"}
          </button>
        </form>
      </Modal>

      <DebtBreakdownSheet
        open={modal === "owe"}
        onClose={closeModal}
        title="I Owe"
        totalPaise={archivedDebtSummary.totalIOwePaise}
        breakdown={archivedDebtSummary.iOweBreakdown}
        emptyBody="You do not owe anything from archived hangouts right now."
        tone="text-rose-300"
      />

      <DebtBreakdownSheet
        open={modal === "owed"}
        onClose={closeModal}
        title="Owed To Me"
        totalPaise={archivedDebtSummary.totalOwedToMePaise}
        breakdown={archivedDebtSummary.owedToMeBreakdown}
        emptyBody="Nobody owes you anything from archived hangouts right now."
        tone="text-emerald-300"
      />
    </>
  );
}
