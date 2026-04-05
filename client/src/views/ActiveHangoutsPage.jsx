import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Pressable } from "../components/Pressable";
import { useHangouts } from "../hooks/useHangouts";
import { useAuth } from "../state/AuthContext";
import { formatPaise } from "../utils/money";

function DebtBreakdownSheet({ title, totalPaise, breakdown, emptyBody, open, onClose, tone }) {
  return (
    <Modal open={open} title={title} onClose={onClose} panelClassName="pb-8">
      <div className="paper-scrap paper-tilt-left p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/65">Archived remaining total</p>
        <p className={`mt-3 font-heading text-3xl font-bold ${tone}`}>{formatPaise(totalPaise)}</p>
      </div>

      {!breakdown.length ? (
        <EmptyState title="Nothing pending" body={emptyBody} />
      ) : (
        <div className="mt-5 space-y-4">
          {breakdown.map((entry) => (
            <div key={entry.counterpartyUserId} className="paper-scrap paper-tilt-right p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-semibold text-ink-dark">@{entry.counterpartyName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-ink-charcoal/55">
                    {entry.hangouts.length} archived hangout{entry.hangouts.length === 1 ? "" : "s"}
                  </p>
                </div>
                <p className={`text-lg font-bold ${tone}`}>{formatPaise(entry.totalPaise)}</p>
              </div>

              <div className="mt-4 space-y-3">
                {entry.hangouts.map((hangout) => (
                  <div
                    key={`${entry.counterpartyUserId}-${hangout.hangoutId}`}
                    className="rounded-[1.25rem] border border-ink-dark/15 bg-white/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-ink-charcoal">{hangout.hangoutName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-ink-charcoal/55">
                        {hangout.roomCode}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ink-dark">{formatPaise(hangout.amountPaise)}</p>
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
          <img
            src="/rough-bills-logo.png"
            alt="Rough Bills logo"
            className="h-20 w-20 -translate-y-1 object-contain"
          />
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Pressable
          as="button"
          type="button"
          onClick={() => openModal("owe")}
          className="paper-scrap paper-tilt-left bg-[#fff1b8] px-4 py-4 text-left"
          whileTap={{ scale: 0.98, rotate: -2, y: 2 }}
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-marker-red/80">I owe</span>
          <span className="mt-2 block font-heading text-lg font-semibold text-marker-red">
            {formatPaise(archivedDebtSummary.totalIOwePaise)}
          </span>
          <span className="mt-1 block text-sm text-ink-charcoal/70">Closed hangouts only</span>
        </Pressable>
        <Pressable
          as="button"
          type="button"
          onClick={() => openModal("owed")}
          className="paper-scrap paper-tilt-right bg-[#dff6df] px-4 py-4 text-left"
          whileTap={{ scale: 0.98, rotate: 2, y: 2 }}
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-ink-dark/70">Owed to me</span>
          <span className="mt-2 block font-heading text-lg font-semibold text-ink-dark">
            {formatPaise(archivedDebtSummary.totalOwedToMePaise)}
          </span>
          <span className="mt-1 block text-sm text-ink-charcoal/70">Closed hangouts only</span>
        </Pressable>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Pressable
          as="button"
          type="button"
          onClick={() => openModal("create")}
          className="marker-button rounded-[1.6rem] px-4 py-4 text-left"
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-white/80">Create</span>
          <span className="mt-2 block font-heading text-lg font-semibold">Start a hangout</span>
        </Pressable>
        <Pressable
          as="button"
          type="button"
          onClick={() => openModal("join")}
          className="paper-scrap paper-tilt-flat px-4 py-4 text-left"
        >
          <span className="block text-xs uppercase tracking-[0.3em] text-ink-dark/70">Join</span>
          <span className="mt-2 block font-heading text-lg font-semibold text-ink-dark">Use room code</span>
        </Pressable>
      </div>

      {loading ? <LoadingState label="Loading your active hangouts..." /> : null}
      {error ? <p className="mb-4 text-sm text-marker-red">{error}</p> : null}

      {!loading && hangouts.length === 0 ? (
        <EmptyState
          title="No active hangouts yet"
          body="Start one for dinner, fuel, movie night, or any shared spend with friends."
        />
      ) : null}

      <div className="space-y-3">
        {hangouts.map((hangout, index) => (
          <Card
            key={hangout.id}
            className="cursor-pointer bg-[#fffef8] transition"
            tilt={index % 2 === 0 ? "left" : "right"}
          >
            <Pressable
              as="button"
              type="button"
              onClick={() => navigate(`/hangouts/${hangout.id}`)}
              className="w-full text-left"
              whileTap={{ scale: 0.985, y: 1 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/60">{hangout.roomCode}</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-ink-dark">{hangout.name}</h2>
                  <p className="mt-2 text-sm text-ink-charcoal/70">Created by @{hangout.creator.username}</p>
                </div>
                <div className="rounded-full border border-ink-dark/20 bg-[#eaf1ff] px-3 py-2 text-[11px] font-semibold text-ink-dark shadow-[2px_2px_0_rgba(16,42,111,0.08)]">
                  {hangout.memberCount} members
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-ink-charcoal/65">
                <span>{hangout.expenseCount} expenses</span>
                <span>{hangout.summary.settlements.length} settlements</span>
              </div>
              {hangout.summary.settlements[0] ? (
                <p className="mt-3 text-sm text-ink-charcoal">
                  Next up: {hangout.summary.settlements[0].fromName} pays{" "}
                  {hangout.summary.settlements[0].toName}{" "}
                  {formatPaise(
                    hangout.summary.settlements[0].remainingAmountPaise ??
                      hangout.summary.settlements[0].amountPaise
                  )}
                </p>
              ) : (
                <p className="mt-3 text-sm text-ink-dark">All balances are even right now.</p>
              )}
            </Pressable>
          </Card>
        ))}
      </div>

      <Modal open={modal === "create"} title="Create Hangout" onClose={closeModal}>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Trip to Goa"
            className="lined-input text-base"
          />
          {actionError ? <p className="text-sm text-marker-red">{actionError}</p> : null}
          <Pressable
            as="button"
            disabled={submitting}
            className="marker-button w-full px-4 py-4 font-semibold disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create hangout"}
          </Pressable>
        </form>
      </Modal>

      <Modal open={modal === "join"} title="Join Hangout" onClose={closeModal}>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="AB12CD"
            maxLength={6}
            className="lined-input text-base uppercase tracking-[0.4em]"
          />
          {actionError ? <p className="text-sm text-marker-red">{actionError}</p> : null}
          <Pressable
            as="button"
            disabled={submitting}
            className="marker-button w-full px-4 py-4 font-semibold disabled:opacity-60"
          >
            {submitting ? "Joining..." : "Join hangout"}
          </Pressable>
        </form>
      </Modal>

      <DebtBreakdownSheet
        open={modal === "owe"}
        onClose={closeModal}
        title="I Owe"
        totalPaise={archivedDebtSummary.totalIOwePaise}
        breakdown={archivedDebtSummary.iOweBreakdown}
        emptyBody="You do not owe anything from archived hangouts right now."
        tone="text-marker-red"
      />

      <DebtBreakdownSheet
        open={modal === "owed"}
        onClose={closeModal}
        title="Owed To Me"
        totalPaise={archivedDebtSummary.totalOwedToMePaise}
        breakdown={archivedDebtSummary.owedToMeBreakdown}
        emptyBody="Nobody owes you anything from archived hangouts right now."
        tone="text-ink-dark"
      />
    </>
  );
}
