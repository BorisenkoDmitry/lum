import RootDocument from '../RootDocument';
import { siteMetadata } from '../site-metadata';
export const metadata = siteMetadata('en');
export default function EnglishLayout({ children }) { return <RootDocument locale="en">{children}</RootDocument>; }
