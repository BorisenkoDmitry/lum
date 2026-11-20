import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { getToothModel } from '../components/tooth-geometry.js';

const started = performance.now();
const geometry = mergeVertices(getToothModel().enamel, 0.00001);
const vertices = geometry.attributes.position.count;
const indices = geometry.index.count;
const data = new ArrayBuffer(16 + vertices * 8 * 4 + indices * 4);
new Uint32Array(data, 0, 4).set([0x4c59554d, 1, vertices, indices]);
let offset = 16;
for (const name of ['position', 'normal', 'uv']) {
  const values = geometry.attributes[name].array;
  new Float32Array(data, offset, values.length).set(values);
  offset += values.byteLength;
}
new Uint32Array(data, offset, indices).set(geometry.index.array);
const directory = new URL('../public/models/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('tooth.bin', directory), Buffer.from(data));
console.log(JSON.stringify({ vertices, triangles: indices / 3, bytes: data.byteLength, generatedMs: Math.round(performance.now() - started), path: fileURLToPath(new URL('tooth.bin', directory)) }));
