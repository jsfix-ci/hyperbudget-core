import { Category } from "./category";

/* A formatted version of Transaction for displaying stuff on the frontend only.
* Numbers here are stringified, so you shouldn't add them
Also, this gives 2 new members: cat_class (which is the classnames for the categories, and category_names which don't include hidden categories.
*/

export type FormattedTransaction = {
  txn_type: string;
  txn_desc: string;
  txn_src: string;

  cat_class: string;
  category_names: string;
  categories: Category[],

  txn_amount_credit:  number;
  txn_amount_debit:  number;
  acc_balance:  number;

  txn_amount_credit_str:  string;
  txn_amount_debit_str:  string;
  acc_balance_str:  string;

  txn_date: string;
  running_total_spend: string;
}