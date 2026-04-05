import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FloatingExpenseButton } from "../components/FloatingExpenseButton";
import { LoadingState } from "../components/LoadingState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Pressable } from "../components/Pressable";
import { useAuth } from "../state/AuthContext";
import { decimalStringToPaise, formatPaise } from "../utils/money";

function PaymentStrike({ payment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      className="paper-scrap paper-tilt-left relative mt-4 overflow-hidden p-4"
    >
      <p className="text-sm text-ink-charcoal">
        <span className="font-semibold text-ink-dark">{payment.fromName}</span> paid{" "}
        <span className="font-semibold text-ink-dark">{payment.toName}</span>
      </p>
      <p className="mt-2 font-heading text-xl font-bold text-ink-dark">{formatPaise(payment.amountPaise)}</p>
      <motion.svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 320 120"
        preserveAspectRatio="none"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M18 72 C 54 42, 108 95, 160 68 S 242 38, 302 66"
          fill="none"
          stroke="#102A6F"
          strokeWidth="4"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0.9 },
            visible: { pathLength: 1, opacity: 1 }
          }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        />
        <motion.path
          d="M210 26 C 236 28, 258 20, 292 28"
          fill="none"
          stroke="#B22222"
          strokeWidth="3"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0.85 },
            visible: { pathLength: 1, opacity: 1 }
          }}
          transition={{ duration: 0.28, delay: 0.38, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}

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
  const [recentPaymentStroke, setRecentPaymentStroke] = useState(null);

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

      setRecentPaymentStroke({
        id: `${selectedSettlement.fromUserId}-${selectedSettlement.toUserId}-${Date.now()}`,
        fromName: selectedSettlement.fromName,
        toName: selectedSettlement.toName,
        amountPaise:
          paymentMode === "partial"
            ? decimalStringToPaise(paymentAmount)
            : selectedSettlement.remainingAmountPaise
      });
      setHangout(payload.hangout);
      closePaymentModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!recentPaymentStroke) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setRecentPaymentStroke(null), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [recentPaymentStroke]);

  if (loading) {
    return <LoadingState label="Loading hangout..." />;
  }

  if (error && !hangout) {
    return (
      <div className="pt-16 text-center">
        <p className="text-sm text-marker-red">{error}</p>
        <Pressable
          as="button"
          type="button"
          onClick={() => navigate("/hangouts")}
          className="paper-button mt-4 rounded-full px-4 py-3 text-sm font-semibold"
        >
          Back
        </Pressable>
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
            <Pressable
              as="button"
              type="button"
              onClick={() => navigate("/hangouts")}
              className="paper-button rounded-full px-4 py-2 text-sm font-semibold"
            >
              Back
            </Pressable>
            {hangout.status === "ACTIVE" ? (
              <Pressable
                as="button"
                type="button"
                onClick={handleCopyCode}
                className="paper-button rounded-full px-4 py-2 text-sm font-semibold"
              >
                Copy room code
              </Pressable>
            ) : null}
            {hangout.status === "ACTIVE" && isCreator ? (
              <Pressable
                as="button"
                type="button"
                onClick={handleCloseHangout}
                className="marker-button rounded-full px-4 py-2 text-sm font-semibold"
              >
                End hangout
              </Pressable>
            ) : null}
          </div>
        }
      />

      {error ? <p className="mb-4 text-sm text-marker-red">{error}</p> : null}

      <Card className="bg-[#fffef8]" tilt="left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">Members</p>
            <h2 className="mt-2 font-heading text-lg font-semibold text-ink-dark">{hangout.members.length} in this hangout</h2>
          </div>
          <div className={hangout.status === "CLOSED" ? "stamp-label px-3 py-2 text-xs" : "paper-button rounded-full px-3 py-2 text-sm"}>
            {hangout.status}
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-charcoal/80">
          Created by <span className="font-semibold text-ink-dark">@{hangout.creator.username}</span>
        </p>
        <p className="mt-3 text-sm text-ink-charcoal/70">
          {hangout.status === "ACTIVE"
            ? isCreator
              ? "You can still add expenses and end this hangout when everyone is done."
              : `Only @${hangout.creator.username} can end this hangout.`
            : "This hangout is archived. You can keep tracking payments against the final dues."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {hangout.members.map((member) => (
            <span key={member.userId} className="rounded-full border border-ink-dark/15 bg-white/55 px-3 py-2 text-sm text-ink-charcoal">
              @{member.username}
            </span>
          ))}
        </div>
      </Card>

      <Card className="mt-4 bg-[#fffdf8]" tilt="right">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">Settlements</p>
        <div className="mt-4 flex rounded-[1.5rem] border border-ink-dark/15 bg-white/50 p-1">
          <Pressable
            as="button"
            type="button"
            onClick={() => setSettlementScope("mine")}
            className={`flex-1 rounded-[1.2rem] px-4 py-3 text-sm font-semibold ${
              settlementScope === "mine" ? "marker-button" : "text-ink-charcoal/65"
            }`}
            whileTap={{ scale: 0.985, y: 1 }}
          >
            My dues
          </Pressable>
          <Pressable
            as="button"
            type="button"
            onClick={() => setSettlementScope("group")}
            className={`flex-1 rounded-[1.2rem] px-4 py-3 text-sm font-semibold ${
              settlementScope === "group" ? "marker-button" : "text-ink-charcoal/65"
            }`}
            whileTap={{ scale: 0.985, y: 1 }}
          >
            Whole group
          </Pressable>
        </div>
        <p className="mt-4 text-sm text-ink-charcoal/70">
          {settlementScope === "mine"
            ? "Direct dues that involve you only."
            : "Direct dues across the whole group, without optimizing away who originally covered what."}
        </p>
        <AnimatePresence>
          {recentPaymentStroke ? <PaymentStrike key={recentPaymentStroke.id} payment={recentPaymentStroke} /> : null}
        </AnimatePresence>
        {!visibleSettlements.length ? (
          <p className="mt-3 text-sm text-ink-dark">
            {settlementScope === "mine"
              ? "You do not owe anyone, and nobody owes you right now."
              : "Everyone is settled."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {visibleSettlements.map((settlement) => (
              <div key={`${settlement.fromUserId}-${settlement.toUserId}`} className="paper-scrap paper-tilt-flat p-4">
                <p className="text-sm text-ink-charcoal">
                  <span className="font-semibold text-ink-dark">{settlement.fromName}</span> owes{" "}
                  <span className="font-semibold text-ink-dark">{settlement.toName}</span>
                </p>
                <p className="mt-2 font-heading text-xl font-bold text-ink-dark">
                  {formatPaise(settlement.remainingAmountPaise)}
                </p>
                {settlement.paidAmountPaise > 0 ? (
                  <p className="mt-1 text-sm text-ink-charcoal/70">
                    Paid so far: {formatPaise(settlement.paidAmountPaise)} of{" "}
                    {formatPaise(settlement.originalAmountPaise)}
                  </p>
                ) : null}
                {hangout.status === "CLOSED" && user?.id === settlement.toUserId ? (
                  <Pressable
                    as="button"
                    type="button"
                    onClick={() => openPaymentModal(settlement)}
                    className="marker-button mt-4 rounded-full px-4 py-2 text-sm font-semibold"
                    whileTap={{ scale: 0.95, rotate: -1, y: 1 }}
                  >
                    Mark dues paid
                  </Pressable>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-4 bg-[#fffef8]" tilt="left">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">Balances</p>
        <p className="mt-3 text-sm text-ink-charcoal/70">
          Net position for each member after combining every expense in the hangout.
        </p>
        <div className="mt-4 space-y-3">
          {hangout.summary.balances.length ? (
            hangout.summary.balances.map((balance) => (
              <div key={balance.userId} className="rounded-[1.25rem] border border-ink-dark/15 bg-white/55 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-charcoal">@{balance.username}</span>
                  <span
                    className={`text-sm font-semibold ${
                      balance.netPaise > 0 ? "text-ink-dark" : "text-marker-red"
                    }`}
                  >
                    {balance.netPaise > 0 ? "+" : ""}
                    {formatPaise(balance.netPaise)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-charcoal/70">No open balances.</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 bg-[#fffef8]" tilt="right">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">Expense History</p>
        {hangout.expenses.length ? (
          <div className="receipt-sheet mt-4 rounded-[1.5rem] border border-dashed border-ink-charcoal/20 bg-[#fffdf6] px-5 py-2">
            {hangout.expenses.map((expense) => (
              <div key={expense.id} className="flex items-start justify-between gap-3 border-b border-dashed border-ink-charcoal/20 py-4 last:border-b-0">
                <div>
                  <p className="font-heading text-lg font-semibold text-ink-charcoal">{expense.description}</p>
                  <p className="mt-1 text-sm text-ink-charcoal/65">Paid by @{expense.payer.username}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-ink-dark">{formatPaise(expense.amountPaise)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No expenses yet" body="Tap the floating button to log the first shared expense." />
        )}
      </Card>

      {hangout.summary.paymentHistory?.length ? (
        <Card className="mt-4 bg-[#fffef8]" tilt="left">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/70">Payment History</p>
          <div className="mt-4 space-y-3">
            {hangout.summary.paymentHistory.map((payment) => (
              <div key={payment.id} className="paper-scrap paper-tilt-flat p-4">
                <p className="text-sm text-ink-charcoal">
                  {payment.fromName} paid {payment.toName}
                </p>
                <p className="mt-2 font-heading text-lg font-semibold text-ink-dark">
                  {formatPaise(payment.amountPaise)}
                </p>
                <p className="stamp-label mt-3 px-3 py-2 text-[10px]">
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
            className="lined-input text-base"
          />
          <input
            value={expenseForm.amount}
            onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
            placeholder="250.00"
            inputMode="decimal"
            className="lined-input text-base"
          />
          <select
            value={expenseForm.payerId}
            onChange={(event) => setExpenseForm((current) => ({ ...current, payerId: event.target.value }))}
            className="lined-input text-base"
          >
            {hangout.members.map((member) => (
              <option key={member.userId} value={member.userId}>
                @{member.username}
              </option>
            ))}
          </select>
          <Pressable
            as="button"
            type="submit"
            disabled={submitting}
            className="marker-button w-full px-4 py-4 font-semibold disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save expense"}
          </Pressable>
        </form>
      </Modal>

      <Modal
        open={paymentModalOpen && Boolean(selectedSettlement)}
        title="Mark Dues Paid"
        onClose={closePaymentModal}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="paper-scrap paper-tilt-flat p-4">
            <p className="text-sm text-ink-charcoal/75">
              {selectedSettlement?.fromName} owes {selectedSettlement?.toName}
            </p>
            <p className="mt-2 font-heading text-xl font-semibold text-ink-dark">
              {formatPaise(selectedSettlement?.remainingAmountPaise || 0)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Pressable
              as="button"
              type="button"
              onClick={() => setPaymentMode("full")}
              className={`rounded-[1.4rem] px-4 py-4 text-left ${
                paymentMode === "full" ? "marker-button" : "paper-button text-ink-charcoal"
              }`}
            >
              <p className="font-semibold">Paid full</p>
              <p className="mt-1 text-sm opacity-80">Settle this due completely.</p>
            </Pressable>
            <Pressable
              as="button"
              type="button"
              onClick={() => setPaymentMode("partial")}
              className={`rounded-[1.4rem] px-4 py-4 text-left ${
                paymentMode === "partial" ? "marker-button" : "paper-button text-ink-charcoal"
              }`}
            >
              <p className="font-semibold">Specific amount</p>
              <p className="mt-1 text-sm opacity-80">Record a partial payment.</p>
            </Pressable>
          </div>

          {paymentMode === "partial" ? (
            <input
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder="100.00"
              inputMode="decimal"
              className="lined-input text-base"
            />
          ) : null}

          <Pressable
            as="button"
            type="submit"
            disabled={submitting}
            className="marker-button w-full px-4 py-4 font-semibold disabled:opacity-60"
            whileTap={{ scale: 0.965, y: 2, rotate: -1 }}
          >
            {submitting ? "Saving..." : "Save payment update"}
          </Pressable>
        </form>
      </Modal>

      {hangout.status === "ACTIVE" && !isExpenseModalOpen ? (
        <FloatingExpenseButton onClick={openExpenseModal} />
      ) : null}

      {copied ? (
        <div className="paper-scrap paper-tilt-left fixed bottom-24 left-1/2 z-50 -translate-x-1/2 px-5 py-3 text-sm font-semibold text-ink-charcoal">
          Room code copied: {hangout.roomCode}
        </div>
      ) : null}
    </>
  );
}
