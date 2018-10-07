//mocha -r ts-node/register  src/t/report.spec.ts
import { Report, ReportFactory } from '../src/lib/report';
import { Transaction } from '../src/lib/transaction';

import moment from 'moment';

import { expect, assert } from 'chai';
import 'mocha';

describe('ReportFactory', () => {
  it('can be initiated', () => {
    assert.ok(new ReportFactory());
  });

  it('creates report objects', () => {
    let rf = new ReportFactory();

    return rf.fromRecords([{
      'date': '01/01/2017',
      'creditAmount': '1000',
      'debitAmount': 0,
      'accountBalance': '1000',
      'description': 'Some Transaction',
    }]).then(() => {
      let report = rf.report;

      assert.ok(report);
      expect(report).to.have.property('transactions').with.lengthOf(1);

      let transaction = report.transactions[0];
      assert.ok(transaction);
      expect(transaction).to.have.property('creditAmount');
      expect(transaction.creditAmount).to.equal(1000);
      expect(transaction).to.be.an.instanceOf(Transaction);
    });
  });

  it('Correctly filters', () => {
    let rf = new ReportFactory();
    return rf.fromRecords([
      {
        'date': '01/01/2017',
        'creditAmount': 1000,
        'debitAmount': 0,
        'accountBalance': 1000,
        'description': 'January Transaction',
      },
      {
        'date': '01/09/2017',
        'creditAmount': 0,
        'debitAmount': 100,
        'accountBalance': 900,
        'description': 'First September Transaction',
      },
      {
        'date': '02/09/2017',
        'creditAmount': 0,
        'debitAmount': 50,
        'accountBalance': 850,
        'description': 'Second September Transaction',
      }
    ]).then(() => {
      let report = rf.report;
      report.filterMonth('201709');

      expect(report).to.have.property('transactions').with.lengthOf(2);
      expect(!!report.transactions.find((txn) => {return txn.description==='First September Transaction';})).to.be.true;
      expect(!!report.transactions.find((txn) => {return txn.description==='Second September Transaction';})).to.be.true;
      expect(!!report.transactions.find((txn) => {return txn.description==='January Transaction';})).to.be.false;

      report.filterMonth('201701');
      expect(report).to.have.property('transactions').with.lengthOf(1);
      expect(!!report.transactions.find((txn) => {return txn.description==='First September Transaction';})).to.be.false;
      expect(!!report.transactions.find((txn) => {return txn.description==='Second September Transaction';})).to.be.false;
      expect(!!report.transactions.find((txn) => {return txn.description==='January Transaction';})).to.be.true;

      report.filterMonth('201801');
      expect(report).to.have.property('transactions').with.lengthOf(0);

      rf.addRecords([{
        'date': '01/01/2018',
        'creditAmount': 1000,
        'debitAmount': 0,
        'accountBalance': 1000,
        'description': 'January 2018 Transaction',
      }]);
    }).then(() => {
      let report = rf.report;

      expect(report).to.have.property('transactions').with.lengthOf(1);
      expect(report.transactions[0].description).to.equal('January 2018 Transaction');

      report.filterMonth('201701');
      expect(report).to.have.property('transactions').with.lengthOf(1);

      report.resetFilter();
      expect(report).to.have.property('transactions').with.lengthOf(4);
    });
  });
  it('Can be configured to only keep unique transactions', () => {
    let rf = new ReportFactory({ unique: false, });

    return rf.fromRecords([
      {
        'date': '01/01/2017',
        'creditAmount': 0,
        'debitAmount': 1000,
        'accountBalance': 1000,
        'description': 'January Transaction',
      },
      {
        date: '01/01/2017',
        creditAmount: 0,
        debitAmount: 1000,
        accountBalance: 1000,
        description: 'January Transaction',
      },
      {
        date: '02/01/2017',
        creditAmount: 0,
        debitAmount: 150,
        accountBalance: 1000,
        description: 'January Transaction',
      }
    ]).then(() => {
      let report = rf.report;
      expect(report).to.have.property('transactions').with.lengthOf(3);
      expect(moment(report.transactions[0].date).isSame(moment('2017-01-01T00:00:00Z'))).to.be.true;
      expect(moment(report.transactions[1].date).isSame(moment('2017-01-01T00:00:00Z'))).to.be.true;
      expect(moment(report.transactions[2].date).isSame(moment('2017-01-02T00:00:00Z'))).to.be.true;
      rf = new ReportFactory({ unique: true, });

      return rf.fromRecords([
        {
          'date': '01/01/2017',
          'creditAmount': 0,
          'debitAmount': 1000,
          'description': 'January Transaction',
        },
        {
          date: '01/01/2017',
          creditAmount: 0,
          debitAmount: 1000,
          description: 'January Transaction',
        },
        {
          date: '02/01/2017',
          creditAmount: 0,
          debitAmount: 150,
          description: 'January Transaction',
        }
      ]).then(() => {
        let report = rf.report;

        expect(report).to.have.property('transactions').with.lengthOf(2);
        expect(moment(report.transactions[0].date).isSame(moment('2017-01-01T00:00:00Z'))).to.be.true;
        expect(moment(report.transactions[1].date).isSame(moment('2017-01-02T00:00:00Z'))).to.be.true;

        rf = new ReportFactory({  unique: true, });

        return rf.fromRecords([
          {
            'date': '01/01/2017',
            'creditAmount': 0,
            'debitAmount': 1000,
            'accountBalance': 1000,
            'description': 'January Transaction',
          },
          {
            'date': '01/01/2017',
            'creditAmount': 0,
            'debitAmount': 1000,
            'accountBalance':  1000,
            'description': 'January Transaction',
          },
          {
            'date': '01/01/2017',
            'creditAmount': 0,
            'debitAmount': 1000,
            'accountBalance': 2000,
            'description': 'January Transaction',
          },
        ]).then(() => {
          rf.addRecords([
            {
              'date': '01/01/2017',
              'creditAmount': 0,
              'debitAmount': 1000,
              'accountBalance': 1000,
              'description': 'January Transaction',
            },
          ])
        }).then(() => {
          let report = rf.report;
          expect(report).to.have.property('transactions').with.lengthOf(2);
          expect(report.transactions[0].accountBalance).to.equal(1000);
          expect(report.transactions[1].accountBalance).to.equal(2000);
        })
      });
    });
  });

  it ('can combine many sources', () => {
    let rf = new ReportFactory();

    return rf.addRecords([{ 'date': '01/01/2017', 'creditAmount': 0, 'debitAmount': 1000, 'description': 'Desc 1' }])
    .then(() => rf.addRecords([{ 'date': '01/01/2017', 'creditAmount': 0, 'debitAmount': 1000, 'description': 'Desc 2' }]))
    .then(() => rf.fromCSV(
`"user","department","pan","date","description","client","type","free type","currency","credit","debit","net","fee","local currency","country","mcc"
"John Doe","","5116********4444","14/12/2017","AUTH: BURGER,,LONDON","","","","GBP","","76.65","76.65","","","GB","5812"
"John Doe","","5116********4444","14/12/2017","Card Load","","","","GBP","150.00","","150.00","","","","0"`
    , 'fairfx-corp'))
    .then(() => rf.fromCSV(
`Transaction Date,Transaction Type,Sort Code,Account Number,Transaction Description,Debit Amount,Credit Amount,Balance,
30/01/2017,BGC,'00-00-00,12345678,CELERY,,1234.56,1234.56
27/01/2017,DEB,'00-00-00,12345678,ASDA SUPERSTORE,18.86,,1215.7
`
    , 'lloyds'))
    .then(() => {
      let report = rf.report;

      expect(report).to.have.property('transactions').with.lengthOf(6);
      expect(report.transactions[0].description).to.equal('Desc 1');
      expect(report.transactions[1].description).to.equal('Desc 2');
      expect(report.transactions[2].description).to.equal('AUTH: BURGER,,LONDON');
      expect(report.transactions[2].debitAmount).to.equal(76.65);
      expect(report.transactions[3].creditAmount).to.equal(150);
      expect(report.transactions[3].description).to.equal('Card Load');
      expect(report.transactions[4].creditAmount).to.equal(1234.56);
      expect(report.transactions[4].description).to.equal('CELERY');
      expect(report.transactions[4].debitAmount).to.equal(0);
      expect(report.transactions[5].description).to.equal('ASDA SUPERSTORE');
      expect(report.transactions[5].debitAmount).to.equal(18.86);
      expect(report.transactions[5].creditAmount).to.equal(0);
    });
  });
  it ('can remove transactions', () => {
    let rf = new ReportFactory();
    return rf.addRecords([{
      date: '2018-01-01',
      identifier: 'a1',
    }, {
      date: '2018-01-01',
      identifier: 'a2',
    }, {
      date: '2018-01-03',
      identifier: 'a3',
    }, {
      date: '2018-01-04',
      identifier: 'a4',
    }])
    .then(() => {
      rf.removeRecords(['a2','a3','b'])
    })
    .then(() => {
      expect(rf.report.transactions.map(t => t.identifier))
      .to.deep.equal(['a1','a4'])
    })
  })
});
