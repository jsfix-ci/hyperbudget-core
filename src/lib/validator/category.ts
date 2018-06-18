import { RuleMatchMode } from "../enums";

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

const validate_complex = (
  name: string,
  obj: { [key: string]: any },
  rules: { [key: string]: { rule: (thing: any) => boolean, optional?: boolean }}
): string[] => {
  let invalid: string[] = [];

  Object.keys(rules).forEach((key) => {
    if (obj[key] === undefined) {
      if (!rules[key].optional) {
        invalid.push(`${name}.${key}`);
        return false;
      } else {
        return true;
      }
    }

    if (!rules[key].rule(obj[key])) {
      invalid.push(`${name}.${key}`);
      return false;
    }
  });

  return invalid;
}

const _is_string = (thing: any): boolean => typeof(thing) === 'string';
const _is_number = (thing: any): boolean => typeof(thing) === 'number' && !isNaN(thing);
const _is_boolean = (thing: any): boolean => typeof(thing) === 'boolean';
const _is_string_not_empty = (thing: any): boolean => _is_string(thing) && thing.length > 0;

const validate_category_rules = (category_rules: any): string[] => {
  if (typeof category_rules !== 'object') {
    return ['category.category_rules'];
  }

  return validate_complex('category.category_rules', category_rules, {
    txn_day: { rule: validate_category_number_rule, optional: true },
    txn_desc: { rule:  validate_category_string_rule, optional: true },
    txn_type: { rule: validate_category_string_rule, optional: true },
    txn_amount_debit: { rule: validate_category_number_rule, optional: true },
    txn_amount_credit: { rule: validate_category_number_rule, optional: true },
  });
};

export const validate_category = (category: any): string[] => {
  if (typeof category !== 'object') {
    return ['category'];
  }

  let errors = validate_category_rules(category.category_rules);

  errors = errors.concat(validate_complex('category', category, {
    id: { rule: _is_string_not_empty },
    name: { rule: _is_string_not_empty },
    className: { rule: _is_string },
    hidden_on_cat_list: { rule: _is_boolean, optional: true },
    hidden_on_txn_list: { rule: _is_boolean, optional: true },
    hidden_on_running_total: { rule: _is_boolean, optional: true },
    txn_month_modifier: { rule: _is_number, optional: true },
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