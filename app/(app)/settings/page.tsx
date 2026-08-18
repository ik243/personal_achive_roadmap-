"use client";

import { useTheme } from "next-themes";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ThemePreference } from "@/lib/domain/types";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import { useAppData } from "@/providers/app-data-provider";

export default function SettingsPage() {
  const { settings, setTheme, resetDemoData, clearAllData } = useAppData();
  const supabaseSync = isSupabaseEnabled();
  const { setTheme: setNextTheme } = useTheme();

  const applyTheme = (theme: ThemePreference) => {
    setTheme(theme);
    setNextTheme(theme);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Appearance and data." />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Appearance</Label>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as ThemePreference[]).map((theme) => (
              <Button
                key={theme}
                variant={settings.theme === theme ? "default" : "outline"}
                onClick={() => applyTheme(theme)}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {supabaseSync
              ? "Cloud sync is active via Supabase. Changes are saved to your database."
              : "Data is stored locally in your browser. Set Supabase env vars to sync across devices."}
          </p>
          <Button variant="outline" onClick={resetDemoData}>
            Load demo data
          </Button>
          <Button variant="destructive" onClick={clearAllData}>
            Clear all data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
