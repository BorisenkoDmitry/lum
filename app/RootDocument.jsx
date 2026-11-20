import '@fontsource/inter/cyrillic-400.css';
import '@fontsource/inter/cyrillic-500.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/roboto-condensed/cyrillic-800.css';
import '@fontsource/roboto-condensed/latin-800.css';
import './globals.css';
import './home-sections.css';
import './doctors.css';
import './shared-tooth.css';
import './reviews-booking.css';
import './language.css';
import './hero-reference.css';
import './catalog-glass.css';
import './site-typography.css';
import LocaleProvider from '../components/LocaleProvider';

export default function RootDocument({ children, locale }) {
  return <html lang={locale}><body><LocaleProvider locale={locale}>{children}</LocaleProvider></body></html>;
}
