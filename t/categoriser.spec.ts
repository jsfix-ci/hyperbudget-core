//mocha -r ts-node/register  t/report.spec.ts
import { Transaction } from '../src/lib/transaction';
import { Categoriser } from '../src/lib/categoriser';

import { expect, assert } from 'chai';
import 'mocha';
import { RuleMatchMode } from '../src/lib/enums';
import { Category } from '../src/types/category';
describe('Categoriser', () => {
  it('Can parse rules', () => {
    let transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'DD',
      txn_desc            : 'MY DESCRIPTION',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
      })
    ).to.be.true;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 0]],
        },
      })
    ).to.be.false;

    transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'FPI',
      txn_desc            : 'SALARY',
      txn_amount_credit   : 3000,
      txn_amount_debit    : 0,
      acc_balance         : 3000,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
      })
    ).to.be.false;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=', 'SALARY']],
        },
      })
    ).to.be.true;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'SALARY']],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 2000]],
        },
      })
    ).to.be.true;

    transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'FPI',
      txn_desc            : 'TFR J DOE',
      txn_amount_credit   : 2000,
      txn_amount_debit    : 0,
      acc_balance         : 2000,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['!~', 'TFR J DOE']],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 2000]],
        },
      })
    ).to.be.false;
  });
  it('categorises transactions', () => {
    let categories: Category[] = [{
      "name": "Income",
      "category_rules": {
        "txn_amount_credit": {
          "mode": 1001,
          "rules": [
            [">", 0]
          ]
        },
        "txn_desc": {
          "mode": 1001,
          "rules": [
            ["!~", "J DOE"],
          ]
        }
      },
      "className": "cat-income",
      "id": "income"
    }, {
      "name": "Main Income",
      "category_rules": {
        "txn_amount_credit": {
          "rules": [
            [">", 1000]
          ]
        },
        "txn_desc": {
          "rules": [
            ["!~", "J DOE"],
          ]
        }
      },
      "className": "cat-income",
      "id": "main-income",
      "txn_month_modifier": 1
    }, {
      "name": "Expenditure",
      "category_rules": {
        "txn_amount_debit": {
          "rules": [
            [">", 0]
          ]
        },
        "txn_desc": {
          "rules": [
            ["!~", "J DOE"],
          ]
        }
      },
      "className": "cat-exp",
      "id": "exp"
    }, {
      "name": "Refunds",
      "category_rules": {
        "txn_type": {
          "rules": [
            ["=", "DEB"]
          ]
        },
        "txn_amount_credit": {
          "rules": [
            [">", 0]
          ]
        }
      },
      "className": "class-refunds",
      "id": "refunds"
    }, {
      "name": "Bills",
      "category_rules": {
        "txn_type": {
          "rules": [
            ["=", "DD"]
          ]
        }
      },
      "className": "cat-bills",
      "id": "bills"
    }, {
      "name": "Rent",
      "category_rules": {
        "txn_type": {
          "rules": [
            ["=", "SO"]
          ]
        }
      },
      "className": "cat-rent",
      "id": "rent"
    },
    {
      "name": "Rent: Bring back",
      "category_rules": {
        "txn_type": {
          "rules": [
            ["=", "SO"]
          ]
        },
        "txn_day": {
          "rules": [
            ["<", 15]
          ]
        }
      },
      "txn_month_modifier": -1,
      "className": "cat-rent",
      "id": "rent-bring-back",
      "hidden_on_cat_list": true,
      "hidden_on_txn_list": true
    }, {
      "name": "Bills - bring forward",
      "category_rules": {
        "txn_type": {
          "rules": [
            ["=", "DD"]
          ]
        },
        "txn_desc": {
          "mode": 1002,
          "rules": [
            ["=~", "ELECTRICITY CORP INC"]
          ]
        },
        "txn_day": {
          "rules": [
            [">", 15]
          ]
        }
      },
      "txn_month_modifier": 1,
      "className": "cat-bills",
      "id": "bills-fwd",
      "hidden_on_cat_list": true,
      "hidden_on_txn_list": true
    }, {
      "name": "Cash Withdrawals",
      "category_rules": {
        "txn_type": {
          "rules": [
            ["=", "CPT"]
          ]
        }
      },
      "className": "cat-cpt",
      "id": "cpt"
    }, {
      "name": "Personal Bank Transfers",
      "category_rules": {
        "txn_desc": {
          "rules": [
            ["=~", "J DOE"]
          ]
        }
      },
      "className": "cat-tfr-pers",
      "id": "tfr-pers",
      "hidden_on_running_total": true
    }];

    let categoriser = new Categoriser(
      categories
    );

    let transactions: Transaction[] = [
      new Transaction({
        txn_date            : '01/01/2017',
        txn_type            : 'FPO',
        txn_desc            : 'TFR J DOE',
        txn_amount_credit   : 0,
        txn_amount_debit    : 2000,
      }),
      new Transaction({
        txn_date: '01/01/2017',
        txn_type: 'DD',
        txn_desc: 'ELECTRICITY CORP INC',
        txn_amount_debit: 80.12,
        txn_amount_credit: 0,
      }),
      new Transaction({
        txn_date: '31/01/2017',
        txn_type: 'DD',
        txn_desc: 'ELECTRICITY CORP INC',
        txn_amount_debit: 75.24,
        txn_amount_credit: 0,
      }),
      new Transaction({
        txn_date: '31/01/2017',
        txn_type: 'CPT',
        txn_desc: 'LNK 10 DWNG STR LNDN GB',
        txn_amount_debit:  0,
        txn_amount_credit: 100,
      }),
      new Transaction({
        txn_date: '16/01/2017',
        txn_type: 'DD',
        txn_desc: 'INTERNET',
        txn_amount_debit: 34.99,
        txn_amount_credit: 0,
      }),
      new Transaction({
        txn_date: '29/01/2017',
        txn_type: 'SO',
        txn_desc: 'LANDLORD CORP',
        txn_amount_debit: 500.00,
        txn_amount_credit: 0,
      }),
      new Transaction({
        txn_date: '20/01/2017',
        txn_type: 'DEB',
        txn_desc: 'PEAR COMPUTERS INC',
        txn_amount_debit: 999.99,
        txn_amount_credit: 0,
      }),
      new Transaction({
        txn_date: '31/12/2016',
        txn_type: 'FPI',
        txn_desc: 'MEGACORP SALARY',
        txn_amount_debit: 0,
        txn_amount_credit: 1500,
      }),
      new Transaction({
        txn_date: '31/12/2017',
        txn_type: 'FPI',
        txn_desc: 'EBAY SALES',
        txn_amount_debit: 0,
        txn_amount_credit: 50,
      }),
    ];

    return categoriser.categorise_transactions(transactions).then(() => {
      expect(transactions[0].month).to.equal('201701');
      expect(transactions[0].categories.map((cat) => cat.id)).to.deep.equal(['tfr-pers']);
      expect(Categoriser.is_internal_transfer(transactions[0])).to.be.true;
      expect(transactions[1].month).to.equal('201701');
      expect(transactions[1].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'bills']);
      expect(transactions[2].month).to.equal('201702');
      expect(transactions[2].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'bills', 'bills-fwd']);
      expect(transactions[3].month).to.equal('201701');
      expect(transactions[3].categories.map((cat) => cat.id)).to.deep.equal(['income', 'cpt']);
      expect(transactions[4].month).to.equal('201701');
      expect(transactions[4].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'bills']);
      expect(transactions[5].month).to.equal('201701');
      expect(transactions[5].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'rent']);
      expect(transactions[6].month).to.equal('201701');
      expect(transactions[6].categories.map((cat) => cat.id)).to.deep.equal(['exp']);
      expect(transactions[7].month).to.equal('201701');
      expect(transactions[7].categories.map((cat) => cat.id)).to.deep.equal(['income', 'main-income']);
      expect(transactions[8].month).to.equal('201712');
      expect(transactions[8].categories.map((cat) => cat.id)).to.deep.equal(['income']);
    });
  });
});
