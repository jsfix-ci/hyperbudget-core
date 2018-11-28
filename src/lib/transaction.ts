import { Category } from '../types/category';

import moment from 'moment';
import sha1 from 'sha1';
import { DateFormat } from './enums';

export class Transaction {
  readonly identifier: string;
  readonly date: Date;
  readonly type: string = '';
  readonly accountSortCode: string = '';
  readonly accountNumber: string = '';
  readonly description: string = '';
  readonly debitAmount: number = 0;
  readonly creditAmount: number = 0;
  readonly source: string = 'Unknown';
  readonly accountBalance: number = null;
  calculatedMonth: string = '';
  readonly calendarMonth: string = '';
  categories: Category[] = [];
  [key: string]: any;

  constructor(
    record: {
      date: string,
      type?: string,
      accountSortCode?: string,
      accountNumber?: string,
      description?: string,
      debitAmount?: number,
      creditAmount?: number,
      source?: string,
      accountBalance?: number,
      calculatedMonth?: string,
      calendarMonth?: string,
      categories?: Category[],
      identifier?: string,
      [k: string]: any,
    }
  ) {
    let _validators: { [ idx: string ]: any } = {
      'debitAmount' : (val: any) => (!val || !isNaN(val)),
      'creditAmount': (val: any) => (!val || !isNaN(val)),
      'accountBalance'      : (val: any) => !isNaN(val),
    };

    let _filters: { [idx: string]: any } = {
      'debitAmount': (val: string | number) => Number(val),
      'creditAmount': (val: string | number) => Number(val),
      'date': (val: string) => this.parse_date(val),
    };

    if (record.source) {
      this.source = record.source;
    }

    Object.keys(record).forEach((key: string) => {
      this[key] = record[key];

      if (_filters[key]) {
        this[key] = _filters[key](this[key]);
      }
      if (_validators[key]) {
        if (!_validators[key](this[key])) {
          throw new Error(`Property '${key}' (${this[key]}) fails validation: ${_validators[key]} ${this} ${record}`);
        }
      }
    });

    this.calendarMonth = moment(this.date).utc().format('YYYYMM');

    if (!this.calculatedMonth) {
      this.calculatedMonth = this.calendarMonth;
    }

    if (!this.identifier) {
      this.identifier  = this.build_identifier();
    }
  }

  txn_amount() {
    return this.creditAmount - this.debitAmount;
  }

  private parse_date(date: string): Date {
    let src = this.source;
    let format: string;

    if (!!date.match(/\d{3}-\d{2}-\d{2}T/)) {
      return moment(date).toDate();
    }

    format = Transaction._extract_date_format_based_on_source(src);

    return moment(date + " Z", format).toDate();
  }

  private static _extract_date_format_based_on_source(src: string): string {
    let format: string;

    switch (src) {
      case 'FairFX Corp':
      format = DateFormat.Sane;
      break;
      default:
      format = DateFormat.Europe;
      break;
    }

    return format;
  }

  /*
   * Assuming each { Date, Description, Amount } represents a unique
   * transaction, generate an identifying sha1 hash (Date + Description +
   * Amount + Source + If available, the account balance).  In reality, there
   * is no way to guarantee the uniqueness of a transaction.
   */
  private build_identifier(): string {
    return sha1(this.date.getTime() + this.description + this.txn_amount() + this.source + (this.accountBalance ? this.accountBalance : '')).toString();
  }
}
