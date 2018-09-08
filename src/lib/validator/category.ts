import { RuleMatchMode } from "../enums";
import * as validator from "./validator";

const validate_category_rule = (input: any, callback: (rule: any) => {}) => {
  if (input.mode !== undefined && input.mode !== RuleMatchMode.Strict && input.mode !== RuleMatchMode.Flex) {
    return false;
  }

  if (!(input.rules && Array.isArray(input.rules))) {
    return false;
  }

  for (var i = 0; i < input.rules.length; i++) {
    let rule: any[] = input.rules[i];

    if (!(rule && Array.isArray(rule) && rule.length == 2)) {
      return false;
    }

    if (!callback(rule)) {
      return false;
    }
  }

  return true;
}

const validate_category_number_rule = (input: any) => {
  return validate_category_rule(input, (rule: any[]) => {
    if (!rule[0].match(/^(=|\!=|\>|\<|\>=|\<=)$/)) {
      return false;
    }

    if (!('' + rule[1]).match(/\d+/)) {
      return false;
    }

    return true;
  });
}

const validate_category_string_rule = (input: any) => {
  return validate_category_rule(input, (rule: any[]) => {
    if (!rule[0].match(/^(=|\!=|=\~|\!\~)$/)) {
      return false;
    }

    return true;
  });
}

const validate_category_rules = (category_rules: any): string[] => {
  if (typeof category_rules !== 'object') {
    return ['category.category_rules'];
  }

  return validator.validate_complex('category.category_rules', category_rules, {
    txn_day: { rule: validate_category_number_rule, optional: true },
    description: { rule:  validate_category_string_rule, optional: true },
    type: { rule: validate_category_string_rule, optional: true },
    debitAmount: { rule: validate_category_number_rule, optional: true },
    creditAmount: { rule: validate_category_number_rule, optional: true },
  });
};

export const validate_category = (category: any): string[] => {
  if (typeof category !== 'object') {
    return ['category'];
  }

  let errors = validate_category_rules(category.category_rules);

  errors = errors.concat(validator.validate_complex('category', category, {
    id: { rule: validator.is_string_not_empty },
    name: { rule: validator.is_string_not_empty },
    className: { rule: validator.is_string },
    hidden_on_cat_list: { rule: validator.is_boolean, optional: true },
    hidden_on_txn_list: { rule: validator.is_boolean, optional: true },
    hidden_on_running_total: { rule: validator.is_boolean, optional: true },
    txn_month_modifier: { rule: validator.is_number, optional: true },
  }));

  return errors;
};

export const validate_categories =
  (categories: any[]): {
    id: string,
    idx: number,
    errors: string[]
  }[] => {
    return categories.map((cat, idx) => {
      let errors = validate_category(cat);

      if (errors.length > 0) {
        return {
          id: cat.id,
          idx: idx,
          errors:  errors
        }
      }
    }).filter((errors) => errors !== undefined);
  }
