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
export class WebGLTest {
  main() {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }

    function expandRLEData(rleData: number[], padding?: number[]) {
      padding = padding || [];
      const data: number[] = [];
      for (let ii = 0; ii < rleData.length; ii += 4) {
        const runLength = rleData[ii];
        const element = rleData.slice(ii + 1, ii + 4);
        element.push.apply(element, padding);
        for (let jj = 0; jj < runLength; ++jj) {
          data.push.apply(data, element);
        }
      }
      return data;
    }

    function create3DFVertices(): Record<string, Float32Array> {
      const positions = [
        // left column front
        0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

        // top rung front
        30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

        // middle rung front
        30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

        // left column back
        0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

        // top rung back
        30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

        // middle rung back
        30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

        // top
        0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

        // top rung right
        100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

        // under top rung
        30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

        // between top rung and middle
        30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

        // top of middle rung
        30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

        // right of middle rung
        67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

        // bottom of middle rung.
        30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

        // right of bottom
        30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

        // bottom
        0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

        // left side
        0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
      ];

      const texcoords = [
        // left column front
        0.22, 0.19, 0.22, 0.79, 0.34, 0.19, 0.22, 0.79, 0.34, 0.79, 0.34, 0.19,

        // top rung front
        0.34, 0.19, 0.34, 0.31, 0.62, 0.19, 0.34, 0.31, 0.62, 0.31, 0.62, 0.19,

        // middle rung front
        0.34, 0.43, 0.34, 0.55, 0.49, 0.43, 0.34, 0.55, 0.49, 0.55, 0.49, 0.43,

        // left column back
        0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

        // top rung back
        0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

        // middle rung back
        0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

        // top
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

        // top rung right
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

        // under top rung
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

        // between top rung and middle
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // top of middle rung
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // right of middle rung
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // bottom of middle rung.
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

        // right of bottom
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // bottom
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

        // left side
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
      ];

      const normals = expandRLEData([
        // left column front
        // top rung front
        // middle rung front
        18, 0, 0, 1,

        // left column back
        // top rung back
        // middle rung back
        18, 0, 0, -1,

        // top
        6, 0, 1, 0,

        // top rung right
        6, 1, 0, 0,

        // under top rung
        6, 0, -1, 0,

        // between top rung and middle
        6, 1, 0, 0,

        // top of middle rung
        6, 0, 1, 0,

        // right of middle rung
        6, 1, 0, 0,

        // bottom of middle rung.
        6, 0, -1, 0,

        // right of bottom
        6, 1, 0, 0,

        // bottom
        6, 0, -1, 0,

        // left side
        6, -1, 0, 0,
      ]);

      const colors = expandRLEData(
        [
          // left column front
          // top rung front
          // middle rung front
          18, 200, 70, 120,

          // left column back
          // top rung back
          // middle rung back
          18, 80, 70, 200,

          // top
          6, 70, 200, 210,

          // top rung right
          6, 200, 200, 70,

          // under top rung
          6, 210, 100, 70,

          // between top rung and middle
          6, 210, 160, 70,

          // top of middle rung
          6, 70, 180, 210,

          // right of middle rung
          6, 100, 70, 210,

          // bottom of middle rung.
          6, 76, 210, 100,

          // right of bottom
          6, 140, 210, 80,

          // bottom
          6, 90, 130, 110,

          // left side
          6, 160, 160, 220,
        ],
        [255]
      );

      const numVerts = positions.length / 3;

      const arrays = {
        position: webglUtils.createAugmentedTypedArray(3, numVerts, undefined),
        texcoord: webglUtils.createAugmentedTypedArray(2, numVerts, undefined),
        normal: webglUtils.createAugmentedTypedArray(3, numVerts, undefined),
        color: webglUtils.createAugmentedTypedArray(4, numVerts, Uint8Array),
        indices: webglUtils.createAugmentedTypedArray(
          3,
          numVerts / 3,
          Uint16Array
        ),
      };

      // @ts-expect-error
      arrays.position.push(positions);
      // @ts-expect-error
      arrays.texcoord.push(texcoords);
      // @ts-expect-error
      arrays.normal.push(normals);
      // @ts-expect-error
      arrays.color.push(colors);

      for (let ii = 0; ii < numVerts; ++ii) {
        // @ts-expect-error
        arrays.indices.push(ii);
      }

      // @ts-expect-error
      return arrays;
    }

    function createBufferInfo(fn: Function) {
      return function (gl: WebGLRenderingContext) {
        const arrays = fn.apply(null, Array.prototype.slice.call(arguments, 1));
        return webglUtils.createBufferInfoFromArrays(gl, arrays);
      };
    }

    const create3DFBufferInfo = createBufferInfo(create3DFVertices);

    // Create data for 'F'
    var fBufferInfo = create3DFBufferInfo(gl);
    // Maunally create a bufferInfo
    var textBufferInfo = {
      attribs: {
        a_position: { buffer: gl.createBuffer(), numComponents: 2 },
        a_texcoord: { buffer: gl.createBuffer(), numComponents: 2 },
      },
      numElements: 0,
    };

    // setup GLSL programs
    var fProgramInfo = webglUtils.createProgramInfo(
      gl,
      ["vertex-shader-3d", "fragment-shader-3d"],
      undefined,
      undefined,
      undefined
    );
    var textProgramInfo = webglUtils.createProgramInfo(
      gl,
      ["text-vertex-shader", "text-fragment-shader"],
      undefined,
      undefined,
      undefined
    );

    // Create a texture.
    var glyphTex = gl.createTexture();
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
    var image = new Image();
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

    var names = [
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

    var fUniforms = {
      u_matrix: m4.identity(),
    };

    var textUniforms = {
      u_matrix: m4.identity(),
      u_texture: glyphTex,
      u_color: [0, 0, 0, 1], // black
    };

    function degToRad(d: number) {
      return (d * Math.PI) / 180;
    }

    var translation = [0, 30, 0];
    var rotation = [degToRad(190), degToRad(0), degToRad(0)];
    var scale = [1, 1, 1];
    var fieldOfViewRadians = degToRad(60);
    var rotationSpeed = 1.2;

    var then = 0;

    requestAnimationFrame(drawScene);

    // Draw the scene.
    function drawScene(now: number) {
      // Convert to seconds
      now *= 0.001;
      // Subtract the previous time from the current time
      var deltaTime = now - then;
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
      var aspect = glCanvas.clientWidth / glCanvas.clientHeight;
      var zNear = 1;
      var zFar = 2000;
      var projectionMatrix = m4.perspective(
        fieldOfViewRadians,
        aspect,
        zNear,
        zFar
      );

      // Compute the camera's matrix using look at.
      var cameraRadius = 360;
      var cameraPosition = [
        Math.cos(now) * cameraRadius,
        0,
        Math.sin(now) * cameraRadius,
      ];
      var target = [0, 0, 0];
      var up = [0, 1, 0];
      var cameraMatrix = m4.lookAt(cameraPosition, target, up);
      var viewMatrix = m4.inverse(cameraMatrix);

      var textPositions = [];

      // setup to draw the 'F'
      gl.useProgram(fProgramInfo.program);

      webglUtils.setBuffersAndAttributes(gl, fProgramInfo, fBufferInfo);

      // draw the Fs.
      var spread = 170;
      for (var yy = -1; yy <= 1; ++yy) {
        for (var xx = -2; xx <= 2; ++xx) {
          var fViewMatrix = m4.translate(
            viewMatrix,
            translation[0] + xx * spread,
            translation[1] + yy * spread,
            translation[2]
          );
          fViewMatrix = m4.xRotate(fViewMatrix, rotation[0]);
          fViewMatrix = m4.yRotate(fViewMatrix, rotation[1] + yy * xx * 0.2);
          fViewMatrix = m4.zRotate(
            fViewMatrix,
            rotation[2] + now + (yy * 3 + xx) * 0.1
          );
          fViewMatrix = m4.scale(fViewMatrix, scale[0], scale[1], scale[2]);
          fViewMatrix = m4.translate(fViewMatrix, -50, -75, 0);
          textPositions.push([
            fViewMatrix[12],
            fViewMatrix[13],
            fViewMatrix[14],
          ]);

          fUniforms.u_matrix = m4.multiply(projectionMatrix, fViewMatrix);

          webglUtils.setUniforms(fProgramInfo, fUniforms);

          // Draw the geometry.
          gl.drawElements(
            gl.TRIANGLES,
            fBufferInfo.numElements,
            gl.UNSIGNED_SHORT,
            0
          );
        }
      }

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
        var name = names[ndx];
        var s =
          name +
          ":" +
          pos[0].toFixed(0) +
          "," +
          pos[1].toFixed(0) +
          "," +
          pos[2].toFixed(0);
        var vertices = makeVerticesForString(fontInfo, s);

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
        var fromEye = m4.normalize(pos, undefined);
        var amountToMoveTowardEye = 150; // because the F is 150 units long
        var viewX = pos[0] - fromEye[0] * amountToMoveTowardEye;
        var viewY = pos[1] - fromEye[1] * amountToMoveTowardEye;
        var viewZ = pos[2] - fromEye[2] * amountToMoveTowardEye;
        var desiredTextScale = (-1 / gl.canvas.height) * 2; // 1x1 pixels
        var scale = viewZ * desiredTextScale;

        var textMatrix = m4.translate(projectionMatrix, viewX, viewY, viewZ);
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
