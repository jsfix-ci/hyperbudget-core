import { CSVParser } from '../csvparser';

export class FairFXCorpCSVParser extends CSVParser {
  protected srcName = 'FairFX Corp';
  protected txnMap =  {
    'date'          : 'date',
    'type'          : 'type',
    'pan'           : 'accountNumber',
    'description'   : 'description',
    'debit'         : 'debitAmount',
    'credit'        : 'creditAmount',
  };

  parseCSVRecords(records: any[]): any[]{
    return super.parseCSVRecords(records).map(record => ({
      ...record,
      creditAmount: +record.creditAmount,
      debitAmount: +record.debitAmount,
    }));
  }
}
