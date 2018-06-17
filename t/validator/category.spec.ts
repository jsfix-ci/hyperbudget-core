import * as validator from '../../src/lib/validator/category';

import { expect, assert } from 'chai';
import 'mocha';
import { RuleMatchMode } from '../../src/lib/enums';

describe('Validation', () => {
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
    })).to.deep.equal([
      'category.category_rules.txn_day',
      'category.category_rules.txn_amount_credit',
    ]);

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

    expect(validator.validate_category({
      name: 'should fail',
      id: 'should-fail',
      className: '',
      category_rules: {
        txn_desc: {
          rules: [
            [ '!!=', 'this should fail' ]
          ]
        }
      }
    })).to.deep.equal(['category.category_rules.txn_desc'])
  });
});
