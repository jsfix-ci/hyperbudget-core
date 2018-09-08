import { Transaction } from '../transaction';
import { Categoriser } from '../categoriser';
import { Category } from '../../types/category';
import { FormattedTransaction } from '../../types/formatted-transaction';
import { CategoryAmounts } from '../../types/category-amounts';

import { Utils } from '../utils';
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
  static generate_web_frontend_report (txns: Transaction[]): FormattedTransaction[] {
    let formatted: FormattedTransaction[] = JSON.parse(JSON.stringify(txns));
    let running_total_spend: number = 0;

    formatted.forEach((formatted_txn: FormattedTransaction) => {
      formatted_txn.cat_class      = formatted_txn.categories.map((c: Category) => c.className).join(" ");
      formatted_txn.category_names = formatted_txn.categories.filter((c: Category) => !c.hidden_on_txn_list)
      .map((c:Category) => c.name).join(", ");

      formatted_txn.creditAmountStr = Utils.format_number(formatted_txn.creditAmount);
      formatted_txn.debitAmountStr  = Utils.format_number(formatted_txn.debitAmount);
      formatted_txn.accountBalance_str       = Utils.format_number(formatted_txn.accountBalance);

      formatted_txn.date              = moment(formatted_txn.date).utc().format('YYYY-MM-DD');

      let skip_running = formatted_txn.categories.find((c: Category) => c.hidden_on_running_total);

      if (formatted_txn.debitAmount && !skip_running) {
        running_total_spend += Math.abs(formatted_txn.debitAmount);
      }

      formatted_txn.running_total_spend = Utils.format_number(running_total_spend);
    });

    return formatted;
  }

  static generate_category_amounts (categoriser: Categoriser, txns: Transaction[], org_txns: Transaction[]): CategoryAmounts {
    let cat_amts: CategoryAmounts = {};

    let cats: Category[] = categoriser.categories

    cats.forEach((c: Category) => {
      if (!c.hidden_on_cat_list) {
        cat_amts[c.name] = { name: c.name, total: 0, className: c.className, count: 0 };
      }
    });

    txns.forEach((txn: Transaction) => {
      txn.categories.forEach((cat: Category) => {
        // It's the category being listed isn't internal_transfer but the txn cat is, skipit.
        if (! (cat.id !== 'tfr-pers' && Categoriser.is_internal_transfer(txn)) ) {
          if (!cat.hidden_on_cat_list) {
            (<number>cat_amts[cat.name].total) += txn.creditAmount - txn.debitAmount;
            cat_amts[cat.name].count++;
          }
        }
      });
    });

    let lloyds_match = org_txns.filter( (txn) => txn.source === 'Lloyds' );

    cat_amts['lloyds_match_in'] = {
      name: 'Lloyds Reconciliation - in',
      id: 'lloyds-match-in',
      className: 'lloyds-match',
      total: lloyds_match.reduce((prev: number, next: Transaction) => { return prev + next.creditAmount; }, 0),
      count: lloyds_match.filter((txn) => txn.creditAmount > 0).length
    };

    cat_amts['lloyds_match_out'] = {
      name: 'Lloyds Reconciliation - out',
      id: 'lloyds-match-out',
      className: 'lloyds-match',
      total: lloyds_match.reduce((prev: number, next: Transaction) => { return prev - next.debitAmount; }, 0),
      count: lloyds_match.filter((txn) => txn.debitAmount > 0).length
    };

    //XXX UGLY
    if (cat_amts['Income'] && cat_amts['Expenditure']) {
      cat_amts['total_gains'] = { name: 'In-Out', className: 'gains', total: Math.abs(+cat_amts['Income'].total) - Math.abs(+cat_amts['Expenditure'].total), count: 0 };
    }

    return cat_amts;
  }

  static generate_category_amounts_frontend (categoriser: Categoriser, txns: Transaction[], org_txns: Transaction[]): CategoryAmounts {
    let cat_amts = ReportManager.generate_category_amounts(categoriser, txns, org_txns);
    let filtered:any  = Object.keys(cat_amts).map((k) => {
      let filtered:any = cat_amts[k];
      filtered.total = Utils.format_number(filtered.total);
      return filtered;
    });

    return filtered.filter((c: any) => c.total && c.total != '0.00');
  }

  static generate_monthly_breakdown (txns: Transaction[], months: string[]): Breakdown {
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

  static generate_monthly_breakdown_frontend (txns: Transaction[], months: string[]): BreakdownFormatted[] {
    let breakdown = ReportManager.generate_monthly_breakdown(txns, months);

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
