export const formatISO = (date: Date = new Date()): string => {
  return date.toISOString();
};

export const parseISO = (isoString: string): Date => {
  return new Date(isoString);
};

export const isRecent = (date: Date, days: number = 7): boolean => {
  const diff = Date.now() - date.getTime();
  return diff < days * 24 * 60 * 60 * 1000;
};
