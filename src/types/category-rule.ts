import { NumericMatchConfig, StringMatchConfig } from "./match-config";

export type CategoryRule = {
  txn_day?: NumericMatchConfig,
  description?: StringMatchConfig;
  type?: StringMatchConfig;
  source?: StringMatchConfig;
  debitAmount?: NumericMatchConfig;
  creditAmount?: NumericMatchConfig;
  [key: string]: any,
};
