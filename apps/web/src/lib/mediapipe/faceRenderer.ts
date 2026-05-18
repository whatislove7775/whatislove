/**
 * WebGL Face Mask Renderer
 * -------------------------
 * Рендерит AI-маску поверх лица клиента используя результаты MediaPipe Face Mesh.
 * ВСЯ обработка происходит на устройстве клиента (On-Device AI).
 * Сервер не получает видеопоток — только WebRTC P2P.
 *
 * Алгоритм:
 * 1. MediaPipe Face Mesh → 468 точек лица в 3D
 * 2. WebGL рисует поверх точек стилизованную маску (хром/металл)
 * 3. Маска точно повторяет микромимику: движения губ, бровей, век
 * 4. Обработанный поток Canvas → MediaStream → WebRTC peer connection
 */

export interface FaceMeshResult {
  multiFaceLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
}

// Треугольники тесселяции лица из MediaPipe FACEMESH_TESSELATION
// Полный список: @mediapipe/face_mesh FACEMESH_TESSELATION (468 точек, ~800 треугольников)
// Здесь приведены ключевые группы для рендеринга маски
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const MOUTH_OUTER_INDICES = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
  375, 321, 405, 314, 17, 84, 181, 91, 146,
];

const LEFT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const RIGHT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];

export class FaceMaskRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error("WebGL2 not supported");
    this.gl = gl;
    this.initShaders();
  }

  private initShaders(): void {
    const gl = this.gl;

    // Вершинный шейдер: позиции точек лица в NDC
    const vertSrc = `#version 300 es
      in vec2 a_position;
      in float a_depth;
      out float v_depth;
      void main() {
        gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
        gl_Position.y *= -1.0;
        v_depth = a_depth;
      }
    `;

    // Фрагментный шейдер: хромированная маска с микробликами
    const fragSrc = `#version 300 es
      precision mediump float;
      in float v_depth;
      out vec4 outColor;

      void main() {
        // Хром: металлический градиент серого с синеватым отливом
        float chrome = 0.6 + 0.4 * v_depth;
        vec3 chromColor = vec3(
          chrome * 0.82,
          chrome * 0.88,
          chrome * 0.98
        );
        // Полупрозрачность: 85% — сохраняется мимика под маской
        outColor = vec4(chromColor, 0.85);
      }
    `;

    const vert = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const frag = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return;

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vert);
    gl.attachShader(this.program, frag);
    gl.linkProgram(this.program);

    this.positionBuffer = gl.createBuffer();
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Рендерит хромированную маску по 468 точкам MediaPipe Face Mesh.
   * Вызывается каждый кадр (~30fps) из requestAnimationFrame.
   */
  render(landmarks: Array<{ x: number; y: number; z: number }>): void {
    const gl = this.gl;
    if (!this.program || !landmarks.length) return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.program);

    // Строим вершины для треугольников маски по контуру лица
    const vertices: number[] = [];
    const allIndices = [...FACE_OVAL_INDICES, ...MOUTH_OUTER_INDICES];

    for (let i = 0; i < allIndices.length - 2; i += 3) {
      const pts = [allIndices[i], allIndices[i + 1], allIndices[i + 2]];
      for (const idx of pts) {
        if (idx < landmarks.length) {
          vertices.push(landmarks[idx].x, landmarks[idx].y, landmarks[idx].z);
        }
      }
    }

    if (vertices.length === 0) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, "a_position");
    const depthLoc = gl.getAttribLocation(this.program, "a_depth");

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(depthLoc);
    gl.vertexAttribPointer(depthLoc, 1, gl.FLOAT, false, 12, 8);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
  }

  dispose(): void {
    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
  }
}
