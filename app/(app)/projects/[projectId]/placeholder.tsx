import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Placeholder({ title, phase, children }: { title: string; phase: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming in {phase}</CardTitle>
          <CardDescription>
            This screen is part of {phase}. It will appear once that phase lands.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          {children ?? "No content yet."}
        </CardContent>
      </Card>
    </div>
  );
}
