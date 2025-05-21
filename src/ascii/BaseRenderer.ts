import {
  CONFIG,
  BRIGHTNESS_TO_ASCII,
  ASCII_CHARS,
  getColorString,
} from "./types";

export abstract class BaseRenderer {
  protected elements: {
    video: HTMLVideoElement;
    ascii: HTMLElement;
  };
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected lastFrameTime: number = 0;
  protected animationFrameId: number | null = null;
  protected boundProcessFrame: FrameRequestCallback;
  protected fps: number = 0;
  protected frameTimes: number[] = [];
  protected lastFpsUpdate: number = 0;
  protected fpsElement: HTMLElement | null;
  protected _isGreyscale: boolean = false;

  public set isGreyscale(value: boolean) {
    this._isGreyscale = value;
  }
  protected WIDTH: number = 0;
  protected HEIGHT: number = 0;

  constructor(videoElement: HTMLVideoElement, asciiElementId: string) {
    this.elements = {
      video: videoElement,
      ascii: document.getElementById(asciiElementId) as HTMLElement,
    };

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
    this.boundProcessFrame = this.processFrame.bind(this);
    this.fpsElement = document.getElementById("current-fps");
  }

  start(): void {
    this.animationFrameId = requestAnimationFrame(this.boundProcessFrame);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  updateDimensions(width: number, height: number): void {
    this.WIDTH = Math.round(width);
    this.HEIGHT = Math.round(height);
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
  }

  // Abstract method to be implemented by child classes
  protected abstract renderFrame(pixels: Uint8ClampedArray): void;

  protected updateFps(timestamp: number): void {
    const now = performance.now();
    this.frameTimes.push(now);
    this.lastFrameTime = timestamp;

    if (now - this.frameTimes[0] < 1000) {
      return;
    }

    // Remove frame times older than 1 second
    while (this.frameTimes.length > 0 && now - this.frameTimes[0] > 1000) {
      this.frameTimes.shift();
    }

    // Update FPS display once per second
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameTimes.length;
      if (this.fpsElement) {
        this.fpsElement.textContent = this.fps.toString();
      }
      this.lastFpsUpdate = now;
    }
  }

  protected processFrame(timestamp: number): void {
    if (timestamp - this.lastFrameTime < CONFIG.frameThrottle) {
      this.animationFrameId = requestAnimationFrame(this.boundProcessFrame);
      return;
    }

    this.updateFps(timestamp);

    this.ctx.drawImage(this.elements.video, 0, 0, this.WIDTH, this.HEIGHT);
    const imageData = this.ctx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
    const pixels = imageData.data;

    this.renderFrame(pixels);
    this.animationFrameId = requestAnimationFrame(this.boundProcessFrame);
  }

  // Helper method to calculate brightness and get character
  protected getCharacterData(
    pixels: Uint8ClampedArray,
    pixelIndex: number
  ): { char: string; r: number; g: number; b: number } {
    const brightness =
      (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) /
      3;
    const charIndex = BRIGHTNESS_TO_ASCII[Math.round(brightness)];
    return {
      char: ASCII_CHARS[charIndex],
      r: pixels[pixelIndex],
      g: pixels[pixelIndex + 1],
      b: pixels[pixelIndex + 2],
    };
  }

  // Helper method to get color string
  protected getColor(r: number, g: number, b: number): string {
    return this._isGreyscale ? "black" : getColorString(r, g, b);
  }
}
