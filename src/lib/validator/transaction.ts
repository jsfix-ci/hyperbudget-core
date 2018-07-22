import * as jsonschema from 'jsonschema';
const txnSchema = require ('../../schema/Transaction.json');
const catSchema = require ('../../schema/Category.json');

export const validate_transaction = (transaction: any): jsonschema.ValidationError[] => {
  const validator = new jsonschema.Validator();
  validator.addSchema(catSchema, "/Category.json");

  const result: jsonschema.ValidatorResult = validator.validate(transaction, txnSchema);

  result.errors.forEach(e => {
    delete e.schema;
    delete e.instance;
  });

  return result.errors;
};

export const validate_transactions =
  (transactions: any[]): {
    id: string,
    idx: number,
    errors: jsonschema.ValidationError[]
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
