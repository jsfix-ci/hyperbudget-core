//mocha -r ts-node/register  t/report.spec.ts
import { Transaction } from '../src/lib/transaction';
import { expect, assert } from 'chai';
import 'mocha';

import { SystemConfig } from '../src/lib/config/system';

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
  
});
