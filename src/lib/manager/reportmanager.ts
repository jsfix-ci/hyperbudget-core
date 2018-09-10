import { Transaction } from '../transaction';
import { Categoriser } from '../categoriser';
import { Category } from '../../types/category';
import { FormattedTransaction } from '../../types/formatted-transaction';
import { CategoryAmounts } from '../../types/category-amounts';

import * as Utils from '../utils';
import ReportFactory from '../report';

import moment from 'moment';
import { BreakdownFormatted, Breakdown } from '../../types/breakdown';

/**
 * Temporary business logic wrapper to aid refactoring
 */
export class ReportBusinessLogic {
  rf: ReportFactory;

  constructor() {
    this.rf = new ReportFactory();
  }
  addTransactionsFromObject (records: any[]) {
    return this.rf.addRecords(records).then(() => (
      this.translatedTransactions()
    ));
  }
  addTransactionsFromCSV (csv_text: string, source: string) {
    return this.rf.fromCSV(csv_text, source).then(() => (
      this.translatedTransactions()
    ))
  }
  categoriseTransactions(categories: Category[]) {
    const categoriser = new Categoriser(categories);
    return categoriser.categorise_transactions(this.rf.report.transactions).then(() => (
      this.translatedTransactions()
    ));
  }
  filterTransactionsByMonth(month: string) {
    this.rf.report.filterMonth(month);
    return this.translatedTransactions();
  }
  resetFilter() {
    this.rf.report.resetFilter();
    return this.translatedTransactions();
  }
  translatedTransactions() {
    return this.rf.report.transactions.map((txn: Transaction) => ({
      identifier: txn.identifier,
      date: txn.date,
      type: txn.type,
      description: txn.description,
      accountSortcode: txn.accountSortCode,
      accountNumber: txn.accountNumber,
      accountBalance: txn.accountBalance,
      debitAmount: txn.debitAmount,
      creditAmount: txn.creditAmount,
      source: txn.source,
      categoryIds: txn.categories.map(cat => cat.id),
      calculatedMonth: txn.calculatedMonth,
      calendarMonth: txn.calendarMonth,
    }));
  }
}

export class ReportManager {
  static generateWebFrontendReport (txns: Transaction[]): FormattedTransaction[] {
    let formatted: FormattedTransaction[] = JSON.parse(JSON.stringify(txns));
    let runningTotalSpend: number = 0;

    formatted.forEach((formattedTxn: FormattedTransaction) => {
      formattedTxn.catClass      = formattedTxn.categories.map((c: Category) => c.className).join(" ");
      formattedTxn.categoryNames = formattedTxn.categories.filter((c: Category) => !c.hidden_on_txn_list)
      .map((c:Category) => c.name).join(", ");

      formattedTxn.creditAmountStr = Utils.format_number(formattedTxn.creditAmount);
      formattedTxn.debitAmountStr  = Utils.format_number(formattedTxn.debitAmount);
      formattedTxn.accountBalanceStr = Utils.format_number(formattedTxn.accountBalance);

      formattedTxn.date = moment(formattedTxn.date).utc().format('YYYY-MM-DD');

      let skip_running = formattedTxn.categories.find((c: Category) => c.hidden_on_running_total);

      if (formattedTxn.debitAmount && !skip_running) {
        runningTotalSpend += Math.abs(formattedTxn.debitAmount);
      }

      formattedTxn.runningTotalSpend = Utils.format_number(runningTotalSpend);
    });

    return formatted;
  }

  static generateCategoryAmounts (categoriser: Categoriser, txns: Transaction[], txnInCalendarMonth: Transaction[]): CategoryAmounts {
    let categoryAmounts: CategoryAmounts = {};

    let cats: Category[] = categoriser.categories

    cats.forEach((c: Category) => {
      if (!c.hidden_on_cat_list) {
        categoryAmounts[c.name] = { name: c.name, total: 0, className: c.className, count: 0 };
      }
    });

    txns.forEach((txn: Transaction) => {
      txn.categories.forEach((cat: Category) => {
        // It's the category being listed isn't internal_transfer but the txn cat is, skipit.
        if (! (cat.id !== 'tfr-pers' && Categoriser.is_internal_transfer(txn)) ) {
          if (!cat.hidden_on_cat_list) {
            (<number>categoryAmounts[cat.name].total) += txn.creditAmount - txn.debitAmount;
            categoryAmounts[cat.name].count++;
          }
        }
      });
    });

    let lloydsMatch = txnInCalendarMonth.filter( (txn) => txn.source === 'Lloyds' );

    categoryAmounts['lloyds_match_in'] = {
      name: 'Lloyds Reconciliation - in',
      id: 'lloyds-match-in',
      className: 'lloyds-match',
      total: lloydsMatch.reduce((prev: number, next: Transaction) => { return prev + next.creditAmount; }, 0),
      count: lloydsMatch.filter((txn) => txn.creditAmount > 0).length
    };

    categoryAmounts['lloyds_match_out'] = {
      name: 'Lloyds Reconciliation - out',
      id: 'lloyds-match-out',
      className: 'lloyds-match',
      total: lloydsMatch.reduce((prev: number, next: Transaction) => { return prev - next.debitAmount; }, 0),
      count: lloydsMatch.filter((txn) => txn.debitAmount > 0).length
    };

    //XXX UGLY
    if (categoryAmounts['Income'] && categoryAmounts['Expenditure']) {
      categoryAmounts['total_gains'] = { name: 'In-Out', className: 'gains', total: Math.abs(+categoryAmounts['Income'].total) - Math.abs(+categoryAmounts['Expenditure'].total), count: 0 };
    }

    return categoryAmounts;
  }

  /**
   * Turns categoryAmounts objects (`{ id => id, name, className, total, count }` into an array of {id, name, className, total, count})
   * @param categoriser Categoriser
   * @param txns Transactions in view
   * @param txnInCalendarMonth Transactions in calendar month, just for lloyds hack
   */
  static generateCategoryAmountsFrontend (categoriser: Categoriser, txns: Transaction[], txnInCalendarMonth: Transaction[]) {
    let categoryAmounts = ReportManager.generateCategoryAmounts(categoriser, txns, txnInCalendarMonth);
    let filtered = Object.keys(categoryAmounts).map((k) => {
      let catAmt = categoryAmounts[k];
      catAmt.total = Utils.format_number(+catAmt.total);
      return catAmt;
    });

    return filtered.filter(c => c.total && c.total != '0.00');
  }

  static generateMonthlyBreakdown (txns: Transaction[], months: string[]): Breakdown {
    let breakdown: Breakdown = {};

    months.forEach((month: string) => {
      breakdown[month] = { in: 0, main_in: 0, out: 0, gains: 0, main_gains: 0, running: 0, running_main: 0};
    });

    let running: number = 0;
    let running_main: number = 0;

    txns.forEach((txn: Transaction) => {
      if (!breakdown[txn.calculatedMonth]) {
        throw new Error("no breakdown for month " + txn.calculatedMonth);
      }

      txn.categories.forEach((cat: Category) => {
        if (cat.id === "income") {
          breakdown[txn.calculatedMonth].in += txn.creditAmount;
        } else if (cat.id === "main-income") {
          breakdown[txn.calculatedMonth].main_in += txn.creditAmount;
        } else if (cat.id === 'exp') {
          breakdown[txn.calculatedMonth].out += Math.abs(txn.debitAmount);
        }
      });
    });

    months.forEach((month: string) => {
      breakdown[month].gains = breakdown[month].in - breakdown[month].out;
      breakdown[month].main_gains = breakdown[month].main_in - breakdown[month].out;

      running += breakdown[month].gains;
      running_main += breakdown[month].main_gains;

      breakdown[month].running = running;
      breakdown[month].running_main = running_main;
    });


    return breakdown;
  }

  static generateMonthlyBreakdownFrontend (txns: Transaction[], months: string[]): BreakdownFormatted[] {
    let breakdown = ReportManager.generateMonthlyBreakdown(txns, months);

    return Object.keys(breakdown).map((k) => {
      return {
        month: k,
        in: breakdown[k].in.toFixed(2),
        out: breakdown[k].out.toFixed(2),
        gains: breakdown[k].gains.toFixed(2),
        main_in: breakdown[k].main_in.toFixed(2),
        main_gains: breakdown[k].main_gains.toFixed(2),
        running: breakdown[k].running.toFixed(2),
        running_main: breakdown[k].running_main.toFixed(2),
      };
    });
  }
}
