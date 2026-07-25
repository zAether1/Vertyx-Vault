'use client';

import { useEffect, useState } from 'react';
import MediaPlayer from '@/components/player/MediaPlayer';
import type { MediaSource } from '@/types/media';
import { useLibraryStore } from '@/store/library';

export default function PlaybackProgress({ id, title, source }: { id: string; title: string; source?: MediaSource }) {
  const entries = useLibraryStore((state) => state.progress);
  const saveProgress = useLibraryStore((state) => state.saveProgress);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const entry = entries.find((item) => item.id === id);
  return <MediaPlayer title={title} source={source} initialTime={ready ? entry?.currentTime : 0} onProgress={(currentTime, duration) => saveProgress(id, currentTime, duration)} />;
}
