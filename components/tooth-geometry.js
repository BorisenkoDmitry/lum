import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

const extent = 3.35;

function smoothUnion(a, b, radius) {
  const h = Math.max(radius - Math.abs(a - b), 0) / radius;
  return Math.min(a, b) - h * h * radius * 0.25;
}

function ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz) {
  return (Math.hypot((x - cx) / rx, (y - cy) / ry, (z - cz) / rz) - 1) * Math.min(rx, ry, rz);
}

function root(x, y, z, side) {
  const t = THREE.MathUtils.clamp((-y + 0.12) / 2.42, 0, 1);
  const cx = side * (0.49 + 0.28 * t + 0.13 * Math.sin(t * Math.PI));
  const cy = 0.12 - t * 2.42;
  const cz = 0.18 + Math.sin(t * 2.3) * 0.10;
  const radius = 0.38 * (1 - t) ** 0.67 + 0.055;
  return Math.hypot(x - cx, (y - cy) * 0.74, (z - cz) * 1.05) - radius;
}

function toothField(x, y, z) {
  // A broad, gently squared molar crown with four rounded cusps.
  const p = 3.65;
  const body = ((Math.abs(x / 1.06) ** p + Math.abs((y - 0.58) / 0.76) ** p + Math.abs(z / 0.82) ** p) ** (1 / p) - 1) * 0.76;
  const saddle = 0.13 * Math.exp(-(x * x / 0.12 + z * z / 0.8))
    + 0.07 * Math.exp(-(z * z / 0.05 + x * x / 0.6));
  const crown = body + saddle * THREE.MathUtils.smoothstep(y, 0.70, 1.28);
  let field = crown;
  field = smoothUnion(field, ellipsoid(x, y, z, -0.52, 1.10, 0.32, 0.56, 0.39, 0.53), 0.25);
  field = smoothUnion(field, ellipsoid(x, y, z, 0.51, 1.05, 0.32, 0.57, 0.39, 0.53), 0.25);
  field = smoothUnion(field, ellipsoid(x, y, z, -0.49, 1.08, -0.33, 0.54, 0.41, 0.50), 0.24);
  field = smoothUnion(field, ellipsoid(x, y, z, 0.50, 1.14, -0.33, 0.55, 0.40, 0.50), 0.24);
  field = smoothUnion(field, root(x, y, z, -1), 0.38);
  field = smoothUnion(field, root(x, y, z, 1), 0.38);
  field = smoothUnion(field, ellipsoid(x, y, z, 0, -0.04, -0.14, 0.65, 0.49, 0.63), 0.26);
  return field;
}

function buildIsosurface(resolution, sample) {
  const temporaryMaterial = new THREE.MeshBasicMaterial();
  const cubes = new MarchingCubes(resolution, temporaryMaterial, false, false, 150000);
  cubes.isolation = 0;
  const stride = resolution * resolution;
  for (let z = 0; z < resolution; z++) {
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        cubes.field[z * stride + y * resolution + x] = -sample(
          (x / resolution * 2 - 1) * extent,
          (y / resolution * 2 - 1) * extent,
          (z / resolution * 2 - 1) * extent,
        );
      }
    }
  }
  cubes.update();
  const geometry = new THREE.BufferGeometry();
  const vertexCount = cubes.count;
  geometry.setAttribute('position', new THREE.BufferAttribute(cubes.geometry.attributes.position.array.slice(0, vertexCount * 3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(cubes.geometry.attributes.normal.array.slice(0, vertexCount * 3), 3));
  geometry.scale(extent, extent, extent);
  const uv = new Float32Array(vertexCount * 2);
  const points = geometry.attributes.position;
  for (let index = 0; index < vertexCount; index++) {
    uv[index * 2] = Math.atan2(points.getZ(index), points.getX(index)) / (Math.PI * 2) + 0.5;
    uv[index * 2 + 1] = (points.getY(index) + extent) / (extent * 2);
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.normalizeNormals();
  geometry.computeBoundingSphere();
  cubes.geometry.dispose();
  temporaryMaterial.dispose();
  return geometry;
}

let sharedModel;

export function getToothModel() {
  if (!sharedModel) {
    sharedModel = {
      enamel: buildIsosurface(104, toothField),
    };
  }
  return sharedModel;
}

export function createEnamelTexture() {
  const width = 128;
  const pixels = new Uint8Array(width * width * 4);
  for (let y = 0; y < width; y++) {
    for (let x = 0; x < width; x++) {
      const grain = Math.sin(x * 47.13 + y * 127.1) * 43758.5453;
      const shade = 125 + (grain - Math.floor(grain)) * 9;
      const index = (y * width + x) * 4;
      pixels.set([shade, shade, shade, 255], index);
    }
  }
  const texture = new THREE.DataTexture(pixels, width, width, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
