import { CSVParser } from '../csvparser';

export class RBSCSVParser extends CSVParser {
  protected srcName = 'RBS';

  // XXX Unverified format - word of mouth
  protected txnMap =  {
    'Date'                : 'date',
    'Type'                : 'type',
    'Description'         : 'description',
    'Value'               : 'txn_amount',
    'Balance'             : 'accountBalance',
    'Account Number'      : 'accountNumber',
  };


  parseCSVRecords(records: any[]): any {
    records = super.parseCSVRecords(records);
    records.forEach((record: any) => {
      record.accountBalance = +record.accountBalance;
      record.txn_amount  = +record.txn_amount;

      if (record.txn_amount >= 0) {
        record.creditAmount = +record.txn_amount;
        record.debitAmount = 0;
      } else {
        record.debitAmount = -1 * record.txn_amount;
        record.creditAmount = 0;
      }

      delete record.txn_amount;
    });

    return records;
  }
}
