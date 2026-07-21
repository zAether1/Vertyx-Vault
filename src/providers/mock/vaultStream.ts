import type { ContentItem } from "@/data/types";
import type { VideoProvider } from "../types";
import { mockLatency, SUBTITLE_TRACKS } from "./shared";

/** Adaptive-bitrate provider — delivers HLS with real quality renditions. */
export const vaultStream: VideoProvider = {
  id: "vault-stream",
  label: "VaultStream",
  priority: 10,
  canResolve: (item: ContentItem) => item.streamHint === "hls",
  async resolve(item) {
    await mockLatency(item.id);
    return {
      contentId: item.id,
      providerId: this.id,
      sources: [
        {
          kind: "hls",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: "auto",
          mimeType: "application/vnd.apple.mpegurl",
        },
      ],
      subtitles: SUBTITLE_TRACKS,
      thumbnails: { kind: "generated" },
      intro: { endSec: 12 },
    };
  },
};
