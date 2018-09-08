import { expect } from 'chai';

import * as transaction_validator from '../../src/lib/validator/transaction';

describe('Transaction Validation', () => {
  it('validates transactions', () => {
    expect(transaction_validator.validate_transaction("not really")).to.deep.equal(['transaction']);
    let txn:any = {};

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal(
      [
        'transaction.identifier',
        'transaction.date',
        'transaction.description',
        'transaction.source',
        'transaction.calculatedMonth',
        'transaction.calendarMonth',
      ]
    );

    expect(txn.debitAmount).to.equal(0);
    expect(txn.creditAmount).to.equal(0);

    txn = {
      identifier: '',
      date: '2018-02-29',
      type: 'DD',
      accountNumber: 123432523,
      description: 'Yo man',
      creditAmount: 0,
      debitAmount: 10,
      source: 'lloyds',
      accountBalance: 200,
      calculatedMonth: '201807',
      calendarMonth: '201806',
    };

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal(
      [
        'transaction.identifier',
        'transaction.date',
      ]
    );

    txn = {
      identifier: 'wat',
      date: '2018-02-28',
      type: 'DD',
      accountNumber: 123432523,
      description: 'Yo man',
      creditAmount: 0,
      debitAmount: 10,
      source: 'lloyds',
      accountBalance: 200,
      calculatedMonth: '201807',
      calendarMonth: '201806',
    };

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal([]);

    txn.categories = [
      {
        name: 'mcdonalds',
        id: 'mcdonalds',
        className: '',
        category_rules: {
          description: { rules: [['=','mcdonalds']] }
        }
      },
      {
        name: 'fast food',
        id: 'bgk',
        className: '',
        category_rules: {
          description: { rules: [['=', 'burger king']] }
        }
      },
      {
        name: 'tasty chicken',
        id: 'kfc',
        className: '',
        category_rules: {
          description: { rules: [['=', 'kfc']] }
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
          description: { rules: [['x','mcdonalds']] }
        }
      },
    ];

    expect(transaction_validator.validate_transaction(txn)).to.deep.equal([
      'category.category_rules.description',
    ]);

    let txn2 = { ... txn};

    txn.creditAmount = 'nope';
    delete txn2.categories;
    txn2.identifier = '';

    expect(transaction_validator.validate_transactions([txn, txn2])).to.deep.equal([
      {
        id: 'wat',
        idx: 0,
        errors: [
          'transaction.creditAmount',
          'category.category_rules.description',
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
