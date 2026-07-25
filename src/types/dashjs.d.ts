declare module 'dashjs' {
  export interface DashPlayer {
    initialize(video: HTMLVideoElement, source: string, autoPlay?: boolean): void;
    reset(): void;
  }

  interface DashMediaPlayer {
    create(): DashPlayer;
  }

  const dashjs: {
    MediaPlayer(): DashMediaPlayer;
  };

  export default dashjs;
}
