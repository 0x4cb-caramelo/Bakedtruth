// Fullscreen WebGPU fragment shader on a canvas, with a caller-supplied Canvas 2D fallback.
//
// The WGSL passed in must define `fn paint(uv: vec2f) -> vec4f` returning premultiplied colour
// (uv is 0..1, origin top-left). It can read `u.res` (pixels), `u.time` (seconds) and `u.mouse`
// (0..1 across the canvas, or -1 before the pointer has moved).
window.BakedShader = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEAD = `
struct U { res: vec2f, time: f32, pad: f32, mouse: vec2f, pad2: vec2f }
@group(0) @binding(0) var<uniform> u: U;
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(p[i], 0.0, 1.0);
}`;
  const TAIL = `
@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f { return paint(pos.xy / u.res); }`;

  /** Match the canvas buffer to its CSS box. One buffer pixel per CSS pixel: this is a backdrop. */
  function fit(canvas) {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  /**
   * Draws `wgsl` on `canvas`, or calls `fallback(canvas, mouse, fit)` when WebGPU is not usable.
   * Resolves to "webgpu" or "canvas2d", whichever ended up drawing.
   */
  async function mount(canvas, wgsl, fallback) {
    const mouse = { x: -1, y: -1 };
    let target = canvas;
    addEventListener(
      "pointermove",
      (e) => {
        const r = target.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) / r.width;
        mouse.y = (e.clientY - r.top) / r.height;
      },
      { passive: true },
    );
    const flat = () => {
      fallback(target, mouse, () => fit(target));
      return "canvas2d";
    };
    if (!navigator.gpu) return flat();
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return flat();
      const device = await adapter.requestDevice();
      const module = device.createShaderModule({ code: HEAD + wgsl + TAIL });
      const info = await module.getCompilationInfo();
      const broken = info.messages.find((m) => m.type === "error");
      if (broken) throw new Error(`WGSL: ${broken.message} (line ${broken.lineNum})`);
      const ctx = canvas.getContext("webgpu");
      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device, format, alphaMode: "premultiplied" });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module, entryPoint: "vs" },
        fragment: { module, entryPoint: "fs", targets: [{ format }] },
      });
      const buffer = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const bind = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer } }],
      });
      const u = new Float32Array(8);
      const frame = (now) => {
        if (!reduce) requestAnimationFrame(frame);
        fit(canvas);
        u.set([canvas.width, canvas.height, now / 1000, 0, mouse.x, mouse.y, 0, 0]);
        device.queue.writeBuffer(buffer, 0, u);
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: ctx.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bind);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
      };
      frame(performance.now());
      return "webgpu";
    } catch (err) {
      console.warn("WebGPU unavailable, using Canvas 2D", err);
      // A canvas that already handed out a WebGPU context cannot give a 2D one: swap in a fresh copy.
      if (!canvas.getContext("2d")) {
        target = canvas.cloneNode();
        canvas.replaceWith(target);
      }
      return flat();
    }
  }

  return { mount, fit };
})();
