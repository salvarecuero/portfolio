// Stub for the procedural cosmic-rift scene. The real Three.js implementation (the ONLY
// file importing `three`) lands in a later task. This placeholder keeps the dynamic
// import('./riftScene') and the RiftHandle type resolvable, and keeps the lazy chunk free
// of `three` until then.
export interface RiftHandle {
  setPaused(paused: boolean): void;
  dispose(): void;
}

export function createRiftScene(
  _canvas: HTMLCanvasElement,
  _opts: { accent: [number, number, number]; energy: [number, number, number] },
): RiftHandle {
  return { setPaused() {}, dispose() {} };
}
