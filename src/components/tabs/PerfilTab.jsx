import {
  AlertCircle,
  PencilLine,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SectionCard from "@/components/common/SectionCard";

import { currency } from "@/lib/formatters";

import { useApp } from "@/context/AppContext";

export default function PerfilTab() {
  const {
    savedPin,
    accessPin,
    setAccessPin,
    handleSavePin,
    handleRemovePin,
    profile,
    setProfile,
    goals,
    newGoal,
    setNewGoal,
    addGoal,
    totalGoals,
    openDeleteConfirm,
  } = useApp();

  return (
    <>
      <SectionCard
        title="Seguridad de acceso"
        description="Protege tu app con un PIN local de 4 a 6 dígitos."
        icon={AlertCircle}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{savedPin ? "Cambiar PIN" : "Crear PIN"}</Label>
            <Input
              type="password"
              inputMode="numeric"
              placeholder="Ej. 1234"
              value={accessPin}
              onChange={(e) => setAccessPin(e.target.value)}
            />
          </div>

          <Button onClick={handleSavePin}>
            {savedPin ? "Guardar nuevo PIN" : "Guardar PIN"}
          </Button>
          {savedPin ? (
            <Button variant="outline" onClick={handleRemovePin}>
              Quitar PIN
            </Button>
          ) : null}

          {savedPin ? (
            <p className="text-xs text-slate-500">
              Ya tienes un PIN configurado. Si guardas uno nuevo, reemplazará el actual.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Este PIN se guarda localmente en este dispositivo.
            </p>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Tu configuración"
          description="Edita tus datos base cuando quieras."
          icon={PencilLine}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ingreso mensual</Label>
              <Input
                type="number"
                value={profile.monthlyIncome || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    monthlyIncome: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Gastos fijos</Label>
              <Input
                type="number"
                value={profile.fixedExpenses || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    fixedExpenses: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Meta de ahorro</Label>
              <Input
                type="number"
                value={profile.savingsGoal || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    savingsGoal: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Meses para fondo de emergencia</Label>
              <Input
                type="number"
                value={profile.emergencyFundMonths || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    emergencyFundMonths: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>% de inversión</Label>
              <Input
                type="number"
                value={profile.investmentRate || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    investmentRate: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Tus metas"
          description="Objetivos de ahorro o inversión."
          icon={CheckCircle2}
        >
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between rounded-2xl border p-3"
              >
                <div>
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm text-slate-500">
                    {currency.format(goal.amount)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    openDeleteConfirm(
                      "goal",
                      goal.id,
                      "Eliminar meta",
                      `Se eliminará la meta "${goal.name}".`
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
              <Input
                placeholder="Nueva meta"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Monto"
                value={newGoal.amount}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
              <Button onClick={addGoal}>
                <Plus className="mr-2 h-4 w-4" /> Agregar
              </Button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-sm">
              Total en metas:{" "}
              <span className="font-semibold">
                {currency.format(totalGoals)}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
