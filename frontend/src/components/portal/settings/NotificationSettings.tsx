"use client";

import { NOTIFICATION_INFO, NOTIFICATION_TOPICS, type AccountSettings, type NotificationPreferences, type NotificationTopic } from "@fa/shared";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { AuthAlert } from "../auth-fields";
import { SavedNote } from "./form-parts";

/** E-Mail-Benachrichtigungen je Thema – speichert sofort beim Umschalten. */
export function NotificationSettings({ initial }: { initial: NotificationPreferences }) {
  const [preferences, setPreferences] = useState(initial);
  const [saving, setSaving] = useState<NotificationTopic>();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  const toggle = async (topic: NotificationTopic) => {
    const previous = preferences;
    const next = { ...preferences, [topic]: !preferences[topic] };
    setPreferences(next); // sofort anzeigen, bei Fehler zurücksetzen
    setSaving(topic);
    setSaved(false);
    setError(undefined);
    try {
      const settings = await apiRequest<AccountSettings>("/account/notifications", { method: "PATCH", body: next });
      setPreferences(settings.notifications);
      setSaved(true);
    } catch (saveError) {
      setPreferences(previous);
      setError(errorMessage(saveError));
    } finally {
      setSaving(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <ul className="divide-y divide-slate-100">
        {NOTIFICATION_TOPICS.map((topic) => {
          const on = preferences[topic];
          const id = `notification-${topic}`;
          return (
            <li key={topic} className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
              <div>
                <p id={id} className="text-sm font-semibold text-primary">
                  {NOTIFICATION_INFO[topic].label}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{NOTIFICATION_INFO[topic].description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-labelledby={id}
                disabled={saving !== undefined}
                onClick={() => void toggle(topic)}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-accent/30 focus-visible:outline-none disabled:cursor-wait",
                  on ? "bg-accent-ink" : "bg-slate-300",
                )}
              >
                <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-6" : "translate-x-1")} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="min-h-5 text-xs text-slate-500">
        {saved ? <SavedNote>Gespeichert</SavedNote> : "Wichtige Hinweise zu Ihrem Konto (z. B. Sicherheit) erhalten Sie immer."}
      </div>
    </div>
  );
}
