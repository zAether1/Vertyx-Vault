import type { ContentItem } from "@/data/types";
import { createRng } from "@/lib/seeded";
import type { VideoProvider } from "../types";
import { mockLatency, SUBTITLE_TRACKS } from "./shared";

const MP4_POOL = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

/** Progressive-download provider — plain MP4 sources. */
export const vaultDirect: VideoProvider = {
  id: "vault-direct",
  label: "VaultDirect",
  priority: 20,
  canResolve: (item: ContentItem) => item.streamHint === "mp4",
  async resolve(item) {
    await mockLatency(item.id);
    const rng = createRng(item.id);
    const url = MP4_POOL[Math.floor(rng() * MP4_POOL.length)] ?? MP4_POOL[0]!;
    return {
      contentId: item.id,
      providerId: this.id,
      sources: [{ kind: "mp4", url, quality: "1080p", mimeType: "video/mp4" }],
      subtitles: SUBTITLE_TRACKS,
      thumbnails: { kind: "generated" },
    };
  },
};
