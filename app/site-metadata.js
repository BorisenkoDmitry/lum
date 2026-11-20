export function siteMetadata(locale) {
  const english = locale === 'en';
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'),
    title: english ? 'Lum — family dentistry | Dental care, implants & veneers' : 'Люм — стоматология для всей семьи | Лечение, имплантация и виниры',
    description: english ? 'Dental care at Lum: cavity treatment, implants, ceramic veneers, braces and professional cleaning. Meet our dentists and explore treatment options.' : 'Стоматология Люм: лечение кариеса, имплантация зубов, виниры, брекеты и профессиональная гигиена. Познакомьтесь с врачами и выберите услугу.',
    alternates: { canonical: english ? '/en' : '/', languages: { ru: '/', en: '/en', 'x-default': '/' } },
    icons: { icon: 'data:,' },
  };
}
