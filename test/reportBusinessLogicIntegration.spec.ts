import snapshot from 'snap-shot-it';
import { ReportBusinessLogic } from '../src/lib/manager/reportmanager';
import { Category } from '../src/types/category';
import { RuleMatchMode } from '../src/lib/enums';

describe('Report Business Logic', () => {
  it('adds transactions from object', async () => {
    const records = [{
      date: '2018-01-01T00:00:00Z',
      debitAmount: 1000,
      description: 'Foobar',
      type: 'DD',
      accountSortCode: '01-02-03',
      accountNumber: '12345678',
      accountBalance: 1050,
      source: 'lloyds',
    }, {
      date: '2018-08-15T00:00:00Z',
      debitAmount: 0,
      creditAmount: 2000,
      description: 'CELERY',
      type: 'FPI',
      accountSortCode: '01-02-03',
      accountNumber: '12345678',
      accountBalance: 3050,
      source: 'lloyds',
    }];

    const logic = new ReportBusinessLogic();
    const txns = await logic.addTransactionsFromObject(records);
    snapshot(txns);
  });

  it('categorises transactions', async () => {
    const categories: Category[] = [{
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
    const records = [
      {
        date            : '01/01/2017',
        type            : 'FPO',
        description            : 'TFR J DOE',
        creditAmount   : 0,
        debitAmount    : 2000,
      },
      {
        date: '01/01/2017',
        type: 'DD',
        description: 'ELECTRICITY CORP INC',
        debitAmount: 80.12,
        creditAmount: 0,
      },
      ({
        date: '31/01/2017',
        type: 'DD',
        description: 'ELECTRICITY CORP INC',
        debitAmount: 75.24,
        creditAmount: 0,
      }),
      ({
        date: '31/01/2017',
        type: 'CPT',
        description: 'LNK 10 DWNG STR LNDN GB',
        debitAmount:  0,
        creditAmount: 100,
      }),
      ({
        date: '16/01/2017',
        type: 'DD',
        description: 'INTERNET',
        debitAmount: 34.99,
        creditAmount: 0,
      }),
      ({
        date: '29/01/2017',
        type: 'SO',
        description: 'LANDLORD CORP',
        debitAmount: 500.00,
        creditAmount: 0,
      }),
      ({
        date: '20/01/2017',
        type: 'DEB',
        description: 'PEAR COMPUTERS INC',
        debitAmount: 999.99,
        creditAmount: 0,
      }),
      ({
        date: '31/12/2016',
        type: 'FPI',
        description: 'MEGACORP SALARY',
        debitAmount: 0,
        creditAmount: 1500,
      }),
      ({
        date: '31/12/2017',
        type: 'FPI',
        description: 'EBAY SALES',
        debitAmount: 0,
        creditAmount: 50,
      }),
    ];

    const logic = new ReportBusinessLogic();
    await logic.addTransactionsFromObject(records);

    snapshot(await logic.categoriseTransactions(categories));
  });
  it('filters transactions', async () => {
    const categories: Category[] = [{
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
    const records = [
      {
        date            : '01/01/2017',
        type            : 'FPO',
        description            : 'TFR J DOE',
        creditAmount   : 0,
        debitAmount    : 2000,
      },
      {
        date: '01/01/2017',
        type: 'DD',
        description: 'ELECTRICITY CORP INC',
        debitAmount: 80.12,
        creditAmount: 0,
      },
      ({
        date: '31/01/2017',
        type: 'DD',
        description: 'ELECTRICITY CORP INC',
        debitAmount: 75.24,
        creditAmount: 0,
      }),
      ({
        date: '31/01/2017',
        type: 'CPT',
        description: 'LNK 10 DWNG STR LNDN GB',
        debitAmount:  0,
        creditAmount: 100,
      }),
      ({
        date: '16/01/2017',
        type: 'DD',
        description: 'INTERNET',
        debitAmount: 34.99,
        creditAmount: 0,
      }),
      ({
        date: '29/01/2017',
        type: 'SO',
        description: 'LANDLORD CORP',
        debitAmount: 500.00,
        creditAmount: 0,
      }),
      ({
        date: '20/01/2017',
        type: 'DEB',
        description: 'PEAR COMPUTERS INC',
        debitAmount: 999.99,
        creditAmount: 0,
      }),
      ({
        date: '31/12/2016',
        type: 'FPI',
        description: 'MEGACORP SALARY',
        debitAmount: 0,
        creditAmount: 1500,
      }),
      ({
        date: '31/12/2017',
        type: 'FPI',
        description: 'EBAY SALES',
        debitAmount: 0,
        creditAmount: 50,
      }),
    ];

    const logic = new ReportBusinessLogic();
    await logic.addTransactionsFromObject(records);

    await logic.categoriseTransactions(categories);

    snapshot(logic.filterTransactionsByMonth('201701'));
    snapshot(logic.filterTransactionsByMonth('201702'));
    snapshot(logic.filterTransactionsByMonth('201712'));

    snapshot(logic.resetFilter());
  });
})
