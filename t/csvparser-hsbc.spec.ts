import { HSBCCSVParser } from '../src/lib/csvparser/hsbc';

import { expect, assert } from 'chai';
import 'mocha';

describe('HSBCCSVParser', () => {
  it('can be initiated', () => {
    assert.ok(new HSBCCSVParser());
  });

  let records: any[] = new HSBCCSVParser().parseCSVRecords(
    [
      {
        'Transaction Date': '2017-01-01',
        'Transaction Description': 'XXX',
        'Transaction Amount': "100",
      },
      {
        'Transaction Date': '2017-01-02',
        'Transaction Description': 'XXX2',
        'Transaction Amount': "-200",
      },
      {
        'Transaction Date': '2018-01-01',
        'Transaction Description': 'ASDA VIS',
        'Transaction Amount': '-50',
      },
      {
        'Transaction Date': '2018-01-01',
        'Transaction Description': 'CASH BARCLAY JAN01 ASDA@10:50 ATM',
        'Transaction Amount': '-40',
      },
      {
        'Transaction Date': '2018-01-01',
        'Transaction Description': 'CASH 12312012 10 Downing Street London VIS',
        'Transaction Amount': '-20',
      },
    ]
 );

  it('Correctly parses records', () => {
    assert.ok(records);
    expect(records.length).to.equal(5);

    let record = records[0];
    expect(record.txn_date).to.equal('2017-01-01');
    expect(record.txn_desc).to.equal('XXX');
    expect(record.txn_amount_credit).to.equal(100);
    expect(record.txn_amount_debit).to.equal(0);

    record = records[1];
    expect(record.txn_date).to.equal('2017-01-02');
    expect(record.txn_desc).to.equal('XXX2');
    expect(record.txn_amount_credit).to.equal(0);
    expect(record.txn_amount_debit).to.equal(200);

    expect(records[2].txn_date).to.equal('2018-01-01');
    expect(records[2].txn_desc).to.equal('ASDA VIS');
    expect(records[2].txn_amount_debit).to.equal(50);
    expect(records[2].txn_type).to.equal('DEB');


    expect(records[3].txn_date).to.equal('2018-01-01');
    expect(records[3].txn_desc).to.equal('CASH BARCLAY JAN01 ASDA@10:50 ATM');
    expect(records[3].txn_amount_debit).to.equal(40);
    expect(records[3].txn_type).to.equal('CPT');

    expect(records[4].txn_date).to.equal('2018-01-01');
    expect(records[4].txn_desc).to.equal('CASH 12312012 10 Downing Street London VIS');
    expect(records[4].txn_amount_debit).to.equal(20);
    expect(records[4].txn_type).to.equal('CPT');
  });
});
