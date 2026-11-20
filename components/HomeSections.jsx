'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { getClinicContent } from './clinic';
import { useLocale, translateMarkup } from './LocaleProvider';
import DoctorsSection from './DoctorsSection';
import CareStory from './CareStory';
import ReviewsAndBooking from './ReviewsAndBooking';

const questions = [
  {
    question: 'С чего начать, если не знаю, что нужно?',
    answer: 'Начните с консультации. Расскажите, что вас беспокоит или что хотелось бы изменить. Врач проведёт осмотр и объяснит возможные следующие шаги.',
  },
  {
    question: 'Нужно ли сразу начинать лечение?',
    answer: 'На консультации можно познакомиться с врачом и обсудить варианты. План, сроки и стоимость лечения согласовывают с вами до его начала.',
  },
  {
    question: 'Что взять на первый приём?',
    answer: 'Если у вас есть предыдущие снимки или заключения, возьмите их с собой. При записи администратор уточнит, нужны ли дополнительные документы.',
  },
  {
    question: 'А если я боюсь стоматолога?',
    answer: 'Расскажите об этом при записи и на приёме. Обсудите с врачом, что именно вызывает тревогу и как сделать предстоящий визит комфортнее для вас.',
  },
];

function ForwardArrow({ diagonal = false }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturedServiceCard({ service, onSelectService }) {
  return (
    <button
      type="button"
      className={`featured-service-card featured-service-card--${service.visual}`}
      onClick={() => onSelectService(service)}
    >
      <span className="featured-service-art" aria-hidden="true">
        <Image src={`/services/${service.id}.webp`} alt="" fill sizes="(max-width: 650px) 150px, 130px" />
      </span>
      <span className="featured-service-title">{service.name}</span>
      <span className="featured-service-bottom">
        <span className="featured-service-price">{service.price}</span>
        <span className="featured-service-arrow"><ForwardArrow diagonal /></span>
      </span>
    </button>
  );
}

function QuestionList() {
  const { t } = useLocale();
  const [openQuestion, setOpenQuestion] = useState(0);
  const prefix = useId();

  return translateMarkup((
    <div className="home-question-list" data-section-reveal>
      {questions.map((item, index) => {
        const expanded = openQuestion === index;
        const panelId = `${prefix}-answer-${index}`;
        const buttonId = `${prefix}-question-${index}`;
        return (
          <div className="home-question" key={item.question} data-open={expanded}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenQuestion(expanded ? null : index)}
              >
                <span>{item.question}</span>
                <span className="home-question-toggle" aria-hidden="true" />
              </button>
            </h3>
            <div
              className="home-answer-grid"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!expanded}
              inert={!expanded ? true : undefined}
            >
              <div className="home-answer-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ), t);
}

export default function HomeSections({ onChooseService, onSelectService, onConsultation }) {
  const { locale, t } = useLocale();
  const { featuredServices } = getClinicContent(locale);
  const [servicePage, setServicePage] = useState(0);
  const servicePages = Array.from({ length: Math.ceil(featuredServices.length / 4) }, (_, pageIndex) =>
    Array.from({ length: 4 }, (_, index) => featuredServices[(pageIndex * 4 + index) % featuredServices.length]));
  return translateMarkup((
    <>
      <CareStory onSelectService={onSelectService}>
      <section className="home-screen home-directions" id="directions" aria-labelledby="directions-title">
        <div className="home-section-inner">
          <div className="directions-heading-row">
            <div data-section-reveal>
              <h2 className="home-display" id="directions-title" tabIndex={-1}>
                Стоматология<br />с особым подходом!
              </h2>
              <p className="directions-mission">Наша миссия — ваша красивая и здоровая улыбка</p>
            </div>
            <div className="directions-introduction" data-section-reveal>
              <p>Пациенты уходят от нас без боли, страхов и неуверенности в себе. И возвращаются к нам снова, приводя своих друзей и родственников. Улыбки наших пациентов — наша визитная карточка.</p>
              <button type="button" className="text-button" onClick={() => onChooseService('')}>Перейти к услугам <ForwardArrow diagonal /></button>
            </div>
          </div>
          <div className="featured-services" role="region" aria-roledescription="карусель" aria-label="Услуги и цены">
            <div className="featured-services-layout" id="featured-services-pages">
              <div className="featured-services-side featured-services-side--left" data-section-reveal>
                {servicePages.map((items, pageIndex) => (
                  <div
                    className="featured-services-side-page"
                    key={pageIndex}
                    role="group"
                    aria-roledescription="слайд"
                    aria-label={t('Услуги слева, набор {number} из {total}', { number: pageIndex + 1, total: servicePages.length })}
                    data-active={servicePage === pageIndex}
                    data-count={Math.min(2, items.length)}
                    aria-hidden={servicePage !== pageIndex}
                    inert={servicePage !== pageIndex ? true : undefined}
                  >
                    {items.slice(0, 2).map((item) => (
                      <FeaturedServiceCard service={item} key={item.id} onSelectService={onSelectService} />
                    ))}
                  </div>
                ))}
              </div>

              <div className="services-tooth-slot" aria-hidden="true" />

              <div className="featured-services-side featured-services-side--right" data-section-reveal>
                {servicePages.map((items, pageIndex) => (
                  <div
                    className="featured-services-side-page"
                    key={pageIndex}
                    role="group"
                    aria-roledescription="слайд"
                    aria-label={t('Услуги справа, набор {number} из {total}', { number: pageIndex + 1, total: servicePages.length })}
                    data-active={servicePage === pageIndex}
                    data-count={Math.max(1, items.length - 2)}
                    aria-hidden={servicePage !== pageIndex}
                    inert={servicePage !== pageIndex ? true : undefined}
                  >
                    {items.slice(2, 4).map((item) => (
                      <FeaturedServiceCard service={item} key={item.id} onSelectService={onSelectService} />
                    ))}
                    {items.length <= 2 && (
                      <button className="featured-services-catalog-card" type="button" onClick={() => onChooseService('')}>
                        <span className="featured-catalog-title">Найдём то,<br />что нужно вам</span>
                        <span className="featured-catalog-link">Все услуги <ForwardArrow diagonal /></span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="featured-services-bottom" data-section-reveal>
              <p className="featured-services-note">Услуги и цены для демонстрации шаблона</p>
              <div className="featured-services-controls" role="group" aria-label="Переключение услуг">
                <button type="button" aria-label="Предыдущие услуги" aria-controls="featured-services-pages" onClick={() => setServicePage((value) => (value - 1 + servicePages.length) % servicePages.length)}><span aria-hidden="true">←</span></button>
                <span className="featured-services-position" role="status" aria-live="polite" aria-label={t('Набор {number} из {total}', { number: servicePage + 1, total: servicePages.length })}>{servicePage + 1} / {servicePages.length}</span>
                <button type="button" aria-label="Следующие услуги" aria-controls="featured-services-pages" onClick={() => setServicePage((value) => (value + 1) % servicePages.length)}><span aria-hidden="true">→</span></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      </CareStory>

      <DoctorsSection onSelectDoctor={onSelectService} onConsultation={onConsultation} />

      <ReviewsAndBooking />

      <section className="home-screen home-questions" id="questions" aria-labelledby="questions-title">
        <div className="home-section-inner questions-composition">
          <div className="questions-introduction">
            <h2 className="home-display" id="questions-title" data-section-reveal>
              Давайте<br />разберёмся.
            </h2>
            <p className="home-intro-text" data-section-reveal>
              Можно начать с любого вопроса. Даже если вы давно откладывали визит.
            </p>
            <button className="primary-button questions-cta" type="button" onClick={onConsultation} data-section-reveal>
              Обсудить мой вопрос <ForwardArrow diagonal />
            </button>
          </div>
          <QuestionList />
          <div className="questions-signoff" data-section-reveal>
            <span>Люм<span className="questions-brand-period">.</span></span>
            <p>Забота начинается со знакомства.</p>
          </div>
        </div>
      </section>
    </>
  ), t);
}
