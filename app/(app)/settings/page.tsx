"use client";

import { useTheme } from "next-themes";
import { PageHeader } from "@/components/layout/page-header";
import { NotebookSection } from "@/components/layout/notebook-section";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-8">
      <PageHeader title="Settings" />

      <NotebookSection title="Theme">
        <div className="flex gap-1">
          {(["light", "dark", "system"] as ThemePreference[]).map((theme) => (
            <Button
              key={theme}
              size="sm"
              variant={settings.theme === theme ? "default" : "ghost"}
              onClick={() => applyTheme(theme)}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Button>
          ))}
        </div>
      </NotebookSection>

      <NotebookSection title="Data">
        <p className="mb-4 text-sm text-muted-foreground">
          {supabaseSync
            ? "Synced to Supabase."
            : "Stored locally in your browser."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={resetDemoData}>
            Load curriculum
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllData}>
            Clear all
          </Button>
        </div>
      </NotebookSection>
    </div>
  );
}
