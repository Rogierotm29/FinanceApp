import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Sparkles,
  Upload,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SectionCard from "@/components/common/SectionCard";

import { monthToWeekly, getBudgetPlan } from "@/lib/finance";
import { currency } from "@/lib/formatters";
import { hashPin, PIN_STORAGE_KEY } from "@/lib/security";

import { useApp } from "@/context/AppContext";

export default function OnboardingPage() {
  const {
    step,
    setStep,
    profile,
    setProfile,
    loadDemo,
    importRef,
    handleImportFile,
    setSavedPin,
    showError,
  } = useApp();

  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const handlePinStep = async () => {
    // Si no puso nada, saltar sin PIN
    if (!pinInput) {
      setStep(4);
      return;
    }
    if (!/^\d{4,6}$/.test(pinInput)) {
      showError("El PIN debe tener entre 4 y 6 números.");
      return;
    }
    if (pinInput !== pinConfirm) {
      showError("Los PINs no coinciden.");
      return;
    }
    const hash = await hashPin(pinInput);
    localStorage.setItem(PIN_STORAGE_KEY, hash);
    setSavedPin(hash);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
            <BadgeDollarSign className="h-4 w-4" />
            Configuración inicial de tu dinero
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Una app personal para manejar tu dinero
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Te pregunta tus datos, los guarda localmente, separa efectivo,
            crédito e inversión, y te ayuda a registrar movimientos reales.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadDemo}>
              <Sparkles className="mr-2 h-4 w-4" /> Cargar demo
            </Button>
            <Button
              variant="outline"
              onClick={() => importRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Importar respaldo
            </Button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Paso {step} de 4</CardTitle>
              <CardDescription>
                Completa esta parte para personalizar tus recomendaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={(step / 4) * 100} />

              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>¿Cómo te llamas?</Label>
                    <Input
                      placeholder="Ej. Ricardo"
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
                    <Label>Ingreso mensual aproximado</Label>
                    <Input
                      type="number"
                      placeholder="25000"
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
                    <Label>Gastos fijos mensuales</Label>
                    <Input
                      type="number"
                      placeholder="12000"
                      value={profile.fixedExpenses || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          fixedExpenses: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Meta grande de ahorro o patrimonio</Label>
                    <Input
                      type="number"
                      placeholder="100000"
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
                      placeholder="3"
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
                    <Label>Porcentaje de inversión mensual</Label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={profile.investmentRate || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          investmentRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Método base</Label>
                    <Select
                      value={profile.method}
                      onValueChange={(value) =>
                        setProfile((prev) => ({ ...prev, method: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50/30/20">
                          50 / 30 / 20
                        </SelectItem>
                        <SelectItem value="Personalizado">
                          Personalizado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <ShieldCheck className="h-8 w-8 shrink-0 text-slate-400" />
                    <div>
                      <h3 className="font-semibold">PIN de acceso</h3>
                      <p className="text-sm text-slate-500">
                        Opcional. Protege tu app con un PIN de 4 a 6 dígitos.
                        Si lo omites, podrás configurarlo después en Perfil.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>PIN (4–6 dígitos)</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      placeholder="••••"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmar PIN</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      placeholder="••••"
                      maxLength={6}
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handlePinStep()}
                    />
                  </div>

                  <p className="text-xs text-slate-400">
                    Deja ambos campos vacíos para continuar sin PIN.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold">Resumen inicial</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-white p-3 text-sm">
                        <p className="text-slate-500">Nombre</p>
                        <p className="font-medium">
                          {profile.name || "Sin definir"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-sm">
                        <p className="text-slate-500">Ingreso mensual</p>
                        <p className="font-medium">
                          {currency.format(profile.monthlyIncome || 0)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-sm">
                        <p className="text-slate-500">Gastos fijos</p>
                        <p className="font-medium">
                          {currency.format(profile.fixedExpenses || 0)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-sm">
                        <p className="text-slate-500">
                          Inversión semanal sugerida
                        </p>
                        <p className="font-medium">
                          {currency.format(
                            monthToWeekly(
                              getBudgetPlan(
                                profile.monthlyIncome,
                                profile.fixedExpenses,
                                profile.investmentRate,
                                profile.method
                              ).investment
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Tus datos se guardan localmente. Después podrás exportarlos
                    o importarlos entre dispositivos.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                >
                  Atrás
                </Button>

                {step < 3 && (
                  <Button onClick={() => setStep((prev) => prev + 1)}>
                    Siguiente
                  </Button>
                )}
                {step === 3 && (
                  <Button onClick={handlePinStep}>
                    {pinInput ? "Guardar PIN y continuar" : "Omitir y continuar"}
                  </Button>
                )}
                {step === 4 && (
                  <Button onClick={() => setStep(5)}>Entrar al tablero</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <SectionCard
              title="Qué trae esta versión"
              description="Pensada para sentirse más app y menos formulario."
              icon={Sparkles}
            >
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-3">
                  Subpestañas por tipo de cuenta.
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  Pagos de tarjeta con historial.
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  Depósitos y transferencias en débito.
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  Aportes, retiros y rendimiento en inversión.
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
