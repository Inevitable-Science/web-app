// src/hooks/useFormatDaysAndHours.js
import { useMemo } from 'react';

/**
 * A custom hook that converts seconds into a string of days and hours.
 * @param {number | null | undefined} totalSeconds 
 * @returns {string} Formatted string e.g., "5 days, 14 hours"
 */
export const useFormatDaysAndHours = (totalSeconds: number) => {
  const formattedDuration = useMemo(() => {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) {
      return '0 hours';
    }

    const wholeSeconds = Math.floor(totalSeconds);
    
    const days = Math.floor(wholeSeconds / 86400);
    const hours = Math.floor((wholeSeconds % 86400) / 3600);

    const dayString = `${days} day${days > 1 ? 's' : ''}`;
    const hourString = `${hours} hour${hours !== 1 ? 's' : ''}`;

    if (days > 0) {
      return `${dayString}, ${hourString}`;
    }
    
    // If there are no days, just return the hours
    return hourString;
  }, [totalSeconds]);

  return formattedDuration;
};