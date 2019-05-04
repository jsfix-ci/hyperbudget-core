import { Transaction } from './transaction';
import { CSVParserManager } from './manager/csvparsermanager';

export type ReportOptionsType = { unique?: boolean };
export type ReportFilter = {
  month?: string,
  type?: string,
};

export interface Report {
  transactions: Transaction[];
  transactionsInCalendarMonth: Transaction[];
  unfilteredTransactions: Transaction[];

  filter(filter: ReportFilter): void;
  filterMonth(month: string): Report;
  filterType(type: string): Report;
  applyFilter(): Report;
  resetFilter(): Report;

  addTransactions(transactions: Transaction[]): Report;
  removeTransactions(transactionIds: string[]): Report;
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

  addTransactions(transactions: Transaction[]): Report {
    this.unfilteredTransactions = this.unfilteredTransactions.concat(transactions);
    this.applyFilter();

    return this;
  }

  resetFilter(): Report {
    this.transactions = [...this.unfilteredTransactions];
    return this;
  }

  filter(filter: ReportFilter): Report {
    this.reportFilter = {
      ...this.reportFilter,
      ...filter
    };

    return this.applyFilter();
  }

  filterMonth(month: string): Report {
    this.filter({ month: month });

    return this;
  }

  filterType(type: string): Report {
    this.filter({ type: type });

    return this;
  }

  applyFilter(): Report {
    this.resetFilter();

    if (this.reportFilter.month) {
      this.transactionsInCalendarMonth = this.unfilteredTransactions.filter(txn => txn.calendarMonth === this.reportFilter.month);
      this.transactions = this.transactions.filter(txn => txn.calculatedMonth === this.reportFilter.month);
    }
    if (this.reportFilter.type) {
      this.transactions = this.transactions.filter(txn => (
        txn.type.toLowerCase() === this.reportFilter.type.toLowerCase()
      ));
    }

    return this;
  }

  removeTransactions(transactionsToRemove: string[]): Report {
    this.unfilteredTransactions = this.unfilteredTransactions.filter(txn => (
      transactionsToRemove.indexOf(txn.identifier) === -1
    ));
    this.applyFilter();

    return this;
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

  removeRecords(transactionIdentifiers: string[]) {
    this.report.removeTransactions(transactionIdentifiers);
  }
}

export default ReportFactory;
