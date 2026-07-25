export interface LibraryEntry { id: string; addedAt: number; }
export interface PlaybackEntry { id: string; currentTime: number; duration: number; updatedAt: number; }
export interface LibrarySnapshot { favorites: LibraryEntry[]; history: LibraryEntry[]; progress: PlaybackEntry[]; }
