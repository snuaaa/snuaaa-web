import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineSegments,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';

// Near stars along the path the camera travels, for the warp between pages. The catalog stars are
// hundreds of units away and barely move when the camera does, so speed needs stars close by: these
// sit in a long tube around the travel axis, from just ahead of the camera to TUBE_LENGTH away.
// At rest they are faint points that shift with the pointer more than the far stars do; while the page
// changes the tube scrolls past the camera and each star draws a trail behind it in 3D, so near stars
// streak across the screen and far ones barely move.

const COUNT = 1000;
// Share drawn on small screens.
const MOBILE_SHARE = 0.5;
const TUBE_LENGTH = 900;
const NEAR = 8;
// Distance from the axis, so no star flies straight into the camera.
const MIN_RADIUS = 18;
const MAX_RADIUS = 240;
// World units travelled per second at full warp, and the trail length at full warp.
const SPEED = 950;
const TRAIL = 90;

const common = /* glsl */ `
  attribute vec2 aOffset;
  attribute float aZ;
  attribute float aBright;
  uniform vec3 uOrigin;
  uniform vec3 uAxis;
  uniform vec3 uRight;
  uniform vec3 uUp;
  uniform float uTravel;
  uniform float uOpacity;
  varying float vAlpha;

  // Distance ahead of the camera along the axis, wrapping so the tube never runs out.
  float ahead() {
    return mod(aZ - uTravel, ${TUBE_LENGTH.toFixed(1)}) + ${NEAR.toFixed(1)};
  }

  vec3 place(float z) {
    return uOrigin + uAxis * z + uRight * aOffset.x + uUp * aOffset.y;
  }

  // Fades in at the far end of the tube, where stars appear after wrapping, and out right before
  // they pass the camera.
  float fade(float z) {
    return smoothstep(${TUBE_LENGTH.toFixed(1)}, ${(TUBE_LENGTH * 0.7).toFixed(1)}, z)
      * smoothstep(${NEAR.toFixed(1)}, 40.0, z);
  }
`;

const pointVertexShader = /* glsl */ `
  ${common}
  uniform float uPixelRatio;
  uniform float uRest;

  void main() {
    float z = ahead();
    vec4 mvPosition = modelViewMatrix * vec4(place(z), 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Nearer stars are larger: real perspective, capped so passing stars stay small.
    float dist = -mvPosition.z;
    gl_PointSize = clamp(1.5 + 260.0 / dist, 1.5, 6.0) * uPixelRatio;
    vAlpha = aBright * fade(z) * uOpacity * uRest;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = (1.0 - smoothstep(0.0, 0.6, d)) + exp(-d * d * 5.0) * 0.4;
    gl_FragColor = vec4(0.88, 0.93, 1.0, a * vAlpha);
  }
`;

// Each trail is a line from the star (aEnd 0) to where it was a moment ago (aEnd 1), both placed in
// 3D and projected by the camera, so the trail's length on screen comes from its depth.
const trailVertexShader = /* glsl */ `
  ${common}
  attribute float aEnd;
  uniform float uTrail;

  void main() {
    float z = ahead();
    // Kept in front of the camera when the trail points towards it (travelling back up the pages).
    float tail = max(z + uTrail * aEnd, 2.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(place(tail), 1.0);
    vAlpha = aBright * fade(z) * uOpacity * (1.0 - aEnd);
  }
`;

const trailFragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(0.88, 0.93, 1.0, vAlpha);
  }
`;

function hash(i: number) {
  const x = Math.sin(i * 91.3458 + 47.853) * 43758.5453;
  return x - Math.floor(x);
}

class WarpField {
  readonly object = new Group();

  private readonly pointGeometry = new BufferGeometry();

  private readonly trailGeometry = new BufferGeometry();

  private readonly pointMaterial: ShaderMaterial;

  private readonly trailMaterial: ShaderMaterial;

  private readonly trails: LineSegments;

  private travel = 0;

  constructor() {
    const offsets = new Float32Array(COUNT * 2);
    const zs = new Float32Array(COUNT);
    const bright = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i += 1) {
      // Even spread over the tube's cross-section between the two radii.
      const r = Math.sqrt(
        MIN_RADIUS ** 2 + hash(i) * (MAX_RADIUS ** 2 - MIN_RADIUS ** 2),
      );
      const theta = hash(i + 4513) * Math.PI * 2;
      offsets[i * 2] = r * Math.cos(theta);
      offsets[i * 2 + 1] = r * Math.sin(theta);
      zs[i] = hash(i + 8221) * TUBE_LENGTH;
      bright[i] = 0.35 + hash(i + 1301) ** 2 * 0.65;
    }
    this.pointGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(COUNT * 3), 3),
    );
    this.pointGeometry.setAttribute('aOffset', new BufferAttribute(offsets, 2));
    this.pointGeometry.setAttribute('aZ', new BufferAttribute(zs, 1));
    this.pointGeometry.setAttribute('aBright', new BufferAttribute(bright, 1));

    // Two vertices per star for the trails.
    const trailOffsets = new Float32Array(COUNT * 4);
    const trailZs = new Float32Array(COUNT * 2);
    const trailBright = new Float32Array(COUNT * 2);
    const ends = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i += 1) {
      for (let e = 0; e < 2; e += 1) {
        const v = i * 2 + e;
        trailOffsets[v * 2] = offsets[i * 2];
        trailOffsets[v * 2 + 1] = offsets[i * 2 + 1];
        trailZs[v] = zs[i];
        trailBright[v] = bright[i];
        ends[v] = e;
      }
    }
    this.trailGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(COUNT * 6), 3),
    );
    this.trailGeometry.setAttribute(
      'aOffset',
      new BufferAttribute(trailOffsets, 2),
    );
    this.trailGeometry.setAttribute('aZ', new BufferAttribute(trailZs, 1));
    this.trailGeometry.setAttribute(
      'aBright',
      new BufferAttribute(trailBright, 1),
    );
    this.trailGeometry.setAttribute('aEnd', new BufferAttribute(ends, 1));

    const uniforms = () => ({
      uOrigin: { value: new Vector3() },
      uAxis: { value: new Vector3() },
      uRight: { value: new Vector3() },
      uUp: { value: new Vector3() },
      uTravel: { value: 0 },
      uOpacity: { value: 0 },
    });
    this.pointMaterial = new ShaderMaterial({
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        ...uniforms(),
        uPixelRatio: { value: 1 },
        uRest: { value: 0.3 },
      },
    });
    this.trailMaterial = new ShaderMaterial({
      vertexShader: trailVertexShader,
      fragmentShader: trailFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { ...uniforms(), uTrail: { value: 0 } },
    });

    const points = new Points(this.pointGeometry, this.pointMaterial);
    points.frustumCulled = false;
    this.trails = new LineSegments(this.trailGeometry, this.trailMaterial);
    this.trails.frustumCulled = false;
    this.trails.visible = false;
    this.object.add(points, this.trails);
  }

  resize(pixelRatio: number, isMobile: boolean) {
    this.pointMaterial.uniforms.uPixelRatio.value = pixelRatio;
    const count = Math.round(COUNT * (isMobile ? MOBILE_SHARE : 1));
    this.pointGeometry.setDrawRange(0, count);
    this.trailGeometry.setDrawRange(0, count * 2);
  }

  // `warp` is signed (positive going down the pages, 0 at rest); `dt` is in seconds. The tube follows
  // `origin`, which should leave out the pointer offset so the near stars still shift with the pointer.
  update(
    origin: Vector3,
    axis: Vector3,
    right: Vector3,
    up: Vector3,
    warp: number,
    dt: number,
    opacity: number,
  ) {
    this.travel = (this.travel + warp * SPEED * dt) % TUBE_LENGTH;
    const strength = Math.min(1, Math.abs(warp));
    this.trails.visible = warp !== 0;

    const u = this.pointMaterial.uniforms;
    u.uOrigin.value.copy(origin);
    u.uAxis.value.copy(axis);
    u.uRight.value.copy(right);
    u.uUp.value.copy(up);
    u.uTravel.value = this.travel;
    u.uOpacity.value = opacity;
    // Brighter while moving, so the field reads as stars rushing past.
    u.uRest.value = 0.3 + 0.7 * strength;

    const t = this.trailMaterial.uniforms;
    t.uOrigin.value.copy(origin);
    t.uAxis.value.copy(axis);
    t.uRight.value.copy(right);
    t.uUp.value.copy(up);
    t.uTravel.value = this.travel;
    t.uOpacity.value = opacity * strength;
    t.uTrail.value = Math.sign(warp) * TRAIL * Math.min(1.6, Math.abs(warp));
  }

  dispose() {
    this.pointGeometry.dispose();
    this.trailGeometry.dispose();
    this.pointMaterial.dispose();
    this.trailMaterial.dispose();
  }
}

export default WarpField;
