import { BaseRenderer } from "./BaseRenderer";
import WebGLUtils from "./webgl-utils";

const fontInfo = {
  letterHeight: 8,
  spaceWidth: 8,
  spacing: -1,
  textureWidth: 64,
  textureHeight: 40,
  glyphInfos: {
    a: { x: 0, y: 0, width: 8 },
    b: { x: 8, y: 0, width: 8 },
    c: { x: 16, y: 0, width: 8 },
    d: { x: 24, y: 0, width: 8 },
    e: { x: 32, y: 0, width: 8 },
    f: { x: 40, y: 0, width: 8 },
    g: { x: 48, y: 0, width: 8 },
    h: { x: 56, y: 0, width: 8 },
    i: { x: 0, y: 8, width: 8 },
    j: { x: 8, y: 8, width: 8 },
    k: { x: 16, y: 8, width: 8 },
    l: { x: 24, y: 8, width: 8 },
    m: { x: 32, y: 8, width: 8 },
    n: { x: 40, y: 8, width: 8 },
    o: { x: 48, y: 8, width: 8 },
    p: { x: 56, y: 8, width: 8 },
    q: { x: 0, y: 16, width: 8 },
    r: { x: 8, y: 16, width: 8 },
    s: { x: 16, y: 16, width: 8 },
    t: { x: 24, y: 16, width: 8 },
    u: { x: 32, y: 16, width: 8 },
    v: { x: 40, y: 16, width: 8 },
    w: { x: 48, y: 16, width: 8 },
    x: { x: 56, y: 16, width: 8 },
    y: { x: 0, y: 24, width: 8 },
    z: { x: 8, y: 24, width: 8 },
    "0": { x: 16, y: 24, width: 8 },
    "1": { x: 24, y: 24, width: 8 },
    "2": { x: 32, y: 24, width: 8 },
    "3": { x: 40, y: 24, width: 8 },
    "4": { x: 48, y: 24, width: 8 },
    "5": { x: 56, y: 24, width: 8 },
    "6": { x: 0, y: 32, width: 8 },
    "7": { x: 8, y: 32, width: 8 },
    "8": { x: 16, y: 32, width: 8 },
    "9": { x: 24, y: 32, width: 8 },
    "-": { x: 32, y: 32, width: 8 },
    "*": { x: 40, y: 32, width: 8 },
    "!": { x: 48, y: 32, width: 8 },
    "?": { x: 56, y: 32, width: 8 },
  },
};

function makeVerticesForString(fontInfo: any, s: any) {
  var len = s.length;
  var numVertices = len * 6;
  var positions = new Float32Array(numVertices * 2);
  var texcoords = new Float32Array(numVertices * 2);
  var offset = 0;
  var x = 0;
  var maxX = fontInfo.textureWidth;
  var maxY = fontInfo.textureHeight;
  for (var ii = 0; ii < len; ++ii) {
    var letter = s[ii];
    var glyphInfo = fontInfo.glyphInfos[letter];
    if (glyphInfo) {
      var x2 = x + glyphInfo.width;
      var u1 = glyphInfo.x / maxX;
      var v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
      var u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
      var v2 = glyphInfo.y / maxY;

      // 6 vertices per letter
      positions[offset + 0] = x;
      positions[offset + 1] = 0;
      texcoords[offset + 0] = u1;
      texcoords[offset + 1] = v1;

      positions[offset + 2] = x2;
      positions[offset + 3] = 0;
      texcoords[offset + 2] = u2;
      texcoords[offset + 3] = v1;

      positions[offset + 4] = x;
      positions[offset + 5] = fontInfo.letterHeight;
      texcoords[offset + 4] = u1;
      texcoords[offset + 5] = v2;

      positions[offset + 6] = x;
      positions[offset + 7] = fontInfo.letterHeight;
      texcoords[offset + 6] = u1;
      texcoords[offset + 7] = v2;

      positions[offset + 8] = x2;
      positions[offset + 9] = 0;
      texcoords[offset + 8] = u2;
      texcoords[offset + 9] = v1;

      positions[offset + 10] = x2;
      positions[offset + 11] = fontInfo.letterHeight;
      texcoords[offset + 10] = u2;
      texcoords[offset + 11] = v2;

      x += glyphInfo.width + fontInfo.spacing;
      offset += 12;
    } else {
      // we don't have this character so just advance
      x += fontInfo.spaceWidth;
    }
  }

  // return ArrayBufferViews for the portion of the TypedArrays
  // that were actually used.
  return {
    arrays: {
      position: new Float32Array(positions.buffer, 0, offset),
      texcoord: new Float32Array(texcoords.buffer, 0, offset),
    },
    numVertices: offset / 2,
  };
}

function createGlyph(gl: WebGLRenderingContext) {
  // Create a texture.
  const glyphTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, glyphTex);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])
  );
  // Asynchronously load an image
  const image = new Image();
  image.src = "./8x8-font.png";
  image.addEventListener("load", function () {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  });
}

export class WebGLRenderer extends BaseRenderer {
  private gl: WebGLRenderingContext;
  private textBufferInfo: any;

  constructor(videoElement: HTMLVideoElement) {
    super(videoElement, "ascii_webgl");
    const canvas = this.elements.ascii as HTMLCanvasElement;
    const glContext = WebGLUtils.setupWebGL(canvas);

    if (!glContext) {
      throw new Error("WebGL not supported in this browser");
    }

    this.gl = glContext;

    this.textBufferInfo = {
      attribs: {
        a_position: { buffer: glContext.createBuffer(), numComponents: 2 },
        a_texcoord: { buffer: glContext.createBuffer(), numComponents: 2 },
      },
      numElements: 0,
    };
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
