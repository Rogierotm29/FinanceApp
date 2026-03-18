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
}) {
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
            <div className="space-y-2">
              <Label>PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleUnlockApp}>
              Desbloquear app
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}