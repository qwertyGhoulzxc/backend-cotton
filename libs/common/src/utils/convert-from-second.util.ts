function pluralize(unit: string, value: number): string {
  return value === 1 ? unit : unit + 's';
}

export function convertSecondsToReadableFormat(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ${pluralize('second', seconds)}`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${pluralize('minute', minutes)}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${pluralize('hour', hours)}`;
  } else if (seconds < 30 * 86400) {
    const days = Math.floor(seconds / 86400);
    return `${days} ${pluralize('day', days)}`;
  } else if (seconds < 365 * 86400) {
    const months = Math.floor(seconds / (30 * 86400));
    return `${months} ${pluralize('month', months)}`;
  } else {
    const years = Math.floor(seconds / (365 * 86400));
    return `${years} ${pluralize('year', years)}`;
  }
}
