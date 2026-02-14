export const maskEmail = (email: string): string => {
  const emailRegex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+)\.([a-zA-Z0-9._-]+)/;
  const match = email.match(emailRegex);

  if (!match) return email; // Если email не найден, возвращаем исходную строку

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, localPart, domain, tld] = match;

  const maskedLocal =
    localPart.length > 2
      ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart.slice(-1)
      : '*'.repeat(localPart.length);

  const maskedDomain =
    domain.length > 2
      ? domain[0] + '*'.repeat(domain.length - 2) + domain.slice(-1)
      : '*'.repeat(domain.length);

  return `${maskedLocal}@${maskedDomain}.${tld}`;
};
