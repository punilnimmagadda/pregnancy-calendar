/**
 * @description Parses a date string in 'YYYY-MM-DD' format and returns a Date object
 * * If the input is empty, it returns today's date at midnight.
 *
 * @param yyyyMmDd Date string in 'YYYY-MM-DD' format
 * @returns Date object representing the local date at midnight
 */
export const parseLocalDate = (yyyyMmDd?: string): Date => {
  if (!yyyyMmDd) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  const [year, month, day] = yyyyMmDd.split('-').map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }

  return new Date(year, month - 1, day); // Local midnight
};
