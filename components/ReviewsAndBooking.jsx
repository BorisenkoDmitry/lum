'use client';

import { useId, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';
import ReviewsStory from './ReviewsStory';

const content = {
  ru: {
    bookingTitle: 'Начнём\nсо знакомства.',
    bookingDescription: 'Расскажите, как к вам обращаться. Первый визит можно начать с вопросов и спокойного разговора с врачом.',
    formTitle: 'Заявка на консультацию',
    nameLabel: 'Ваше имя',
    namePlaceholder: 'Как к вам обращаться?',
    phoneLabel: 'Номер телефона',
    phonePlaceholder: '+7 (___) ___-__-__',
    phoneHint: 'От 10 до 15 цифр. Можно указать код страны.',
    submit: 'Оставить заявку',
    demoForm: 'Демонстрационная форма. Отправка в клинику отключена.',
    successTitle: 'Форма заполнена верно',
    success: 'Это демонстрация. Имя и телефон никуда не отправлены. Для настоящей записи нужно подключить форму к клинике.',
    errors: {
      nameRequired: 'Укажите, как к вам обращаться.',
      phoneRequired: 'Укажите номер телефона.',
      phoneLength: 'Проверьте номер — нужно от 10 до 15 цифр.',
      phoneFormat: 'В номере допустимы цифры, пробелы, скобки, плюс и дефис.',
    },
  },
  en: {
    bookingTitle: 'Let’s get\nto know you.',
    bookingDescription: 'Tell us what to call you. Your first visit can begin with questions and a relaxed conversation with a dentist.',
    formTitle: 'Request a consultation',
    nameLabel: 'Your name',
    namePlaceholder: 'What should we call you?',
    phoneLabel: 'Phone number',
    phonePlaceholder: '+_ ___ ___ ____',
    phoneHint: 'Use 10 to 15 digits, including the country code if needed.',
    submit: 'Request a consultation',
    demoForm: 'Demo form. Sending requests to a clinic is disabled.',
    successTitle: 'The form looks good',
    success: 'This is a demonstration. Your name and phone number have not been sent anywhere. The form needs to be connected to a clinic before accepting bookings.',
    errors: {
      nameRequired: 'Please tell us what to call you.',
      phoneRequired: 'Please enter your phone number.',
      phoneLength: 'Check your number — it should contain 10 to 15 digits.',
      phoneFormat: 'Use digits, spaces, brackets, a plus sign or a hyphen.',
    },
  },
};

function ReviewArrow({ previous = false }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={previous ? 'M20 12H5m6 6-6-6 6-6' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Booking({ copy }) {
  const prefix = useId();
  const form = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function showRequiredError(event, field) {
    event.preventDefault();
    setSubmitted(false);
    setErrors((current) => ({ ...current, [field]: field === 'patientName' ? 'nameRequired' : 'phoneRequired' }));
    form.current.querySelector(':invalid')?.focus();
  }

  function clearFeedback(field) {
    setSubmitted(false);
    setErrors((current) => ({ ...current, [field]: null }));
  }

  function submit(event) {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    const name = fields.namedItem('patientName');
    const phone = fields.namedItem('patientPhone');
    const digits = phone.value.replace(/\D/g, '');
    const nextErrors = {};
    if (!name.value.trim()) nextErrors.patientName = 'nameRequired';
    if (!/^[+\d()\s.-]+$/.test(phone.value)) nextErrors.patientPhone = 'phoneFormat';
    else if (digits.length < 10 || digits.length > 15) nextErrors.patientPhone = 'phoneLength';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitted(false);
      fields.namedItem(nextErrors.patientName ? 'patientName' : 'patientPhone').focus();
      return;
    }
    event.currentTarget.reset();
    setSubmitted(true);
  }

  return (
    <section className="home-screen home-appointment" id="appointment" aria-labelledby={`${prefix}-title`}>
      <div className="home-section-inner appointment-composition">
        <div className="appointment-introduction">
          <h2 className="appointment-heading" id={`${prefix}-title`} data-section-reveal>{copy.bookingTitle}</h2>
          <p className="appointment-description" data-section-reveal>{copy.bookingDescription}</p>
        </div>

        <form className="appointment-form" ref={form} onSubmit={submit} aria-labelledby={`${prefix}-form-title`} data-section-reveal>
          <h3 id={`${prefix}-form-title`}>{copy.formTitle}</h3>
          <div className="appointment-field">
            <label htmlFor={`${prefix}-name`}>{copy.nameLabel}</label>
            <input
              id={`${prefix}-name`}
              name="patientName"
              type="text"
              autoComplete="name"
              placeholder={copy.namePlaceholder}
              required
              maxLength={100}
              aria-invalid={Boolean(errors.patientName)}
              aria-describedby={errors.patientName ? `${prefix}-name-error` : undefined}
              onInvalid={(event) => showRequiredError(event, 'patientName')}
              onChange={() => clearFeedback('patientName')}
            />
            {errors.patientName && <p className="appointment-field-error" id={`${prefix}-name-error`} role="alert">{copy.errors[errors.patientName]}</p>}
          </div>

          <div className="appointment-field">
            <label htmlFor={`${prefix}-phone`}>{copy.phoneLabel}</label>
            <input
              id={`${prefix}-phone`}
              name="patientPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={copy.phonePlaceholder}
              required
              maxLength={30}
              aria-invalid={Boolean(errors.patientPhone)}
              aria-describedby={`${prefix}-phone-hint${errors.patientPhone ? ` ${prefix}-phone-error` : ''}`}
              onInvalid={(event) => showRequiredError(event, 'patientPhone')}
              onChange={() => clearFeedback('patientPhone')}
            />
            <p className="appointment-field-hint" id={`${prefix}-phone-hint`}>{copy.phoneHint}</p>
            {errors.patientPhone && <p className="appointment-field-error" id={`${prefix}-phone-error`} role="alert">{copy.errors[errors.patientPhone]}</p>}
          </div>

          <button type="submit" className="appointment-submit">{copy.submit}<ReviewArrow /></button>
          <p className="appointment-demo-note">{copy.demoForm}</p>

          {submitted && (
            <div className="appointment-success" role="status">
              <span className="appointment-success-mark" aria-hidden="true">✓</span>
              <div><p className="appointment-success-title">{copy.successTitle}</p><p>{copy.success}</p></div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default function ReviewsAndBooking() {
  const { locale } = useLocale();
  const copy = content[locale] || content.ru;
  return <><ReviewsStory /><Booking copy={copy} /></>;
}
