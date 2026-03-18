export default function AccountBadge({ type }) {
  const styles = {
    Debito: "bg-emerald-100 text-emerald-700",
    Ahorro: "bg-cyan-100 text-cyan-700",
    Efectivo: "bg-amber-100 text-amber-700",
    Credito: "bg-rose-100 text-rose-700",
    Inversion: "bg-violet-100 text-violet-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[type] || "bg-slate-100 text-slate-700"
      }`}
    >
      {type}
    </span>
  );
}