import { expect } from 'chai';
import 'mocha';
import snapshot = require('snap-shot-it');

import * as validator from '../../src/lib/validator/category';
import { RuleMatchMode } from '../../src/lib/enums';

describe('Category Validation', () => {
  it('validates categories', () => {
    snapshot(validator.validate_category("not really"));
    snapshot(validator.validate_category({}));
    snapshot(validator.validate_category({
      id: '',
      name: '',
      category_rules: '',
      className: '',
      hidden_on_cat_list: '',
      hidden_on_txn_list: '',
      hidden_on_running_total: '',
      txn_month_modifier: '',
    }));

    snapshot(validator.validate_category({
      id: 'id',
      name: 'name',
      category_rules: '',
      className: '',
      hidden_on_cat_list: true,
      hidden_on_txn_list: false,
      hidden_on_running_total: true,
      txn_month_modifier: 1,
    }));

    snapshot(validator.validate_category({
      id: 'id',
      name: 'name',
      category_rules: {
        txn_day: '',
        txn_amount_debit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 10], ['<', 20]],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Flex,
          rules: [['=~', 'what']],
        },
      },
      className: '',
      hidden_on_cat_list: true,
      hidden_on_txn_list: false,
      hidden_on_running_total: true,
      txn_month_modifier: 1,
    }));

    expect(validator.validate_category({
      id: 'id',
      name: 'name',
      category_rules: {
        txn_day: {
          mode: RuleMatchMode.Flex,
          rules: [['<', 5]],
        },
        txn_desc: {
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
        txn_type: {
          mode: RuleMatchMode.Flex,
          rules: [
            ['=', 'DD'],
            ['=', 'SO']
          ]
        },
        txn_src: {
          rules: [
            ['=', 'lloyds']
          ]
        },
        txn_amount_debit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 10], ['<', 20]],
        },
        txn_amount_credit: {
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

    snapshot(validator.validate_categories(
    [
      {
        name: '',
        id: '',
        className: '',
        category_rules: {
          txn_desc: { rules: [['=','mcdonalds']] }
        }
      },
      {
        name: 'fast food',
        id: '',
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
    ]));

    expect(validator.validate_categories(
    [
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
    ]
    )).to.deep.equal(
    [
    ]
    );
  });
});
