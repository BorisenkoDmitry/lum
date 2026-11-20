'use client';

import { Fragment, cloneElement, createContext, isValidElement, useContext, useMemo } from 'react';
import { englishMessages } from './messages';

const LocaleContext = createContext({ locale: 'ru', t: (value) => value });

export default function LocaleProvider({ locale, children }) {
  const value = useMemo(() => ({ locale, t: (key, params = {}) => {
    let result = locale === 'en' ? englishMessages[key] ?? key : key;
    for (const [name, value] of Object.entries(params)) result = result.replaceAll(`{${name}}`, String(value));
    return result;
  } }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }

// Source-language UI strings are translation keys. Components translate their
// host markup, while service/doctor records are localized separately by ID.
export function translateMarkup(node, t) {
  if (typeof node === 'string') {
    const [, before, text, after] = node.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return before + t(text.replace(/\s+/g, ' ')) + after;
  }
  if (Array.isArray(node)) return node.map((child, index) => {
    const translated = translateMarkup(child, t);
    return isValidElement(translated) && translated.key === null ? cloneElement(translated, { key: index }) : translated;
  });
  if (!isValidElement(node)) return node;
  if (node.type === Fragment) return cloneElement(node, {}, translateMarkup(node.props.children, t));
  if (typeof node.type !== 'string') return node;
  const props = {};
  for (const name of ['aria-label', 'aria-roledescription', 'title', 'placeholder', 'alt']) {
    if (typeof node.props[name] === 'string') props[name] = t(node.props[name]);
  }
  return cloneElement(node, props, translateMarkup(node.props.children, t));
}
