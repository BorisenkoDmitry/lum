'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useLocale, translateMarkup } from './LocaleProvider';

const doctors = [
  {
    id: 'alexander',
    name: 'Александр Ветров',
    specialty: 'Хирург-имплантолог',
    experience: '12 лет практики',
    photo: '/doctors/alexander.webp',
    description: 'Александр Ветров — хирург-имплантолог. В демонстрационном примере занимается восстановлением отсутствующих зубов и планированием хирургических этапов лечения. На консультации подробно объясняет последовательность действий и обсуждает вопросы пациента. Указанный опыт — 12 лет. Специалист и его биография вымышлены для демонстрации шаблона.',
  },
  {
    id: 'mikhail',
    name: 'Михаил Орлов',
    specialty: 'Стоматолог-ортопед',
    experience: '9 лет практики',
    photo: '/doctors/mikhail.webp',
    description: 'Михаил Орлов — стоматолог-ортопед. В демонстрационном примере специализируется на коронках, винирах и протезировании. Его подход начинается с обсуждения пожеланий пациента, формы будущей улыбки и удобства в повседневной жизни. Указанный опыт — 9 лет. Специалист и его биография вымышлены для демонстрации шаблона.',
  },
  {
    id: 'anna',
    name: 'Анна Белова',
    specialty: 'Стоматолог-терапевт',
    experience: '7 лет практики',
    photo: '/doctors/anna.webp',
    description: 'Анна Белова — стоматолог-терапевт. В демонстрационном примере занимается профилактикой, лечением кариеса и восстановлением зубов. На первом приёме уделяет время знакомству, объясняет результаты осмотра и помогает разобраться в плане лечения. Указанный опыт — 7 лет. Специалист и её биография вымышлены для демонстрации шаблона.',
  },
];

function DoctorArrow() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoctorPortrait({ doctor }) {
  const { locale } = useLocale();
  const portrait = useRef(null);

  useEffect(() => {
    const container = portrait.current;
    const imageLayer = container.querySelector('.doctor-photo-motion');
    const preference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let frame = null;

    function renderMovement() {
      current.x += (target.x - current.x) * 0.13;
      current.y += (target.y - current.y) * 0.13;
      imageLayer.style.setProperty('--portrait-x', `${current.x}px`);
      imageLayer.style.setProperty('--portrait-y', `${current.y}px`);
      if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.02) {
        frame = requestAnimationFrame(renderMovement);
      } else {
        frame = null;
      }
    }

    function startMovement() {
      if (frame === null) frame = requestAnimationFrame(renderMovement);
    }

    function move(event) {
      if (!preference.matches || event.pointerType !== 'mouse') return;
      const bounds = container.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
      startMovement();
    }

    function leave() {
      if (!preference.matches) return;
      target.x = 0;
      target.y = 0;
      startMovement();
    }

    function syncPreference() {
      container.toggleAttribute('data-parallax', preference.matches);
      if (!preference.matches) {
        cancelAnimationFrame(frame);
        frame = null;
        current.x = current.y = target.x = target.y = 0;
        imageLayer.style.removeProperty('--portrait-x');
        imageLayer.style.removeProperty('--portrait-y');
      }
    }

    syncPreference();
    container.addEventListener('pointermove', move, { passive: true });
    container.addEventListener('pointerleave', leave, { passive: true });
    preference.addEventListener('change', syncPreference);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerleave', leave);
      preference.removeEventListener('change', syncPreference);
      container.removeAttribute('data-parallax');
      imageLayer.style.removeProperty('--portrait-x');
      imageLayer.style.removeProperty('--portrait-y');
    };
  }, []);

  return (
    <div className="doctor-portrait" ref={portrait} data-section-visual>
      <div className="doctor-photo-motion">
        <Image
          src={doctor.photo}
          alt={`${doctor.name}, ${locale === 'en' ? 'fictional dentist portrait' : 'демонстрационный портрет врача'}`}
          fill
          sizes="(max-width: 650px) 38vw, (max-width: 980px) 30vw, 32vw"
          className="doctor-photo"
        />
      </div>
      <span className="doctor-experience">{doctor.experience}</span>
    </div>
  );
}

export default function DoctorsSection({ onSelectDoctor, onConsultation }) {
  const { locale, t } = useLocale();
  const localizedDoctors = locale === 'en' ? doctors.map((doctor, index) => ({
    ...doctor,
    name: ['Alexander Vetrov', 'Mikhail Orlov', 'Anna Belova'][index],
    specialty: ['Dental surgeon & implantologist', 'Prosthodontist', 'General dentist'][index],
    experience: ['12 years of practice', '9 years of practice', '7 years of practice'][index],
    description: [
      'Alexander Vetrov is a dental surgeon and implantologist. This demonstration profile focuses on replacing missing teeth and planning surgical care. The dentist, portrait, biography and 12 years of experience are fictional template content.',
      'Mikhail Orlov is a prosthodontist. This demonstration profile focuses on crowns, veneers and dental prosthetics. The dentist, portrait, biography and 9 years of experience are fictional template content.',
      'Anna Belova is a general dentist. This demonstration profile focuses on prevention, cavity treatment and tooth restoration. The dentist, portrait, biography and 7 years of experience are fictional template content.',
    ][index],
  })) : doctors;
  const section = useRef(null);

  useEffect(() => {
    const element = section.current;
    const preference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let visible = false;
    let frame = null;

    function update() {
      frame = null;
      if (!visible || !preference.matches) return;
      const bounds = element.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - bounds.top - bounds.height / 2) / innerHeight));
      element.style.setProperty('--doctors-depth', `${progress * 22}px`);
    }

    function schedule() {
      if (visible && preference.matches && frame === null) frame = requestAnimationFrame(update);
    }

    function syncPreference() {
      if (preference.matches) schedule();
      else element.style.removeProperty('--doctors-depth');
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(element);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    preference.addEventListener('change', syncPreference);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', syncPreference);
      element.style.removeProperty('--doctors-depth');
    };
  }, []);

  return translateMarkup((
    <section className="home-screen home-doctors" id="doctors" aria-labelledby="doctors-title" ref={section}>
      <div className="home-section-inner">
        <div className="doctors-heading-row">
          <h2 className="home-display" id="doctors-title" data-section-reveal>Наши врачи</h2>
          <p className="home-intro-text" data-section-reveal>
            Лечение начинается со знакомства. Выберите специалиста, чтобы узнать о его подходе.
          </p>
        </div>

        <div className="doctors-lineup">
          {localizedDoctors.map((doctor) => (
            <article className={`doctor-profile doctor-profile--${doctor.id}`} key={doctor.id} data-section-reveal>
              <DoctorPortrait doctor={doctor} />
              <div className="doctor-details">
                <h3>{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.specialty}</p>
                <div className="doctor-actions">
                  <button className="doctor-booking" type="button" onClick={() => onConsultation()} aria-label={`${t('Записаться')} — ${doctor.name}`}>
                    Записаться <DoctorArrow />
                  </button>
                  <button className="doctor-biography" type="button" onClick={() => onSelectDoctor(doctor)} aria-label={`${t('О враче')} — ${doctor.name}`}>
                    О враче
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="doctors-demo-note" data-section-reveal>
          Вымышленные специалисты. Демонстрация шаблона.
        </p>
      </div>
    </section>
  ), t);
}
