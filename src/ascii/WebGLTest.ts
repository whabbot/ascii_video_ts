import * as webglUtils from "./webgl-utils-2";
import * as m4 from "./m4";

type FontInfo = {
  letterHeight: number;
  spaceWidth: number;
  spacing: number;
  textureWidth: number;
  textureHeight: number;
  glyphInfos: {
    [key: string]: {
      x: number;
      y: number;
      width: number;
    };
  };
};

const fontInfo: FontInfo = {
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

function makeVerticesForString(fontInfo: FontInfo, s: string) {
  const len = s.length;
  const numVertices = len * 6;
  const positions = new Float32Array(numVertices * 2);
  const texcoords = new Float32Array(numVertices * 2);
  let offset = 0;
  let x = 0;
  const maxX = fontInfo.textureWidth;
  const maxY = fontInfo.textureHeight;
  for (let ii = 0; ii < len; ++ii) {
    const letter = s[ii];
    const glyphInfo = fontInfo.glyphInfos[letter];
    if (glyphInfo) {
      const x2 = x + glyphInfo.width;
      const u1 = glyphInfo.x / maxX;
      const v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
      const u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
      const v2 = glyphInfo.y / maxY;

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
export class WebGLTest {
  main() {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }

    // Maunally create a bufferInfo
    const textBufferInfo = {
      attribs: {
        a_position: { buffer: gl.createBuffer(), numComponents: 2 },
        a_texcoord: { buffer: gl.createBuffer(), numComponents: 2 },
      },
      numElements: 0,
    };

    // setup GLSL program
    const textProgramInfo = webglUtils.createProgramInfo(
      gl,
      ["text-vertex-shader", "text-fragment-shader"],
      undefined,
      undefined,
      undefined
    );

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
    image.src = "./font.png";
    image.onload = function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, glyphTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    };

    const names = [
      "anna", // 0
      "colin", // 1
      "james", // 2
      "danny", // 3
      "kalin", // 4
      "hiro", // 5
      "eddie", // 6
      "shu", // 7
      "brian", // 8
      "tami", // 9
      "rick", // 10
      "gene", // 11
      "natalie", // 12,
      "evan", // 13,
      "sakura", // 14,
      "kai", // 15,
    ];

    const textUniforms = {
      u_matrix: m4.identity(),
      u_texture: glyphTex,
      u_color: [0, 0, 0, 1], // black
    };

    function degToRad(d: number) {
      return (d * Math.PI) / 180;
    }

    const rotation = [degToRad(190), degToRad(0), degToRad(0)];
    const fieldOfViewRadians = degToRad(60);
    const rotationSpeed = 1.2;

    let then = 0;

    requestAnimationFrame(drawScene);

    // Draw the scene.
    function drawScene(now: number) {
      // Convert to seconds
      now *= 0.001;
      // Subtract the previous time from the current time
      const deltaTime = now - then;
      // Remember the current time for the next frame.
      then = now;

      if (!gl) {
        return;
      }

      const glCanvas = gl.canvas as HTMLCanvasElement;

      webglUtils.resizeCanvasToDisplaySize(glCanvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);

      // Every frame increase the rotation a little.
      rotation[1] += rotationSpeed * deltaTime;

      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.depthMask(true);

      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Compute the matrices used for all objects
      const aspect = glCanvas.clientWidth / glCanvas.clientHeight;
      const zNear = 1;
      const zFar = 2000;
      const projectionMatrix = m4.perspective(
        fieldOfViewRadians,
        aspect,
        zNear,
        zFar
      );

      const textPositions = [
        [-150, -300, -300],
        [-100, -250, -300],
        [-50, -200, -300],
        [0, -150, -300],
        [50, -100, -300],
        [100, -50, -300],
        [150, 0, -300],
        [100, 50, -300],
        [50, 100, -300],
        [0, 150, -300],
        [-50, 100, -300],
        [-100, 50, -300],
        [-150, 0, -300],
        [-100, -50, -300],
        [-50, -100, -300],
      ];

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);

      // draw the text

      // setup to draw the text.
      // Because every letter uses the same attributes and the same progarm
      // we only need to do this once.
      gl.useProgram(textProgramInfo.program);
      webglUtils.setBuffersAndAttributes(gl, textProgramInfo, textBufferInfo);

      textPositions.forEach(function (pos, ndx) {
        const name = names[ndx];
        const vertices = makeVerticesForString(fontInfo, name);

        // update the buffers
        textBufferInfo.attribs.a_position.numComponents = 2;
        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          textBufferInfo.attribs.a_position.buffer
        );
        gl.bufferData(
          gl.ARRAY_BUFFER,
          vertices.arrays.position,
          gl.DYNAMIC_DRAW
        );
        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          textBufferInfo.attribs.a_texcoord.buffer
        );
        gl.bufferData(
          gl.ARRAY_BUFFER,
          vertices.arrays.texcoord,
          gl.DYNAMIC_DRAW
        );

        // use just the position of the 'F' for the text

        // because pos is in view space that means it's a vector from the eye to
        // some position. So translate along that vector back toward the eye some distance
        const fromEye = m4.normalize(pos, undefined);
        const amountToMoveTowardEye = 150; // because the F is 150 units long
        const viewX = pos[0] - fromEye[0] * amountToMoveTowardEye;
        const viewY = pos[1] - fromEye[1] * amountToMoveTowardEye;
        const viewZ = pos[2] - fromEye[2] * amountToMoveTowardEye;
        const desiredTextScale = (-1 / gl.canvas.height) * 2; // 1x1 pixels
        const scale = viewZ * desiredTextScale;

        let textMatrix = m4.translate(projectionMatrix, viewX, viewY, viewZ);
        // scale the F to the size we need it.
        textMatrix = m4.scale(textMatrix, scale, scale, 1);

        // set texture uniform
        m4.copy(textMatrix, textUniforms.u_matrix);
        webglUtils.setUniforms(textProgramInfo, textUniforms);

        // Draw the text.
        gl.drawArrays(gl.TRIANGLES, 0, vertices.numVertices);
      });

      requestAnimationFrame(drawScene);
    }
  }
}
