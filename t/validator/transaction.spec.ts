import { expect } from 'chai';
import snapshot = require('snap-shot-it');

import * as transaction_validator from '../../src/lib/validator/transaction';

describe('Transaction Validation', () => {
  it('validates transactions', () => {
    snapshot(transaction_validator.validate_transaction("not really"));
    let txn:any = {};

    snapshot(transaction_validator.validate_transaction(txn));

    txn = {
      identifier: '',
      txn_date: '2018-02-28',
      txn_type: 'DD',
      acc_number: 123432523,
      txn_desc: 'Yo man',
      txn_amount_credit: 0,
      txn_amount_debit: 10,
      txn_src: 'lloyds',
      acc_balance: 200,
      month: '201807',
      org_month: '201806',
    };

    snapshot(transaction_validator.validate_transaction(txn));

    txn = {
      identifier: 'wat',
      txn_date: '2018-02-28',
      txn_type: 'DD',
      acc_number: 123432523,
      txn_desc: 'Yo man',
      txn_amount_credit: 0,
      txn_amount_debit: 10,
      txn_src: 'lloyds',
      acc_balance: 200,
      month: '201807',
      org_month: '201806',
    };

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal([]);

    txn.categories = [
      {
        name: 'mcdonalds',
        id: 'mcdonalds',
        className: '',
        category_rules: {
          txn_desc: { rules: [['=','mcdonalds']] }
        }
      },
      {
        name: 'fast food',
        id: 'bgk',
        className: '',
        category_rules: {
          txn_desc: { rules: [['=', 'burger king']] }
        }
      },
      {
        name: 'tasty chicken',
        id: 'kfc',
        className: '',
        category_rules: {
          txn_desc: { rules: [['=', 'kfc']] }
        }
      }
    ];

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal([]);

    txn.categories = [
      {
        name: 'mcdonalds',
        id: 'mcdonalds',
        className: '',
        category_rules: {
          txn_desc: { rules: [['x','mcdonalds']] }
        }
      },
    ];

    snapshot(transaction_validator.validate_transaction(txn));

    let txn2 = { ... txn};

    txn.txn_amount_credit = 'nope';
    delete txn2.categories;
    txn2.identifier = '';

    snapshot(transaction_validator.validate_transactions([txn, txn2]));

    snapshot(transaction_validator.validate_transaction({
      categories: [{}],
    }));
  });
});
