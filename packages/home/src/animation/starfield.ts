import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  MathUtils,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import starCatalogUrl from '~/assets/data/stars.bin?url';

// Real stars from the Yale Bright Star Catalog (scripts/star-catalog.js): their directions and colors
// are the real sky, their distances are spread out only so the field has depth as the camera moves.
// The catalog stops at magnitude 6.5, which looks sparse next to the old stars.png, so a layer of faint
// random stars fills in the background.

const MOBILE_WIDTH = 860;
const FILLER_COUNT = 9000;
// Share of the filler stars drawn on small screens, where thousands of tiny stars read as noise.
const MOBILE_FILLER_SHARE = 0.35;

// The first page looks just west of Orion, so Orion sits beside the logo with Taurus and the Pleiades
// above: the sky over Seoul on a winter evening.
const LOOK_RA = 68;
const LOOK_DEC = 12;

// Per page, the camera pitches down and moves forward, so going down the page list feels like
// descending from deep space towards the ground (the CSS gradient behind brightens the same way).
const PITCH_PER_PAGE = MathUtils.degToRad(3.5);
const FORWARD_PER_PAGE = 45;
// Stars fade out over the last pages, where the background turns into daylight.
const PAGE_OPACITY = [1, 1, 1, 1, 0.95, 0.7, 0];

const TRANSITION_MS = 1000; // matches the background's `top` transition

const UP = new Vector3(0, 1, 0);

const vertexShader = /* glsl */ `
  attribute float aMag;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float size = max(1.6, 10.0 - (aMag + 1.5) * 1.1);
    gl_PointSize = size * uSizeScale * uPixelRatio;

    float alpha = clamp(1.4 - aMag * 0.13, 0.3, 1.0);
    // Fainter stars twinkle more, like they do near the horizon.
    float amount = uTwinkle * mix(0.15, 0.45, clamp(aMag / 6.0, 0.0, 1.0));
    float wave = sin(uTime * (0.6 + fract(aPhase * 7.3) * 1.6) + aPhase * 6.2831);
    alpha *= 1.0 - amount * (0.5 + 0.5 * wave);

    vColor = aColor;
    vAlpha = alpha;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(0.0, 0.55, d);
    float glow = exp(-d * d * 5.0) * 0.55;
    float alpha = (core + glow) * vAlpha * uOpacity;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.6), alpha);
  }
`;

// Approximate star color from its temperature, softened towards white to suit the site's white line art.
function temperatureToRGB(kelvin: number): [number, number, number] {
  const t = kelvin / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
    b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  } else {
    r = 329.7 * (t - 60) ** -0.1332;
    g = 288.12 * (t - 60) ** -0.0755;
    b = 255;
  }
  const soften = (v: number) =>
    MathUtils.lerp(MathUtils.clamp(v, 0, 255) / 255, 1, 0.45);
  return [soften(r), soften(g), soften(b)];
}

// Equatorial coordinates to a unit vector, with celestial north as +y.
function radec(raDeg: number, decDeg: number, target = new Vector3()) {
  const ra = MathUtils.degToRad(raDeg);
  const dec = MathUtils.degToRad(decDeg);
  return target.set(
    Math.cos(dec) * Math.cos(ra),
    Math.sin(dec),
    -Math.cos(dec) * Math.sin(ra),
  );
}

// Deterministic pseudo-random number in [0, 1) for star i, so every visit looks the same.
function hash(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export async function loadStarCatalog() {
  const res = await fetch(starCatalogUrl);
  if (!res.ok) {
    throw new Error(`Failed to load star catalog: ${res.status}`);
  }
  return new DataView(await res.arrayBuffer());
}

class Starfield {
  private renderer: WebGLRenderer;

  private scene = new Scene();

  private camera: PerspectiveCamera;

  private material: ShaderMaterial;

  private geometry: BufferGeometry;

  private catalogCount: number;

  private readonly lookDir = radec(LOOK_RA, LOOK_DEC);

  private readonly right = new Vector3();

  private readonly reducedMotion: boolean;

  // Page progress, animated from `from` to `to`.
  private page = { from: 0, to: 0, start: 0, current: 0 };

  private pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0 };

  private frameId = 0;

  private startTime = performance.now();

  private readonly tmp = new Vector3();

  private readonly onResize = () => this.resize();

  private readonly onPointerMove = (ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse') return;
    this.pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (ev.clientY / window.innerHeight) * 2 - 1;
  };

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  };

  constructor(canvas: HTMLCanvasElement, catalog: DataView, page: number) {
    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new PerspectiveCamera(60, 1, 1, 3000);

    this.catalogCount = catalog.byteLength / 6;
    const total = this.catalogCount + FILLER_COUNT;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const phases = new Float32Array(total);
    const mags = new Float32Array(total);
    for (let i = 0; i < this.catalogCount; i += 1) {
      const o = i * 6;
      const ra = catalog.getUint16(o, true) / 100;
      const dec = catalog.getInt16(o + 2, true) / 100;
      const mag = catalog.getInt8(o + 4) / 10;
      const kelvin = catalog.getUint8(o + 5) * 100 || 6000;
      const distance = 450 + hash(i) * 650;
      radec(ra, dec, this.tmp)
        .multiplyScalar(distance)
        .toArray(positions, i * 3);
      colors.set(temperatureToRGB(kelvin), i * 3);
      phases[i] = hash(i + 9973);
      mags[i] = mag;
    }
    for (let i = this.catalogCount; i < total; i += 1) {
      // Uniform random direction.
      const z = hash(i) * 2 - 1;
      const theta = hash(i + 7919) * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      this.tmp
        .set(r * Math.cos(theta), z, r * Math.sin(theta))
        .multiplyScalar(450 + hash(i + 104729) * 650)
        .toArray(positions, i * 3);
      colors.set(temperatureToRGB(4500 + hash(i + 31) * 6000), i * 3);
      phases[i] = hash(i + 9973);
      mags[i] = 6.5 + hash(i + 613) * 1.5;
    }

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
    this.geometry.setAttribute('aMag', new BufferAttribute(mags, 1));
    this.geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSizeScale: { value: 1 },
        uTwinkle: { value: this.reducedMotion ? 0 : 1 },
        uOpacity: { value: PAGE_OPACITY[page] ?? 0 },
      },
    });

    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    this.page = { from: page, to: page, start: 0, current: page };

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.resize();
    this.start();
  }

  public setPage(page: number) {
    if (page === this.page.to) return;
    this.page = {
      from: this.page.current,
      to: page,
      start: performance.now(),
      current: this.page.current,
    };
    if (this.reducedMotion) {
      this.render();
    }
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }

  private start() {
    cancelAnimationFrame(this.frameId);
    if (this.reducedMotion) {
      this.render();
      return;
    }
    const loop = () => {
      this.frameId = requestAnimationFrame(loop);
      this.render();
    };
    loop();
  }

  private stop() {
    cancelAnimationFrame(this.frameId);
  }

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < MOBILE_WIDTH;
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      isMobile ? 1.5 : 2,
    );

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Keep roughly the same patch of sky in view on portrait screens.
    this.camera.fov = this.camera.aspect < 1 ? 75 : 60;
    this.camera.updateProjectionMatrix();

    this.material.uniforms.uPixelRatio.value = pixelRatio;
    this.material.uniforms.uSizeScale.value = isMobile ? 2 : 3;

    // The filler stars come after the catalog, so the draw range trims only them.
    this.geometry.setDrawRange(
      0,
      this.catalogCount +
        Math.round(FILLER_COUNT * (isMobile ? MOBILE_FILLER_SHARE : 1)),
    );

    this.render();
  }

  private updatePage(now: number) {
    const { from, to, start } = this.page;
    const t =
      this.reducedMotion || !start
        ? 1
        : MathUtils.clamp((now - start) / TRANSITION_MS, 0, 1);
    this.page.current = MathUtils.lerp(from, to, easeInOut(t));
  }

  private render() {
    const now = performance.now();
    const time = (now - this.startTime) / 1000;
    this.updatePage(now);
    const page = this.page.current;

    const smoothing = this.reducedMotion ? 0 : 0.04;
    this.pointer.smoothX += (this.pointer.x - this.pointer.smoothX) * smoothing;
    this.pointer.smoothY += (this.pointer.y - this.pointer.smoothY) * smoothing;
    // A slow drift stands in for the mouse on touch screens.
    const driftX = this.reducedMotion ? 0 : Math.sin(time * 0.05) * 0.3;
    const driftY = this.reducedMotion ? 0 : Math.cos(time * 0.04) * 0.2;
    const px = this.pointer.smoothX + driftX;
    const py = this.pointer.smoothY + driftY;

    // Direction: look towards Orion, pitched down by page and nudged by the pointer.
    this.right.crossVectors(this.lookDir, UP).normalize();
    const dir = this.tmp
      .copy(this.lookDir)
      .applyAxisAngle(this.right, -page * PITCH_PER_PAGE + py * 0.03)
      .applyAxisAngle(UP, -px * 0.04);

    // Position: move forward and sideways, so nearer stars shift more than far ones.
    this.camera.position
      .copy(this.lookDir)
      .multiplyScalar(page * FORWARD_PER_PAGE)
      .addScaledVector(this.right, px * 12)
      .addScaledVector(UP, -py * 8);
    this.camera.lookAt(
      this.camera.position.x + dir.x,
      this.camera.position.y + dir.y,
      this.camera.position.z + dir.z,
    );

    const lower = Math.floor(page);
    const upper = Math.min(lower + 1, PAGE_OPACITY.length - 1);
    this.material.uniforms.uOpacity.value = MathUtils.lerp(
      PAGE_OPACITY[lower] ?? 0,
      PAGE_OPACITY[upper] ?? 0,
      page - lower,
    );
    this.material.uniforms.uTime.value = time;

    this.renderer.render(this.scene, this.camera);
  }
}

export default Starfield;
