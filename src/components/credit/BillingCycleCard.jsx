import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function BillingCycleCard({ account, billingInfo, currency, onPayClick }) {
  const [statementExpanded, setStatementExpanded] = useState(false);
  const [currentExpanded, setCurrentExpanded] = useState(false);

  if (!billingInfo) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed p-4 text-center text-sm text-slate-500">
        Configura día de corte y pago para ver el ciclo de facturación.
      </div>
    );
  }

  const {
    statementBalance,
    daysUntilDue,
    isOverdue,
    isUrgent,
    dueDateFormatted,
    nextCutoffFormatted,
    currentCycleTotal,
    currentCycleItems,
    statementCycleItems,
  } = billingInfo;

  const statementBorderClass =
    isOverdue || isUrgent
      ? "border-rose-300 bg-rose-50"
      : "border-rose-200 bg-rose-50";

  return (
    <div className="mt-3 space-y-3">
      {/* Statement section */}
      {statementBalance > 0 ? (
        <div className={`rounded-2xl border p-4 ${statementBorderClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                Por pagar
              </p>
              <p className="mt-0.5 text-lg font-bold text-rose-900">
                {currency.format(statementBalance)}
              </p>
              <p className="mt-0.5 text-sm text-rose-700">
                Vence el {dueDateFormatted}
              </p>
              {isOverdue ? (
                <p className="mt-1 text-sm font-medium text-red-600">
                  ⚠ Vencido hace {Math.abs(daysUntilDue)} días
                </p>
              ) : isUrgent ? (
                <p className="mt-1 text-sm font-medium text-amber-600">
                  ¡Vence en {daysUntilDue} días!
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-600">
                  Vence en {daysUntilDue} días
                </p>
              )}
            </div>
            <Button
              size="sm"
              className="ml-4 shrink-0 rounded-xl"
              onClick={() => onPayClick(account.id, statementBalance)}
            >
              Registrar pago →
            </Button>
          </div>

          {statementCycleItems.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900"
                onClick={() => setStatementExpanded((prev) => !prev)}
              >
                {statementExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Ocultar gastos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Ver {statementCycleItems.length} gastos del estado de cuenta
                  </>
                )}
              </button>

              {statementExpanded && (
                <div className="mt-2 space-y-1.5">
                  {statementCycleItems.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{expense.concept}</p>
                        <p className="text-xs text-slate-500">
                          {expense.category} · {expense.date}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {currency.format(expense.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">
            ✓ Estado de cuenta al corriente
          </p>
          <p className="mt-0.5 text-xs text-emerald-600">
            Sin saldo por pagar en este ciclo
          </p>
        </div>
      )}

      {/* Current cycle section */}
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Acumulando · Corte el {nextCutoffFormatted}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-slate-800">
              {currency.format(currentCycleTotal)}
            </p>
          </div>
        </div>

        {currentCycleItems.length > 0 ? (
          <div className="mt-3">
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              onClick={() => setCurrentExpanded((prev) => !prev)}
            >
              {currentExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Ver {currentCycleItems.length} gastos del ciclo
                </>
              )}
            </button>

            {currentExpanded && (
              <div className="mt-2 space-y-1.5">
                {currentCycleItems.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{expense.concept}</p>
                      <p className="text-xs text-slate-500">
                        {expense.category} · {expense.date}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {currency.format(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">Sin gastos en este ciclo</p>
        )}
      </div>
    </div>
  );
}
