'use client';

import { cloneElement, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLocale, translateMarkup } from './LocaleProvider';
import ProtocolChapter from './ProtocolChapter';
import '../app/care-story.css';

export default function CareStory({ children, onSelectService }) {
  const { locale, t } = useLocale();
  const root = useRef(null);
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState('services');

  useLayoutEffect(() => {
    const media = matchMedia('(min-width: 981px) and (prefers-reduced-motion: no-preference)');
    const sync = () => setEnhanced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    const element = root.current;
    const services = element.querySelector('#directions');
    const protocol = element.querySelector('#protocol');
    const content = services.querySelector('.home-section-inner');
    const body = services.querySelector('.featured-services-layout');
    const footer = services.querySelector('.featured-services-bottom');
    function measure() {
      const box = content.getBoundingClientRect();
      element.style.setProperty('--care-content-height', `${box.height}px`);
      element.style.setProperty('--care-body-y', `${body.getBoundingClientRect().top - box.top}px`);
      element.style.setProperty('--care-body-height', `${body.offsetHeight}px`);
      element.style.setProperty('--care-footer-y', `${footer.getBoundingClientRect().top - box.top}px`);
    }
    const sizes = new ResizeObserver(measure);
    sizes.observe(content);
    sizes.observe(body);
    measure();
    const reposition = requestAnimationFrame(() => {
      if (location.hash !== '#protocol') return;
      if (!enhanced) protocol.scrollIntoView();
      else window.dispatchEvent(new Event('hashchange'));
    });
    if (!enhanced) {
      setActive('services');
      return () => { cancelAnimationFrame(reposition); sizes.disconnect(); };
    }
    const context = gsap.context(() => {}, element);
    let current = location.hash === '#protocol' ? 'protocol' : 'services';
    let target = current;
    let animation;
    let complete;
    let paused = false;
    let disposed = false;
    setActive(current);

    const panelFor = (name) => name === 'protocol' ? protocol : services;
    const itemsFor = (panel) => panel.id === 'protocol'
      ? Array.from(panel.querySelectorAll('[data-care-item]'))
      : Array.from(panel.querySelectorAll('.directions-heading-row > div, .featured-services-side-page[data-active="true"] > button, .featured-services-bottom'));
    function settle() {
      if (disposed) return;
      current = target;
      // Commit the CSS selector before clearing GSAP's visibility overrides.
      // React may batch setActive until after this animation frame.
      element.dataset.careContext = current;
      setActive(current);
      element.dataset.transitioning = 'false';
      gsap.set([services, protocol], { clearProps: 'visibility,opacity' });
      for (const panel of [services, protocol]) {
        panel.inert = panel !== panelFor(current);
        panel.setAttribute('aria-hidden', String(panel !== panelFor(current)));
      }
      const finished = complete;
      complete = undefined;
      window.dispatchEvent(new CustomEvent('clinic:care-settled', { detail: { context: current } }));
      finished?.();
    }
    function change(event) {
      const next = event.detail?.context;
      if (!['services', 'protocol'].includes(next)) return;
      if (animation?.isActive() || element.dataset.transitioning === 'true') return;
      complete = event.detail.complete;
      if (next === current) { complete?.(); complete = undefined; return; }
      target = next;
      const oldPanel = panelFor(current);
      const nextPanel = panelFor(next);
      const oldItems = itemsFor(oldPanel);
      const nextItems = itemsFor(nextPanel);
      const direction = event.detail.direction || (next === 'protocol' ? 1 : -1);
      if (event.detail.immediate) {
        context.add(() => gsap.set(nextItems, { clearProps: 'transform,opacity' }));
        settle();
        return;
      }
      const focusWasInside = oldPanel.contains(document.activeElement);
      oldPanel.inert = nextPanel.inert = true;
      element.dataset.transitioning = 'true';
      context.add(() => {
        gsap.set(nextItems, { y: direction * 48, opacity: 0 });
        gsap.set(nextPanel, { visibility: 'visible', opacity: 1 });
        animation = gsap.timeline({
          paused: paused || document.hidden,
          onComplete: () => {
            settle();
            if (focusWasInside) nextPanel.querySelector('h2')?.focus({ preventScroll: true });
          },
        });
        animation.to(oldItems, { y: -direction * 48, opacity: 0, duration: .32, stagger: .045, ease: 'power2.in' }, .14)
          .set(oldPanel, { visibility: 'hidden', opacity: 0 })
          .to(nextItems, { y: 0, opacity: 1, duration: .56, stagger: .065, ease: 'power3.out', clearProps: 'transform,opacity' }, '+=.04');
      });
    }
    function pause(event) { paused = Boolean(event.detail); animation?.paused(paused || document.hidden); }
    function visibility() { animation?.paused(paused || document.hidden); }
    window.addEventListener('clinic:care-context', change);
    window.addEventListener('clinic:care-pause', pause);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true; cancelAnimationFrame(reposition);
      animation?.kill();
      context.revert();
      sizes.disconnect();
      window.removeEventListener('clinic:care-context', change);
      window.removeEventListener('clinic:care-pause', pause);
      document.removeEventListener('visibilitychange', visibility);
      element.dataset.transitioning = 'false';
      complete?.();
    };
  }, [enhanced]);

  const go = (name) => window.dispatchEvent(new CustomEvent('clinic:care-request', { detail: { context: name } }));
  return (
    <div className="care-story" ref={root} data-care-mode={enhanced ? 'story' : 'flow'} data-care-context={active}>
      {cloneElement(translateMarkup(children, t), { 'data-care-panel': 'services', 'aria-hidden': enhanced && active !== 'services' ? true : undefined, inert: enhanced && active !== 'services' ? true : undefined })}
      <ProtocolChapter onSelectService={onSelectService} hidden={enhanced && active !== 'protocol'} />
      <nav className="care-chapter-controls" aria-label={locale === 'en' ? 'Care chapters' : 'Разделы лечения'}>
        <button type="button" aria-pressed={active === 'services'} aria-controls="directions" onClick={() => go('services')}>{locale === 'en' ? 'Treatments and prices' : 'Услуги и цены'}</button>
        <span aria-hidden="true" />
        <button type="button" aria-pressed={active === 'protocol'} aria-controls="protocol" onClick={() => go('protocol')}>{locale === 'en' ? 'Our treatment approach' : 'Подход к лечению'}</button>
      </nav>
    </div>
  );
}


