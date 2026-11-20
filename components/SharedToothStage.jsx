'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocale, translateMarkup } from './LocaleProvider';

const ToothScene = dynamic(() => import('./ToothScene'), {
  ssr: false,
  loading: () => null,
});

function allows3D() {
  const connection = navigator.connection;
  return !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType || '')
    && !(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    && !(navigator.deviceMemory && navigator.deviceMemory <= 4);
}

// Keep one canvas and one camera alive. Only the outer DOM layer moves and scales.
export default function SharedToothStage({ interaction, reducedMotion, reset, cyclePlaying, onStageChange, onPointerMove, onKeyDown }) {
  const { t } = useLocale();
  const stage = useRef(null);
  const sceneFailed = useRef(false);
  const [touchLayout, setTouchLayout] = useState(false);
  useEffect(() => {
    const media = matchMedia('(max-width: 980px)');
    const sync = () => setTouchLayout(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const [sceneRequested, setSceneRequested] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneUnavailable, setSceneUnavailable] = useState(false);
  const requestScene = useCallback(() => { if (!sceneFailed.current && allows3D()) setSceneRequested(true); }, []);
  const reportReady = useCallback(() => { if (!sceneFailed.current) setSceneReady(true); }, []);
  const stopScene = useCallback(() => {
    sceneFailed.current = true;
    setSceneUnavailable(true);
    setSceneRequested(false);
    setSceneReady(false);
    onStageChange('Чистая эмаль');
  }, [onStageChange]);
  const interactive = sceneReady && sceneRequested && !sceneUnavailable;

  useEffect(() => {
    if (sceneRequested || sceneUnavailable) return;
    if (!allows3D()) return;
    let visible = false;
    let loaded = document.readyState === 'complete';
    let timer;
    let idle;
    function cancel() {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      timer = idle = undefined;
    }
    function schedule() {
      if (!visible || !loaded || document.hidden || timer !== undefined || idle !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        const start = () => {
          if (!visible || document.hidden) return;
          const probe = document.createElement('canvas');
          const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true, powerPreference: 'low-power' });
          if (!gl) return;
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          requestScene();
        };
        if ('requestIdleCallback' in window) idle = requestIdleCallback(start, { timeout: 2000 });
        else start();
      }, 900);
    }
    function onLoad() { loaded = true; schedule(); }
    function onVisibility() { if (document.hidden) cancel(); else schedule(); }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else cancel();
    });
    observer.observe(stage.current);
    window.addEventListener('load', onLoad, { once: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancel();
      observer.disconnect();
      window.removeEventListener('load', onLoad);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sceneRequested, sceneUnavailable, reducedMotion, requestScene]);

  useLayoutEffect(() => {
    const element = stage.current;
    const main = element.closest('main');
    const source = main.querySelector('.tooth-stage-anchor');
    const destination = main.querySelector('.services-tooth-slot');
    const directions = main.querySelector('#directions');
    const protocol = main.querySelector('#protocol');
    const protocolSlot = main.querySelector('.protocol-tooth-slot');
    const story = main.querySelector('.care-story');
    if (!source || !destination) return;
    let geometry;
    let frame = null;
    let disposed = false;

    function measure() {
      const mainBox = main.getBoundingClientRect();
      const from = source.getBoundingClientRect();
      const to = destination.getBoundingClientRect();
      geometry = {
        fromX: from.left - mainBox.left,
        fromY: from.top - mainBox.top,
        width: from.width,
        height: from.height,
        toX: to.left - mainBox.left + to.width / 2,
        toY: to.top - mainBox.top + to.height / 2,
        scale: to.height / from.height * 1.4,
        targetHeight: to.height,
        targetWidth: to.width,
        finish: directions.getBoundingClientRect().top + scrollY,
      };
      if (protocol && protocolSlot && story?.dataset.careMode !== 'story') {
        const next = protocolSlot.getBoundingClientRect();
        geometry.protocol = {
          x: next.left - mainBox.left + next.width / 2,
          y: next.top - mainBox.top + next.height / 2,
          scale: next.height / from.height * 1.4,
          width: next.width,
          height: next.height,
          finish: protocol.getBoundingClientRect().top + scrollY,
        };
      }
      element.style.width = `${from.width}px`;
      element.style.height = `${from.height}px`;
      update();
    }

    function update() {
      frame = null;
      if (!geometry) return;
      const g = geometry;
      let progress = Math.max(0, Math.min(1, scrollY / Math.max(1, g.finish)));
      if (reducedMotion) progress = progress < .5 ? 0 : 1;
      let targetScale = g.scale;
      let targetX = g.toX;
      let targetY = g.toY;
      let targetWidth = g.targetWidth;
      let targetHeight = g.targetHeight;
      let chapter = 0;
      if (g.protocol) {
        chapter = Math.max(0, Math.min(1, (scrollY - g.finish) / Math.max(1, g.protocol.finish - g.finish)));
        if (reducedMotion) chapter = chapter < .5 ? 0 : 1;
        targetScale += (g.protocol.scale - targetScale) * chapter;
        targetX += (g.protocol.x - targetX) * chapter;
        targetY += (g.protocol.y - targetY) * chapter;
        targetWidth += (g.protocol.width - targetWidth) * chapter;
        targetHeight += (g.protocol.height - targetHeight) * chapter;
      }
      const scale = 1 + (targetScale - 1) * progress;
      const x = g.fromX + (targetX - g.width * targetScale / 2 - g.fromX) * progress;
      const y = g.fromY + (targetY - g.height * targetScale / 2 - g.fromY) * progress;
      const targetClip = Math.max(0, (g.width - targetWidth / targetScale) / 2);
      const clip = g.width * .14 + (targetClip - g.width * .14) * progress;
      const verticalClip = Math.max(0, (g.height - targetHeight / targetScale) / 2) * progress;
      element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      element.style.clipPath = `inset(${verticalClip}px ${clip}px)`;
      element.dataset.location = chapter >= .999 ? 'protocol' : progress >= .999 ? 'services' : progress <= .001 ? 'hero' : 'transition';
    }

    function schedule() {
      if (frame === null) frame = requestAnimationFrame(update);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(source);
    observer.observe(destination);
    observer.observe(directions);
    if (protocol) observer.observe(protocol);
    const mode = new MutationObserver(measure);
    if (story) mode.observe(story, { attributes: true, attributeFilter: ['data-care-mode'] });
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    return () => {
      disposed = true;
      observer.disconnect();
      mode.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
    };
  }, [reducedMotion]);

  return translateMarkup((
    <div
      ref={stage}
      className="tooth-stage shared-tooth-stage"
      data-scene-ready={interactive}
      role="img"
      aria-label={touchLayout ? 'Объёмный зуб. Медленно вращается при прокрутке страницы.' : 'Объёмный зуб. Двигайте мышью, зажмите и тяните для свободного вращения. При прокрутке зуб переходит в центр услуг.'}
      aria-hidden={!interactive}
      tabIndex={interactive && !touchLayout ? 0 : -1}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        if (interaction.current.dragging) return;
        interaction.current.x = 0;
        interaction.current.y = 0;
      }}
      onKeyDown={(event) => { if (interactive) onKeyDown(event); }}
    >

      <div className="tooth-scene-shell">{sceneRequested && !sceneUnavailable && <ToothScene interaction={interaction} reducedMotion={reducedMotion} reset={reset} cyclePlaying={cyclePlaying} onStageChange={onStageChange} onReady={reportReady} onPoorPerformance={stopScene} />}</div>
    </div>
  ), t);
}
