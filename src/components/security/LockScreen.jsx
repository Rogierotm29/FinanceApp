import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LockScreen({
  accessPin,
  setAccessPin,
  handleUnlockApp,
  attempts = 0,
  maxAttempts = 5,
  lockoutUntil = null,
}) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!lockoutUntil) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = lockoutUntil - Date.now();
      if (remaining <= 0) {
        setCountdown(null);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil && Date.now() < lockoutUntil;
  const remainingAttempts = maxAttempts - attempts;
  const showAttemptsWarning = attempts >= 3 && !isLockedOut;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUnlockApp();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Acceso protegido</CardTitle>
            <CardDescription>
              Ingresa tu PIN para entrar a tu información financiera.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLockedOut && countdown !== null ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                App bloqueada. Intenta de nuevo en{" "}
                {countdown >= 60
                  ? `${Math.ceil(countdown / 60)} minuto${Math.ceil(countdown / 60) !== 1 ? "s" : ""}`
                  : `${countdown} segundo${countdown !== 1 ? "s" : ""}`}
                .
              </div>
            ) : null}

            {showAttemptsWarning ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Intentos restantes: {remainingAttempts}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!!isLockedOut}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleUnlockApp}
              disabled={!!isLockedOut}
            >
              Desbloquear app
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
