import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import LockScreen from "@/components/security/LockScreen";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import ErrorBoundary from "@/components/common/ErrorBoundary";

function AppRouter() {
  const {
    mounted,
    isAppUnlocked,
    step,
    accessPin,
    setAccessPin,
    handleUnlockApp,
    pinAttempts,
    lockoutUntil,
  } = useApp();

  if (!mounted) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Cargando tu tablero financiero...
      </div>
    );
  }

  if (!isAppUnlocked) {
    return (
      <LockScreen
        accessPin={accessPin}
        setAccessPin={setAccessPin}
        handleUnlockApp={handleUnlockApp}
        attempts={pinAttempts}
        maxAttempts={5}
        lockoutUntil={lockoutUntil}
      />
    );
  }

  if (step < 5) {
    return <OnboardingPage />;
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}
