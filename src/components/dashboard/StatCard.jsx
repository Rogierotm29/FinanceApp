import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className="rounded-3xl border-0 shadow-md xl:col-span-1">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}