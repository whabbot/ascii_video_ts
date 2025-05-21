import { BaseRenderer } from "./BaseRenderer";
import WebGLUtils from "./webgl-utils";

export class WebGLRenderer extends BaseRenderer {
  private gl: WebGLRenderingContext;

  constructor(videoElement: HTMLVideoElement) {
    super(videoElement, "ascii_webgl");
    const canvas = this.elements.ascii as HTMLCanvasElement;
    const glContext = WebGLUtils.setupWebGL(canvas);

    if (!glContext) {
      throw new Error("WebGL not supported in this browser");
    }

    this.gl = glContext;

    this.initShaders();
    this.initBuffers();
    this.initTextures();
  }

  private initShaders(): void {
    // TODO: implement
  }

  private initBuffers(): void {
    // TODO: implement
  }

  private initTextures(): void {
    // TODO: implement
  }

  updateDimensions(width: number, height: number): void {
    super.updateDimensions(width, height);

    const canvas = this.elements.ascii as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;

    this.gl.viewport(0, 0, width, height);
  }

  protected renderFrame(): void {
    // TODO: implement
  }

  public set isGreyscale(value: boolean) {
    this._isGreyscale = value;
  }

  public stop(): void {
    super.stop();
    // Clean up WebGL resources
    // TODO: implement
  }
}
