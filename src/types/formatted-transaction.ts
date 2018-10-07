import { Category } from "./category";

/* A formatted version of Transaction for displaying stuff on the frontend only.
* Numbers here are stringified, so you shouldn't add them
Also, this gives 2 new members: catClass (which is the classnames for the categories, and categoryNames which don't include hidden categories.
*/

export type FormattedTransaction = {
  identifier: string;

  type: string;
  description: string;
  source: string;

  catClass: string;
  categoryNames: string;
  categories: Category[],

  creditAmount:  number;
  debitAmount:  number;
  accountBalance:  number;

  creditAmountStr:  string;
  debitAmountStr:  string;
  accountBalanceStr:  string;

  date: string;
  runningTotalSpend: string;
}
