import * as THREE from 'three';

export class ToothGeometryLoader extends THREE.Loader {
  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, (buffer) => {
      try {
        const [magic, version, vertices, indices] = new Uint32Array(buffer, 0, 4);
        if (magic !== 0x4c59554d || version !== 1) throw new Error('Unsupported tooth geometry');
        const geometry = new THREE.BufferGeometry();
        let offset = 16;
        for (const [name, size] of [['position', 3], ['normal', 3], ['uv', 2]]) {
          const values = new Float32Array(buffer, offset, vertices * size);
          geometry.setAttribute(name, new THREE.BufferAttribute(values, size));
          offset += values.byteLength;
        }
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, offset, indices), 1));
        geometry.computeBoundingSphere();
        onLoad(geometry);
      } catch (error) { onError?.(error); }
    }, onProgress, onError);
  }
}

export function createEnamelTexture() {
  const width = 128;
  const pixels = new Uint8Array(width * width * 4);
  for (let y = 0; y < width; y++) {
    for (let x = 0; x < width; x++) {
      const grain = Math.sin(x * 47.13 + y * 127.1) * 43758.5453;
      const shade = 125 + (grain - Math.floor(grain)) * 9;
      pixels.set([shade, shade, shade, 255], (y * width + x) * 4);
    }
  }
  const texture = new THREE.DataTexture(pixels, width, width, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
