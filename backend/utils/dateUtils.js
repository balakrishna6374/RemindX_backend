export const normalizeToLocalMidnight = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) throw new Error('Invalid Date input');
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

export const getDaysRemaining = (targetDate, referenceDate = new Date()) => {
  const target = normalizeToLocalMidnight(targetDate);
  const ref = normalizeToLocalMidnight(referenceDate);
  const diffMs = target.getTime() - ref.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const isToday = (targetDate, referenceDate = new Date()) => {
  return getDaysRemaining(targetDate, referenceDate) === 0;
};

export const isTomorrow = (targetDate, referenceDate = new Date()) => {
  return getDaysRemaining(targetDate, referenceDate) === 1;
};

export const isPast = (targetDate, referenceDate = new Date()) => {
  return getDaysRemaining(targetDate, referenceDate) < 0;
};

export const getEventStatus = (eventDate, referenceDate = new Date()) => {
  const days = getDaysRemaining(eventDate, referenceDate);
  if (days < 0) return 'EXPIRED';
  if (days === 0) return 'DUE_TODAY';
  if (days <= 3) return 'DUE_SOON';
  return 'UPCOMING';
};

export const formatDateDisplay = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};
