'use client';

import { useLocale } from './LocaleProvider';

const words = {
  ru: {
    eyebrow: 'ТОЧНАЯ СТОМАТОЛОГИЯ · ЗАБОТА О ВАС',
    heading: ['Современная забота.', 'Естественно красивая улыбка.'],
    description: 'Точное планирование, бережное лечение и естественный результат, который хочется сохранить.',
    precision: 'Точность', planning: 'Цифровое планирование',
    comfort: 'Комфорт', care: 'Бережный подход к лечению',
    action: 'Записаться на консультацию', stat: 'улыбок в истории нашей клиники',
    statNote: 'Демонстрационные данные', caption: 'ЛЕЧЕНИЕ · ЭСТЕТИКА · ЗАБОТА О ВАШЕЙ УЛЫБКЕ',
    seal: 'С ЗАБОТОЙ О ВАШЕЙ УЛЫБКЕ · ',
  },
  en: {
    eyebrow: 'PRECISION DENTISTRY · PERSONALIZED CARE',
    heading: ['Advanced care.', 'A naturally confident smile.'],
    description: 'Modern restorative dentistry designed around precision, comfort, and results that feel completely natural.',
    precision: 'Precision', planning: 'Digital Smile Planning',
    comfort: 'Comfort', care: 'Gentle, patient-first care',
    action: 'Book a Consultation', stat: 'patients cared for with a personalized touch',
    statNote: 'Illustrative template data', caption: 'RESTORATIVE & COSMETIC DENTISTRY, REIMAGINED',
    seal: 'PRECISION DENTISTRY · PERSONALIZED CARE · ',
  },
};

function Check() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 10 2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function HeroReference({ onConsultation, surfaceStage, controls }) {
  const { locale, t } = useLocale();
  const copy = words[locale] || words.ru;
  return <>
    <div className="hero-atmosphere" aria-hidden="true" />
    <div className="hero-title-wrap">
      <p className="hero-eyebrow">{copy.eyebrow}</p>
      <h1 id="hero-title">{copy.heading.map(line => <span key={line}>{line}</span>)}</h1>
      <p className="hero-reference-description">{copy.description}</p>
    </div>

    <div className="tooth-stage tooth-stage-anchor" aria-hidden="true" />


    <div className="hero-float-card hero-float-card--precision">
      <span className="hero-feature-icon"><Check /></span><div><strong>{copy.precision}</strong><span>{copy.planning}</span></div>
    </div>
    <div className="hero-float-card hero-float-card--comfort">
      <span className="hero-feature-icon"><Check /></span><div><strong>{copy.comfort}</strong><span>{copy.care}</span></div>
    </div>
    <div className="hero-reference-action"><button className="primary-button" type="button" onClick={onConsultation}>{copy.action}</button></div>
    <div className="hero-reference-stat"><strong>1,500<span>+</span></strong><p>{copy.stat}</p><small>{copy.statNote}</small></div>
    <div className="hero-quality-seal" aria-hidden="true"><svg viewBox="0 0 120 120" fill="none"><defs><path id="hero-seal-ring" d="M60 15a45 45 0 1 1-.01 0" /></defs><circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth=".65" /><text fill="currentColor" fontSize="8" letterSpacing="1.5"><textPath href="#hero-seal-ring">{copy.seal}</textPath></text><path d="M48 42c-10-4-14 8-9 20 2 5 4 22 8 22s4-17 8-17 4 17 8 17 6-17 8-22c5-12 1-24-9-20-5 2-9 2-14 0Z" stroke="currentColor" strokeWidth="1.2" /></svg></div>
    <div className="hero-bottom"><p className="hero-reference-caption">{copy.caption}<span>{t(surfaceStage)} · <span className="hero-desktop-hint">{locale === 'en' ? 'Drag to explore' : 'Потяните зуб для обзора'}</span><span className="hero-mobile-hint">{locale === 'en' ? 'Rotates as you scroll' : 'Поворачивается при прокрутке'}</span></span></p>{controls}</div>
  </>;
}
