import { CONFIG } from "./types";
import { CanvasRenderer } from "./CanvasRenderer";
import { SpanRenderer } from "./SpanRenderer";
import type { BaseRenderer } from "./BaseRenderer";

export class AsciiVideo {
  private video: HTMLVideoElement;
  private loading: HTMLElement;
  private currentRenderer: BaseRenderer | null = null;
  private scaleFactor: number = CONFIG.defaultScale;

  constructor() {
    this.video = document.getElementById("video") as HTMLVideoElement;
    this.loading = document.getElementById("loading") as HTMLElement;

    this.initializeControls();
    this.initializeFpsSlider();
    this.changeRenderer();
  }

  private initializeControls(): void {
    const scaleSlider = document.getElementById(
      "scale-slider"
    ) as HTMLInputElement;
    const scaleValue = document.getElementById("scale-value") as HTMLElement;
    const greyscale = document.getElementById("greyscale") as HTMLInputElement;
    const rendererSelect = document.getElementById(
      "renderer"
    ) as HTMLSelectElement;

    scaleSlider.value = CONFIG.defaultScale.toString();
    scaleValue.textContent = CONFIG.defaultScale.toString();

    scaleSlider.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.scaleFactor = parseFloat(target.value);
      scaleValue.textContent = this.scaleFactor.toString();
      if (this.currentRenderer) {
        this.currentRenderer.updateDimensions(
          this.video.videoWidth * this.scaleFactor,
          this.video.videoHeight * this.scaleFactor
        );
      }
    });

    greyscale.addEventListener("change", () => {
      if (this.currentRenderer) {
        this.currentRenderer.isGreyscale = greyscale.checked;
      }
    });

    rendererSelect.addEventListener("change", () => this.changeRenderer());
  }

  private initializeFpsSlider(): void {
    const fpsSlider = document.getElementById("fps-slider") as HTMLInputElement;
    const fpsValue = document.getElementById("fps-value") as HTMLElement;

    fpsSlider.min = CONFIG.minFPS.toString();
    fpsSlider.max = CONFIG.maxFPS.toString();
    fpsSlider.value = CONFIG.defaultFPS.toString();

    fpsSlider.addEventListener("input", () => {
      const fps = parseInt(fpsSlider.value);
      fpsValue.textContent = fps.toString();
      CONFIG.frameThrottle = 1000 / fps;
    });
  }

  private async initWebcam(): Promise<void> {
    this.loading.style.display = "block";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = stream;
      this.loading.style.display = "none";
    } catch (err) {
      this.loading.textContent = "Error accessing webcam";
      console.error("Error accessing webcam:", err);
    }
  }

  private changeRenderer(): void {
    const rendererType = (
      document.getElementById("renderer") as HTMLSelectElement
    ).value;
    const asciiSpan = document.getElementById("ascii_span") as HTMLElement;
    const asciiCanvas = document.getElementById(
      "ascii_canvas"
    ) as HTMLCanvasElement;

    // Stop current renderer if exists
    if (this.currentRenderer) {
      this.currentRenderer.stop();
    }

    // Clear and hide both renderers
    asciiSpan.innerHTML = "";
    asciiSpan.classList.remove("renderer-active");

    const ctx = asciiCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
    }
    asciiCanvas.classList.remove("renderer-active");

    // Create new renderer
    if (rendererType === "canvas") {
      this.currentRenderer = new CanvasRenderer(this.video);
      asciiCanvas.classList.add("renderer-active");
    } else {
      this.currentRenderer = new SpanRenderer(this.video);
      asciiSpan.classList.add("renderer-active");
    }

    // Initialize webcam and start rendering
    this.initWebcam().then(() => {
      this.video.onloadeddata = () => {
        if (this.currentRenderer) {
          this.currentRenderer.updateDimensions(
            this.video.videoWidth * this.scaleFactor,
            this.video.videoHeight * this.scaleFactor
          );
          this.currentRenderer.start();
        }
      };
    });
  }
}
