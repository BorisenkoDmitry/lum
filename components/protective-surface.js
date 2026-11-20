import * as THREE from 'three';

// One shared-geometry draw call. Lines and nodes are shaded on the enamel
// surface, so no wire objects, particles, bloom pass, or CPU projection is needed.
export function createProtectiveSurface() {
  const uniforms = {
    alpha: { value: 0 },
    reveal: { value: -3 },
    time: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: { uShieldAlpha: uniforms.alpha, uShieldReveal: uniforms.reveal, uShieldTime: uniforms.time },
    transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: `
      varying vec3 vShieldPosition;
      varying vec3 vShieldNormal;
      void main() {
        vShieldPosition = position;
        vShieldNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * 0.018, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uShieldAlpha;
      uniform float uShieldReveal;
      uniform float uShieldTime;
      varying vec3 vShieldPosition;
      varying vec3 vShieldNormal;
      void main() {
        vec3 normal = abs(normalize(vShieldNormal));
        vec3 p = vShieldPosition * 4.8;
        vec2 grid = normal.z >= normal.x && normal.z >= normal.y ? p.xy : (normal.x >= normal.y ? p.zy : p.xz);
        vec2 node = fract(grid + 0.5) - 0.5;
        float edge = min(abs(node.x), abs(node.y));
        float diagonal = abs(fract(grid.x + grid.y + 0.5) - 0.5) * 0.7071;
        edge = min(edge, diagonal);
        float aa = max(fwidth(grid.x), fwidth(grid.y)) * 0.65;
        float line = 1.0 - smoothstep(0.008, 0.014 + aa, edge);
        float lineGlow = (1.0 - smoothstep(0.015, 0.15, edge)) * 0.12;
        float radius = length(node);
        float dotCore = 1.0 - smoothstep(0.045, 0.09 + aa * 0.25, radius);
        float dotGlow = (1.0 - smoothstep(0.04, 0.25, radius)) * 0.48;
        float coverage = 1.0 - smoothstep(uShieldReveal - 0.16, uShieldReveal + 0.16, vShieldPosition.y);
        float pulse = 0.91 + sin(uShieldTime * 2.5 + vShieldPosition.y * 2.0) * 0.09;
        float strength = max(line * 0.30 + lineGlow, dotCore * 0.95 + dotGlow);
        float alpha = strength * coverage * uShieldAlpha * pulse;
        if (alpha < 0.003) discard;
        vec3 color = mix(vec3(0.30, 0.84, 1.0), vec3(0.88, 1.0, 1.0), dotCore);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  return { material, uniforms };
}
