import { Transaction } from './transaction';
import { CSVParserManager } from './manager/csvparsermanager';

export type ReportOptionsType = { unique?: boolean };
export type ReportFilter = {
  month?: string,
};

export interface Report {
  transactions: Transaction[];
  transactionsInCalendarMonth: Transaction[];
  unfilteredTransactions: Transaction[];

  filter(filter: ReportFilter): void;
  filterMonth(month: string): void;
  applyFilter(): void;
  resetFilter(): void;

  addTransactions(transactions: Transaction[]): void;
};

class ReportImpl implements Report {
  transactions: Transaction[];
  transactionsInCalendarMonth: Transaction[];
  unfilteredTransactions: Transaction[];

  private reportFilter: ReportFilter;

  constructor() {
    this.transactions = [];
    this.transactionsInCalendarMonth = [];
    this.unfilteredTransactions = [];
    this.reportFilter = {};
  }

  addTransactions(transactions: Transaction[]) {
    this.unfilteredTransactions = this.unfilteredTransactions.concat(transactions);
    this.applyFilter();
  }

  resetFilter(): void {
    this.transactions = [...this.unfilteredTransactions];
  }

  filter(filter: ReportFilter): void {
    this.reportFilter = filter;
    this.applyFilter();
  }

  filterMonth(month: string): void {
    this.filter({ month: month });
  }

  applyFilter(): void {
    this.resetFilter();

    if (this.reportFilter.month) {
      this.transactionsInCalendarMonth = this.unfilteredTransactions.filter(txn => txn.calendarMonth === this.reportFilter.month);
      this.transactions = this.unfilteredTransactions.filter(txn => txn.calculatedMonth === this.reportFilter.month);
    }
  }
}

export class ReportFactory {
  private _report: ReportImpl;
  private options: ReportOptionsType;
  private txnSeenIdentifierMap: { [key: string]: boolean } = {};

  constructor(options?: ReportOptionsType) {
    this.options = options || {};
    this._report = new ReportImpl();
  }

  get report(): Report {
    return this._report;
  }

  fromCSV(csv_text: string, type: string): Promise<void> {
    return CSVParserManager.parseCSVFile(csv_text, type).then((records: any[]) => {
      return this.addRecords(records);
    });
  }

  fromRecords(records: any[]): Promise<void> {
    return this.addRecords(records);
  }

  addRecords(records: any[]): Promise<void> {
    let transactions: Transaction[] = [];

    records.forEach((record: any) => {
      let txn:Transaction = new Transaction(record);

      //unique only
      if (!this.options.unique || !this.txnSeenIdentifierMap[txn.identifier]) {
        transactions.push(txn);
      }

      this.txnSeenIdentifierMap[txn.identifier] = true;
    });

    this.report.addTransactions(transactions);

    return new Promise((resolve, reject) => resolve());
  }
}

export default ReportFactory;
