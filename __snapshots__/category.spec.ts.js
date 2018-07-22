exports['Category Validation validates categories 1'] = [
  {
    "property": "instance",
    "message": "is not of a type(s) object",
    "name": "type",
    "argument": [
      "object"
    ],
    "stack": "instance is not of a type(s) object"
  }
]

exports['Category Validation validates categories 2'] = [
  {
    "property": "instance",
    "message": "requires property \"id\"",
    "name": "required",
    "argument": "id",
    "stack": "instance requires property \"id\""
  },
  {
    "property": "instance",
    "message": "requires property \"name\"",
    "name": "required",
    "argument": "name",
    "stack": "instance requires property \"name\""
  },
  {
    "property": "instance",
    "message": "requires property \"category_rules\"",
    "name": "required",
    "argument": "category_rules",
    "stack": "instance requires property \"category_rules\""
  }
]

exports['Category Validation validates categories 3'] = [
  {
    "property": "instance.id",
    "message": "does not meet minimum length of 1",
    "name": "minLength",
    "argument": 1,
    "stack": "instance.id does not meet minimum length of 1"
  },
  {
    "property": "instance.name",
    "message": "does not meet minimum length of 1",
    "name": "minLength",
    "argument": 1,
    "stack": "instance.name does not meet minimum length of 1"
  },
  {
    "property": "instance.category_rules",
    "message": "is not of a type(s) object",
    "name": "type",
    "argument": [
      "object"
    ],
    "stack": "instance.category_rules is not of a type(s) object"
  },
  {
    "property": "instance.hidden_on_cat_list",
    "message": "is not of a type(s) boolean",
    "name": "type",
    "argument": [
      "boolean"
    ],
    "stack": "instance.hidden_on_cat_list is not of a type(s) boolean"
  },
  {
    "property": "instance.hidden_on_txn_list",
    "message": "is not of a type(s) boolean",
    "name": "type",
    "argument": [
      "boolean"
    ],
    "stack": "instance.hidden_on_txn_list is not of a type(s) boolean"
  },
  {
    "property": "instance.hidden_on_running_total",
    "message": "is not of a type(s) boolean",
    "name": "type",
    "argument": [
      "boolean"
    ],
    "stack": "instance.hidden_on_running_total is not of a type(s) boolean"
  },
  {
    "property": "instance.txn_month_modifier",
    "message": "is not of a type(s) number",
    "name": "type",
    "argument": [
      "number"
    ],
    "stack": "instance.txn_month_modifier is not of a type(s) number"
  }
]

exports['Category Validation validates categories 4'] = [
  {
    "property": "instance.category_rules",
    "message": "is not of a type(s) object",
    "name": "type",
    "argument": [
      "object"
    ],
    "stack": "instance.category_rules is not of a type(s) object"
  }
]

exports['Category Validation validates categories 5'] = [
  {
    "property": "instance.category_rules.txn_day",
    "message": "is not of a type(s) object",
    "name": "type",
    "argument": [
      "object"
    ],
    "stack": "instance.category_rules.txn_day is not of a type(s) object"
  }
]

exports['Category Validation validates categories 6'] = [
  {
    "id": "",
    "idx": 0,
    "errors": [
      {
        "property": "instance.id",
        "message": "does not meet minimum length of 1",
        "name": "minLength",
        "argument": 1,
        "stack": "instance.id does not meet minimum length of 1"
      },
      {
        "property": "instance.name",
        "message": "does not meet minimum length of 1",
        "name": "minLength",
        "argument": 1,
        "stack": "instance.name does not meet minimum length of 1"
      }
    ]
  },
  {
    "id": "",
    "idx": 1,
    "errors": [
      {
        "property": "instance.id",
        "message": "does not meet minimum length of 1",
        "name": "minLength",
        "argument": 1,
        "stack": "instance.id does not meet minimum length of 1"
      }
    ]
  }
]
