import { NumericMatchConfig, StringMatchConfig, IdentifierMatchConfig } from "./match-config";
import { RuleMatchMode } from "../lib/enums";

export type CategoryRule = {
  identifier?: IdentifierMatchConfig,
  txn_day?: NumericMatchConfig,
  description?: StringMatchConfig;
  type?: StringMatchConfig;
  source?: StringMatchConfig;
  debitAmount?: NumericMatchConfig;
  creditAmount?: NumericMatchConfig;
  mode?: RuleMatchMode;
  [key: string]: any,
};
