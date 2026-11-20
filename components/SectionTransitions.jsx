'use client';

import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

const touchControls = 'dialog, input, textarea, [contenteditable="true"]';

export default function SectionTransitions({ disabled, reducedMotion }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('clinic:care-pause', { detail: disabled }));
  }, [disabled]);
  useEffect(() => {
    if (reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const section = document.querySelector('.care-story') || document.getElementById('directions');
    if (!section) return;
    const originalColor = section.style.getPropertyValue('background-color');
    const originalPriority = section.style.getPropertyPriority('background-color');
    let visible = false;
    let timer;
    let tint;
    let changed = false;

    function reset() {
      clearTimeout(timer);
      timer = undefined;
      tint?.kill();
      tint = undefined;
      if (!changed) return;
      if (originalColor) section.style.setProperty('background-color', originalColor, originalPriority);
      else section.style.removeProperty('background-color');
      changed = false;
    }

    function schedule() {
      clearTimeout(timer);
      if (!visible || document.hidden) return;
      // Scroll events keep postponing this until the screen has settled.
      timer = setTimeout(() => {
        timer = undefined;
        if (!visible || document.hidden) return;
        changed = true;
        tint = gsap.to(section, { backgroundColor: '#f1f8fb', duration: 1, ease: 'sine.inOut', overwrite: 'auto' });
      }, 350);
    }

    function onScroll() { clearTimeout(timer); if (!changed) schedule(); }
    function onVisibility() { if (document.hidden) reset(); else schedule(); }
    // A centre band also works for mobile sections taller than the viewport.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else reset();
    }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });
    visibility.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      visibility.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reset();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const section = document.querySelector('.care-story');
    const protocol = section?.querySelector('#protocol');
    if (!protocol) return;
    let visible = false;
    let timer;
    let tint;
    let disposed = false;
    const active = () => visible && (section.dataset.careMode !== 'story' || section.dataset.careContext === 'protocol');
    function sync() {
      clearTimeout(timer);
      if (!active() || document.hidden) {
        tint?.kill();
        tint = gsap.to(section, { '--protocol-tint': 0, duration: .6, ease: 'sine.inOut', overwrite: 'auto' });
        return;
      }
      timer = setTimeout(() => {
        if (disposed || !active() || document.hidden) return;
        tint = gsap.to(section, { '--protocol-tint': .42, duration: 1.25, ease: 'sine.inOut', overwrite: 'auto' });
      }, 350);
    }
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: '-20% 0px -20% 0px' });
    visibility.observe(protocol);
    const context = new MutationObserver(sync);
    context.observe(section, { attributes: true, attributeFilter: ['data-care-mode', 'data-care-context'] });
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      clearTimeout(timer);
      tint?.kill();
      visibility.disconnect();
      context.disconnect();
      document.removeEventListener('visibilitychange', sync);
      section.style.removeProperty('--protocol-tint');
    };
  }, [reducedMotion]);


  useLayoutEffect(() => {
    if (reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const screens = Array.from(document.querySelectorAll('.home-screen'));
    const revealed = new Set();
    const originalY = new Map();
    const originalScale = new Map();
    const context = gsap.context(() => {
      for (const screen of screens) {
        for (const element of screen.querySelectorAll('[data-section-reveal]')) {
          const y = parseFloat(gsap.getProperty(element, 'y')) || 0;
          originalY.set(element, y);
          let from = { y: y + 20, x: 0, scale: 1, rotation: 0 };
          if (element.matches('.featured-services-side--left')) from = { y, x: -24, scale: 1, rotation: 0 };
          else if (element.matches('.featured-services-side--right')) from = { y, x: 24, scale: 1, rotation: 0 };
          else if (element.matches('.home-question-list')) from = { y, x: 16, scale: 1, rotation: 0 };
          gsap.set(element, { opacity: 0, ...from });
        }
        for (const element of screen.querySelectorAll('[data-section-visual]')) {
          const scale = parseFloat(gsap.getProperty(element, 'scaleX')) || 1;
          originalScale.set(element, scale);
          gsap.set(element, { scale: scale * 0.98, transformOrigin: 'center center' });
        }
      }
    });
    const visibility = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || revealed.has(entry.target)) continue;
        revealed.add(entry.target);
        context.add(() => {
          const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
          entrance.to(entry.target.querySelectorAll('[data-section-reveal]'), { opacity: 1, y: (_, element) => originalY.get(element), x: 0, scale: 1, rotation: 0, duration: 0.6, stagger: 0.06, clearProps: 'transform,opacity' });
          const visuals = entry.target.querySelectorAll('[data-section-visual]');
          if (visuals.length) entrance.to(visuals, { scale: (_, element) => originalScale.get(element), duration: 0.75, ease: 'power2.out', clearProps: 'transform' }, 0.04);
        });
      }
    }, { threshold: 0.25 });
    screens.forEach((screen) => visibility.observe(screen));
    return () => {
      visibility.disconnect();
      context.revert();
    };
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (disabled || reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(Observer, ScrollToPlugin);
    const main = document.querySelector('main');
    const care = document.querySelector('.care-story');
    let moving = false;
    let gestureActive = false;
    let transition;
    let pendingHash = false;
    let disposed = false;
    const reviews = document.getElementById('reviews');
    let reviewRange = { start: Infinity, end: Infinity };
    let nativeReviews = false;
    let nativeTouch;
    let reviewTouchHandoff = false;

    const withinReviews = () => reviews && scrollY >= reviewRange.start - 2 && scrollY <= reviewRange.end + 2;
    function reviewMode(enabled) {
      nativeReviews = Boolean(enabled);
      main.dataset.scrollMode = nativeReviews ? 'reviews' : 'screens';
    }
    function measureReviews() {
      if (!reviews) return;
      const box = reviews.getBoundingClientRect();
      reviewRange = { start: box.top + scrollY, end: Math.max(box.top + scrollY, box.bottom + scrollY - innerHeight) };
      if (!moving) reviewMode(withinReviews());
    }
    function onNativeScroll() {
      if (moving || !reviews) return;
      if (nativeReviews) {
        // Clamp only the two handoff edges; all scrolling between them is native.
        if (scrollY < reviewRange.start - 2) window.scrollTo(0, reviewRange.start);
        else if (scrollY > reviewRange.end + 2) window.scrollTo(0, reviewRange.end);
      } else if (withinReviews()) reviewMode(true);
      if (nativeReviews && location.hash !== '#reviews') history.replaceState(history.state, '', location.pathname + location.search + '#reviews');
    }
    function onReviewFocus(event) {
      if (nativeReviews && !reviews?.contains(event.target)) reviewMode(false);
    }
    function onReviewTouchStart(event) {
      if (moving || !withinReviews() || event.target.closest?.('dialog')) return;
      nativeTouch = { y: event.touches[0]?.clientY, start: scrollY <= reviewRange.start + 2, end: scrollY >= reviewRange.end - 2 };
      reviewMode(true);
    }
    function onReviewTouchMove(event) {
      if (!nativeTouch || moving) return;
      const distance = (event.touches[0]?.clientY ?? nativeTouch.y) - nativeTouch.y;
      const direction = nativeTouch.start && distance > 38 ? -1 : nativeTouch.end && distance < -38 ? 1 : 0;
      if (!direction) return;
      if (event.cancelable) event.preventDefault();
      nativeTouch = undefined;
      reviewMode(false);
      gestureActive = false;
      reviewTouchHandoff = true;
      advance(direction);
    }
    function onReviewTouchEnd() {
      nativeTouch = undefined;
      // Observer did not own this native gesture, so onStop cannot release it.
      if (reviewTouchHandoff) gestureActive = false;
      reviewTouchHandoff = false;
    }
    const reviewSizes = new ResizeObserver(measureReviews);
    if (reviews) reviewSizes.observe(reviews);
    reviewSizes.observe(main);
    measureReviews();
    document.fonts.ready.then(() => { if (!disposed) measureReviews(); });

    const storyMode = () => care?.dataset.careMode === 'story';
    function stops() {
      const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const positions = [{ y: 0, id: 'home' }];
      for (const screen of document.querySelectorAll('.home-screen')) {
        const box = screen.getBoundingClientRect();
        const top = box.top + scrollY;
        if (screen.id === 'protocol' && storyMode()) {
          positions.push({ y: Math.min(document.getElementById('directions').getBoundingClientRect().top + scrollY, maximum), id: 'protocol', context: 'protocol' });
          continue;
        }
        const context = screen.id === 'directions' && storyMode() ? 'services' : undefined;
        positions.push({ y: Math.min(top, maximum), id: screen.id, context });
        const last = top + box.height - innerHeight;
        for (let y = top + innerHeight; y < last - 4; y += innerHeight) positions.push({ y: Math.min(y, maximum), id: screen.id, context });
        if (last > top + 4) positions.push({ y: Math.min(last, maximum), id: screen.id, context });
      }
      positions.push({ y: maximum, id: null });
      return positions.filter((position, index) => index === 0 || position.context === 'protocol' || position.y - positions[index - 1].y > 4);
    }

    function changeContext(position, immediate, complete) {
      window.dispatchEvent(new CustomEvent('clinic:care-context', { detail: { context: position.context, direction: position.direction, immediate, complete } }));
    }
    function goTo(position) {
      if (!position || moving || care?.dataset.transitioning === 'true') return;
      const distance = Math.abs(scrollY - position.y);
      const changing = position.context && care?.dataset.careContext !== position.context;
      if (distance < 2 && !changing) { if (position.id === 'reviews') reviewMode(true); return; }
      moving = true;
      reviewMode(false);
      main.setAttribute('aria-busy', 'true');
      const finish = () => {
        if (disposed) return;
        moving = false;
        reviewMode(position.id === 'reviews');
        main.removeAttribute('aria-busy');
        if (position.id && !position.fromHistory) {
          const hash = position.id === 'home' ? '' : `#${position.id}`;
          if (location.hash !== hash) {
            const method = distance < 2 && changing ? 'pushState' : 'replaceState';
            history[method](history.state, '', location.pathname + location.search + hash);
          }
        }
        if (position.focus) document.querySelector(`#${position.id} input`)?.focus({ preventScroll: true });
        if (pendingHash) { pendingHash = false; onHash(); }
      };
      if (changing && distance > 2) changeContext(position, true);
      if (distance < 2) {
        changeContext(position, Boolean(position.instant), finish);
        return;
      }
      if (position.instant) { window.scrollTo(0, position.y); finish(); return; }
      transition = gsap.to(window, { scrollTo: { y: position.y, autoKill: false }, duration: .9, ease: 'power3.inOut', onComplete: finish });
    }

    function advance(direction) {
      if (moving || gestureActive || care?.dataset.transitioning === 'true') return;
      const positions = stops();
      let nearest = 0;
      for (let index = 1; index < positions.length; index++) {
        const candidate = Math.abs(positions[index].y - scrollY);
        const previous = Math.abs(positions[nearest].y - scrollY);
        if (candidate < previous - 2 || (Math.abs(candidate - previous) < 2 && positions[index].context === care?.dataset.careContext)) nearest = index;
      }
      const next = Math.max(0, Math.min(positions.length - 1, nearest + direction));
      if (next === nearest) return;
      gestureActive = true;
      goTo({ ...positions[next], direction });
    }

    const input = Observer.create({
      target: window, type: 'wheel,touch', ignore: 'dialog',
      ignoreCheck: (event, isPointerOrTouch) => {
        if (event.type === 'wheel' && event.ctrlKey) return true;
        if (moving) return false;
        if (withinReviews()) {
          if (event.type === 'wheel') {
            const leaving = scrollY <= reviewRange.start + 2 && event.deltaY < 0 || scrollY >= reviewRange.end - 2 && event.deltaY > 0;
            if (leaving) { reviewMode(false); return false; }
          }
          reviewMode(true);
          return true;
        }
        const rotatingDesktopTooth = !matchMedia('(max-width: 980px)').matches && event.target.closest?.('.tooth-stage[data-scene-ready="true"]');
        return Boolean(isPointerOrTouch && (rotatingDesktopTooth || event.target.closest?.(touchControls)));
      },
      preventDefault: true, allowClicks: true, wheelSpeed: -1, tolerance: 38, dragMinimum: 10,
      onUp: () => advance(1), onDown: () => advance(-1),
      onStop: () => { gestureActive = false; }, onStopDelay: .18,
    });
    function onKey(event) {
      if (event.target.closest?.('dialog, .tooth-stage[data-scene-ready="true"], input, textarea, summary, [contenteditable="true"]') || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === ' ' && event.target.closest?.('button, a')) return;
      const directions = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, ' ': event.shiftKey ? -1 : 1 };
      if (event.key in directions && withinReviews() && !moving) {
        const direction = directions[event.key];
        if (direction < 0 && scrollY <= reviewRange.start + 2 || direction > 0 && scrollY >= reviewRange.end - 2) {
          event.preventDefault(); reviewMode(false); gestureActive = false; advance(direction);
        }
        return;
      }
      if (event.key in directions) { event.preventDefault(); gestureActive = false; advance(directions[event.key]); }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); const positions = stops(); goTo(event.key === 'Home' ? positions[0] : positions[positions.length - 1]);
      }
    }
    function onAnchor(event) {
      const anchor = event.target.closest?.('a[href="#home"], a[href="#reviews"], a[href="#appointment"], a[href="#protocol"], a[href="#directions"]');
      if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      goTo(stops().find(position => position.id === anchor.getAttribute('href').slice(1)));
    }
    function onNavigate(event) {
      const position = stops().find(item => item.id === event.detail.id);
      if (position) goTo({ ...position, focus: event.detail.focus });
    }
    function onCareRequest(event) { goTo(stops().find(position => position.context === event.detail.context)); }
    function onHash() {
      if (moving || care?.dataset.transitioning === 'true') { pendingHash = true; return; }
      const id = location.hash.slice(1) || 'home';
      const position = stops().find(item => item.id === id);
      if (position) goTo({ ...position, fromHistory: true, instant: true });
    }
    function onSettled(event) {
      if (pendingHash && !moving) { pendingHash = false; onHash(); }
      else if (!moving && event.detail?.context && storyMode()) {
        const hash = event.detail.context === 'protocol' ? '#protocol' : '#directions';
        history.replaceState(history.state, '', location.pathname + location.search + hash);
      }
    }
    const initial = requestAnimationFrame(() => {
      if (location.hash && care?.dataset.transitioning !== 'true') onHash();
    });
    window.addEventListener('keydown', onKey);
    window.addEventListener('clinic:navigate', onNavigate);
    window.addEventListener('clinic:care-request', onCareRequest);
    window.addEventListener('clinic:care-settled', onSettled);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('resize', measureReviews, { passive: true });
    window.addEventListener('touchstart', onReviewTouchStart, { passive: true });
    window.addEventListener('touchmove', onReviewTouchMove, { passive: false });
    window.addEventListener('touchend', onReviewTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onReviewTouchEnd, { passive: true });
    document.addEventListener('focusin', onReviewFocus);
    document.addEventListener('click', onAnchor);
    return () => {
      disposed = true;
      cancelAnimationFrame(initial);
      transition?.kill(); input.kill(); main.removeAttribute('aria-busy');
      reviewSizes.disconnect();
      delete main.dataset.scrollMode;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('clinic:navigate', onNavigate);
      window.removeEventListener('clinic:care-request', onCareRequest);
      window.removeEventListener('clinic:care-settled', onSettled);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', measureReviews);
      window.removeEventListener('touchstart', onReviewTouchStart);
      window.removeEventListener('touchmove', onReviewTouchMove);
      window.removeEventListener('touchend', onReviewTouchEnd);
      window.removeEventListener('touchcancel', onReviewTouchEnd);
      document.removeEventListener('focusin', onReviewFocus);
      document.removeEventListener('click', onAnchor);
    };
  }, [disabled, reducedMotion]);

  return null;
}
