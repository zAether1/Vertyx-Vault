"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

/** Shell for iframe-kind sources — provider's own player fills the frame. */
export function EmbedFrame({ src, title }: { src: string; title: string }) {
  const { t } = useI18n();
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-panel border border-graphite-800 bg-void shadow-card">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
      <p className="absolute bottom-2 right-3 label-micro opacity-70">
        {t.player.externalPlayer}
      </p>
    </div>
  );
}
