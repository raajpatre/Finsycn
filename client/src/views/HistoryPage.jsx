import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useHangouts } from "../hooks/useHangouts";
import { formatPaise } from "../utils/money";

export function HistoryPage() {
  const navigate = useNavigate();
  const { hangouts, loading, error } = useHangouts("CLOSED");

  return (
    <>
      <PageHeader
        eyebrow="Archive"
        title="History"
        subtitle="Closed hangouts stay here with their final settlements and spend trail."
      />

      {loading ? <LoadingState label="Loading archived hangouts..." /> : null}
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      {!loading && hangouts.length === 0 ? (
        <EmptyState title="No archived hangouts yet" body="Once you close a hangout, its history will appear here." />
      ) : null}

      <div className="space-y-3">
        {hangouts.map((hangout) => (
          <Card key={hangout.id}>
            <button type="button" onClick={() => navigate(`/hangouts/${hangout.id}`)} className="w-full text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-100/70">{hangout.roomCode}</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{hangout.name}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {hangout.expenseCount} expenses • {hangout.memberCount} members
              </p>
              {hangout.summary.settlements.length ? (
                <div className="mt-4 space-y-2">
                  {hangout.summary.settlements.map((settlement) => (
                    <p key={`${settlement.fromUserId}-${settlement.toUserId}`} className="text-sm text-slate-200">
                      {settlement.fromName} owes {settlement.toName}{" "}
                      <span className="font-semibold text-brand-100">
                        {formatPaise(settlement.remainingAmountPaise ?? settlement.amountPaise)}
                      </span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-emerald-300">Closed with no pending balances.</p>
              )}
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
