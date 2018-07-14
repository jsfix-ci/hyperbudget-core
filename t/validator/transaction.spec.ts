import { expect } from 'chai';

import * as transaction_validator from '../../src/lib/validator/transaction';

describe('Transaction Validation', () => {
  it('validates transactions', () => {
    expect(transaction_validator.validate_transaction("not really")).to.deep.equal(['transaction']);
    let txn:any = {};

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal(
      [
        'transaction.identifier',
        'transaction.txn_date',
        'transaction.txn_desc',
        'transaction.txn_src',
        'transaction.month',
        'transaction.org_month',
      ]
    );

    expect(txn.txn_amount_debit).to.equal(0);
    expect(txn.txn_amount_credit).to.equal(0);

    txn = {
      identifier: '',
      txn_date: '2018-02-29',
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

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal(
      [
        'transaction.identifier',
        'transaction.txn_date',
      ]
    );

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

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal([
      'category.category_rules.txn_desc',
    ]);

    let txn2 = { ... txn};

    txn.txn_amount_credit = 'nope';
    delete txn2.categories;
    txn2.identifier = '';

    expect(transaction_validator.validate_transactions([txn, txn2])).to.deep.equal([
      {
        id: 'wat',
        idx: 0,
        errors: [
          'transaction.txn_amount_credit',
          'category.category_rules.txn_desc',
        ],
      },
      {
        id: '',
        idx: 1,
        errors: [
          'transaction.identifier',
        ],
      },
    ]);
  });
});
