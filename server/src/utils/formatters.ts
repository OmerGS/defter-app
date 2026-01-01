export const formatters = {
  /**
   * Sanitizes and standardizes phone numbers to International format (E.164).
   * Handles France (+33) default and preserves International/Turkey (+90) formats.
   * * Examples:
   * - "06 12 34 56 78"  -> "+33612345678"
   * - "+90 532 123 45"  -> "+9053212345"
   * - "0090 532..."     -> "+90532..."
   */
  sanitizePhone: (phone: string): string => {
    if (!phone) return '';

    let clean = phone.replace(/[^0-9+]/g, '');

    if (clean.startsWith('00')) {
      return '+' + clean.slice(2);
    }

    if (clean.startsWith('+')) {
      return clean;
    }

    if (clean.startsWith('0')) {
      return '+33' + clean.slice(1);
    }

    return '+' + clean;
  },

  /**
   * Formats a price for display or documents (e.g., 25.00).
   */
  formatCurrency: (amount: number | string): string => {
    return Number(amount).toFixed(2);
  }
};