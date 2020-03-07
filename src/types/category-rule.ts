import { NumericMatchConfig, StringMatchConfig, IdentifierMatchConfig } from "./match-config";

export type CategoryRule = {
  identifier?: IdentifierMatchConfig,
  txn_day?: NumericMatchConfig,
  description?: StringMatchConfig;
  type?: StringMatchConfig;
  source?: StringMatchConfig;
  debitAmount?: NumericMatchConfig;
  creditAmount?: NumericMatchConfig;
  [key: string]: any,
};
