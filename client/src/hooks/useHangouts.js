import { useEffect, useState } from "react";

import { apiFetch } from "../api/client";
import { useAuth } from "../state/AuthContext";

export function useHangouts(status) {
  const { token } = useAuth();
  const [hangouts, setHangouts] = useState([]);
  const [archivedDebtSummary, setArchivedDebtSummary] = useState({
    totalIOwePaise: 0,
    totalOwedToMePaise: 0,
    iOweBreakdown: [],
    owedToMeBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    apiFetch(`/hangouts${status ? `?status=${status}` : ""}`, { token })
      .then((payload) => {
        setHangouts(payload.hangouts);
        setArchivedDebtSummary(payload.archivedDebtSummary ?? {
          totalIOwePaise: 0,
          totalOwedToMePaise: 0,
          iOweBreakdown: [],
          owedToMeBreakdown: []
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, token]);

  return {
    hangouts,
    archivedDebtSummary,
    loading,
    error,
    refresh: async () => {
      setLoading(true);
      const payload = await apiFetch(`/hangouts${status ? `?status=${status}` : ""}`, { token });
      setHangouts(payload.hangouts);
      setArchivedDebtSummary(payload.archivedDebtSummary ?? {
        totalIOwePaise: 0,
        totalOwedToMePaise: 0,
        iOweBreakdown: [],
        owedToMeBreakdown: []
      });
      setLoading(false);
    }
  };
}
