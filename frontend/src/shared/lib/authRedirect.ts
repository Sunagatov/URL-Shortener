const PUBLIC_PATHS = new Set(['/', '/signin', '/signup']);

export const shouldRedirectToSignIn = (pathname: string): boolean => {
  return !PUBLIC_PATHS.has(pathname);
};

export const redirectToSignIn = (): void => {
  if (shouldRedirectToSignIn(window.location.pathname)) {
    window.location.replace('/signin');
  }
};
