import RootDocument from '../RootDocument';
import { siteMetadata } from '../site-metadata';
export const metadata = siteMetadata('ru');
export default function RussianLayout({ children }) { return <RootDocument locale="ru">{children}</RootDocument>; }
