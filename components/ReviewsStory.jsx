'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocale } from './LocaleProvider';
import '../app/reviews-story.css';

const content = {
  ru: {
    title: 'Слово пациентам',
    introduction: 'От первого разговора до заботы после приёма.',
    demo: 'Все истории и портреты вымышлены. Демонстрация шаблона.',
    chapters: [
      { name: 'Знакомство', shortName: 'Начало', description: 'Когда всё начинается с разговора', cards: [
        { name: 'Мария К.', treatment: 'Первая консультация', portrait: 0, variant: 'statement', quote: 'Мне было важно понимать, что будет происходить. Всё спокойно объяснили и дали время задать вопросы. После разговора стало легче решиться на следующий шаг.' },
        { name: 'Денис П.', treatment: 'Планирование лечения', portrait: 3, variant: 'portrait', quote: 'Сложный для меня вопрос разложили на понятные шаги. Я ушёл с планом и пониманием, что будет дальше. Для первого знакомства с клиникой это очень важно.' },
      ] },
      { name: 'Забота', description: 'Внимание к деталям и к человеку', cards: [
        { name: 'Алексей М.', treatment: 'Профессиональная гигиена', portrait: 1, variant: 'editorial', quote: 'Понравилось, что со мной обсуждали каждый этап. А после приёма показали, как ухаживать за зубами дома. Теперь я лучше понимаю, что делаю и зачем.' },
        { name: 'Ирина Л.', treatment: 'Забота на приёме', portrait: 4, variant: 'compact', quote: 'Мне заранее объяснили, что можно почувствовать на приёме и когда сделать паузу. Я могла спокойно сказать, что мне неудобно. Это помогло чувствовать себя увереннее.' },
      ] },
      { name: 'Результат', shortName: 'Итог', description: 'Понимание, которое остаётся с вами', cards: [
        { name: 'Ольга С.', treatment: 'Эстетика улыбки', portrait: 2, variant: 'portrait-quote', quote: 'Пришла с идеей, но без готового решения. Мы обсудили разные варианты, и я смогла выбрать свой. Было приятно, что к моим пожеланиям отнеслись внимательно.' },
        { name: 'Роман В.', treatment: 'Рекомендации после лечения', portrait: 5, variant: 'closing', quote: 'Мне подробно объяснили, как поддерживать результат и когда приходить на осмотр. Понравилось, что разговор не закончился в момент завершения приёма.' },
      ] },
    ],
    invitation: 'Ваше знакомство с клиникой может начаться с вопроса.',
    action: 'Обсудить мой вопрос',
  },
  en: {
    title: 'In our patients’ words',
    introduction: 'From the first conversation to care after your visit.',
    demo: 'All stories and portraits are fictional. Template demonstration.',
    chapters: [
      { name: 'Meeting', description: 'It starts with a conversation', cards: [
        { name: 'Maria K.', treatment: 'First consultation', portrait: 0, variant: 'statement', quote: 'I wanted to understand what would happen. Everything was explained calmly, and I had time to ask questions. That conversation helped me feel ready for the next step.' },
        { name: 'Dennis P.', treatment: 'Treatment planning', portrait: 3, variant: 'portrait', quote: 'Something that had seemed complicated became a clear set of steps. I left with a plan and an understanding of what would come next. That mattered at my first visit.' },
      ] },
      { name: 'Care', description: 'Attention to the person and the details', cards: [
        { name: 'Alex M.', treatment: 'Professional cleaning', portrait: 1, variant: 'editorial', quote: 'I appreciated being talked through each stage. Afterwards, I was shown how to care for my teeth at home. Now I understand my daily routine much better.' },
        { name: 'Irina L.', treatment: 'Care during the visit', portrait: 4, variant: 'compact', quote: 'I was told what I might feel during the appointment and when we could take a break. I could say when something felt uncomfortable. That helped me feel more confident.' },
      ] },
      { name: 'Moving forward', shortName: 'Aftercare', description: 'Understanding that stays with you', cards: [
        { name: 'Olga S.', treatment: 'Smile aesthetics', portrait: 2, variant: 'portrait-quote', quote: 'I had an idea, but I had not made a decision. We discussed the options together, and I could choose what suited me. It felt good to have my wishes heard.' },
        { name: 'Roman V.', treatment: 'Aftercare advice', portrait: 5, variant: 'closing', quote: 'I was given a clear explanation of how to look after the result and when to come back for a check-up. I liked that the conversation continued beyond the appointment itself.' },
      ] },
    ],
    invitation: 'Your first conversation with the clinic can start with a question.',
    action: 'Ask a question',
  },
};

function Portrait({ index, className = '' }) {
  return <span className={`patient-portrait ${className}`} aria-hidden="true">
    <Image src="/reviews/patient-atlas.webp" alt="" width={1536} height={1024} loading="lazy" unoptimized className="patient-portrait-atlas" style={{ left: `${-(index % 3) * 100}%`, top: `${-Math.floor(index / 3) * 100}%` }} />
  </span>;
}

function ReviewCard({ card, number }) {
  return <div className={`review-card-shell review-card-shell--${card.variant}`} data-review-shell>
    <div className="review-card-motion" data-review-motion>
    <article className={`patient-review-card patient-review-card--${card.variant}`} aria-labelledby={`review-author-${number}`} data-review-card>
      <span className="patient-review-mark" aria-hidden="true">“</span>
      {['portrait', 'editorial', 'portrait-quote'].includes(card.variant) && <Portrait index={card.portrait} className="patient-portrait--feature" />}
      <div className="patient-review-copy">
        <span className="patient-review-stars" aria-hidden="true">★★★★★</span>
        <blockquote><p>{card.quote}</p></blockquote>
        <footer className="patient-review-author">
          {!['portrait', 'editorial', 'portrait-quote'].includes(card.variant) && <Portrait index={card.portrait} className="patient-portrait--avatar" />}
          <div><span className="patient-review-name" id={`review-author-${number}`}>{card.name}</span><span className="patient-review-treatment">{card.treatment}</span></div>
        </footer>
      </div>
    </article>
    </div>
  </div>;
}

export default function ReviewsStory() {
  const { locale } = useLocale();
  const copy = content[locale] || content.ru;
  const root = useRef(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const motion = gsap.matchMedia(root);
    motion.add({ desktop: '(min-width: 651px)', mobile: '(max-width: 650px)', reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      if (conditions.reduced) return;
      const mobile = conditions.mobile;
      const cards = Array.from(root.current.querySelectorAll('[data-review-card]'));
      cards.forEach((card, index) => {
        const shell = card.closest('[data-review-shell]');
        const floating = shell.querySelector('[data-review-motion]');
        const stacked = index % 2 === 1;
        const chapter = shell.closest('.reviews-chapter');
        // Both cards share one progress range: the lower card catches the
        // upper one as the chapter scrolls, and peels away on reverse scroll.
        const fromY = mobile ? (stacked ? 30 : 0) : (stacked ? 130 : -30);
        const toY = mobile ? (stacked ? -65 : 70) : (stacked ? -85 : 135);
        gsap.fromTo(floating, {
          y: fromY, x: mobile ? 0 : (stacked ? 12 : -12),
          rotation: mobile ? 0 : (stacked ? 1.2 : -1.2), scale: 1,
        }, {
          y: toY, x: mobile ? 0 : (stacked ? -14 : 14),
          rotation: mobile ? 0 : (stacked ? -1.2 : 1.2),
          scale: mobile ? (stacked ? 1.025 : 1.015) : (stacked ? 1.035 : 1.02),
          ease: 'none', force3D: true,
          scrollTrigger: { trigger: chapter, start: 'top 75%', end: 'bottom 30%', scrub: .35 },
        });
        gsap.fromTo(card, { y: mobile ? 38 : 72 + (index % 3) * 12, x: mobile ? 0 : [20, -28, 0, 35, -18, 20][index], opacity: 0, scale: .97 }, {
          y: 0, x: 0, opacity: 1, scale: 1, duration: .85, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: shell, start: 'top 90%', once: true },
        });
      });
      let frame;
      let active = true;
      const refresh = () => {
        if (!active) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      // The care chapter above enhances after hydration and changes page height.
      const layout = new ResizeObserver(refresh);
      layout.observe(root.current.closest('main'));
      document.fonts.ready.then(refresh);
      return () => { active = false; layout.disconnect(); cancelAnimationFrame(frame); };
    });
    return () => motion.revert();
  }, []);

  return <section className="home-screen reviews-story" id="reviews" ref={root} aria-labelledby="reviews-story-title" data-native-scroll>
    <div className="reviews-story-inner">
      <header className="reviews-story-header">
        <div><h2 id="reviews-story-title">{copy.title}</h2><p className="reviews-story-introduction">{copy.introduction}</p></div>
        <p className="reviews-story-demo">{copy.demo}</p>
      </header>
      <div className="reviews-chapters">
        {copy.chapters.map((chapter, chapterIndex) => <section className={`reviews-chapter reviews-chapter--${chapterIndex + 1}`} key={chapter.name} aria-labelledby={`review-chapter-${chapterIndex}`}>
          <div className="reviews-chapter-number">
            <span className="reviews-sticky-number" aria-hidden="true">{String(chapterIndex + 1).padStart(2, '0')}</span>
            <h3 id={`review-chapter-${chapterIndex}`} aria-label={chapter.name}><span className="reviews-chapter-label-full">{chapter.name}</span><span className="reviews-chapter-label-short" aria-hidden="true">{chapter.shortName || chapter.name}</span></h3><p>{chapter.description}</p>
          </div>
          <div className="reviews-chapter-cards">{chapter.cards.map((card, index) => <ReviewCard card={card} key={card.name} number={chapterIndex * 2 + index} />)}</div>
        </section>)}
      </div>
      <div className="reviews-story-invitation"><p>{copy.invitation}</p><a href="#appointment">{copy.action}<span aria-hidden="true">↗</span></a></div>
    </div>
  </section>;
}
