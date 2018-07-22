import * as jsonschema from 'jsonschema';
const schema = require ('../../schema/Category.json');

export const validate_category = (category: any): jsonschema.ValidationError[] => {
  const validator = new jsonschema.Validator();
  const result: jsonschema.ValidatorResult = validator.validate(category, schema);

  result.errors.forEach(e => {
    delete e.schema;
    delete e.instance;
  });

  return result.errors;
};

export const validate_categories =
  (categories: any[]): {
    id: string,
    idx: number,
    errors: jsonschema.ValidationError[]
  }[] => {
    return categories.map((cat, idx) => {
      let errors = validate_category(cat);

      if (errors.length > 0) {
        return {
          id: cat.id,
          idx: idx,
          errors: errors
        }
      }
    }).filter((errors) => errors !== undefined);
  };
