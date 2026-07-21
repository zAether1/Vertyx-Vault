import type { ContentItem } from "@/data/types";
import { NoProviderError, type ResolvedMedia, type VideoProvider } from "./types";
import { vaultStream } from "./mock/vaultStream";
import { vaultDirect } from "./mock/vaultDirect";
import { vaultEmbed } from "./mock/vaultEmbed";

const providers: VideoProvider[] = [vaultStream, vaultDirect, vaultEmbed];

export function registerProvider(provider: VideoProvider): void {
  providers.push(provider);
}

/**
 * Resolve media for an item: providers are tried in priority order and a
 * failing provider falls through to the next one.
 */
export async function resolveMedia(item: ContentItem): Promise<ResolvedMedia> {
  const candidates = [...providers]
    .sort((a, b) => a.priority - b.priority)
    .filter((p) => p.canResolve(item));

  for (const provider of candidates) {
    try {
      return await provider.resolve(item);
    } catch {
      // Provider failed — fall through to the next candidate.
    }
  }
  throw new NoProviderError(item.id);
}
