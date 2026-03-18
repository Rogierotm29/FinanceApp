import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  right,
}) {
  return (
    <Card className="rounded-3xl border-0 shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-1">{description}</CardDescription>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {right}
            <div className="rounded-2xl bg-slate-100 p-3">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}