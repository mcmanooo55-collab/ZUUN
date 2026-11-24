import { pages } from './content.js';

// Keep direct /index.html requests and in-app routing in agreement.
export function readRoute(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const lang = segments[0] === 'en' ? 'en' : 'ar';
  if (segments[0] === 'ar' || segments[0] === 'en') segments.shift();
  const slug = segments.length === 1 && segments[0] === 'index.html' ? '' : segments[0] || '';
  const page = segments.length < 2 ? pages.find(item => item.path === slug) : undefined;
  return { lang, page };
}
