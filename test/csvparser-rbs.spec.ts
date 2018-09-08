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
      expect(firstRecord.date).to.equal('01/11/2017');
      expect(firstRecord.type).to.equal('FPI');
      expect(firstRecord.description).to.match(/^Hello World/);
      expect(firstRecord.debitAmount).to.equal(0);
      expect(firstRecord.creditAmount).to.equal(100);
      expect(firstRecord.accountBalance).to.equal(1000);
      expect(firstRecord.accountNumber).to.equal('12345678');

      const secondRecord = records[1];
      expect(secondRecord.date).to.equal('02/11/2017');
      expect(secondRecord.type).to.equal('DEB');
      expect(secondRecord.description).to.match(/^Hello 2/);
      expect(secondRecord.debitAmount).to.equal(100);
      expect(secondRecord.creditAmount).to.equal(0);
      expect(secondRecord.accountBalance).to.equal(900);
      expect(secondRecord.accountNumber).to.equal('12345678');
    });
  });
});
