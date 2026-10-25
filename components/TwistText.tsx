"use client";

import { useEffect, useRef } from "react";

type TwistTextProps = {
  frontText?: string;
  backText?: string;
  speed?: number;
  twistAmount?: number;
  amplitude?: number;
};

// --- Pure Helper Functions (Extracted outside component for React Compiler compliance) ---

async function loadLetterImages(
  word: string,
): Promise<(HTMLImageElement | null)[]> {
  const chars = word.toLowerCase().split("");
  const imgPromises = chars.map((char) => {
    return new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = `/letters/${char}.svg`;
    });
  });
  return Promise.all(imgPromises);
}

function createTextCanvas(
  word: string,
  isOutline: boolean,
  images: (HTMLImageElement | null)[],
  letterHeight: number = 160,
  letterGap: number = -15, // Gap between individual letters inside a word
  wordGap: number = 40, // 1. Gap between words in a phrase (space width)
  sidePadding: number = 40, // 2. Gap between rotating 3D cylinder faces (lower = tighter)
): HTMLCanvasElement {
  const texCanvas = document.createElement("canvas");
  const chars = word.toLowerCase().split("");

  // Calculate width for each character (SVG aspect ratio for letters, wordGap for spaces)
  const charWidths = chars.map((char, idx) => {
    if (char === " ") return wordGap;
    const img = images[idx];
    const aspectRatio =
      img && img.naturalWidth && img.naturalHeight
        ? img.naturalWidth / img.naturalHeight
        : 246 / 234;
    return letterHeight * aspectRatio;
  });

  // Calculate total rendered text width
  const totalTextWidth = charWidths.reduce((sum, w, idx) => {
    const isSpace = chars[idx] === " " || chars[idx - 1] === " ";
    return sum + w + (idx > 0 && !isSpace ? letterGap : 0);
  }, 0);

  // Set texture width tightly to total text width + side padding
  texCanvas.width = Math.max(1000, totalTextWidth + sidePadding * 2);
  texCanvas.height = 240;

  const ctx2d = texCanvas.getContext("2d")!;
  ctx2d.clearRect(0, 0, texCanvas.width, texCanvas.height);

  const startY = (texCanvas.height - letterHeight) / 2;
  let currentX = (texCanvas.width - totalTextWidth) / 2;

  chars.forEach((char, idx) => {
    const w = charWidths[idx];

    if (char === " ") {
      currentX += w; // Advance by space width
    } else {
      const img = images[idx];
      if (img) {
        ctx2d.drawImage(img, currentX, startY, w, letterHeight);
      }
      currentX += w + letterGap;
    }
  });

  return texCanvas;
}

function createGLTexture(
  gl: WebGLRenderingContext,
  canvasSource: HTMLCanvasElement,
): WebGLTexture {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    canvasSource,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

export default function TwistText({
  frontText = "KRIPESH",
  backText = "GHIMIRE",
  speed = 0.012,
  twistAmount = 2.4,
  amplitude = 0.22,
}: TwistTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const texturesRef = useRef<{
    outline: WebGLTexture | null;
    solid: WebGLTexture | null;
  }>({ outline: null, solid: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let isCancelled = false;
    let animationId: number;
    let time = 0;

    // Enable Alpha Blending for transparent background
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // --- Shader Sources ---
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;

      uniform sampler2D u_texOutlineFront;
      uniform sampler2D u_texSolidBack;
      uniform float u_time;
      uniform float u_twist;
      uniform float u_amplitude;
      uniform float u_radius;

      void main() {
        vec2 uv = v_uv;
        vec4 finalColor = vec4(0.0, 0.0, 0.0, 0.0);

        float phase = (uv.x - 0.5) * u_twist - u_time;

        for (int i = 0; i < 4; i++) {
          float faceAngle = phase + float(i) * 1.57079632679;
          float phi = mod(faceAngle + 3.14159265359, 6.28318530718) - 3.14159265359;

          if (phi > -1.57079632679 && phi < 1.57079632679) {
            float cosVal = cos(phi);
            float sinVal = sin(phi);

            // Inverted sine displacement for flipped curve
            float centerY = 0.5 + sinVal * u_amplitude;
            float sliceH = u_radius * cosVal;

            float texV = (uv.y - (centerY - sliceH * 0.5)) / sliceH;

            if (texV >= 0.0 && texV <= 1.0) {
              vec2 texCoord = vec2(uv.x, 1.0 - texV);
              vec4 texColor;

              if (i == 0 || i == 2) {
                texColor = texture2D(u_texOutlineFront, texCoord);
              } else {
                texColor = texture2D(u_texSolidBack, texCoord);
              }

              float alpha = texColor.a * min(1.0, cosVal * 1.4);
              finalColor = vec4(
                mix(finalColor.rgb, texColor.rgb, alpha),
                max(finalColor.a, alpha)
              );
            }
          }
        }

        gl_FragColor = finalColor;
      }
    `;

    const createShader = (
      glCtx: WebGLRenderingContext,
      type: number,
      source: string,
    ) => {
      const shader = glCtx.createShader(type)!;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error(glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vsSource)!;
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)!;
    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad Geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uTwistLoc = gl.getUniformLocation(program, "u_twist");
    const uAmpLoc = gl.getUniformLocation(program, "u_amplitude");
    const uRadLoc = gl.getUniformLocation(program, "u_radius");
    const uTexOutlineLoc = gl.getUniformLocation(program, "u_texOutlineFront");
    const uTexSolidLoc = gl.getUniformLocation(program, "u_texSolidBack");

    gl.uniform1f(uTwistLoc, twistAmount);
    gl.uniform1f(uAmpLoc, amplitude);
    gl.uniform1f(uRadLoc, 0.28);

    // Load letter SVG assets asynchronously into mutable ref
    Promise.all([loadLetterImages(frontText), loadLetterImages(backText)]).then(
      ([frontImages, backImages]) => {
        if (isCancelled) return;

        // Arguments: (word, isOutline, images, letterHeight, letterGap, wordGap, sidePadding)
        const canvasFront = createTextCanvas(
          frontText,
          true,
          frontImages,
          170,
          -20,
          40,
          20,
        );
        const canvasBack = createTextCanvas(
          backText,
          false,
          backImages,
          170,
          -20,
          40,
          20,
        );

        const outlineTex = createGLTexture(gl, canvasFront);
        const solidTex = createGLTexture(gl, canvasBack);

        texturesRef.current = { outline: outlineTex, solid: solidTex };

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, outlineTex);
        gl.uniform1i(uTexOutlineLoc, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, solidTex);
        gl.uniform1i(uTexSolidLoc, 1);
      },
    );

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      time += speed;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTimeLoc, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      if (texturesRef.current.outline)
        gl.deleteTexture(texturesRef.current.outline);
      if (texturesRef.current.solid)
        gl.deleteTexture(texturesRef.current.solid);
      texturesRef.current = { outline: null, solid: null };

      gl.deleteProgram(program);
    };
  }, [frontText, backText, speed, twistAmount, amplitude]);

  return (
    <div className="relative w-full h-[320px] bg-transparent flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
