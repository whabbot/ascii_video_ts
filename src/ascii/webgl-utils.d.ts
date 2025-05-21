interface WebGLUtilsInterface {
  create3DContext(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext | null;
  setupWebGL(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext | null;
  setupWebGL2Compute(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext | null;
}

declare const WebGLUtils: WebGLUtilsInterface;
export default WebGLUtils;
