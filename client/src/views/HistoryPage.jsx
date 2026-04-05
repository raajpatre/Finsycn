import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { Pressable } from "../components/Pressable";
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
      {error ? <p className="mb-4 text-sm text-marker-red">{error}</p> : null}

      {!loading && hangouts.length === 0 ? (
        <EmptyState title="No archived hangouts yet" body="Once you close a hangout, its history will appear here." />
      ) : null}

      <div className="space-y-3">
        {hangouts.map((hangout, index) => (
          <Card key={hangout.id} tilt={index % 2 === 0 ? "right" : "left"} className="bg-[#fffef8]">
            <Pressable
              as="button"
              type="button"
              onClick={() => navigate(`/hangouts/${hangout.id}`)}
              className="w-full text-left"
              whileTap={{ scale: 0.985, y: 1 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-dark/65">{hangout.roomCode}</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-ink-dark">{hangout.name}</h2>
                </div>
                <span className="stamp-label px-3 py-2 text-xs">Closed</span>
              </div>
              <p className="mt-2 text-sm text-ink-charcoal/70">
                {hangout.expenseCount} expenses • {hangout.memberCount} members
              </p>
              {hangout.summary.settlements.length ? (
                <div className="mt-4 space-y-2">
                  {hangout.summary.settlements.map((settlement) => (
                    <p key={`${settlement.fromUserId}-${settlement.toUserId}`} className="text-sm text-ink-charcoal">
                      {settlement.fromName} owes {settlement.toName}{" "}
                      <span className="font-semibold text-ink-dark">
                        {formatPaise(settlement.remainingAmountPaise ?? settlement.amountPaise)}
                      </span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-dark">Closed with no pending balances.</p>
              )}
            </Pressable>
          </Card>
        ))}
      </div>
    </>
  );
}
