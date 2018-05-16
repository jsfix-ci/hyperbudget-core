import * as path from 'path';

import { Transaction } from './transaction';
import { CSVParserManager } from './manager/csvparsermanager';
import { Categoriser } from './categoriser';

export type ReportOptionsType = { unique_only?: boolean };

export interface Report {
  transactions: Transaction[];
  transactions_org: Transaction[];

  filter_month(month: string): void;
};

class ReportImpl implements Report {
  transactions: Transaction[];
  transactions_org: Transaction[];

  constructor() {
    this.transactions = [];
    this.transactions_org = [];
  }

  filter_month(month: string): void {
    if (!this.transactions) {
      throw new Error ("No transactions yet");
    }

    this.transactions_org = this.transactions.filter(txn => txn.org_month === month);
    this.transactions = this.transactions.filter(txn => txn.month === month);
  }
}

export class ReportFactory {
  private _report: ReportImpl;
  private options: ReportOptionsType;

  constructor(options?: ReportOptionsType) {
    this.options = options || {};
    this._report = new ReportImpl();
  }

  get report(): Report {
    return this._report;
  }

  set report(r) {
    this._report = r;
  }

  from_csv(csv_text: string, type: string): Promise<void> {
    return CSVParserManager.parseCSVFile(csv_text, type).then(function(records: any){
      return this.add_records(records);
    }.bind(this));
  }

  from_records(records: any): Promise<void> {
    return this.add_records(records);
  }

  add_records(records: any): Promise<void> {
    let transactions: Transaction[] = [];
    let txnSeenIdentifierMap: { [key: string]: boolean } = {};

    records.forEach(function(record: any) {
      let txn:Transaction = new Transaction(record);

      //unique only
      if (!this.options.unique_only || !txnSeenIdentifierMap[txn.identifier]) {
        transactions.push(txn);
      }

      txnSeenIdentifierMap[txn.identifier] = true;
    }.bind(this));

    this.report.transactions = this.report.transactions.concat (transactions);

    return new Promise((resolve, reject) => resolve());
  }
}

export default ReportFactory;
