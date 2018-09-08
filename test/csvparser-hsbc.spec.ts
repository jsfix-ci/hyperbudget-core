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
    expect(record.date).to.equal('2017-01-01');
    expect(record.description).to.equal('XXX');
    expect(record.creditAmount).to.equal(100);
    expect(record.debitAmount).to.equal(0);

    record = records[1];
    expect(record.date).to.equal('2017-01-02');
    expect(record.description).to.equal('XXX2');
    expect(record.creditAmount).to.equal(0);
    expect(record.debitAmount).to.equal(200);

    expect(records[2].date).to.equal('2018-01-01');
    expect(records[2].description).to.equal('ASDA VIS');
    expect(records[2].debitAmount).to.equal(50);
    expect(records[2].type).to.equal('DEB');


    expect(records[3].date).to.equal('2018-01-01');
    expect(records[3].description).to.equal('CASH BARCLAY JAN01 ASDA@10:50 ATM');
    expect(records[3].debitAmount).to.equal(40);
    expect(records[3].type).to.equal('CPT');

    expect(records[4].date).to.equal('2018-01-01');
    expect(records[4].description).to.equal('CASH 12312012 10 Downing Street London VIS');
    expect(records[4].debitAmount).to.equal(20);
    expect(records[4].type).to.equal('CPT');
  });
});
