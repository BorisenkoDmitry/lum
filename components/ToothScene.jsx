'use client';

import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { ToothGeometryLoader, createEnamelTexture } from './tooth-model';
import { createAnimatedEnamel } from './enamel-material';
import { createProtectiveSurface } from './protective-surface';
import { useLocale } from './LocaleProvider';

const surfaceEpisodes = [
  { appearance: 'Появляется налёт', restoration: 'Очищение поверхности' },
  { appearance: 'Появляется линия трещины', restoration: 'Условная реставрация' },
  { appearance: 'Меняется оттенок эмали', restoration: 'Осветление поверхности' },
];

function Studio() {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const room = new THREE.Scene();
    room.background = new THREE.Color('#344e63');
    const panels = [
      { position: [-3, 3, 4], size: [2.8, 5], brightness: 3 },
      { position: [4, 2, 2], size: [1.3, 4.5], brightness: 2 },
      { position: [0, 5, -1], size: [3.5, 2.5], brightness: 2.5 },
    ];
    for (const panel of panels) {
      const light = new THREE.Mesh(
        new THREE.PlaneGeometry(...panel.size),
        new THREE.MeshBasicMaterial({ color: new THREE.Color('white').multiplyScalar(panel.brightness), side: THREE.DoubleSide }),
      );
      light.position.set(...panel.position);
      light.lookAt(0, 0, 0);
      room.add(light);
    }
    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromScene(room, 0.02, 0.1, 100, { size: 64 });
    const previous = scene.environment;
    scene.environment = target.texture;
    invalidate();
    return () => {
      scene.environment = previous;
      target.dispose();
      generator.dispose();
      room.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
    };
  }, [gl, scene, invalidate]);
  return null;
}

function FreeRotation({ interaction, reset }) {
  const controls = useRef(null);
  const { camera, gl, size, invalidate } = useThree();
  useEffect(() => {
    const distance = size.width < 560 ? 9.0 : 10.1;
    camera.position.set(0, 0.15, Math.max(distance, 6.7 * size.height / size.width));
    camera.up.set(0, 1, 0);
    camera.lookAt(0, -0.22, 0);
    camera.updateProjectionMatrix();
    // Mobile touch belongs to page scrolling, never to camera controls.
    if (matchMedia('(max-width: 980px)').matches) { invalidate(); return; }
    const trackball = new TrackballControls(camera, gl.domElement);
    trackball.target.set(0, -0.22, 0);
    trackball.noZoom = true;
    trackball.noPan = true;
    trackball.staticMoving = true;
    trackball.rotateSpeed = 2.3;
    trackball.keys = [];
    const startDrag = () => { interaction.current.dragging = true; invalidate(); };
    const endDrag = () => { interaction.current.dragging = false; invalidate(); };
    trackball.addEventListener('start', startDrag);
    trackball.addEventListener('end', endDrag);
    trackball.addEventListener('change', invalidate);
    controls.current = trackball;
    invalidate();
    return () => {
      interaction.current.dragging = false;
      trackball.removeEventListener('start', startDrag);
      trackball.removeEventListener('end', endDrag);
      trackball.removeEventListener('change', invalidate);
      trackball.dispose();
      controls.current = null;
    };
  }, [camera, gl, size.width, size.height, reset, interaction, invalidate]);
  useFrame(() => controls.current?.update());
  return null;
}

function Tooth({ interaction, reducedMotion, reset, cyclePlaying, onStageChange, onReady }) {
  const group = useRef(null);
  const shieldMesh = useRef(null);
  const { invalidate, gl } = useThree();
  const geometry = useLoader(ToothGeometryLoader, '/models/tooth.bin');
  const grain = useMemo(createEnamelTexture, []);
  const enamel = useMemo(() => createAnimatedEnamel(grain), [grain]);
  const shield = useMemo(createProtectiveSurface, []);
  const elapsed = useRef(0);
  const mobileLayout = useRef(false);
  const scrollPosition = useRef(0);
  const currentStage = useRef('Чистая эмаль');
  const inViewport = useRef(true);
  const readyFrame = useRef(null);
  const reportedReady = useRef(false);

  useEffect(() => {
    const visibility = new IntersectionObserver(([entry]) => {
      inViewport.current = entry.isIntersecting;
      if (entry.isIntersecting) invalidate();
    });
    visibility.observe(gl.domElement);
    return () => visibility.disconnect();
  }, [gl, invalidate]);

  useEffect(() => {
    interaction.current.x = 0;
    interaction.current.y = 0;
    group.current.rotation.set(0.28, -0.39, -0.09);
    invalidate();
  }, [reset, interaction, invalidate]);

  useEffect(() => () => cancelAnimationFrame(readyFrame.current), []);
  useEffect(() => {
    if (reducedMotion) {
      enamel.uniforms.growth.value = 0;
      enamel.uniforms.cleaning.value = 0;
      enamel.uniforms.crack.value = 0;
      enamel.uniforms.tint.value = 0;
      shield.uniforms.alpha.value = 0;
      if (shieldMesh.current) shieldMesh.current.visible = false;
      currentStage.current = 'Чистая эмаль';
      onStageChange('Чистая эмаль');
      elapsed.current = 0;
    }
    invalidate();
  }, [cyclePlaying, reducedMotion, enamel, shield, invalidate, onStageChange]);
  useEffect(() => {
    const media = matchMedia('(max-width: 980px)');
    const syncLayout = () => { mobileLayout.current = media.matches; scrollPosition.current = scrollY; invalidate(); };
    const scrollFrame = () => { if (mobileLayout.current) { scrollPosition.current = scrollY; invalidate(); } };
    syncLayout();
    media.addEventListener('change', syncLayout);
    window.addEventListener('scroll', scrollFrame, { passive: true });
    const requestFrame = () => invalidate();
    window.addEventListener('pointermove', requestFrame, { passive: true });
    window.addEventListener('keydown', requestFrame);
    document.addEventListener('visibilitychange', requestFrame);
    return () => {
      media.removeEventListener('change', syncLayout);
      window.removeEventListener('scroll', scrollFrame);
      window.removeEventListener('pointermove', requestFrame);
      window.removeEventListener('keydown', requestFrame);
      document.removeEventListener('visibilitychange', requestFrame);
    };
  }, [invalidate]);

  useEffect(() => () => {
    grain.dispose();
    enamel.material.dispose();
    shield.material.dispose();
  }, [grain, enamel, shield]);

  useFrame((_, delta) => {
    if (document.hidden || !inViewport.current) return;
    if (!reportedReady.current) {
      reportedReady.current = true;
      readyFrame.current = requestAnimationFrame(() => {
        readyFrame.current = requestAnimationFrame(onReady);
      });
    }
    if (cyclePlaying && !reducedMotion) {
      const episodeLength = 13;
      elapsed.current = (elapsed.current + Math.min(delta, 0.05)) % (surfaceEpisodes.length * episodeLength);
      const episodeIndex = Math.floor(elapsed.current / episodeLength);
      const time = elapsed.current % episodeLength;
      const growth = time < 9.4 ? THREE.MathUtils.smoothstep(time, 1.6, 3.8) : 0;
      const shieldAlpha = THREE.MathUtils.smoothstep(time, 4.2, 5.25) * (1 - THREE.MathUtils.smoothstep(time, 6.1, 7.0));
      shield.uniforms.alpha.value = shieldAlpha;
      shield.uniforms.reveal.value = THREE.MathUtils.lerp(-2.8, 1.9, THREE.MathUtils.smoothstep(time, 4.2, 5.55));
      shield.uniforms.time.value = elapsed.current;
      shieldMesh.current.visible = shieldAlpha > 0.001;
      enamel.uniforms.growth.value = episodeIndex === 0 ? growth : 0;
      enamel.uniforms.crack.value = episodeIndex === 1 ? growth : 0;
      enamel.uniforms.tint.value = episodeIndex === 2 ? growth : 0;
      enamel.uniforms.sweep.value = THREE.MathUtils.lerp(-0.08, 1.7, THREE.MathUtils.smoothstep(time, 7.05, 9.4));
      enamel.uniforms.cleaning.value = time >= 7.05 && time <= 9.4 ? 1 : 0;
      let stage = 'Чистая эмаль';
      if (time >= 1.6 && time < 4.2) stage = surfaceEpisodes[episodeIndex].appearance;
      if (time >= 4.2 && time < 7.05) stage = 'Защитная сетка';
      if (time >= 7.05 && time <= 9.4) stage = surfaceEpisodes[episodeIndex].restoration;
      if (currentStage.current !== stage) {
        currentStage.current = stage;
        onStageChange(stage);
      }
      invalidate();
    }
    if (reducedMotion) return;
    const target = interaction.current;
    const amount = 1 - Math.exp(-(mobileLayout.current ? 3 : 5) * Math.min(delta, 0.05));
    const nextX = 0.28 + (mobileLayout.current ? 0 : target.y * 0.20);
    const nextY = -0.39 + (mobileLayout.current ? scrollPosition.current * 0.00065 : target.x * 0.53);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, nextX, amount);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, nextY, amount);
    if (Math.abs(group.current.rotation.x - nextX) + Math.abs(group.current.rotation.y - nextY) > 0.0001) {
      invalidate();
    } else {
      group.current.rotation.x = nextX;
      group.current.rotation.y = nextY;
    }
  });

  return (
    <group ref={group} position={[0, 0.05, 0]} rotation={[0.28, -0.39, -0.09]}>
      <mesh geometry={geometry} material={enamel.material} />
      <mesh ref={shieldMesh} geometry={geometry} material={shield.material} visible={false} renderOrder={1} />
    </group>
  );
}

class SceneBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() {
    return this.state.error
      ? <p className="scene-error">{this.props.fallbackText}</p>
      : this.props.children;
  }
}

function ContextLossFallback({ onLost }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const showPoster = () => onLost?.();
    canvas.addEventListener('webglcontextlost', showPoster);
    return () => canvas.removeEventListener('webglcontextlost', showPoster);
  }, [gl, onLost]);
  return null;
}

function FrameBudget({ active, onSlow }) {
  const samples = useRef({ warmup: 0, count: 0, elapsed: 0, verySlow: 0 });
  const visible = useRef(true);
  const { gl } = useThree();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; });
    observer.observe(gl.domElement);
    return () => observer.disconnect();
  }, [gl]);
  useFrame((_, delta) => {
    const value = samples.current;
    if (!active || document.hidden || !visible.current) {
      value.count = value.elapsed = value.verySlow = 0;
      return;
    }
    if (delta > .25) {
      if (++value.verySlow >= 3) onSlow?.();
      value.count = value.elapsed = 0;
      return;
    }
    value.verySlow = 0;
    if (value.warmup++ < 15) return;
    value.count++;
    value.elapsed += delta;
    if (value.count >= 30) {
      if (value.elapsed / value.count > .05) onSlow?.();
      value.count = value.elapsed = 0;
    }
  });
  return null;
}

export default function ToothScene({ interaction, reducedMotion, reset, cyclePlaying, onStageChange, onReady, onPoorPerformance }) {
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  return (
    <SceneBoundary onError={onPoorPerformance} fallbackText={t('Для 3D-зуба нужен браузер с поддержкой WebGL 2.')}>
      {!ready && <p className="scene-loading" role="status">{t('Создаём ваш 3D-зуб…')}</p>}
      <Canvas
        aria-hidden="true"
        resize={{ offsetSize: true, scroll: false }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{ position: [0, 0.15, 10.1], fov: 37, near: 0.1, far: 60 }}
        frameloop="demand"
        fallback={<p className="scene-error">{t('Для 3D-зуба нужен браузер с поддержкой WebGL 2.')}</p>}
      >
        <ContextLossFallback onLost={onPoorPerformance} />
        <ambientLight intensity={0.22} />
        <hemisphereLight intensity={0.65} color="#ffffff" groundColor="#239bcc" />
        <directionalLight position={[-4, 6, 5]} intensity={1.7} color="#ffffff" />
        <directionalLight position={[4, 1, -3]} intensity={1.7} color="#86e1ff" />
        <Suspense fallback={null}>
          <FrameBudget active={cyclePlaying && !reducedMotion} onSlow={onPoorPerformance} />
          <Studio />
          <FreeRotation interaction={interaction} reset={reset} />
          <Tooth interaction={interaction} reducedMotion={reducedMotion} reset={reset} cyclePlaying={cyclePlaying} onStageChange={onStageChange} onReady={() => { setReady(true); onReady?.(); }} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
