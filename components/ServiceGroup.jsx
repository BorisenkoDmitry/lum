'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function ServiceGroup({ group, initiallyOpen, reducedMotion, onSelect }) {
  const details = useRef(null);
  const content = useRef(null);
  const expanded = useRef(initiallyOpen);
  const animation = useRef(null);

  useLayoutEffect(() => {
    const items = content.current.querySelectorAll('button');
    return () => {
      animation.current?.kill();
      gsap.killTweensOf(items);
    };
  }, []);

  function toggle(event) {
    event.preventDefault();
    const element = details.current;
    const panel = content.current;
    const items = panel.querySelectorAll('button');
    const wasClosed = !element.open;
    const height = wasClosed ? 0 : panel.getBoundingClientRect().height;
    const opening = !expanded.current;
    expanded.current = opening;
    element.dataset.expanded = String(opening);
    animation.current?.kill();
    gsap.killTweensOf(items);

    if (reducedMotion) {
      element.open = opening;
      gsap.set(panel, { clearProps: 'height,opacity' });
      gsap.set(items, { clearProps: 'transform,opacity' });
      return;
    }

    element.open = true;
    animation.current = gsap.fromTo(panel, {
      height,
      opacity: wasClosed ? 0 : gsap.getProperty(panel, 'opacity'),
    }, {
      height: opening ? panel.scrollHeight : 0,
      opacity: opening ? 1 : 0,
      duration: opening ? 0.32 : 0.23,
      ease: 'power3.out',
      onComplete: () => {
        element.open = opening;
        gsap.set(panel, { clearProps: 'height,opacity' });
      },
    });

    if (opening && wasClosed) {
      gsap.fromTo(items, { y: 9, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.25, stagger: 0.035, ease: 'power2.out', clearProps: 'transform,opacity',
      });
    } else if (opening) {
      gsap.to(items, { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out', clearProps: 'transform,opacity' });
    }
  }

  return (
    <details ref={details} open={initiallyOpen} data-expanded={initiallyOpen}>
      <summary onClick={toggle}><span>{group.title}<small>{group.description}</small></span><span className="details-icon" aria-hidden="true" /></summary>
      <div ref={content} className="catalog-panel"><div className="catalog-services">
        {group.services.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item)}>{item.name}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>)}
      </div></div>
    </details>
  );
}
