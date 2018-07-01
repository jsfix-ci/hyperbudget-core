import * as validator from "./validator";
import { validate_categories } from "./category";

export const validate_transaction = (transaction: any): string[] => {
  if (typeof transaction !== 'object') {
    return ['transaction'];
  }

  let errors = validator.validate_complex('transaction', transaction, {
    identifier: { rule: validator.is_string_not_empty },
    txn_date: { rule: validator.is_date },
    txn_type: { rule: validator.is_string_not_empty },
    acc_number: {
      rule: (t) => validator.is_string(t) || validator.is_number(t),
      optional: true
    },
    txn_desc: { rule: validator.is_string_not_empty },
    txn_amount_debit: { rule: validator.is_number, optional: true, default: 0 },
    txn_amount_credit: { rule: validator.is_number, optional: true, default: 0 },
    txn_src: { rule: validator.is_string_not_empty },
    acc_balance: { rule: validator.is_number, optional: true },
    month: { rule: validator.is_string_not_empty },
    org_month: { rule: validator.is_string_not_empty },
  });

  if (transaction.categories) {
    errors = errors.concat(...validate_categories(transaction.categories).map(e => e.errors));
  }

  return errors;
};

export const validate_transactions =
  (transactions: any[]): {
    id: string,
    idx: number,
    errors: string[]
  }[] => {
    return transactions.map((txn, idx) => {
      let errors = validate_transaction(txn);

      if (errors.length > 0) {
        return {
          id: txn.identifier,
          idx: idx,
          errors:  errors
        }
      }
    }).filter((errors) => errors !== undefined);
  }
