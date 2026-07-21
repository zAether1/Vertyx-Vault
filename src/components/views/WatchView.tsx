"use client";

import dynamic from "next/dynamic";
import type { ContentItem } from "@/data/types";
import { VertyxMark } from "@/components/ui/icons";

/** Player is heavy (hls.js path) — load it client-side on demand. */
const VideoPlayer = dynamic(
  () => import("@/components/player/VideoPlayer").then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-svh items-center justify-center bg-void">
        <VertyxMark size={48} className="animate-pulse text-ink" />
      </div>
    ),
  },
);

export function WatchView({ item }: { item: ContentItem }) {
  return <VideoPlayer item={item} />;
}
