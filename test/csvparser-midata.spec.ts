import { MidataCSVParser } from '../src/lib/csvparser/midata';

import { expect, assert } from 'chai';
import 'mocha';

import * as path from 'path';
import * as fs from 'fs';

describe('MidataCSVParser', () => {
  it('can be initiated', () => {
    assert.ok(new MidataCSVParser());
  });
  it('Correctly parses records', () => {
    let buf = fs.readFileSync(path.resolve(__dirname, 'data/midata/midata3801.csv'));

    return new MidataCSVParser().parseCSVFile(
      buf.toString()
    ).then((records) => {
      assert.ok(records);
      expect(records.length).to.equal(9);

      let record = records[0];
      expect(record.date).to.equal('27/11/2017');
      expect(record.type).to.equal('VIS');
      expect(record.description).to.match(/^Just Eat/);
      expect(record.debitAmount).to.equal(14.24);
      expect(record.creditAmount).to.equal(0);
      expect(record.accountBalance).to.equal(17.97);
    })
  });
});
