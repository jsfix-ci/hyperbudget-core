import { RBSCSVParser } from '../src/lib/csvparser/rbs';

import { expect, assert } from 'chai';
import 'mocha';

import * as path from 'path';
import * as fs from 'fs';

describe('RBS CSV Parser', () => {
  let rbs: RBSCSVParser = null;

  beforeEach(() => {
    rbs = new RBSCSVParser();
  });

  it('correctly parses records', () => {
    const CSVPath = path.resolve(__dirname, 'data/rbs/rbs-unverified.csv');

    let buf = fs.readFileSync(CSVPath);

    return rbs.parseCSVFile(buf.toString()).then((records: Array<any>) => {
      expect(records).to.have.lengthOf(2);

      const firstRecord = records[0];
      expect(firstRecord.txn_date).to.equal('01/11/2017');
      expect(firstRecord.txn_type).to.equal('FPI');
      expect(firstRecord.txn_desc).to.match(/^Hello World/);
      expect(firstRecord.txn_amount_debit).to.equal(0);
      expect(firstRecord.txn_amount_credit).to.equal(100);
      expect(firstRecord.acc_balance).to.equal(1000);
      expect(firstRecord.acc_number).to.equal('12345678');

      const secondRecord = records[1];
      expect(secondRecord.txn_date).to.equal('02/11/2017');
      expect(secondRecord.txn_type).to.equal('DEB');
      expect(secondRecord.txn_desc).to.match(/^Hello 2/);
      expect(secondRecord.txn_amount_debit).to.equal(100);
      expect(secondRecord.txn_amount_credit).to.equal(0);
      expect(secondRecord.acc_balance).to.equal(900);
      expect(secondRecord.acc_number).to.equal('12345678');
    });
  });
});
