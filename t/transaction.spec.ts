//mocha -r ts-node/register  t/report.spec.ts
import { Transaction } from '../src/lib/transaction';
import { expect, assert } from 'chai';
import 'mocha';
import moment from 'moment';

describe('Transaction', () => {
  it('Can be constructed', () => {
    let transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'DD',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });
    assert.ok(transaction);
    expect(transaction).to.be.an.instanceOf(Transaction);
  });
  it('Keeps the given month by default', () => {
    let transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'DEB',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });
    expect(transaction.month).to.equal('201701');
    transaction = new Transaction({
      txn_date            : '31/01/2017',
      txn_type            : 'TFR',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
      txn_desc            : 'Transfer to somebody else',
    });
    expect(transaction.month).to.equal('201701');
    transaction = new Transaction({
      txn_date            : '28/02/2017',
      txn_type            : 'CPT',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });
    expect(transaction.month).to.equal('201702');
  });
  it('parses dates', () => {
    let transaction = new Transaction({
      txn_date: '05/07/2018',
      txn_type: 'DEB',
      txn_amount_credit: 0,
      txn_amount_debit: 25,
      acc_balance: 0,
      txn_desc: 'Amazon UK',
      txn_src: 'lloyds',
    });

    expect(transaction.txn_date).to.be.instanceOf(Date);
    expect(moment(transaction.txn_date).isSame(moment('2018-07-05T00:00:00Z'))).to.be.true;

    transaction = new Transaction({
      txn_date: '2018-03-01',
      txn_type: 'DEB',
      txn_amount_credit: 0,
      txn_amount_debit: 25,
      acc_balance: 0,
      txn_desc: 'Amazon UK',
      txn_src: 'FairFX Corp',
    });

    expect(transaction.txn_date).to.be.instanceOf(Date);
    expect(moment(transaction.txn_date).isSame(moment('2018-03-01'))).to.be.true;
  });

  it('number-fies amounts', () => {
    let transaction = new Transaction({
      txn_date: '05/07/2018',
      txn_type: 'DEB',
      txn_amount_credit: 10,
      txn_amount_debit: 25,
      acc_balance: 0,
      txn_desc: 'Amazon UK',
    });

    expect(typeof transaction.txn_amount_debit).to.equal('number');
    expect(typeof transaction.txn_amount_credit).to.equal('number');
    expect(transaction.txn_amount_credit).to.equal(10);
    expect(transaction.txn_amount_debit).to.equal(25);
  });
});
