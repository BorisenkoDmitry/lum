import { englishGroups, localizeService } from './clinic-translations';

export const clinic = {
  name: 'Люм',
  tagline: 'Стоматология с заботой',
  bookingUrl: null,
};

export const consultation = {
  id: 'consultation',
  name: 'Консультация стоматолога',
  description: 'Знакомство с врачом, осмотр и обсуждение вопросов о здоровье зубов. После осмотра можно составить план дальнейших действий.',
  keywords: ['первый приём', 'осмотр', 'не знаю что выбрать', 'боль', 'болит зуб', 'стоматолог терапевт'],
};

export const catalogSuggestions = [
  { label: 'Гигиена', query: 'гигиена' },
  { label: 'Виниры', query: 'виниры' },
  { label: 'Имплантация', query: 'имплантация' },
  { label: 'Детям', query: 'детям' },
];

// Reference copy and prices are demonstration content, replace for each clinic.
export const featuredServices = [
  { id: 'checkup', name: 'CHECK-UP полости рта', price: '4 900 ₽', visual: 'care', group: 'diagnostics', description: 'Осмотр полости рта и обсуждение состояния зубов и дёсен с врачом.', keywords: ['чекап', 'check up', 'обследование'] },
  { id: 'osstem', name: 'Импланты Osstem', price: 'от 31 900 ₽', visual: 'restore', group: 'restoration', description: 'Имплантация с использованием системы Osstem. План и состав лечения определяют после диагностики.', keywords: ['осстем', 'osstem', 'имплантация'] },
  { id: 'implant-former', name: 'Имплантация + формирователь', price: 'от 21 900 ₽', visual: 'restore', group: 'restoration', description: 'Имплантация с установкой формирователя десны. Этапы и сроки согласовывают после осмотра.', keywords: ['имплантация', 'формирователь десны'] },
  { id: 'crowns', name: 'Коронки на зубы', price: 'от 53 900 ₽', visual: 'restore', group: 'restoration', description: 'Восстановление формы и функции зуба коронкой. Материал и подготовку зуба обсуждают с ортопедом.', keywords: ['коронка', 'протезирование'] },
  { id: 'veneers', name: 'Керамические виниры', price: 'от 58 500 ₽', visual: 'smile', group: 'aesthetics', description: 'Керамические накладки для изменения видимой поверхности зубов. Форму и оттенок подбирают вместе с врачом.', keywords: ['виниры', 'керамика', 'накладки'] },
  { id: 'caries', name: 'Лечение кариеса', price: 'от 8 800 ₽', visual: 'care', group: 'treatment', description: 'Удаление поражённых тканей и восстановление зуба пломбировочным материалом.', keywords: ['пломба', 'кариес', 'дырка в зубе'] },
  { id: 'extraction', name: 'Удаление простое и сложное', price: 'от 5 650 ₽', visual: 'care', group: 'surgery', description: 'Удаление зуба после осмотра и оценки возможности его сохранения. Метод зависит от положения и состояния зуба.', keywords: ['удалить зуб', 'удаление зуба'] },
  { id: 'hygiene', name: 'Гигиеническая чистка зубов', price: 'от 8 499 ₽', visual: 'care', group: 'prevention', description: 'Удаление зубных отложений, полировка и рекомендации по домашнему уходу.', keywords: ['профессиональная гигиена', 'чистка зубов', 'налёт'] },
  { id: 'braces', name: 'Металлические брекеты', price: 'от 36 900 ₽', visual: 'smile', group: 'bite', description: 'Брекет-система для коррекции положения зубов под наблюдением ортодонта.', keywords: ['брекеты', 'прикус', 'металлические'] },
];

// Patient-facing groups consolidate the reference site's dentistry categories.
// Technology names remain searchable within the relevant service.
export const serviceGroups = [
  {
    id: 'treatment',
    title: 'Лечение зубов',
    description: 'Кариес, каналы, лечение во сне',
    keywords: ['терапевтическая стоматология', 'терапия', 'здоровье'],
    services: [
      { id: 'caries', name: 'Лечение кариеса', description: 'Врач удаляет поражённые ткани и восстанавливает зуб пломбировочным материалом.', keywords: ['пломба', 'дырка в зубе', 'болит зуб', 'боль', 'кариес'] },
      { id: 'root-canals', name: 'Лечение каналов', description: 'Обработка корневых каналов при лечении пульпита и других заболеваний внутренних тканей зуба.', keywords: ['эндодонтия', 'пульпит', 'периодонтит', 'болит зуб', 'боль', 'нерв'] },
      { id: 'microscope', name: 'Лечение под микроскопом', description: 'Увеличение помогает врачу рассматривать детали зуба во время лечения.', keywords: ['лечение зубов под микроскопом', 'микроскоп', 'перелечивание каналов'] },
      { id: 'wisdom-treatment', name: 'Лечение зуба мудрости', description: 'Осмотр зуба мудрости и оценка возможности его лечения и сохранения.', keywords: ['восьмерка', 'восьмёрка', '8 зуб', 'сохранить зуб мудрости'] },
      { id: 'oral-mucosa', name: 'Лечение слизистой полости рта', description: 'Осмотр и лечение заболеваний слизистой, в том числе стоматита.', keywords: ['стоматит', 'язвочки', 'слизистая'] },
      { id: 'sleep-dentistry', name: 'Лечение зубов во сне', description: 'Лечение с участием анестезиологической команды. Возможность такого подхода обсуждают с врачом после оценки состояния здоровья.', keywords: ['седация', 'наркоз', 'медикаментозный сон', 'боюсь стоматолога', 'страх'] },
    ],
  },
  {
    id: 'prevention',
    title: 'Гигиена и дёсны',
    description: 'Профессиональный уход и пародонтология',
    keywords: ['профилактика', 'пародонтология', 'пародонтолог', 'здоровье'],
    services: [
      { id: 'hygiene', name: 'Профессиональная гигиена', description: 'Удаление зубных отложений и полировка поверхности зубов. Врач также может объяснить особенности домашнего ухода.', keywords: ['чистка зубов', 'налёт', 'зубной камень', 'air flow', 'airflow', 'ультразвук'] },
      { id: 'gums', name: 'Лечение дёсен', description: 'Оценка состояния дёсен и тканей вокруг зубов. План лечения зависит от причины воспаления и результатов осмотра.', keywords: ['пародонтит', 'гингивит', 'кровоточивость', 'кровоточат десны', 'воспаление десен'] },
      { id: 'splinting', name: 'Шинирование зубов', description: 'Объединение подвижных зубов специальной конструкцией по показаниям врача.', keywords: ['подвижность', 'шатаются зубы', 'шина'] },
    ],
  },
  {
    id: 'restoration',
    title: 'Восстановление зубов',
    description: 'Имплантация, коронки и протезы',
    keywords: ['ортопедия', 'протезирование', 'нет зуба', 'отсутствует зуб'],
    services: [
      { id: 'implant', name: 'Имплантация зубов', description: 'Восстановление отсутствующего зуба с опорой на имплантат. Систему и этапы лечения обсуждают после диагностики.', keywords: ['имплант', 'импланты', 'astra', 'астра', 'straumann', 'штрауман', 'implantium', 'имплантиум', 'anyridge', 'эниридж'] },
      { id: 'all-on-4', name: 'Все зубы на четырёх имплантах', description: 'Протезирование зубного ряда с опорой на четыре имплантата. Применимость метода определяет врач.', keywords: ['all on 4', 'all-on-4', 'все на 4', 'имплантация', 'полное отсутствие зубов'] },
      { id: 'all-on-6', name: 'Все зубы на шести имплантах', description: 'Восстановление зубного ряда конструкцией с опорой на шесть имплантатов.', keywords: ['all on 6', 'all-on-6', 'все на 6', 'имплантация', 'полное отсутствие зубов'] },
      { id: 'crowns', name: 'Коронки на зубы', description: 'Ортопедическая конструкция восстанавливает форму и жевательную поверхность зуба.', keywords: ['керамика', 'цирконий', 'металлокерамика', 'разрушен зуб', 'протезирование зубов'] },
      { id: 'dentures', name: 'Съёмные зубные протезы', description: 'Конструкции для восстановления нескольких отсутствующих зубов или зубного ряда.', keywords: ['нейлоновые протезы', 'акри фри', 'acry free', 'протезирование'] },
    ],
  },
  {
    id: 'aesthetics',
    title: 'Эстетика улыбки',
    description: 'Цвет, форма и реставрация',
    keywords: ['эстетическая стоматология', 'красота улыбки'],
    services: [
      { id: 'veneers', name: 'Виниры', description: 'Тонкие накладки для изменения видимой поверхности передних зубов. Форму, материал и подготовку зуба обсуждают с врачом.', keywords: ['e max', 'emax', 'керамические виниры', 'накладки'] },
      { id: 'whitening', name: 'Отбеливание зубов', description: 'Осветление зубов после осмотра и оценки состояния эмали. Способ и ожидаемый оттенок обсуждают на консультации.', keywords: ['zoom', 'flash', 'fläsh', 'зум', 'флеш', 'белые зубы'] },
      { id: 'art-restoration', name: 'Реставрация зубов', description: 'Восстановление формы и внешнего вида зуба с помощью реставрационного материала.', keywords: ['скол', 'сколотый зуб', 'художественная реставрация', 'композит'] },
    ],
  },
  {
    id: 'bite',
    title: 'Исправление прикуса',
    description: 'Брекеты, элайнеры и челюстной сустав',
    keywords: ['ортодонтия', 'ровные зубы', 'ортодонт'],
    services: [
      { id: 'orthodontist', name: 'Консультация ортодонта', description: 'Осмотр прикуса и обсуждение вариантов изменения положения зубов.', keywords: ['первичный приём ортодонта', 'кривые зубы'] },
      { id: 'braces', name: 'Брекеты', description: 'Несъёмная система для постепенного изменения положения зубов под наблюдением ортодонта.', keywords: ['брекет система', 'выравнивание зубов'] },
      { id: 'aligners', name: 'Элайнеры', description: 'Последовательность прозрачных кап для коррекции положения зубов по плану ортодонта.', keywords: ['капы', 'прозрачные каппы', 'выравнивание зубов'] },
      { id: 'gnathology', name: 'Челюстной сустав и гнатология', description: 'Оценка работы жевательных мышц, прикуса и височно-нижнечелюстного сустава.', keywords: ['гнатолог', 'внчс', 'щелкает челюсть', 'боль в челюсти', 'бруксизм'] },
    ],
  },
  {
    id: 'surgery',
    title: 'Удаление зубов',
    description: 'Хирургическая стоматология',
    keywords: ['хирургия', 'хирург', 'хирургическая стоматология'],
    services: [
      { id: 'extraction', name: 'Удаление зуба', description: 'Удаление зуба после осмотра и оценки возможности его сохранения.', keywords: ['удалить зуб', 'экстракция'] },
      { id: 'wisdom', name: 'Удаление зуба мудрости', description: 'Осмотр, диагностика и план удаления зуба мудрости с учётом его положения.', keywords: ['восьмерка', 'восьмёрка', '8 зуб', 'ретинированный', 'непрорезавшийся'] },
    ],
  },
  {
    id: 'children',
    title: 'Детская стоматология',
    description: 'Знакомство, лечение и уход',
    keywords: ['детям', 'ребёнок', 'ребенку', 'детский стоматолог', 'молочные зубы'],
    services: [
      { id: 'child-first-visit', name: 'Первое знакомство с врачом', description: 'Знакомство ребёнка со стоматологом и кабинетом в спокойном темпе.', keywords: ['адаптация', 'первый приём', 'консультация', 'страх'] },
      { id: 'child-caries', name: 'Лечение молочных зубов', description: 'Лечение кариеса молочных зубов с учётом возраста ребёнка.', keywords: ['детский кариес', 'пломба'] },
      { id: 'child-hygiene', name: 'Детская гигиена', description: 'Профессиональный уход за зубами и знакомство с домашней чисткой.', keywords: ['чистка ребенку', 'налёт', 'профилактика'] },
      { id: 'child-extraction', name: 'Удаление молочного зуба', description: 'Осмотр и удаление молочного зуба по показаниям детского стоматолога.', keywords: ['удалить молочный зуб', 'детское удаление'] },
      { id: 'child-orthodontics', name: 'Детская ортодонтия', description: 'Оценка развития прикуса и обсуждение вариантов коррекции положения зубов у ребёнка.', keywords: ['детский ортодонт', 'брекеты', 'элайнеры', 'капы', 'прикус'] },
      { id: 'frenulum', name: 'Пластика уздечки языка и губы', description: 'Коррекция уздечки после осмотра и оценки показаний к вмешательству.', keywords: ['подрезание уздечки', 'короткая уздечка'] },
    ],
  },
  {
    id: 'diagnostics',
    title: 'Диагностика и консультации',
    description: 'Осмотр, снимки и 3D-сканирование',
    keywords: ['обследование', 'диагностика зубов'],
    services: [
      consultation,
      { id: 'ct', name: 'КТ зубов', description: 'Объёмное рентгенологическое исследование зубов и окружающих тканей.', keywords: ['компьютерная томография', 'клкт', '3d снимок', 'томограф'] },
      { id: 'panoramic', name: 'Панорамный снимок', description: 'Обзорное рентгенологическое изображение зубных рядов.', keywords: ['оптг', 'ортопантомография', 'панорама'] },
      { id: 'cephalogram', name: 'Снимок для оценки прикуса', description: 'Телерентгенография для анализа соотношения челюстей и планирования ортодонтического лечения.', keywords: ['трг', 'телерентгенография'] },
      { id: 'dental-xray', name: 'Прицельный снимок зуба', description: 'Рентгенологическое изображение отдельного зуба и прилегающей области.', keywords: ['рентген', 'визиография', 'снимок зуба'] },
      { id: 'scan', name: '3D-сканирование зубов', description: 'Получение цифровой модели зубных рядов с помощью внутриротового сканера.', keywords: ['интраоральное сканирование', 'внутриротовой сканер', 'цифровой слепок'] },
      { id: 'image-analysis', name: 'Цифровой анализ снимков', description: 'Дополнительный программный анализ рентгенологических изображений. Результаты оценивает врач.', keywords: ['diagnocat', 'диагнокат', 'искусственный интеллект', 'расшифровка кт'] },
    ],
  },
];

export function normalizeSearch(value) {
  return value.toLocaleLowerCase('ru')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zа-я0-9]+/giu, ' ')
    .trim();
}

export function getClinicContent(locale = 'ru') {
  if (locale !== 'en') return { clinic, consultation, catalogSuggestions, featuredServices };
  return {
    clinic: { ...clinic, name: 'Lum', tagline: 'Dentistry with care' },
    consultation: localizeService(consultation, locale),
    featuredServices: featuredServices.map((item) => localizeService(item, locale)),
    catalogSuggestions: [
      { label: 'Hygiene', query: 'hygiene' }, { label: 'Veneers', query: 'veneers' },
      { label: 'Implants', query: 'implant' }, { label: 'Children', query: 'children' },
    ],
  };
}

export function findServiceGroups(query, locale = 'ru') {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  let catalog = serviceGroups.map((group) => {
    const featured = featuredServices.filter((item) => item.group === group.id);
    const services = group.services.map((service) => {
      const match = featured.find((item) => item.id === service.id);
      return match ? { ...service, ...match, keywords: [...service.keywords, ...match.keywords] } : service;
    });
    return { ...group, services: [...services, ...featured.filter((item) => !services.some((service) => service.id === item.id))] };
  });
  if (locale === 'en') catalog = catalog.map((group) => ({
    ...group, title: englishGroups[group.id][0], description: englishGroups[group.id][1],
    keywords: [...group.keywords, group.title], services: group.services.map((item) => localizeService(item, locale)),
  }));
  if (!words.length) return catalog;
  return catalog.map((group) => ({
    ...group,
    services: group.services.filter((service) => {
      const text = normalizeSearch([group.title, ...group.keywords, service.name, ...service.keywords].join(' '));
      return words.every((word) => text.includes(word));
    }),
  })).filter((group) => group.services.length);
}
