import { useEffect } from 'react';

export const usePageTitle = (pageTitle?: string) => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — Shorty URL` : 'Shorty URL';
    return () => {
      document.title = 'Shorty URL';
    };
  }, [pageTitle]);
};
