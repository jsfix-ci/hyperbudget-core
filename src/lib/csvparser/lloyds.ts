import { CSVParser } from '../csvparser';

export class LloydsCSVParser extends CSVParser {
  protected srcName = 'Lloyds';

  protected txnMap =  {
    'Transaction Date'       : 'date',
    'Transaction Type'       : 'type',
    'Sort Code'              : 'accountSortCode',
    'Account Number'         : 'accountNumber',
    'Transaction Description': 'description',
    'Debit Amount'           : 'debitAmount',
    'Credit Amount'          : 'creditAmount',
    'Balance'                : 'accountBalance'
  };

  parseCSVRecords(records: any[]): any[] {
    return super.parseCSVRecords(records).map(record => ({
      ...record,
      creditAmount: +record.creditAmount,
      debitAmount: +record.debitAmount,
      accountBalance: +record.accountBalance,
    }));
  }
}
