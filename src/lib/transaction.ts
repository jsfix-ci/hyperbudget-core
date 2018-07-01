import { Category } from '../types/category';

import moment from 'moment';
import sha1 from 'sha1';
import { Options } from './options';

export class Transaction {
  readonly identifier: string;
  readonly txn_date: Date;
  readonly txn_type: string = '';
  readonly acc_sortcode: string = '';
  readonly acc_number: string = '';
  readonly txn_desc: string = '';
  readonly txn_amount_debit: number = 0;
  readonly txn_amount_credit: number = 0;
  readonly txn_src: string = 'Unknown';
  readonly acc_balance: number = 0;
  month: string = '';
  readonly org_month: string = '';
  categories: Category[] = [];
  [key: string]: any;

  constructor(
    record: {
      txn_date: string,
      txn_type?: string,
      acc_sortcode?: string,
      acc_number?: string,
      txn_desc?: string,
      txn_amount_debit?: number,
      txn_amount_credit?: number,
      txn_src?: string,
      acc_balance?: number,
      month?: string,
      org_month?: string,
      categories?: Category[],
      identifier?: string,
      [k: string]: any,
    }
  ) {
    let _validators: { [ idx: string ]: any } = {
      'txn_amount_debit' : function(val: any) { return (!val || !isNaN(val)); },
      'txn_amount_credit': function(val: any) { return (!val || !isNaN(val)); },
      'acc_balance'      : function(val: any) { return !isNaN(val); },
    };

    let _filters: { [idx: string]: any } = {
      'txn_amount_debit': function(val: string | number) { return Number(val); },
      'txn_amount_credit': function(val: string | number) { return Number(val); },
      'txn_date': function(val: string) { return this._parse_date(val); }.bind(this),
    };

    if (record.txn_src) {
      this.txn_src = record.txn_src;
    }

    Object.keys(record).forEach(function(key: string) {
      this[key] = record[key];

      if (_filters[key]) {
        this[key] = _filters[key](this[key]);
      }
      if (_validators[key]) {
        if (!_validators[key](this[key])) {
          throw new Error(`Property '${key}' (${this[key]}) fails validation: ${_validators[key]} ${this} ${record}`);
        }
      }
    }.bind(this));

    this.org_month = moment(this.txn_date).format('YYYYMM');

    if (!this.month) {
      this.month = this.org_month;
    }

    this.identifier  = this._build_identifier();
  }

  txn_amount() {
    return this.txn_amount_credit - this.txn_amount_debit;
  }

  private _parse_date(txn_date: string): Date {
    let src = this.txn_src;
    let format: string;

    format = Transaction._extract_date_format_based_on_source(src);

    return moment(txn_date, format).toDate();
  }

  private static _extract_date_format_based_on_source(src: string): string {
    let format: string;

    switch (src) {
      case 'FairFX Corp':
      format = Options.DATE_FORMAT_SANE;
      break;
      default:
      format = Options.DATE_FORMAT_EUROPE;
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
  private _build_identifier(): string {
    return sha1(this.txn_date.getTime() + this.txn_desc + this.txn_amount() + this.txn_src + (this.acc_balance ? this.acc_balance : '')).toString();
  }
}
