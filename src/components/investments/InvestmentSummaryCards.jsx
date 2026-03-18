import { Card, CardContent } from "@/components/ui/card";

export default function InvestmentSummaryCards({ investmentSummary, currency }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card className="rounded-3xl border-0 shadow-md">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Aportado</p>
          <p className="mt-1 text-2xl font-bold">
            {currency.format(investmentSummary.aporte)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-md">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Retirado</p>
          <p className="mt-1 text-2xl font-bold">
            {currency.format(investmentSummary.retiro)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-md">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Rendimiento</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {currency.format(investmentSummary.rendimiento)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-md">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Minusvalía</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">
            {currency.format(investmentSummary.minusvalia)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-md">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Neto</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              investmentSummary.neto > 0
                ? "text-emerald-600"
                : investmentSummary.neto < 0
                ? "text-rose-600"
                : "text-slate-900"
            }`}
          >
            {currency.format(investmentSummary.neto)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {investmentSummary.neto > 0
              ? "Vas con ganancia neta"
              : investmentSummary.neto < 0
              ? "Vas con pérdida neta"
              : "Sin cambio neto"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}