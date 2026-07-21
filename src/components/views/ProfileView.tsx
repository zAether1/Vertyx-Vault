"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { usePlayerPrefs, type SubtitlePref } from "@/stores/player-prefs";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { UserIcon } from "@/components/ui/icons";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`cursor-pointer rounded-pill border px-3.5 py-1.5 text-caption transition-colors duration-[var(--duration-fast)] ${
            value === opt.value
              ? "border-primary-500/60 bg-primary-900/50 text-primary-300"
              : "border-graphite-700 text-ink-dim hover:border-graphite-600 hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileView() {
  const { t } = useI18n();
  const favorites = useFavorites();
  const history = useHistory();
  const prefs = usePlayerPrefs();
  const [hydrated, setHydrated] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => setHydrated(true), []);

  const hoursWatched = hydrated
    ? Math.round(history.entries.reduce((acc, e) => acc + e.progressSec, 0) / 3600 * 10) / 10
    : 0;

  const clearAll = () => {
    favorites.clear();
    history.clear();
    prefs.reset();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div data-i18n-region>
      <div
        className="mx-auto min-h-svh max-w-3xl px-4 pb-24 sm:px-6"
        style={{ paddingTop: "calc(var(--nav-height) + 2.5rem)" }}
      >
        <header className="mb-10 flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-pill border border-graphite-600 bg-graphite-900 text-primary-300 shadow-glow-purple">
            <UserIcon size={26} />
          </span>
          <div>
            <h1 className="font-display text-display-md font-semibold text-ink">
              {t.profile.title}
            </h1>
            <p className="mt-1 text-body text-ink-dim">{t.profile.subtitle}</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Stats */}
          <GlassPanel className="p-6">
            <h2 className="label-micro mb-5">{t.profile.stats}</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: hydrated ? favorites.ids.length : 0, label: t.profile.favoritesCount },
                { value: hydrated ? history.entries.length : 0, label: t.profile.watchedCount },
                { value: hoursWatched, label: t.profile.hoursWatched },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-display-md font-semibold text-ink">
                    {stat.value}
                  </p>
                  <p className="label-micro mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Language */}
          <GlassPanel className="p-6">
            <h2 className="label-micro mb-1">{t.profile.language}</h2>
            <p className="mb-4 text-caption text-ink-faint">{t.profile.languageHint}</p>
            <LocaleSwitcher />
          </GlassPanel>

          {/* Playback */}
          <GlassPanel className="space-y-6 p-6">
            <h2 className="label-micro">{t.profile.playback}</h2>
            <div>
              <p className="mb-2.5 text-caption text-ink-dim">{t.profile.defaultSpeed}</p>
              <SegmentedControl
                label={t.profile.defaultSpeed}
                value={prefs.speed}
                onChange={prefs.setSpeed}
                options={SPEEDS.map((s) => ({ value: s, label: s === 1 ? t.player.normal : `${s}×` }))}
              />
            </div>
            <div>
              <p className="mb-2.5 text-caption text-ink-dim">{t.profile.defaultSubtitles}</p>
              <SegmentedControl<SubtitlePref>
                label={t.profile.defaultSubtitles}
                value={prefs.subtitles}
                onChange={prefs.setSubtitles}
                options={[
                  { value: "off", label: t.player.subtitlesOff },
                  { value: "en", label: t.profile.english },
                  { value: "es", label: t.profile.spanish },
                ]}
              />
            </div>
          </GlassPanel>

          {/* Data */}
          <GlassPanel className="p-6">
            <h2 className="label-micro mb-1">{t.profile.data}</h2>
            <p className="mb-4 text-caption text-ink-faint">{t.profile.clearDataHint}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={clearAll} className="!text-danger hover:!bg-danger/10">
                {t.profile.clearData}
              </Button>
              {clearedNotice && (
                <p role="status" className="text-caption text-success">
                  {t.profile.cleared}
                </p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
      <Footer />
    </div>
  );
}
