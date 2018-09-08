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
      date            : '01/01/2017',
      type            : 'DD',
      description            : 'MY DESCRIPTION',
      creditAmount   : 0,
      debitAmount    : 0,
      accountBalance         : 0,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        description: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
      })
    ).to.be.true;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        description: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
        creditAmount: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 0]],
        },
      })
    ).to.be.false;

    transaction = new Transaction({
      date            : '01/01/2017',
      type            : 'FPI',
      description            : 'SALARY',
      creditAmount   : 3000,
      debitAmount    : 0,
      accountBalance         : 3000,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        description: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
      })
    ).to.be.false;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        description: {
          mode: RuleMatchMode.Strict,
          rules: [['=', 'SALARY']],
        },
      })
    ).to.be.true;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        description: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'SALARY']],
        },
        creditAmount: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 2000]],
        },
      })
    ).to.be.true;

    transaction = new Transaction({
      date            : '01/01/2017',
      type            : 'FPI',
      description            : 'TFR J DOE',
      creditAmount   : 2000,
      debitAmount    : 0,
      accountBalance         : 2000,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        description: {
          mode: RuleMatchMode.Strict,
          rules: [['!~', 'TFR J DOE']],
        },
        creditAmount: {
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
        "creditAmount": {
          "mode": RuleMatchMode.Strict,
          "rules": [
            [">", 0]
          ]
        },
        "description": {
          "mode": RuleMatchMode.Strict,
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
        "creditAmount": {
          "rules": [
            [">", 1000]
          ]
        },
        "description": {
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
        "debitAmount": {
          "rules": [
            [">", 0]
          ]
        },
        "description": {
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
        "type": {
          "rules": [
            ["=", "DEB"]
          ]
        },
        "creditAmount": {
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
        "type": {
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
        "type": {
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
        "type": {
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
        "type": {
          "rules": [
            ["=", "DD"]
          ]
        },
        "description": {
          "mode": RuleMatchMode.Strict,
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
        "type": {
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
        "description": {
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
        date            : '01/01/2017',
        type            : 'FPO',
        description            : 'TFR J DOE',
        creditAmount   : 0,
        debitAmount    : 2000,
      }),
      new Transaction({
        date: '01/01/2017',
        type: 'DD',
        description: 'ELECTRICITY CORP INC',
        debitAmount: 80.12,
        creditAmount: 0,
      }),
      new Transaction({
        date: '31/01/2017',
        type: 'DD',
        description: 'ELECTRICITY CORP INC',
        debitAmount: 75.24,
        creditAmount: 0,
      }),
      new Transaction({
        date: '31/01/2017',
        type: 'CPT',
        description: 'LNK 10 DWNG STR LNDN GB',
        debitAmount:  0,
        creditAmount: 100,
      }),
      new Transaction({
        date: '16/01/2017',
        type: 'DD',
        description: 'INTERNET',
        debitAmount: 34.99,
        creditAmount: 0,
      }),
      new Transaction({
        date: '29/01/2017',
        type: 'SO',
        description: 'LANDLORD CORP',
        debitAmount: 500.00,
        creditAmount: 0,
      }),
      new Transaction({
        date: '20/01/2017',
        type: 'DEB',
        description: 'PEAR COMPUTERS INC',
        debitAmount: 999.99,
        creditAmount: 0,
      }),
      new Transaction({
        date: '31/12/2016',
        type: 'FPI',
        description: 'MEGACORP SALARY',
        debitAmount: 0,
        creditAmount: 1500,
      }),
      new Transaction({
        date: '31/12/2017',
        type: 'FPI',
        description: 'EBAY SALES',
        debitAmount: 0,
        creditAmount: 50,
      }),
    ];

    return categoriser.categorise_transactions(transactions).then(() => {
      expect(transactions[0].calculatedMonth).to.equal('201701');
      expect(transactions[0].categories.map((cat) => cat.id)).to.deep.equal(['tfr-pers']);
      expect(Categoriser.is_internal_transfer(transactions[0])).to.be.true;
      expect(transactions[1].calculatedMonth).to.equal('201701');
      expect(transactions[1].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'bills']);
      expect(transactions[2].calculatedMonth).to.equal('201702');
      expect(transactions[2].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'bills', 'bills-fwd']);
      expect(transactions[3].calculatedMonth).to.equal('201701');
      expect(transactions[3].categories.map((cat) => cat.id)).to.deep.equal(['income', 'cpt']);
      expect(transactions[4].calculatedMonth).to.equal('201701');
      expect(transactions[4].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'bills']);
      expect(transactions[5].calculatedMonth).to.equal('201701');
      expect(transactions[5].categories.map((cat) => cat.id)).to.deep.equal(['exp', 'rent']);
      expect(transactions[6].calculatedMonth).to.equal('201701');
      expect(transactions[6].categories.map((cat) => cat.id)).to.deep.equal(['exp']);
      expect(transactions[7].calculatedMonth).to.equal('201701');
      expect(transactions[7].categories.map((cat) => cat.id)).to.deep.equal(['income', 'main-income']);
      expect(transactions[8].calculatedMonth).to.equal('201712');
      expect(transactions[8].categories.map((cat) => cat.id)).to.deep.equal(['income']);
    });
  });
});
