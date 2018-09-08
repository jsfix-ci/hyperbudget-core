//mocha -r ts-node/register  t/report.spec.ts
import { Transaction } from '../src/lib/transaction';
import { expect, assert } from 'chai';
import 'mocha';
import moment from 'moment';

describe('Transaction', () => {
  it('Can be constructed', () => {
    let transaction = new Transaction({
      date            : '01/01/2017',
      type            : 'DD',
      creditAmount   : 0,
      debitAmount    : 0,
      accountBalance         : 0,
    });
    assert.ok(transaction);
    expect(transaction).to.be.an.instanceOf(Transaction);
  });
  it('Keeps the given month by default', () => {
    let transaction = new Transaction({
      date            : '01/01/2017',
      type            : 'DEB',
      creditAmount   : 0,
      debitAmount    : 0,
      accountBalance         : 0,
    });
    expect(transaction.calculatedMonth).to.equal('201701');
    transaction = new Transaction({
      date            : '31/01/2017',
      type            : 'TFR',
      creditAmount   : 0,
      debitAmount    : 0,
      accountBalance         : 0,
      description            : 'Transfer to somebody else',
    });
    expect(transaction.calculatedMonth).to.equal('201701');
    transaction = new Transaction({
      date            : '28/02/2017',
      type            : 'CPT',
      creditAmount   : 0,
      debitAmount    : 0,
      accountBalance         : 0,
    });
    expect(transaction.calculatedMonth).to.equal('201702');
  });
  it('parses dates', () => {
    let transaction = new Transaction({
      date: '05/07/2018',
      type: 'DEB',
      creditAmount: 0,
      debitAmount: 25,
      accountBalance: 0,
      description: 'Amazon UK',
      source: 'lloyds',
    });

    expect(transaction.date).to.be.instanceOf(Date);
    expect(moment(transaction.date).isSame(moment('2018-07-05T00:00:00Z'))).to.be.true;

    transaction = new Transaction({
      date: '2018-03-01',
      type: 'DEB',
      creditAmount: 0,
      debitAmount: 25,
      accountBalance: 0,
      description: 'Amazon UK',
      source: 'FairFX Corp',
    });

    expect(transaction.date).to.be.instanceOf(Date);
    expect(moment(transaction.date).isSame(moment('2018-03-01'))).to.be.true;
  });

  it('number-fies amounts', () => {
    let transaction = new Transaction({
      date: '05/07/2018',
      type: 'DEB',
      creditAmount: 10,
      debitAmount: 25,
      accountBalance: 0,
      description: 'Amazon UK',
    });

    expect(typeof transaction.debitAmount).to.equal('number');
    expect(typeof transaction.creditAmount).to.equal('number');
    expect(transaction.creditAmount).to.equal(10);
    expect(transaction.debitAmount).to.equal(25);
  });
});
