import { LloydsCSVParser } from '../src/lib/csvparser/lloyds';

import { expect, assert } from 'chai';
import 'mocha';

describe('LloydsCSVParser', () => {
  it('can be initiated', () => {
    assert.ok(new LloydsCSVParser());
  });
  let records = new LloydsCSVParser().parseCSVRecords(
    [{
      'Transaction Date': '2017-01-01',
      'Transaction Type': 'DD',
      'Sort Code': '11-12-34',
      'Account Number': '12345678',
      'Transaction Description': 'XXX',
      'Debit Amount': '100',
      'Credit Amount': '200',
      'Balance': '2000',
    }]);
    it('Correctly parses records', () => {
      assert.ok(records);
      expect(records.length).to.equal(1);

      let record = records[0];
      expect(record.date).to.equal('2017-01-01');
      expect(record.type).to.equal('DD');
      expect(record.accountSortCode).to.equal('11-12-34');
      expect(record.accountNumber).to.equal('12345678');
      expect(record.description).to.equal('XXX');
      expect(record.creditAmount).to.equal(200);
      expect(record.debitAmount).to.equal(100);
      expect(record.accountBalance).to.equal(2000);
    });
});
