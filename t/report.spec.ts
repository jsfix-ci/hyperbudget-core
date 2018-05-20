//mocha -r ts-node/register  src/t/report.spec.ts
import { Report, ReportFactory } from '../src/lib/report';
import { Transaction } from '../src/lib/transaction';

import * as path from 'path';

import { expect, assert } from 'chai';
import 'mocha';

describe('ReportFactory', () => {
  it('can be initiated', () => {
    assert.ok(new ReportFactory());
  });

  it('creates report objects', () => {
    let rf = new ReportFactory();

    return rf.from_records([{
      'txn_date': '01/01/2017',
      'txn_amount_credit': '1000',
      'txn_amount_debit': 0,
      'acc_balance': '1000',
      'txn_desc': 'Some Transaction',
    }]).then(function() {
      let report = rf.report;

      assert.ok(report);
      expect(report).to.have.property('transactions').with.lengthOf(1);

      let transaction = report.transactions[0];
      assert.ok(transaction);
      expect(transaction).to.have.property('txn_amount_credit');
      expect(transaction.txn_amount_credit).to.equal(1000);
      expect(transaction).to.be.an.instanceOf(Transaction);
    });
  });

  it('Correctly filters', () => {
    let rf = new ReportFactory();
    return rf.from_records([
      {
        'txn_date': '01/01/2017',
        'txn_amount_credit': 1000,
        'txn_amount_debit': 0,
        'acc_balance': 1000,
        'txn_desc': 'January Transaction',
      },
      {
        'txn_date': '01/09/2017',
        'txn_amount_credit': 0,
        'txn_amount_debit': 100,
        'acc_balance': 900,
        'txn_desc': 'First September Transaction',
      },
      {
        'txn_date': '02/09/2017',
        'txn_amount_credit': 0,
        'txn_amount_debit': 50,
        'acc_balance': 850,
        'txn_desc': 'Second September Transaction',
      }
    ]).then(function() {
      let report = rf.report;
      report.filter_month('201709');

      expect(report).to.have.property('transactions').with.lengthOf(2);
      expect(!!report.transactions.find(function(txn){return txn.txn_desc==='First September Transaction';})).to.be.true;
      expect(!!report.transactions.find(function(txn){return txn.txn_desc==='Second September Transaction';})).to.be.true;
      expect(!!report.transactions.find(function(txn){return txn.txn_desc==='January Transaction';})).to.be.false;
    });
  });
  it('Can be configured to only keep unique transactions', () => {
    let rf = new ReportFactory({ unique_only: false, });

    return rf.from_records([
      {
        'txn_date': '01/01/2017',
        'txn_amount_credit': 0,
        'txn_amount_debit': 1000,
        'acc_balance': 1000,
        'txn_desc': 'January Transaction',
      },
      {
        txn_date: '01/01/2017',
        txn_amount_credit: 0,
        txn_amount_debit: 1000,
        acc_balance: 1000,
        txn_desc: 'January Transaction',
      },
      {
        txn_date: '02/01/2017',
        txn_amount_credit: 0,
        txn_amount_debit: 150,
        acc_balance: 1000,
        txn_desc: 'January Transaction',
      }
    ]).then(function() {
      let report = rf.report;
      expect(report).to.have.property('transactions').with.lengthOf(3);
      expect(report.transactions[0].txn_date.getDate()).to.equal(new Date('2017-01-01').getDate());
      expect(report.transactions[1].txn_date.getDate()).to.equal(new Date('2017-01-01').getDate());
      expect(report.transactions[2].txn_date.getDate()).to.equal(new Date('2017-01-02').getDate());
      rf = new ReportFactory({ unique_only: true, });

      return rf.from_records([
        {
          'txn_date': '01/01/2017',
          'txn_amount_credit': 0,
          'txn_amount_debit': 1000,
          'txn_desc': 'January Transaction',
        },
        {
          txn_date: '01/01/2017',
          txn_amount_credit: 0,
          txn_amount_debit: 1000,
          txn_desc: 'January Transaction',
        },
        {
          txn_date: '02/01/2017',
          txn_amount_credit: 0,
          txn_amount_debit: 150,
          txn_desc: 'January Transaction',
        }
      ]).then(function() {
        let report = rf.report;

        expect(report).to.have.property('transactions').with.lengthOf(2);
        expect(report.transactions[0].txn_date.getDate()).to.equal(new Date('2017-01-01').getDate());
        expect(report.transactions[1].txn_date.getDate()).to.equal(new Date('2017-01-02').getDate());

        rf = new ReportFactory({  unique_only: true, });

        return rf.from_records([
          {
            'txn_date': '01/01/2017',
            'txn_amount_credit': 0,
            'txn_amount_debit': 1000,
            'acc_balance': 1000,
            'txn_desc': 'January Transaction',
          },
          {
            'txn_date': '01/01/2017',
            'txn_amount_credit': 0,
            'txn_amount_debit': 1000,
            'acc_balance':  1000,
            'txn_desc': 'January Transaction',
          },
          {
            'txn_date': '01/01/2017',
            'txn_amount_credit': 0,
            'txn_amount_debit': 1000,
            'acc_balance': 2000,
            'txn_desc': 'January Transaction',
          },
        ]).then(() => {
          rf.add_records([
            {
              'txn_date': '01/01/2017',
              'txn_amount_credit': 0,
              'txn_amount_debit': 1000,
              'acc_balance': 1000,
              'txn_desc': 'January Transaction',
            },
          ])
        }).then(function() {
          let report = rf.report;
          expect(report).to.have.property('transactions').with.lengthOf(2);
          expect(report.transactions[0].acc_balance).to.equal(1000);
          expect(report.transactions[1].acc_balance).to.equal(2000);
        })
      });
    });
  });

  it ('can combine many sources', () => {
    let rf = new ReportFactory();

    return rf.add_records([{ 'txn_date': '01/01/2017', 'txn_amount_credit': 0, 'txn_amount_debit': 1000, 'txn_desc': 'Desc 1' }])
    .then(() => rf.add_records([{ 'txn_date': '01/01/2017', 'txn_amount_credit': 0, 'txn_amount_debit': 1000, 'txn_desc': 'Desc 2' }]))
    .then(() => rf.from_csv(
`"user","department","pan","date","description","client","type","free type","currency","credit","debit","net","fee","local currency","country","mcc"
"John Doe","","5116********4444","14/12/2017","AUTH: BURGER,,LONDON","","","","GBP","","76.65","76.65","","","GB","5812"
"John Doe","","5116********4444","14/12/2017","Card Load","","","","GBP","150.00","","150.00","","","","0"`
    , 'fairfx-corp'))
    .then(() => rf.from_csv(
`Transaction Date,Transaction Type,Sort Code,Account Number,Transaction Description,Debit Amount,Credit Amount,Balance,
30/01/2017,BGC,'00-00-00,12345678,CELERY,,1234.56,1234.56
27/01/2017,DEB,'00-00-00,12345678,ASDA SUPERSTORE,18.86,,1215.7
`
    , 'lloyds'))
    .then(() => {
      let report = rf.report;

      expect(report).to.have.property('transactions').with.lengthOf(6);
      expect(report.transactions[0].txn_desc).to.equal('Desc 1');
      expect(report.transactions[1].txn_desc).to.equal('Desc 2');
      expect(report.transactions[2].txn_desc).to.equal('AUTH: BURGER,,LONDON');
      expect(report.transactions[2].txn_amount_debit).to.equal(76.65);
      expect(report.transactions[3].txn_amount_credit).to.equal(150);
      expect(report.transactions[3].txn_desc).to.equal('Card Load');
      expect(report.transactions[4].txn_amount_credit).to.equal(1234.56);
      expect(report.transactions[4].txn_desc).to.equal('CELERY');
      expect(report.transactions[4].txn_amount_debit).to.equal(0);
      expect(report.transactions[5].txn_desc).to.equal('ASDA SUPERSTORE');
      expect(report.transactions[5].txn_amount_debit).to.equal(18.86);
      expect(report.transactions[5].txn_amount_credit).to.equal(0);
    });
  });
});
