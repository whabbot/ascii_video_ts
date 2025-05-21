import { BaseRenderer } from "./BaseRenderer";
import { CONFIG } from "./types";

export class CanvasRenderer extends BaseRenderer {
  private asciiCtx: CanvasRenderingContext2D;

  constructor(videoElement: HTMLVideoElement) {
    super(videoElement, "ascii_canvas");
    this.asciiCtx = (this.elements.ascii as HTMLCanvasElement).getContext(
      "2d"
    )!;
  }

  stop(): void {
    super.stop();
    (this.elements.ascii as HTMLCanvasElement)
      .getContext("2d")!
      .clearRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  updateDimensions(width: number, height: number): void {
    const charAspect = CONFIG.charWidth / CONFIG.charHeight;
    this.WIDTH = Math.round(width / charAspect);
    this.HEIGHT = Math.round(height);
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;

    const asciiCanvas = this.elements.ascii as HTMLCanvasElement;
    asciiCanvas.width = this.WIDTH * CONFIG.charWidth;
    asciiCanvas.height = this.HEIGHT * CONFIG.charHeight;
    this.asciiCtx.font = `${CONFIG.charHeight}px monospace`;
    this.asciiCtx.textBaseline = "top";
  }

  protected renderFrame(pixels: Uint8ClampedArray): void {
    const asciiCanvas = this.elements.ascii as HTMLCanvasElement;
    this.asciiCtx.fillStyle = "white";
    this.asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);

    for (let i = 0; i < this.HEIGHT; i++) {
      for (let j = 0; j < this.WIDTH; j++) {
        const pixelIndex = (i * this.WIDTH + j) * 4;
        const { char, r, g, b } = this.getCharacterData(pixels, pixelIndex);

        this.asciiCtx.fillStyle = this.getColor(r, g, b);
        this.asciiCtx.fillText(
          char,
          j * CONFIG.charWidth,
          i * CONFIG.charHeight
        );
      }
    }
  }
}
