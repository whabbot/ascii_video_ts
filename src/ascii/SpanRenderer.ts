import { BaseRenderer } from './BaseRenderer';

export class SpanRenderer extends BaseRenderer {
  constructor(videoElement: HTMLVideoElement) {
    super(videoElement, "ascii_span");
  }

  protected renderFrame(pixels: Uint8ClampedArray): void {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.HEIGHT; i++) {
      for (let j = 0; j < this.WIDTH; j++) {
        const pixelIndex = (i * this.WIDTH + j) * 4;
        const { char, r, g, b } = this.getCharacterData(pixels, pixelIndex);

        const span = document.createElement("span");
        span.textContent = char;
        span.style.color = this.getColor(r, g, b);
        fragment.appendChild(span);
      }
      fragment.appendChild(document.createElement("br"));
    }

    this.elements.ascii.replaceChildren(fragment);
  }
}
