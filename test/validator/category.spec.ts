import * as validator from '../../src/lib/validator/category';

import { expect } from 'chai';
import 'mocha';
import { RuleMatchMode } from '../../src/lib/enums';

describe('Category Validation', () => {
  it('validates categories', () => {
    expect(validator.validate_category("not really")).to.deep.equal(['category']);
    expect(validator.validate_category({})).to.deep.equal([
      'category.category_rules',
      'category.id',
      'category.name',
      'category.className',
    ]);
    expect(validator.validate_category({
      id: '',
      name: '',
      category_rules: '',
      className: '',
      hidden_on_cat_list: '',
      hidden_on_txn_list: '',
      hidden_on_running_total: '',
      txn_month_modifier: '',
    })).to.deep.equal([
      'category.category_rules',
      'category.id',
      'category.name',
      'category.hidden_on_cat_list',
      'category.hidden_on_txn_list',
      'category.hidden_on_running_total',
      'category.txn_month_modifier',
    ]);

    expect(validator.validate_category({
      id: 'id',
      name: 'name',
      category_rules: '',
      className: '',
      hidden_on_cat_list: true,
      hidden_on_txn_list: false,
      hidden_on_running_total: true,
      txn_month_modifier: 1,
    })).to.deep.equal([
      'category.category_rules',
    ]);

    expect(validator.validate_category({
      id: 'id',
      name: 'name',
      category_rules: {
        txn_day: '',
        debitAmount: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 10], ['<', 20]],
        },
        creditAmount: {
          mode: RuleMatchMode.Flex,
          rules: [['=~', 'what']],
        },
      },
      className: '',
      hidden_on_cat_list: true,
      hidden_on_txn_list: false,
      hidden_on_running_total: true,
      txn_month_modifier: 1,
    })).to.deep.equal([
      'category.category_rules.txn_day',
      'category.category_rules.creditAmount',
    ]);

    expect(validator.validate_category({
      id: 'id',
      name: 'name',
      category_rules: {
        txn_day: {
          mode: RuleMatchMode.Flex,
          rules: [['<', 5]],
        },
        description: {
          mode: RuleMatchMode.Flex,
          rules: [
            [
              '!=', 'Testing'
            ],
            [
              '=~', 'another valid thing'
            ],
            [
              '=', 'this is nice'
            ],
            [
              '!~', "this wouldn't match"
            ]
          ]
        },
        type: {
          mode: RuleMatchMode.Flex,
          rules: [
            ['=', 'DD'],
            ['=', 'SO']
          ]
        },
        source: {
          rules: [
            ['=', 'lloyds']
          ]
        },
        debitAmount: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 10], ['<', 20]],
        },
        creditAmount: {
          mode: RuleMatchMode.Flex,
          rules: [
            ['>', 0],
            ['<', 500],
            ['!=', 42],
            ['=', 10],
            ['>=', -20],
            ['<=', -50],
          ],
        },
      },
      className: '',
      hidden_on_cat_list: true,
      hidden_on_txn_list: false,
      hidden_on_running_total: true,
      txn_month_modifier: 1,
    })).to.deep.equal([
    ]);

    expect(validator.validate_category({
      name: 'should fail',
      id: 'should-fail',
      className: '',
      category_rules: {
        description: {
          rules: [
            [ '!!=', 'this should fail' ]
          ]
        }
      }
    })).to.deep.equal(['category.category_rules.description'])
  });

  expect(validator.validate_categories(
    [
      {
        name: '',
        id: '',
        className: '',
        category_rules: {
          description: { rules: [['=','mcdonalds']] }
        }
      },
      {
        name: 'fast food',
        id: '',
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
    ]
  )).to.deep.equal(
    [
      {
        id: '',
        idx: 0,
        errors: [
          'category.id',
          'category.name'
        ]
      },
      {
        id: '',
        idx: 1,
        errors: [
          'category.id'
        ]
      }
    ]
  );

  expect(validator.validate_categories(
    [
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
    ]
  )).to.deep.equal(
    [
    ]
  );

});
