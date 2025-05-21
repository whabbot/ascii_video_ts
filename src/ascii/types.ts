export const ASCII_CHARS = [
  "$", "@", "B", "%", "8", "&", "W", "M", "#", "*", "o", "a", "h", "k", "b", "d", "p", "q", "w", "m",
  "Z", "O", "0", "Q", "L", "C", "J", "U", "Y", "X", "z", "c", "v", "u", "n", "x", "r", "j", "f", "t",
  "/", "\\", "|", "(", ")", "1", "{", "}", "[", "]", "?", "-", "_", "+", "~", "i", "!", "l", "I", ";",
  ":", ",", "\"", "^", "`", ".", " "
] as const;

export interface Config {
  minScale: number;
  maxScale: number;
  defaultScale: number;
  minFPS: number;
  maxFPS: number;
  defaultFPS: number;
  charWidth: number;
  charHeight: number;
  frameThrottle: number;
}

export const CONFIG: Config = {
  minScale: 0.05,
  maxScale: 0.5,
  defaultScale: 0.2,
  minFPS: 1,
  maxFPS: 60,
  defaultFPS: 30,
  charWidth: 4,
  charHeight: 8,
  frameThrottle: 1000 / 30, // Will be updated based on FPS
};

// Initialize BRIGHTNESS_TO_ASCII array
export const BRIGHTNESS_TO_ASCII = new Array(256)
  .fill(0)
  .map((_, i) => Math.floor((i / 256) * ASCII_CHARS.length));

// Color cache for better performance
const colorCache = new Map<string, string>();

export function getColorString(r: number, g: number, b: number): string {
  const key = `${r},${g},${b}`;
  if (!colorCache.has(key)) {
    colorCache.set(key, `rgb(${binColour(r)},${binColour(g)},${binColour(b)})`);
  }
  return colorCache.get(key)!;
}

function binColour(colour: number): number {
  return Math.floor(colour / 8) * 8;
}
