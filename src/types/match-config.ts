import { RuleMatchMode } from "../lib/enums";

export type NumericMatchConfig = {
  mode?: RuleMatchMode;
  rules: [NumberMatchOp, number][],
};

export type StringMatchConfig = {
  mode?: RuleMatchMode;
  rules: [ StringMatchOp, string ][],
};

export type IdentifierMatchConfig = {
  rules: [IdentifierMatchOp, string][],
}

export type NumberMatchOp = '='|'!='|'>'|'<'|'>='|'<=';
export type StringMatchOp = '='|'!='|'=~'|'!~';
export type IdentifierMatchOp = '=';
