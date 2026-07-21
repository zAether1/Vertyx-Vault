import type { ContentItem } from "@/data/types";
import type { VideoProvider } from "../types";
import { mockLatency } from "./shared";

/**
 * Embedded-player provider — the source is a full iframe player hosted by the
 * provider. Custom controls are disabled; EmbedFrame renders the shell.
 */
export const vaultEmbed: VideoProvider = {
  id: "vault-embed",
  label: "VaultEmbed",
  priority: 30,
  canResolve: (item: ContentItem) => item.streamHint === "iframe",
  async resolve(item) {
    await mockLatency(item.id);
    return {
      contentId: item.id,
      providerId: this.id,
      sources: [
        {
          kind: "iframe",
          // Publicly embeddable demo player (CC-licensed content).
          url: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0",
        },
      ],
      subtitles: [],
    };
  },
};
