import moment from 'moment';

export class Utils {
  static format_number(num: number): string {
    return ( !isNaN(num) ? Number(num).toFixed(2) : num.toString() );
  }

  /**
   * Treats a date as if it were a UTC date; drop the timezone, or assume the
   * timezone is +00:00. This is helpful as clients that do `new Date('some
   * date')` always get the date in their local timezone and then horrible things
   * happen.
   * @param {Date} date - The date object
   * @returns {Date} - A UTC date.
  */
  static treatDateAsUTC = (date: Date): Date => moment(date).utcOffset(0).toDate();
}
