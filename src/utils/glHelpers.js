import { rgbToGL } from "./colorConvert";
import { FRAG_SHADER, VERT_SHADER } from "../utils/shaders.js";
import { initShaders } from "../WebGLUtils/cuon-utils.js";
import { Matrix4 } from "../WebGLUtils/cuon-matrix-utils";

export const ANGLE_VALUES = [
  0, -26.565, -45, -71.565, -90, -116.565, -135, -161.565, -180,
];

const BRUSH_VERTICES = new Float32Array([
  -0.1, 0.1, -0.1, -0.1, 0.1, 0.1, 0.1, -0.1,
]);

const RECT_MATRIX = new Matrix4();

export const getAttributes = (gl) => {
  const glAttributes = {
    u_ModelMatrix: gl.getUniformLocation(gl.program, "u_ModelMatrix"),
    a_Position: gl.getAttribLocation(gl.program, "a_Position"),
    u_FragColor: gl.getUniformLocation(gl.program, "u_FragColor"),
  };
  return glAttributes;
};

export const getStroke = (point1, point2) => {
  const distance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
  const angle = Math.atan2(point2.x - point1.x, point2.y - point1.y);
  const deltaP = point2.pressure - point1.pressure;
  return [distance, angle, deltaP];
};

export const initVertexBuffers = (gl, vertices, a_Position) => {
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.error("failed to create buffer object");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  return vertices.length / 2;
};

export const drawPoint = (gl, glAttributes, transforms, color) => {
  RECT_MATRIX.setTranslate(transforms.translate.x, transforms.translate.y, 0.0);
  RECT_MATRIX.rotate(transforms.rotate, 0, 0, 1);
  RECT_MATRIX.scale(
    transforms.pressure * transforms.ratio * transforms.scale,
    transforms.pressure * transforms.scale
  );
  gl.uniformMatrix4fv(glAttributes.u_ModelMatrix, false, RECT_MATRIX.elements);
  gl.uniform4f(
    glAttributes.u_FragColor,
    color[0],
    color[1],
    color[2],
    color[3]
  );
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export const drawStroke = (gl, glAttributes, color, points) => {
  if (!points || points.length < 1) return;
  for (let i = 0; i < points.length; i++) {
    drawPoint(gl, glAttributes, points[i], color);
  }
};

export const redraw = (gl, colors, strokes) => {
  const glAttributes = getAttributes(gl);
  gl.clear(gl.COLOR_BUFFER_BIT);
  strokes.forEach((stroke) => {
    const drawColor = rgbToGL(colors[stroke.color]);
    console.log(stroke.points);
    drawStroke(gl, glAttributes, drawColor, stroke.points);
  });
};

export const createLayer = (
  width,
  height,
  num,
  backgroundColor = [0.0, 0.0, 0.0, 0.0]
) => {
  const layerName = `layer ${num + 1}`;
  const newCanvas = document.createElement("CANVAS");
  newCanvas.width = width;
  newCanvas.height = height;
  const gl = newCanvas.getContext("webgl", {
    antialias: false,
    preserveDrawingBuffer: true,
  });
  gl.clearColor(...backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (!gl)
    alert(
      "Your browser does not support WebGL. Try updating or using another browser, such as the most recent version of Mozilla Firefox"
    );
  if (!initShaders(gl, VERT_SHADER, FRAG_SHADER))
    console.error("failed to initialize shaders");

  const glAttributes = getAttributes(gl);
  if (!initVertexBuffers(gl, BRUSH_VERTICES, glAttributes.a_Position))
    console.error("failed to initializer vertex buffer");

  const newLayer = {
    id: num,
    name: layerName,
    canvas: newCanvas,
    context: gl,
    visible: true,
  };
  return newLayer;
};
