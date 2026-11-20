import * as THREE from 'three';

export function createAnimatedEnamel(grain) {
  const uniforms = {
    growth: { value: 0 },
    sweep: { value: -1 },
    cleaning: { value: 0 },
    crack: { value: 0 },
    tint: { value: 0 },
  };
  const material = new THREE.MeshPhysicalMaterial({
    color: '#d9edf2', roughness: 0.245, metalness: 0.015,
    clearcoat: 0.94, clearcoatRoughness: 0.15, envMapIntensity: 0.66,
    bumpMap: grain, bumpScale: 0.007,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPlaqueGrowth = uniforms.growth;
    shader.uniforms.uCleaningSweep = uniforms.sweep;
    shader.uniforms.uCleaningActive = uniforms.cleaning;
    shader.uniforms.uCrackGrowth = uniforms.crack;
    shader.uniforms.uTintAmount = uniforms.tint;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEnamelPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEnamelPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `
        #include <common>
        varying vec3 vEnamelPosition;
        uniform float uPlaqueGrowth;
        uniform float uCleaningSweep;
        uniform float uCleaningActive;
        uniform float uCrackGrowth;
        uniform float uTintAmount;

        float crackPattern(vec3 point) {
          float lineX = 0.06 + sin(point.y * 4.0) * 0.13 + sin(point.y * 17.0) * 0.033 + sin(point.y * 41.0) * 0.012;
          float mainLine = 1.0 - smoothstep(0.004, 0.014, abs(point.x - lineX));
          float branchX = lineX + (0.83 - point.y) * 0.54;
          float branch = (1.0 - smoothstep(0.003, 0.009, abs(point.x - branchX)))
            * smoothstep(0.37, 0.44, point.y) * (1.0 - smoothstep(0.76, 0.85, point.y));
          float crown = smoothstep(0.12, 0.23, point.y) * (1.0 - smoothstep(1.32, 1.52, point.y));
          float front = smoothstep(0.50, 0.70, point.z);
          float growth = smoothstep(1.39 - uCrackGrowth * 1.3, 1.51 - uCrackGrowth * 1.3, point.y);
          return max(mainLine, branch) * crown * front * growth * uCrackGrowth;
        }

        float plaquePatch(vec3 point, vec3 center, vec3 radius) {
          float distanceToCenter = length((point - center) / radius);
          float edge = sin(point.x * 38.0 + sin(point.y * 21.0)) * 0.045
            + sin(point.z * 34.0 + point.y * 27.0) * 0.035;
          return 1.0 - smoothstep(0.58, 1.0, distanceToCenter + edge);
        }

        float plaquePattern(vec3 point) {
          float coverage = plaquePatch(point, vec3(0.43, 0.70, 0.78), vec3(0.30, 0.29, 0.20));
          coverage = max(coverage, plaquePatch(point, vec3(-0.45, 0.40, 0.77), vec3(0.27, 0.24, 0.18)));
          coverage = max(coverage, plaquePatch(point, vec3(0.02, 1.26, 0.04), vec3(0.27, 0.23, 0.37)));
          coverage = max(coverage, plaquePatch(point, vec3(0.46, 0.70, -0.76), vec3(0.27, 0.30, 0.20)));
          coverage = max(coverage, plaquePatch(point, vec3(-1.02, 0.62, 0.10), vec3(0.20, 0.28, 0.30)));
          coverage = max(coverage, plaquePatch(point, vec3(1.02, 0.38, -0.10), vec3(0.20, 0.25, 0.30)));
          return coverage;
        }
      `)
      .replace('#include <color_fragment>', `
        #include <color_fragment>
        float dentalPattern = plaquePattern(vEnamelPosition);
        float dentalDeposit = smoothstep(1.0 - uPlaqueGrowth, 1.15 - uPlaqueGrowth, dentalPattern) * uPlaqueGrowth;
        float dentalWiped = 1.0 - smoothstep(uCleaningSweep - 0.10, uCleaningSweep + 0.10, vEnamelPosition.y);
        float dentalPlaque = dentalDeposit * (1.0 - dentalWiped);
        float dentalCrack = crackPattern(vEnamelPosition) * (1.0 - dentalWiped);
        float dentalTint = uTintAmount * (1.0 - dentalWiped) * smoothstep(-0.08, 0.16, vEnamelPosition.y);
        float dentalBand = (1.0 - smoothstep(0.025, 0.13, abs(vEnamelPosition.y - uCleaningSweep))) * uCleaningActive;
        dentalBand *= smoothstep(-0.05, 0.15, vEnamelPosition.y) * (1.0 - smoothstep(1.5, 1.7, vEnamelPosition.y));
        vec3 depositColor = mix(vec3(0.22, 0.12, 0.035), vec3(0.10, 0.052, 0.017), dentalPattern);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.56, 0.28), dentalTint * 0.60);
        diffuseColor.rgb = mix(diffuseColor.rgb, depositColor, dentalPlaque * 0.88);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.055, 0.085, 0.10), dentalCrack * 0.9);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.52, 0.83, 0.92), dentalBand * 0.32);
      `)
      .replace('#include <roughnessmap_fragment>', `
        #include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.72, max(dentalPlaque, dentalCrack * 0.85));
      `);
  };
  material.customProgramCacheKey = () => 'enamel-restoration-v2';
  return { material, uniforms };
}
