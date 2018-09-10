import { reportManager } from '../../src/lib/manager/reportmanager';
import { Transaction } from '../../src/lib/transaction';
import { expect } from 'chai';

describe('report manager', () => {
  it('groups by type', () => {
    const transactions: Transaction[] = [
      {
        description: 'Virgin Media',
        debitAmount: 40,
        type: 'DD',
        date: '2018-01-01T00:00:00Z',
      },
      {
        description: 'Virgin Media',
        debitAmount: 77,
        type: 'DD',
        date: '2018-02-01T00:00:00Z',
      },
      {
        description: 'Virgin Media',
        debitAmount: 77,
        type: 'DD',
        date: '2018-02-02T00:00:00Z',
      },
      {
        description: 'TFL',
        debitAmount: 130,
        type: 'DD',
        date: '2018-03-01T00:00:00Z',
      },
      {
        description: 'Rent',
        debitAmount: 1000,
        type: 'SO',
        date: '2018-03-07T00:00:00Z',
      },
      {
        description: 'Salary',
        creditAmount: 2000,
        type: 'FPI',
        date: '2018-03-30T00:00:00Z',
      },
      {
        description: 'Some random spends',
        debitAmount: 12,
        type: 'DEB',
        date: '2018-04-01T00:00:00Z'
      },
    ].map(t => new Transaction(t));

    let groups = reportManager.groupByType(transactions, ['DD',  'SO']);
    expect(Object.keys(groups)).to.deep.equal(['DD', 'SO']);
    expect(groups['DD']).to.have.property('transactions').with.lengthOf(2);
    expect(groups['DD'].transactions[0].description).to.equal('Virgin Media');
    expect(groups['DD'].transactions[0].debitAmount).to.equal(77);
    expect(groups['DD'].transactions[1].description).to.equal('TFL');
    expect(groups['DD'].transactions[1].debitAmount).to.equal(130);
    expect(groups['SO']).to.have.property('transactions').with.lengthOf(1);
    expect(groups['SO'].transactions[0].description).to.equal('Rent');
    expect(groups['SO'].transactions[0].debitAmount).to.equal(1000);
  });
});
