'use client';

import { useLocale } from './LocaleProvider';

const copy = {
  ru: {
    title: 'Соблюдаем международный протокол на каждом этапе лечения',
    note: 'Демонстрационный контекст. Протоколы, лицензии и документы необходимо подтвердить для реальной клиники.',
    details: 'Подробнее',
    features: [
      { id: 'load', name: 'Протокол немедленной нагрузки', text: 'Несъёмный армированный протез: от установки до восстановления после имплантации.', description: 'Демонстрация раздела о немедленной нагрузке. Здесь клиника описывает этапы установки несъёмного армированного протеза, подготовку и последующее восстановление после имплантации. Конкретный план определяют индивидуально после диагностики.' },
      { id: 'sedation', name: 'Седация и анестезия', text: 'Варианты обезболивания и контроль состояния пациента во время имплантации.', description: 'Демонстрация раздела об анестезии и седации. Здесь размещают сведения об участии анестезиолога, наблюдении за состоянием пациента и необходимых лицензиях. Данные о методах и лицензиях заполняет и проверяет реальная клиника.' },
      { id: 'lab', name: 'Зуботехническая лаборатория', text: 'Слепки, определение прикуса, моделирование и изготовление протезов в клинике.', description: 'Демонстрация раздела о собственной зуботехнической лаборатории. В нём можно описать снятие слепков, определение прикуса, моделирование и изготовление протезов. Наличие лаборатории и доступные работы необходимо подтвердить для реальной клиники.' },
      { id: 'documents', name: 'Больничный и налоговый вычет', text: 'Документы для электронного больничного и оформления налогового вычета.', description: 'Демонстрация раздела о документах. Здесь клиника уточняет порядок подготовки документов для электронного больничного и оформления налогового вычета. Доступность документов и условия необходимо указать и проверить перед публикацией.' },
    ],
  },
  en: {
    title: 'We follow an international protocol at every stage of treatment',
    note: 'Demonstration content. Protocols, licences and documents must be verified for the actual clinic.',
    details: 'Learn more',
    features: [
      { id: 'load', name: 'Immediate loading protocol', text: 'A fixed reinforced prosthesis: from placement to recovery after implant treatment.', description: 'A demonstration of an immediate loading information section. The clinic can describe the stages of placing a fixed reinforced prosthesis, preparation and recovery after implant treatment. The individual plan is determined following diagnostic assessment.' },
      { id: 'sedation', name: 'Sedation and anaesthesia', text: 'Pain management options and monitoring during implant treatment.', description: 'A demonstration of a sedation and anaesthesia information section. It can cover the anaesthetist’s role, patient monitoring and relevant licences. Details of methods and licences must be supplied and verified by the actual clinic.' },
      { id: 'lab', name: 'Dental laboratory', text: 'Impressions, bite assessment, modelling and fabrication of prostheses at the clinic.', description: 'A demonstration of an in-house dental laboratory section. It can explain impressions, bite assessment, modelling and fabrication of prostheses. The laboratory and available services must be confirmed for the actual clinic.' },
      { id: 'documents', name: 'Sick leave and tax documents', text: 'Documents for electronic sick leave and a tax deduction application.', description: 'A demonstration of a documents information section. The clinic can explain how it prepares documents for electronic sick leave and tax deduction applications. Document availability and conditions must be supplied and verified before publication.' },
    ],
  },
};

function ProtocolIcon({ type }) {
  const paths = {
    load: <><path d="M4 15c0-5 3-9 8-9s8 4 8 9M5 15v4m5-7v7m4-7v7m5-4v4M4 20h16" /><path d="m9 4 3-2 3 2" /></>,
    sedation: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M7 11h3l2-4 2 8 2-4h2M9 22h6m-3-4v4" /></>,
    lab: <><path d="M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 15h8" /><path d="m17 5 1-2m2 6 2-1" /></>,
    documents: <><path d="M7 3h8l4 4v14H5V3h2m8 0v5h4M8 12h8m-8 4h4" /><path d="m14 17 2 2 4-4" /></>,
  };
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function ProtocolChapter({ hidden, onSelectService }) {
  const { locale } = useLocale();
  const content = copy[locale] || copy.ru;
  function side(items) {
    return <div className="protocol-side">{items.map(item => <article className="protocol-feature" key={item.id} data-care-item>
      <span className="protocol-icon"><ProtocolIcon type={item.id} /></span>
      <h3>{item.name}</h3><p>{item.text}</p>
      <button type="button" className="text-button protocol-details" aria-label={`${content.details}: ${item.name}`} onClick={() => onSelectService(item)}>{content.details}<span aria-hidden="true">↗</span></button>
    </article>)}</div>;
  }
  return <section className="home-screen home-protocol" id="protocol" data-care-panel="protocol" aria-labelledby="protocol-title" aria-hidden={hidden || undefined} inert={hidden || undefined}>
    <div className="home-section-inner protocol-composition">
      <h2 className="home-display protocol-heading" id="protocol-title" tabIndex={-1} data-care-item>{content.title}</h2>
      <div className="protocol-layout">
        {side(content.features.slice(0, 2))}
        <div className="protocol-tooth-slot" aria-hidden="true" />
        {side(content.features.slice(2))}
      </div>
      <p className="protocol-demo-note" data-care-item>{content.note}</p>
    </div>
  </section>;
}
