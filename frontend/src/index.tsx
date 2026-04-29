import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Providers } from '@/app/providers';

const CANONICAL_STYLESHEET_PATH = '/assets/app.css';

const ensureCanonicalStylesheet = () => {
  const stylesheets = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  );

  const canonicalLink = stylesheets.find((link) =>
    link.getAttribute('href')?.startsWith(CANONICAL_STYLESHEET_PATH),
  );

  for (const link of stylesheets) {
    const href = link.getAttribute('href');

    if (!href) {
      continue;
    }

    if (href.startsWith('/assets/index-') && href.endsWith('.css')) {
      link.remove();
    }
  }

  if (canonicalLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${CANONICAL_STYLESHEET_PATH}?v=${Date.now()}`;
  document.head.appendChild(link);
};

ensureCanonicalStylesheet();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>
);
