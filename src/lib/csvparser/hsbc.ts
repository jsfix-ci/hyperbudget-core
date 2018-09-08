import { CSVParser } from '../csvparser';
import { HSBCTransTypes } from '../consts/transactiontypes/hsbc';

export class HSBCCSVParser extends CSVParser {
  protected srcName = 'HSBC';

  protected txnMap =  {
    'Transaction Date'       : 'date',
    'Transaction Description': 'description',
    'Transaction Amount'     : 'txn_amount',
  };

  protected sanitiseInput(input: string): Promise<any> {
    return super.sanitiseInput(input).then((input) => {
      input = "Transaction Date,Transaction Description,Transaction Amount\r\n" + input;
      return new Promise((resolve, reject) => resolve(input));
    });
  }

  parseCSVRecords(records: any[]): any[] {
    records = super.parseCSVRecords(records);
    records.forEach((record: any, idx: number) => {
      if (record.txn_amount) {
        record.txn_amount = record.txn_amount.replace(/,/g, '');

        if (record.txn_amount >= 0) {
          record.creditAmount = +record.txn_amount;
          record.debitAmount = 0;
        } else {
          record.debitAmount = -1 * record.txn_amount;
          record.creditAmount = 0;
        }

        delete record.txn_amount;

        //pulls the transaction type off the end of the description, which is a 2-3 character code at the end of the string, preceded by whitespace
        const type_from_desc_match: string[] = (<string>record.description).match(/\s+(\S\S\S?)$/);

        if (type_from_desc_match && type_from_desc_match.length >= 2) {
          record.type = HSBCTransTypes[type_from_desc_match[1]];

          // VISA network atm withdrawals?
          if (record.type === 'DEB' && !!record.description.match(/^CASH /)) {
            record.type = 'CPT';
          }
        }

        record.source = 'HSBC';
      } else {
        records.splice(idx, 1);
      }
    });

    return records;
  }
}
