// Direction E · Oven² (B's look on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js.
(() => {
  const { icon, money, sparkline, data, mount } = window.BakedApp;

  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
  });

  document.getElementById("steps").innerHTML = data.steps
    .map((s) => `<div><h3>${s.title}</h3><p>${s.body}</p></div>`)
    .join("");
  document.getElementById("principles").innerHTML = data.principles
    .map(
      (p, i) =>
        `<div data-perch="principle-${i}" data-perch-x="0.82" data-perch-size="0.8"><h3>${p.title}</h3><p>${p.body}</p></div>`,
    )
    .join("");

  const odds = (m, side) => `
    <div class="odds">
      <button class="yes ${side === "YES" ? "is-on" : ""}" data-open="${m.id}" data-side="YES" data-mood="approve"><span>Yes</span><span>${m.yes}¢</span></button>
      <button class="no ${side === "NO" ? "is-on" : ""}" data-open="${m.id}" data-side="NO" data-mood="skeptical"><span>No</span><span>${100 - m.yes}¢</span></button>
    </div>`;

  const spark = (m, w, h, cls = "spark") => {
    const s = sparkline(m.history, w, h, 3);
    return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="g${m.id}${cls}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a3d" stop-opacity=".38"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></linearGradient></defs>
      <path d="${s.area}" fill="url(#g${m.id}${cls})"/><path d="${s.line}" fill="none" stroke="#ffb066" stroke-width="2"/></svg>`;
  };

  // Mosaic: trading carousel, upcoming and closing soon.
  function slide(m, i, n) {
    return `
    <article class="slide">
      <div class="slide-main">
        <small>${m.cat} · ${i + 1} of ${n}</small>
        <button class="slide-title" data-open="${m.id}">${m.title}</button>
        <div class="price"><b>${m.yes}%</b><span>chance · YES at ${m.yes}¢</span></div>
        <div class="done"><div class="track" role="img" aria-label="YES at ${m.yes} cents"><span style="width:${m.yes}%"></span></div></div>
        ${odds(m)}
        <div class="meta"><span>${icon("eye", 14)} ${m.proof}</span><span>${money(m.volume)} vol. · ${m.days}d left</span></div>
      </div>
      ${spark(m, 600, 220, "slide-chart")}
    </article>`;
  }
  const upcoming = (u) => `
    <div class="side-row">
      <div class="side-text"><b>${u.title}</b><span>${u.cat} · opens ${u.opens} · ${money(u.budget)} budget</span></div>
      <button class="ghost small" data-action="notify">Notify</button>
    </div>`;
  const closing = (m) => `
    <button class="side-row" data-open="${m.id}">
      <div class="side-text"><b>${m.title}</b><span>${m.cat} · ${money(m.volume)} vol.</span></div>
      <span class="side-right"><strong>${m.yes}%</strong><em>${m.days}d left</em></span>
    </button>`;
  window.BakedMosaic.mount({ slide, upcoming, closing });

  function card(m, state, i) {
    const wide = i % 5 === 0;
    const saved = state.saved.has(m.id);
    return `
    <article class="card ${wide ? "wide" : ""}" data-perch="market-${m.id}" data-perch-x="${wide ? 0.92 : 0.84}" data-perch-size="0.82" ${m.resolved ? 'data-perch-pose="approve" data-perch-say="Fine. It checks out."' : ""}>
      <div class="card-top"><span>${m.cat}</span><span>${m.resolved ? "Resolved today" : `${m.days}d left`} · ${money(m.volume)}</span></div>
      <button class="card-title" data-open="${m.id}">${m.title}</button>
      ${wide ? spark(m, 600, 70) : ""}
      <div class="done"><b>${m.yes}%</b><div class="track" role="img" aria-label="YES at ${m.yes} cents"><span style="width:${m.yes}%"></span></div></div>
      ${m.resolved ? '<div class="resolved">Resolved YES · Redemption available</div>' : odds(m)}
      <div class="evidence">${icon("eye", 14)}<span>${m.proof}</span>
        <button class="save" data-save="${m.id}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${m.name} market">${icon("bookmark", 15)}</button>
      </div>
    </article>`;
  }

  function detail(m, state) {
    return `
    <button class="back" data-action="home">${icon("arrow-left")} All markets</button>
    <div class="detail">
      <div>
        <span class="eyebrow">${m.cat} · ${m.name}</span>
        <h2>${m.title}</h2>
        <p class="note">Example market · Preview values, not live account data</p>
        <section class="proof" data-perch="proof" data-perch-x="0.86" data-perch-size="1.3" data-perch-pose="point" data-perch-say="Done when the account says done.">
          <h3>${icon("eye", 20)} Is it done yet?</h3>
          <div class="gauge">
            <div><small>${m.field} now</small><b>${m.current}</b></div>
            <span class="arrow">${icon("arrow-right", 20)}</span>
            <div><small>Done at</small><b>${m.target}</b></div>
          </div>
          ${m.progress ? `<div class="track" role="progressbar" aria-label="${m.name} goal progress" aria-valuenow="${m.progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${m.progress}%"></span></div>` : ""}
          <div class="rows">
            <div><span>Account read</span><b>${m.address} ↗</b></div>
            <div><span>Deadline</span><b>${m.deadline}</b></div>
            <div><span>Resolution</span><b>${m.resolved ? "Resolved YES" : "Anyone, the moment the account says so"}</b></div>
          </div>
        </section>
        <section class="chart"><h3>YES price · ${m.yes}¢</h3>${spark(m, 600, 170, "big")}</section>
      </div>
      <aside class="order" data-perch="order" data-perch-x="0.2" data-perch-pose="${state.side === "YES" ? "deadpan" : "skeptical"}">
        <h3>${m.resolved ? "Redemption" : `Buy ${state.side}`}</h3>
        ${odds(m, state.side)}
        <label for="amount">Amount · USDC</label>
        <input id="amount" data-role="amount" type="number" min="0" value="10" inputmode="decimal">
        <p data-role="estimate"></p>
        <button class="btn" data-action="wallet" data-mood="tapping">Connect wallet</button>
        <p>Design preview · No transactions</p>
      </aside>
    </div>`;
  }

  // ---- Heat behind the hero: a WebGPU fragment shader, with a Canvas 2D fallback. ----
  const canvas = document.getElementById("heat");
  const tag = document.getElementById("renderer");
  const mouse = { x: -1, y: -1 };
  addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    },
    { passive: true },
  );
  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  const WGSL = `
struct U { res: vec2f, time: f32, pad: f32, mouse: vec2f, pad2: vec2f }
@group(0) @binding(0) var<uniform> u: U;
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(p[i], 0.0, 1.0);
}
fn hash(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453); }
fn noise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1.0, 0.0)), w.x), mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), w.x), w.y);
}
fn fbm(q: vec2f) -> f32 {
  var p = q; var a = 0.5; var s = 0.0;
  for (var i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec2f(1.7, 9.2); a *= 0.5; }
  return s;
}
@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / u.res;
  let aspect = u.res.x / u.res.y;
  let p = vec2f(uv.x * aspect, uv.y);
  let rise = vec2f(0.0, u.time * 0.11);
  let warp = fbm(p * 2.2 + rise * 1.3);
  let n = fbm(p * 3.0 + vec2f(warp * 1.4, 0.0) + rise);
  let floorGlow = smoothstep(0.1, 1.05, uv.y);
  let near = exp(-distance(p, vec2f(u.mouse.x * aspect, u.mouse.y)) * 3.2) * 0.4;
  let heat = clamp(n * (floorGlow * 1.3 + near), 0.0, 1.0);
  let h = smoothstep(0.2, 0.8, heat);
  var col = mix(vec3f(0.36, 0.07, 0.02), vec3f(1.0, 0.42, 0.1), h);
  col = mix(col, vec3f(1.0, 0.8, 0.45), smoothstep(0.72, 1.0, h));
  let a = h * 0.8;
  return vec4f(col * a, a);
}`;

  function embers2d() {
    tag.textContent = "Heat: Canvas 2D fallback (no WebGPU here)";
    const ctx = canvas.getContext("2d");
    const bits = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 2.4,
      v: 0.02 + Math.random() * 0.06,
      p: Math.random() * 6.28,
    }));
    let last = performance.now();
    (function frame(now) {
      requestAnimationFrame(frame);
      fit();
      const { width: w, height: h } = canvas;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w * 0.5, h * 1.15, 0, w * 0.5, h * 1.15, h * 1.1);
      glow.addColorStop(0, "rgba(255,120,40,.42)");
      glow.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      for (const b of bits) {
        b.y -= b.v * dt;
        b.p += dt * 1.4;
        if (b.y < -0.05) Object.assign(b, { y: 1.05, x: Math.random() });
        const x = (b.x + Math.sin(b.p) * 0.012) * w;
        ctx.fillStyle = `rgba(255,${150 + b.y * 60},80,${0.15 + b.y * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, b.y * h, b.r * (w / 1400), 0, 6.283);
        ctx.fill();
      }
    })(last);
  }

  async function heat() {
    if (!navigator.gpu) return embers2d();
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return embers2d();
      const device = await adapter.requestDevice();
      const ctx = canvas.getContext("webgpu");
      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device, format, alphaMode: "premultiplied" });
      const module = device.createShaderModule({ code: WGSL });
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
      tag.textContent = "Heat: WebGPU shader";
      (function frame(now) {
        requestAnimationFrame(frame);
        fit();
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
      })(performance.now());
    } catch (err) {
      console.warn("WebGPU unavailable, using Canvas 2D", err);
      embers2d();
    }
  }
  heat();

  window.BakedPet.init({ size: 84 });
  mount({ id: "E", card, detail });
})();
