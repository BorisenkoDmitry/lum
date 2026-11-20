'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getClinicContent, findServiceGroups, normalizeSearch } from './clinic';
import { useLocale, translateMarkup } from './LocaleProvider';
import ServiceGroup from './ServiceGroup';
import HomeSections from './HomeSections';
import SectionTransitions from './SectionTransitions';
import SharedToothStage from './SharedToothStage';
import HeroReference from './HeroReference';

function Arrow({ diagonal = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CloseIcon() {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function Brand({ clinical = false }) {
  const { locale } = useLocale();
  const { clinic } = getClinicContent(locale);
  return <span className="brand"><span className="brand-symbol" aria-hidden="true">{clinical ? <svg viewBox="0 0 24 30" fill="none"><path d="M10 4C2 1 2 11 5 17c1 3 2 10 4 10s1-8 3-8 1 8 3 8 3-7 4-10C22 11 22 1 14 4c-2 1-2 1-4 0Z" stroke="currentColor" strokeWidth="1.2" /></svg> : '✳'}</span><span>{clinic.name}<span className="brand-period">.</span></span></span>;
}

export default function DentalHero() {
  const { locale, t } = useLocale();
  const { clinic, consultation, catalogSuggestions } = getClinicContent(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuShown, setMenuShown] = useState(false);
  const [query, setQuery] = useState('');
  const [service, setService] = useState(null);
  const [reset, setReset] = useState(0);
  const [cyclePlaying, setCyclePlaying] = useState(true);
  const [surfaceStage, setSurfaceStage] = useState('Чистая эмаль');
  const [reducedMotion, setReducedMotion] = useState(false);
  const menu = useRef(null);
  const information = useRef(null);
  const trigger = useRef(null);
  const menuReturnFocus = useRef(null);
  const interaction = useRef({ x: 0, y: 0, dragging: false });
  const sceneArea = useRef(null);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia(sceneArea);
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const header = sceneArea.current.closest('main').previousElementSibling;
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      entrance.from(header.children, { y: -8, opacity: 0, duration: 0.4, stagger: 0.04, clearProps: 'transform,opacity' })
        .from('.hero-title-wrap', { y: 10, opacity: 0, duration: .7, clearProps: 'transform,opacity' }, .10)
        .from('.hero-float-card', { y: 12, opacity: 0, duration: .7, stagger: .1, clearProps: 'transform,opacity' }, .4)
        .from('.hero-reference-action, .hero-reference-stat, .hero-quality-seal', { y: 8, opacity: 0, duration: .6, stagger: .08, clearProps: 'transform,opacity' }, .6)
        .from('.hero-bottom', { opacity: 0, duration: 0.4, clearProps: 'opacity' }, 0.35);
    });
    return () => motion.revert();
  }, []);

  useLayoutEffect(() => {
    const dialog = menu.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let transition;
    if (menuOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setMenuShown(true);
      }
      if (reduced) {
        gsap.set(dialog, { opacity: 1, y: 0 });
        gsap.set(dialog.querySelectorAll('.catalog-header > *, .catalog-intro > *, .catalog-shortcuts > *, .catalog-groups > *, .catalog-bottom'), { clearProps: 'transform,opacity' });
        return;
      }
      transition = gsap.timeline({ defaults: { ease: 'power3.out' } });
      transition.fromTo(dialog, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38 })
        .fromTo(dialog.querySelectorAll('.catalog-header > *, .catalog-intro > *, .catalog-shortcuts > *'), { y: 17, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.035, duration: 0.38, clearProps: 'transform,opacity' }, 0.08)
        .fromTo(dialog.querySelectorAll('.catalog-groups > *'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.055, duration: 0.42, clearProps: 'transform,opacity' }, 0.15)
        .fromTo(dialog.querySelector('.catalog-bottom'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, clearProps: 'transform,opacity' }, 0.30);
    } else if (dialog.open) {
      transition = gsap.to(dialog, {
        y: reduced ? 0 : -16, opacity: reduced ? 1 : 0, duration: reduced ? 0 : 0.22, ease: 'power2.out',
        onComplete: () => dialog.close(),
      });
    }
    return () => transition?.kill();
  }, [menuOpen, reducedMotion]);

  useEffect(() => {
    if (service) {
      information.current.showModal();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const appearance = gsap.fromTo(information.current.querySelector('.information-content'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power3.out', clearProps: 'transform,opacity' });
        return () => appearance.kill();
      }
    }
    else information.current.close();
  }, [service]);

  useLayoutEffect(() => {
    if (!menuShown && !service) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuShown, service]);

  const normalized = normalizeSearch(query);
  const groups = findServiceGroups(query, locale);
  const resultCount = groups.reduce((total, group) => total + group.services.length, 0);

  function openMenu() {
    menuReturnFocus.current = document.activeElement;
    setQuery('');
    setMenuOpen(true);
  }

  function chooseService(query) {
    menuReturnFocus.current = document.activeElement;
    setQuery(query);
    setMenuOpen(true);
  }

  function showInformation(item) {
    setMenuOpen(false);
    setService(item);
  }

  function openAppointment() {
    if (reducedMotion) {
      document.getElementById('appointment')?.scrollIntoView();
      document.querySelector('#appointment input')?.focus({ preventScroll: true });
    } else window.dispatchEvent(new CustomEvent('clinic:navigate', { detail: { id: 'appointment', focus: true } }));
  }

  function pointerMove(event) {
    if (event.pointerType === 'touch' || matchMedia('(max-width: 980px)').matches || interaction.current.dragging) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    interaction.current.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    interaction.current.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
  }

  function handleSceneKeys(event) {
    const delta = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] }[event.key];
    if (!delta) return;
    event.preventDefault();
    interaction.current.x = Math.max(-1, Math.min(1, interaction.current.x + delta[0]));
    interaction.current.y = Math.max(-1, Math.min(1, interaction.current.y + delta[1]));
  }

  return translateMarkup((
    <>
      <header className="site-header">
        <a href="#home" aria-label={`${clinic.name}, ${locale === 'en' ? 'home' : 'на главную'}`} className="brand-link"><Brand clinical /></a>
        <span className="brand-tagline">{clinic.tagline}</span>
        <nav className="header-navigation" aria-label="Основная навигация">
          <a href="#home">{locale === 'en' ? 'Home' : 'Главная'}</a>
          <a href="#protocol">{locale === 'en' ? 'About Us' : 'О клинике'}</a>
          <button type="button" onClick={openMenu}>Услуги</button>
          <a href="#reviews">{locale === 'en' ? 'Results' : 'Отзывы'}</a>
          <a href="#appointment">{locale === 'en' ? 'Contact' : 'Контакты'}</a>
        </nav>
        <button type="button" className="menu-trigger" aria-label={t('Меню')} aria-haspopup="dialog" aria-expanded={menuOpen} onClick={openMenu} ref={trigger}>
          <span className="menu-label">Меню</span> <span className="menu-bars" aria-hidden="true"><i /><i /></span>
        </button>
        <button type="button" className="header-booking" onClick={openAppointment}>{locale === 'en' ? 'Book Visit' : 'Записаться'}</button>
        <nav className="language-switch" aria-label="Язык сайта">
          <a href="/" lang="ru" hrefLang="ru" aria-current={locale === 'ru' ? 'page' : undefined} aria-label="Русский">RU</a>
          <a href="/en" lang="en" hrefLang="en" aria-current={locale === 'en' ? 'page' : undefined} aria-label="English">EN</a>
        </nav>
      </header>

      <main id="home">
        <section className="hero" aria-labelledby="hero-title" onPointerMove={pointerMove} onPointerLeave={() => {
          if (interaction.current.dragging) return;
          interaction.current.x = 0;
          interaction.current.y = 0;
        }} ref={sceneArea}>
          <HeroReference onConsultation={openAppointment} surfaceStage={surfaceStage} controls={(
            <div className="scene-actions" role="group" aria-label="Настройки 3D-зуба">
              <button type="button" className="animation-toggle" disabled={reducedMotion} aria-label={cyclePlaying ? 'Приостановить анимацию зуба' : 'Продолжить анимацию зуба'} title={reducedMotion ? 'Анимация отключена настройкой уменьшенного движения' : undefined} onClick={() => setCyclePlaying((value) => !value)}>
                {cyclePlaying ? <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="3" height="12" rx="1" /><rect x="12" y="4" width="3" height="12" rx="1" /></svg> : <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 3.5 16 10 6 16.5z" /></svg>}
              </button>
              <button type="button" className="reset-view" aria-label="Вернуть исходный ракурс" title="Вернуть исходный ракурс" onClick={() => setReset((value) => value + 1)}>↺</button>
            </div>
          )} />
        </section>

        <HomeSections onChooseService={chooseService} onSelectService={showInformation} onConsultation={openAppointment} />
        <SharedToothStage interaction={interaction} reducedMotion={reducedMotion} reset={reset} cyclePlaying={cyclePlaying && !menuShown && !service} onStageChange={setSurfaceStage} onPointerMove={pointerMove} onKeyDown={handleSceneKeys} />
      </main>
      <SectionTransitions disabled={menuShown || Boolean(service)} reducedMotion={reducedMotion} />

      <footer className="site-footer"><Brand /><p>Демонстрационный шаблон.<br />{t('«{name}» — вымышленная клиника.', { name: clinic.name })}</p></footer>

      <dialog ref={menu} className="catalog-dialog" aria-labelledby="catalog-title" onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        setMenuOpen(false);
      }} onCancel={(event) => { event.preventDefault(); setMenuOpen(false); }} onClose={() => {
        setMenuOpen(false);
        setMenuShown(false);
        if (!information.current.open) {
          const previous = menuReturnFocus.current;
          const destination = previous?.isConnected && previous.getClientRects().length ? previous : trigger.current;
          destination?.focus({ preventScroll: true });
        }
      }}>
        <div className="catalog-header"><Brand /><button type="button" className="close-button" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)}><CloseIcon /></button></div>
        <div className="catalog-intro"><h2 id="catalog-title">Что вас интересует?</h2><label className="search-field"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" /></svg><input autoFocus type="search" placeholder="Найти услугу" aria-label="Найти услугу" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
        <div className="catalog-shortcuts" role="group" aria-label="Быстрый поиск услуг">
          {catalogSuggestions.map((item) => <button key={item.query} type="button" aria-pressed={normalized === normalizeSearch(item.query)} onClick={() => setQuery(item.query)}>{item.label}</button>)}
          {normalized && <button type="button" className="clear-search" onClick={() => setQuery('')}>Все услуги</button>}
        </div>
        <p className="search-status" role="status">{normalized ? t('Услуг найдено {count}', { count: resultCount }) : ''}</p>
        <div className="catalog-groups">
          {groups.map((group) => (
            <ServiceGroup key={`${group.id}-${normalized}`} group={group} initiallyOpen={Boolean(normalized)} reducedMotion={reducedMotion} onSelect={showInformation} />
          ))}
          {!groups.length && <div className="no-results"><p>По этому запросу услуги не найдены.</p><button type="button" className="text-button" onClick={() => setQuery('')}>Сбросить поиск</button></div>}
        </div>
        <div className="catalog-bottom"><p>Не знаете, что выбрать?<br />Начните с консультации.</p><button type="button" className="primary-button" onClick={() => showInformation(consultation)}>О консультации <Arrow diagonal /></button></div>
      </dialog>

      <dialog ref={information} className="information-dialog" aria-labelledby="information-title" onClose={() => setService(null)} onClick={(event) => { if (event.target === event.currentTarget) setService(null); }}>
        <div className="information-content"><button type="button" className="close-button" aria-label="Закрыть описание" onClick={() => setService(null)}><CloseIcon /></button><h2 id="information-title">{service?.name}</h2>{service?.price && <p className="information-price">{service.price}</p>}<p>{service?.description}</p>{clinic.bookingUrl ? <a href={clinic.bookingUrl} className="primary-button">Записаться <Arrow diagonal /></a> : <p className="demo-note">Запись и контакты подключаются к выбранной клинике.</p>}<button type="button" className="text-button" onClick={() => { setService(null); openMenu(); }}>Ко всем услугам <Arrow /></button></div>
      </dialog>
    </>
  ), t);
}


