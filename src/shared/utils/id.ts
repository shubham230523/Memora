/**
 * ID Generation Abstraction.
 * In production, we might use uuid or nanoid.
 * For now, simple implementation.
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};
