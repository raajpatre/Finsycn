import { Navigate, Route, Routes } from "react-router-dom";

import { BottomNav } from "./components/BottomNav";
import { LoadingState } from "./components/LoadingState";
import { ScreenShell } from "./components/ScreenShell";
import { useAuth } from "./state/AuthContext";
import { ActiveHangoutsPage } from "./views/ActiveHangoutsPage";
import { AuthPage } from "./views/AuthPage";
import { HangoutDetailPage } from "./views/HangoutDetailPage";
import { HistoryPage } from "./views/HistoryPage";
import { ProfilePage } from "./views/ProfilePage";

function ProtectedApp() {
  return (
    <ScreenShell>
      <Routes>
        <Route path="/" element={<Navigate to="/hangouts" replace />} />
        <Route path="/hangouts" element={<ActiveHangoutsPage />} />
        <Route path="/hangouts/:hangoutId" element={<HangoutDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/hangouts" replace />} />
      </Routes>
      <BottomNav />
    </ScreenShell>
  );
}

export default function App() {
  const { loading, token } = useAuth();

  if (loading) {
    return (
      <ScreenShell>
        <LoadingState label="Loading your workspace..." />
      </ScreenShell>
    );
  }

  return token ? <ProtectedApp /> : <AuthPage />;
}
