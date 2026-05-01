export function maskEmailAddress(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  const visibleLocal = localPart.slice(0, 2);
  const hiddenLocal = '•'.repeat(Math.max(localPart.length - visibleLocal.length, 1));
  const [domainName, ...domainTail] = domain.split('.');
  const visibleDomain = domainName.slice(0, 1);
  const hiddenDomain = '•'.repeat(Math.max(domainName.length - visibleDomain.length, 1));

  return `${visibleLocal}${hiddenLocal}@${visibleDomain}${hiddenDomain}${domainTail.length ? `.${domainTail.join('.')}` : ''}`;
}
