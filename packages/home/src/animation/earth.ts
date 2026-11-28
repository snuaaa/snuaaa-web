import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  LinearFilter,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import landMaskUrl from '~/assets/data/land.png?url';

// The Earth the page travels towards: a pale blue dot in a band of sunlight on the first page
// (after Voyager 1's 1990 photo), a large horizon by Activity,
// then it fills the view and fades out as the Dome page lands on the hill. It is drawn in its own
// orthographic layer, so each page can place it on screen directly, whatever the camera does.
// Land comes from Natural Earth (scripts/land-mask.js); the colors follow the site's navy-to-sky gradient.

type Pose = {
  // Center: x as a fraction of half the width, y in half-heights (0 is the middle of the screen).
  x: number;
  y: number;
  // Radius in half-heights.
  r: number;
  opacity: number;
  // Geographic point at the middle of the disc.
  lat: number;
  lon: number;
  // Opacity of the gold star over Seoul.
  marker: number;
  // 1 draws the Earth as a single pale blue point instead of a disc, with a faint band of sunlight across it.
  dot: number;
  // Overrides for portrait screens, where the page content sits lower.
  portrait?: Partial<Omit<Pose, 'portrait'>>;
};

const SEOUL = { lat: 37.46, lon: 126.95 }; // Gwanak campus

const HIDDEN: Pose = {
  x: 0,
  y: -7.3,
  r: 6,
  opacity: 0,
  lat: 30,
  lon: SEOUL.lon,
  marker: 0,
  dot: 0,
};

// One pose per page, in the order of `pages` (constants/index.ts).
const POSES: Pose[] = [
  // Home: the pale blue dot, a single point far ahead in the lower right.
  {
    x: 0.62,
    y: -0.62,
    r: 0.01,
    opacity: 1,
    lat: 15,
    lon: 95,
    marker: 0,
    dot: 1,
    portrait: { x: 0.5, y: -0.8 },
  },
  // Intro: closer, under the text (on desktop the photo covers the right half, on phones all of it).
  {
    x: -0.15,
    y: -0.76,
    r: 0.2,
    opacity: 1,
    lat: 22,
    lon: 112,
    marker: 0.6,
    dot: 0,
  },
  // Activity: a wide horizon along the bottom, with Seoul near the limb.
  {
    x: 0,
    y: -1.78,
    r: 1.2,
    opacity: 1,
    lat: -22,
    lon: SEOUL.lon,
    marker: 1,
    dot: 0,
    // Below the activity stars' labels, which reach further down on phones.
    portrait: { y: -2.08 },
  },
  // Dome onwards: we have landed; the Earth has grown past the screen and faded.
  HIDDEN,
  HIDDEN,
  HIDDEN,
  HIDDEN,
];

// From the upper left and slightly behind, so the middle of the disc (and Seoul) sits at dusk.
const SUN = new Vector3(-1, 0.35, -0.12).normalize();

// The Earth is a flat quad whose sphere normal is rebuilt per pixel from its 2D position, which keeps
// the limb round and smooth at any size (a sphere mesh would show its polygon edge when large).
const discVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D uLand;
  uniform float uHasLand;
  uniform float uOpacity;
  uniform float uLat;
  uniform float uLon;
  uniform vec3 uSun;
  varying vec2 vUv;

  const float PI = 3.14159265;

  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0) discard;
    vec3 n = vec3(vUv, sqrt(1.0 - r2));
    // Antialias the limb over about one pixel.
    float aa = fwidth(r2) * 1.5;
    float coverage = 1.0 - smoothstep(1.0 - aa, 1.0, r2);

    // Rotate so that (uLat, uLon) faces the viewer, then read latitude and longitude.
    float c = cos(-uLat);
    float s = sin(-uLat);
    vec3 g = vec3(n.x, n.y * c - n.z * s, n.y * s + n.z * c);
    float lat = asin(clamp(g.y, -1.0, 1.0));
    float lon = atan(g.x, g.z) + uLon;
    vec2 uv = vec2(fract((lon + PI) / (2.0 * PI)), (lat + PI * 0.5) / PI);
    float land = uHasLand * texture2D(uLand, uv).r;

    float light = smoothstep(-0.12, 0.4, dot(n, uSun));
    vec3 oceanDay = vec3(0.094, 0.306, 0.502);   // #184E80
    vec3 oceanNight = vec3(0.055, 0.118, 0.227);
    vec3 landDay = vec3(0.435, 0.659, 0.784);
    vec3 landNight = vec3(0.106, 0.200, 0.345);
    vec3 day = mix(oceanDay, landDay, land);
    vec3 night = mix(oceanNight, landNight, land);
    vec3 color = mix(night, day, light);

    // Atmosphere: a sky-blue haze towards the limb, brighter on the day side.
    float rim = pow(1.0 - n.z, 2.5);
    color += vec3(0.612, 0.859, 1.0) * rim * (0.25 + 0.6 * light);
    // A fine white edge, like the site's line drawings.
    float edge = smoothstep(0.86, 1.0, r2);
    color = mix(color, vec3(1.0), edge * 0.55);

    gl_FragColor = vec4(color, uOpacity * coverage);
  }
`;

const haloFragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv);
    if (d < 1.0) discard;
    float glow = exp(-(d - 1.0) * 9.0);
    gl_FragColor = vec4(vec3(0.612, 0.859, 1.0), glow * 0.55 * uOpacity);
  }
`;

const markerVertexShader = /* glsl */ `
  uniform float uSize;
  void main() {
    gl_PointSize = uSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const markerFragmentShader = /* glsl */ `
  uniform float uOpacity;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.22, d);
    float glow = exp(-d * d * 6.0) * 0.6;
    // Four soft spikes, so it reads as a star rather than a dot.
    float spikes = max(exp(-abs(p.x) * 40.0), exp(-abs(p.y) * 40.0)) * (1.0 - d) * 0.8;
    float a = clamp(core + glow + spikes, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(mix(vec3(1.0, 0.831, 0.373), vec3(1.0), core), a); // #FFD45F
  }
`;

// The pale blue dot: a soft point a few pixels wide, its color the pale blue of the photo.
const dotFragmentShader = /* glsl */ `
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.22, d);
    float glow = exp(-d * d * 4.5) * 0.9;
    vec3 color = mix(vec3(0.55, 0.78, 1.0), vec3(0.92, 0.97, 1.0), core);
    gl_FragColor = vec4(color, min(1.0, (core * 1.4 + glow) * uOpacity));
  }
`;

// A faint band of scattered sunlight through the dot, as in the Voyager frame. It covers the screen
// (uAspect wide), slightly tilted, with a fainter band beside it.
const beamVertexShader = /* glsl */ `
  uniform float uAspect;
  varying vec2 vPos;
  void main() {
    vPos = position.xy * vec2(uAspect, 1.0);
    gl_Position = projectionMatrix * vec4(vPos, 0.0, 1.0);
  }
`;

const beamFragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform vec2 uCenter;
  varying vec2 vPos;
  void main() {
    vec2 p = vPos - uCenter;
    // Distance across a band tilted about 12 degrees from vertical.
    float across = dot(p, vec2(0.978, 0.208));
    float along = dot(p, vec2(-0.208, 0.978));
    float band = exp(-across * across / 0.006) * 1.0
      + exp(-pow(across + 0.17, 2.0) / 0.0012) * 0.35
      + exp(-pow(across - 0.31, 2.0) / 0.0009) * 0.2;
    // Brightest around the dot, fading along its length.
    float fade = 0.35 + 0.65 * exp(-along * along * 1.5);
    float a = band * fade * 0.11 * uOpacity;
    gl_FragColor = vec4(1.0, 0.8, 0.58, a);
  }
`;

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: MathUtils.lerp(a.x, b.x, t),
  y: MathUtils.lerp(a.y, b.y, t),
  r: MathUtils.lerp(a.r, b.r, t),
  // Fading out finishes early, so the Earth is gone before the Dome page's hill slides in over it.
  opacity: MathUtils.lerp(
    a.opacity,
    b.opacity,
    b.opacity < a.opacity ? Math.min(1, t * 1.8) : t,
  ),
  lat: MathUtils.lerp(a.lat, b.lat, t),
  lon: MathUtils.lerp(a.lon, b.lon, t),
  marker: MathUtils.lerp(a.marker, b.marker, t),
  // The dot gives way to the disc quickly, while the disc is still small.
  dot: MathUtils.lerp(a.dot, b.dot, MathUtils.smoothstep(t, 0, 0.35)),
});

export function poseAt(page: number, portrait: boolean): Pose {
  const lower = MathUtils.clamp(Math.floor(page), 0, POSES.length - 1);
  const upper = Math.min(lower + 1, POSES.length - 1);
  const pick = (pose: Pose) =>
    portrait && pose.portrait ? { ...pose, ...pose.portrait } : pose;
  return lerpPose(pick(POSES[lower]), pick(POSES[upper]), page - lower);
}

class Earth {
  readonly scene = new Scene();

  readonly camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

  private aspect = 1;

  private readonly disc: Mesh;

  private readonly halo: Mesh;

  private readonly marker: Points;

  private readonly earthMaterial: ShaderMaterial;

  private readonly haloMaterial: ShaderMaterial;

  private readonly markerMaterial: ShaderMaterial;

  private readonly dot: Points;

  private readonly dotMaterial: ShaderMaterial;

  private readonly beam: Mesh;

  private readonly beamMaterial: ShaderMaterial;

  private texture: Texture | null = null;

  private disposed = false;

  private readonly seoul = new Vector3();

  constructor() {
    this.earthMaterial = new ShaderMaterial({
      vertexShader: discVertexShader,
      fragmentShader: earthFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uLand: { value: null },
        uHasLand: { value: 0 },
        uOpacity: { value: 0 },
        uLat: { value: 0 },
        uLon: { value: 0 },
        uSun: { value: SUN },
      },
    });
    this.disc = new Mesh(new PlaneGeometry(2, 2), this.earthMaterial);

    this.haloMaterial = new ShaderMaterial({
      vertexShader: discVertexShader,
      fragmentShader: haloFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uOpacity: { value: 0 } },
    });
    this.halo = new Mesh(new PlaneGeometry(3, 3), this.haloMaterial);

    this.markerMaterial = new ShaderMaterial({
      vertexShader: markerVertexShader,
      fragmentShader: markerFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: { uOpacity: { value: 0 }, uSize: { value: 28 } },
    });
    const markerGeometry = new BufferGeometry();
    markerGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(3), 3),
    );
    this.marker = new Points(markerGeometry, this.markerMaterial);
    this.marker.frustumCulled = false;

    this.dotMaterial = new ShaderMaterial({
      vertexShader: markerVertexShader,
      fragmentShader: dotFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uOpacity: { value: 0 }, uSize: { value: 7 } },
    });
    this.dot = new Points(markerGeometry.clone(), this.dotMaterial);
    this.dot.frustumCulled = false;

    this.beamMaterial = new ShaderMaterial({
      vertexShader: beamVertexShader,
      fragmentShader: beamFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uOpacity: { value: 0 },
        uAspect: { value: 1 },
        uCenter: { value: new Vector2() },
      },
    });
    this.beam = new Mesh(new PlaneGeometry(2, 2), this.beamMaterial);
    this.beam.frustumCulled = false;

    this.beam.renderOrder = -1;
    this.halo.renderOrder = 0;
    this.disc.renderOrder = 1;
    this.dot.renderOrder = 2;
    this.marker.renderOrder = 3;
    this.scene.add(this.beam, this.halo, this.disc, this.dot, this.marker);

    // The disc draws as plain ocean until the land mask arrives (or if it never does).
    new TextureLoader().load(landMaskUrl, (texture) => {
      // Arrived after the page left: free it instead of keeping it.
      if (this.disposed) {
        texture.dispose();
        return;
      }
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      this.texture = texture;
      this.earthMaterial.uniforms.uLand.value = texture;
      this.earthMaterial.uniforms.uHasLand.value = 1;
    });
  }

  resize(width: number, height: number, pixelRatio: number) {
    this.aspect = width / height;
    this.camera.left = -this.aspect;
    this.camera.right = this.aspect;
    this.camera.updateProjectionMatrix();
    this.markerMaterial.uniforms.uSize.value =
      (width < 860 ? 22 : 28) * pixelRatio;
    this.dotMaterial.uniforms.uSize.value =
      (width < 860 ? 10 : 12) * pixelRatio;
    this.beamMaterial.uniforms.uAspect.value = this.aspect;
  }

  // `offsetX`/`offsetY` (in half-heights) shift the Earth for pointer parallax.
  // Returns whether anything is visible.
  update(
    page: number,
    time: number,
    reducedMotion: boolean,
    offsetX = 0,
    offsetY = 0,
  ) {
    const pose = poseAt(page, this.aspect < 1);
    const visible = pose.opacity > 0.001;
    const discOpacity = pose.opacity * (1 - pose.dot);
    const dotOpacity = pose.opacity * pose.dot;
    this.disc.visible = discOpacity > 0.001;
    this.halo.visible = this.disc.visible;
    this.dot.visible = dotOpacity > 0.001;
    this.beam.visible = this.dot.visible;
    if (!visible) {
      this.marker.visible = false;
      return false;
    }

    const cx = pose.x * this.aspect + offsetX;
    const cy = pose.y + offsetY;
    this.disc.position.set(cx, cy, 0);
    this.disc.scale.setScalar(pose.r);
    this.halo.position.set(cx, cy, 0);
    this.halo.scale.setScalar(pose.r);

    const lat = MathUtils.degToRad(pose.lat);
    const lon = MathUtils.degToRad(pose.lon);
    this.earthMaterial.uniforms.uOpacity.value = discOpacity;
    this.earthMaterial.uniforms.uLat.value = lat;
    this.earthMaterial.uniforms.uLon.value = lon;
    this.haloMaterial.uniforms.uOpacity.value = discOpacity;

    this.dot.position.set(cx, cy, 0);
    // A slow shimmer, like the dot catching the light.
    this.dotMaterial.uniforms.uOpacity.value =
      dotOpacity * (reducedMotion ? 1 : 0.85 + 0.15 * Math.sin(time * 1.3));
    this.beamMaterial.uniforms.uOpacity.value = dotOpacity;
    this.beamMaterial.uniforms.uCenter.value.set(cx, cy);

    // Seoul on the disc: the inverse of the shader's rotation.
    const sLat = MathUtils.degToRad(SEOUL.lat);
    const sLon = MathUtils.degToRad(SEOUL.lon) - lon;
    const gx = Math.cos(sLat) * Math.sin(sLon);
    const gy = Math.sin(sLat);
    const gz = Math.cos(sLat) * Math.cos(sLon);
    const c = Math.cos(lat);
    const s = Math.sin(lat);
    this.seoul.set(gx, gy * c - gz * s, gy * s + gz * c);
    const facing = MathUtils.smoothstep(this.seoul.z, 0.05, 0.25);
    const pulse = reducedMotion ? 1 : 0.8 + 0.2 * Math.sin(time * 2.2);
    const markerOpacity = pose.marker * discOpacity * facing * pulse;
    this.marker.visible = markerOpacity > 0.001;
    this.marker.position.set(
      cx + this.seoul.x * pose.r,
      cy + this.seoul.y * pose.r,
      0,
    );
    this.markerMaterial.uniforms.uOpacity.value = markerOpacity;
    return true;
  }

  dispose() {
    this.disposed = true;
    this.disc.geometry.dispose();
    this.halo.geometry.dispose();
    this.marker.geometry.dispose();
    this.dot.geometry.dispose();
    this.beam.geometry.dispose();
    this.dotMaterial.dispose();
    this.beamMaterial.dispose();
    this.earthMaterial.dispose();
    this.haloMaterial.dispose();
    this.markerMaterial.dispose();
    this.texture?.dispose();
  }
}

export default Earth;
