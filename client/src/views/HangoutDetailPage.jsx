import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FloatingExpenseButton } from "../components/FloatingExpenseButton";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../state/AuthContext";
import { decimalStringToPaise, formatPaise } from "../utils/money";

export function HangoutDetailPage() {
  const navigate = useNavigate();
  const { hangoutId } = useParams();
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hangout, setHangout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    payerId: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [paymentMode, setPaymentMode] = useState("full");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [settlementScope, setSettlementScope] = useState("mine");

  const isExpenseModalOpen = searchParams.get("addExpense") === "1";

  function getDefaultPayerId(members) {
    return members.find((member) => member.userId === user?.id)?.userId || members[0]?.userId || "";
  }

  async function refreshHangout() {
    const payload = await apiFetch(`/hangouts/${hangoutId}`, { token });
    setHangout(payload.hangout);
    return payload.hangout;
  }

  useEffect(() => {
    setLoading(true);
    setError("");

    refreshHangout()
      .then((nextHangout) => {
        setExpenseForm((current) => ({
          ...current,
          payerId: getDefaultPayerId(nextHangout.members)
        }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hangoutId, token, user?.id]);

  const balanceMessage = useMemo(() => {
    if (!hangout?.summary?.settlements?.length) {
      return hangout?.status === "CLOSED"
        ? "No pending dues remain in this archived hangout."
        : "Everyone is squared up right now.";
    }

    return `${hangout.summary.settlements.length} settlement${
      hangout.summary.settlements.length > 1 ? "s" : ""
    } needed`;
  }, [hangout]);

  const isCreator = hangout?.creatorUserId === user?.id;
  const visibleSettlements = useMemo(() => {
    if (!hangout?.summary?.settlements) {
      return [];
    }

    if (settlementScope === "group") {
      return hangout.summary.settlements;
    }

    return hangout.summary.settlements.filter(
      (settlement) => settlement.fromUserId === user?.id || settlement.toUserId === user?.id
    );
  }, [hangout, settlementScope, user?.id]);

  function closeExpenseModal() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("addExpense");
    setSearchParams(nextParams);
  }

  function openExpenseModal() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("addExpense", "1");
    setSearchParams(nextParams);
  }

  function openPaymentModal(settlement) {
    setError("");
    setSelectedSettlement(settlement);
    setPaymentMode("full");
    setPaymentAmount("");
    setPaymentModalOpen(true);
  }

  function closePaymentModal() {
    setPaymentModalOpen(false);
    setSelectedSettlement(null);
    setPaymentMode("full");
    setPaymentAmount("");
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(hangout.roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (_error) {
      setError("Could not copy the room code on this device.");
    }
  }

  async function handleAddExpense(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await apiFetch(`/hangouts/${hangoutId}/expenses`, {
        token,
        method: "POST",
        body: {
          description: expenseForm.description,
          amountPaise: decimalStringToPaise(expenseForm.amount),
          payerId: expenseForm.payerId || user.id
        }
      });

      const nextHangout = await refreshHangout();
      setExpenseForm({
        description: "",
        amount: "",
        payerId: getDefaultPayerId(nextHangout.members)
      });
      closeExpenseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseHangout() {
    try {
      const payload = await apiFetch(`/hangouts/${hangoutId}/close`, {
        token,
        method: "POST"
      });
      setHangout(payload.hangout);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRecordPayment(event) {
    event.preventDefault();
    if (!selectedSettlement) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const body = {
        fromUserId: selectedSettlement.fromUserId,
        toUserId: selectedSettlement.toUserId,
        mode: paymentMode
      };

      if (paymentMode === "partial") {
        body.amountPaise = decimalStringToPaise(paymentAmount);
      }

      const payload = await apiFetch(`/hangouts/${hangoutId}/settlements/payments`, {
        token,
        method: "POST",
        body
      });

      setHangout(payload.hangout);
      closePaymentModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading hangout..." />;
  }

  if (error && !hangout) {
    return (
      <div className="pt-16 text-center">
        <p className="text-sm text-rose-300">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/hangouts")}
          className="mt-4 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={hangout.status === "CLOSED" ? "Archived Hangout" : "Live Hangout"}
        title={hangout.name}
        subtitle={balanceMessage}
        action={
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/hangouts")}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Back
            </button>
            {hangout.status === "ACTIVE" ? (
              <button
                type="button"
                onClick={handleCopyCode}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                Copy room code
              </button>
            ) : null}
            {hangout.status === "ACTIVE" && isCreator ? (
              <button
                type="button"
                onClick={handleCloseHangout}
                className="rounded-full bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white"
              >
                End hangout
              </button>
            ) : null}
          </div>
        }
      />

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">Members</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{hangout.members.length} in this hangout</h2>
          </div>
          <div className="rounded-full bg-brand-500/15 px-3 py-2 text-sm text-brand-100">
            {hangout.status}
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-300">
          Created by <span className="font-semibold text-white">@{hangout.creator.username}</span>
        </p>
        <p className="mt-3 text-sm text-slate-400">
          {hangout.status === "ACTIVE"
            ? isCreator
              ? "You can still add expenses and end this hangout when everyone is done."
              : `Only @${hangout.creator.username} can end this hangout.`
            : "This hangout is archived. You can keep tracking payments against the final dues."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {hangout.members.map((member) => (
            <span key={member.userId} className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-200">
              @{member.username}
            </span>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">Settlements</p>
        <div className="mt-4 flex rounded-full bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setSettlementScope("mine")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold ${
              settlementScope === "mine" ? "bg-brand-600 text-white" : "text-slate-400"
            }`}
          >
            My dues
          </button>
          <button
            type="button"
            onClick={() => setSettlementScope("group")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold ${
              settlementScope === "group" ? "bg-brand-600 text-white" : "text-slate-400"
            }`}
          >
            Whole group
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          {settlementScope === "mine"
            ? "Direct dues that involve you only."
            : "Direct dues across the whole group, without optimizing away who originally covered what."}
        </p>
        {!visibleSettlements.length ? (
          <p className="mt-3 text-sm text-emerald-300">
            {settlementScope === "mine"
              ? "You do not owe anyone, and nobody owes you right now."
              : "Everyone is settled."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {visibleSettlements.map((settlement) => (
              <div key={`${settlement.fromUserId}-${settlement.toUserId}`} className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-200">
                  <span className="font-semibold text-white">{settlement.fromName}</span> owes{" "}
                  <span className="font-semibold text-white">{settlement.toName}</span>
                </p>
                <p className="mt-2 text-xl font-bold text-brand-100">
                  {formatPaise(settlement.remainingAmountPaise)}
                </p>
                {settlement.paidAmountPaise > 0 ? (
                  <p className="mt-1 text-sm text-slate-400">
                    Paid so far: {formatPaise(settlement.paidAmountPaise)} of{" "}
                    {formatPaise(settlement.originalAmountPaise)}
                  </p>
                ) : null}
                {hangout.status === "CLOSED" && user?.id === settlement.toUserId ? (
                  <button
                    type="button"
                    onClick={() => openPaymentModal(settlement)}
                    className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Mark dues paid
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">Balances</p>
        <p className="mt-3 text-sm text-slate-400">
          Net position for each member after combining every expense in the hangout.
        </p>
        <div className="mt-4 space-y-3">
          {hangout.summary.balances.length ? (
            hangout.summary.balances.map((balance) => (
              <div key={balance.userId} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-200">@{balance.username}</span>
                <span
                  className={`text-sm font-semibold ${
                    balance.netPaise > 0 ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {balance.netPaise > 0 ? "+" : ""}
                  {formatPaise(balance.netPaise)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No open balances.</p>
          )}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">Expense History</p>
        {hangout.expenses.length ? (
          <div className="mt-4 space-y-3">
            {hangout.expenses.map((expense) => (
              <div key={expense.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-white">{expense.description}</p>
                  <p className="mt-1 text-sm text-slate-400">Paid by @{expense.payer.username}</p>
                </div>
                <span className="text-sm font-semibold text-brand-100">{formatPaise(expense.amountPaise)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No expenses yet" body="Tap the floating button to log the first shared expense." />
        )}
      </Card>

      {hangout.summary.paymentHistory?.length ? (
        <Card className="mt-4">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">Payment History</p>
          <div className="mt-4 space-y-3">
            {hangout.summary.paymentHistory.map((payment) => (
              <div key={payment.id} className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-200">
                  {payment.fromName} paid {payment.toName}
                </p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">
                  {formatPaise(payment.amountPaise)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                  Marked by {payment.recordedByName}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Modal open={isExpenseModalOpen && hangout.status === "ACTIVE"} title="Add Expense" onClose={closeExpenseModal}>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <input
            value={expenseForm.description}
            onChange={(event) =>
              setExpenseForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Cab to campus"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none"
          />
          <input
            value={expenseForm.amount}
            onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
            placeholder="250.00"
            inputMode="decimal"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none"
          />
          <select
            value={expenseForm.payerId}
            onChange={(event) => setExpenseForm((current) => ({ ...current, payerId: event.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none"
          >
            {hangout.members.map((member) => (
              <option key={member.userId} value={member.userId} className="bg-slate-900">
                @{member.username}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-600 px-4 py-4 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save expense"}
          </button>
        </form>
      </Modal>

      <Modal
        open={paymentModalOpen && Boolean(selectedSettlement)}
        title="Mark Dues Paid"
        onClose={closePaymentModal}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-300">
              {selectedSettlement?.fromName} owes {selectedSettlement?.toName}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              {formatPaise(selectedSettlement?.remainingAmountPaise || 0)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMode("full")}
              className={`rounded-2xl px-4 py-4 text-left ${
                paymentMode === "full" ? "bg-brand-600 text-white" : "bg-white/5 text-slate-300"
              }`}
            >
              <p className="font-semibold">Paid full</p>
              <p className="mt-1 text-sm opacity-80">Settle this due completely.</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("partial")}
              className={`rounded-2xl px-4 py-4 text-left ${
                paymentMode === "partial" ? "bg-brand-600 text-white" : "bg-white/5 text-slate-300"
              }`}
            >
              <p className="font-semibold">Specific amount</p>
              <p className="mt-1 text-sm opacity-80">Record a partial payment.</p>
            </button>
          </div>

          {paymentMode === "partial" ? (
            <input
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder="100.00"
              inputMode="decimal"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none"
            />
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-600 px-4 py-4 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save payment update"}
          </button>
        </form>
      </Modal>

      {hangout.status === "ACTIVE" && !isExpenseModalOpen ? (
        <FloatingExpenseButton onClick={openExpenseModal} />
      ) : null}

      {copied ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950/95 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(2,6,23,0.45)]">
          Room code copied: {hangout.roomCode}
        </div>
      ) : null}
    </>
  );
}
