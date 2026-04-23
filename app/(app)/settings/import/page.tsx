import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Import" };

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Excel import</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming in Phase 6</CardTitle>
          <CardDescription>Upload your existing spreadsheets and migrate into Acrely.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          Will handle <code>Land_Details_Meadow_Breeze.xlsx</code> and <code>Meadow_Breeze_Sales_Tracker.xlsx</code>
          with column mapping UI and dry-run preview.
        </CardContent>
      </Card>
    </div>
  );
}
