exports['Transaction Validation validates transactions 1'] = [
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

exports['Transaction Validation validates transactions 2'] = [
  {
    "property": "instance",
    "message": "requires property \"identifier\"",
    "name": "required",
    "argument": "identifier",
    "stack": "instance requires property \"identifier\""
  },
  {
    "property": "instance",
    "message": "requires property \"txn_date\"",
    "name": "required",
    "argument": "txn_date",
    "stack": "instance requires property \"txn_date\""
  },
  {
    "property": "instance",
    "message": "requires property \"txn_desc\"",
    "name": "required",
    "argument": "txn_desc",
    "stack": "instance requires property \"txn_desc\""
  },
  {
    "property": "instance",
    "message": "requires property \"txn_src\"",
    "name": "required",
    "argument": "txn_src",
    "stack": "instance requires property \"txn_src\""
  },
  {
    "property": "instance",
    "message": "requires property \"month\"",
    "name": "required",
    "argument": "month",
    "stack": "instance requires property \"month\""
  },
  {
    "property": "instance",
    "message": "requires property \"org_month\"",
    "name": "required",
    "argument": "org_month",
    "stack": "instance requires property \"org_month\""
  }
]

exports['Transaction Validation validates transactions 3'] = [
  {
    "property": "instance.identifier",
    "message": "does not meet minimum length of 1",
    "name": "minLength",
    "argument": 1,
    "stack": "instance.identifier does not meet minimum length of 1"
  }
]

exports['Transaction Validation validates transactions 4'] = []

exports['Transaction Validation validates transactions 5'] = [
  {
    "id": "wat",
    "idx": 0,
    "errors": [
      {
        "property": "instance.txn_amount_credit",
        "message": "is not of a type(s) number",
        "name": "type",
        "argument": [
          "number"
        ],
        "stack": "instance.txn_amount_credit is not of a type(s) number"
      }
    ]
  },
  {
    "id": "",
    "idx": 1,
    "errors": [
      {
        "property": "instance.identifier",
        "message": "does not meet minimum length of 1",
        "name": "minLength",
        "argument": 1,
        "stack": "instance.identifier does not meet minimum length of 1"
      }
    ]
  }
]

exports['Transaction Validation validates transactions 6'] = [
  {
    "property": "instance.categories[0]",
    "message": "requires property \"id\"",
    "name": "required",
    "argument": "id",
    "stack": "instance.categories[0] requires property \"id\""
  },
  {
    "property": "instance.categories[0]",
    "message": "requires property \"name\"",
    "name": "required",
    "argument": "name",
    "stack": "instance.categories[0] requires property \"name\""
  },
  {
    "property": "instance.categories[0]",
    "message": "requires property \"category_rules\"",
    "name": "required",
    "argument": "category_rules",
    "stack": "instance.categories[0] requires property \"category_rules\""
  },
  {
    "property": "instance",
    "message": "requires property \"identifier\"",
    "name": "required",
    "argument": "identifier",
    "stack": "instance requires property \"identifier\""
  },
  {
    "property": "instance",
    "message": "requires property \"txn_date\"",
    "name": "required",
    "argument": "txn_date",
    "stack": "instance requires property \"txn_date\""
  },
  {
    "property": "instance",
    "message": "requires property \"txn_desc\"",
    "name": "required",
    "argument": "txn_desc",
    "stack": "instance requires property \"txn_desc\""
  },
  {
    "property": "instance",
    "message": "requires property \"txn_src\"",
    "name": "required",
    "argument": "txn_src",
    "stack": "instance requires property \"txn_src\""
  },
  {
    "property": "instance",
    "message": "requires property \"month\"",
    "name": "required",
    "argument": "month",
    "stack": "instance requires property \"month\""
  },
  {
    "property": "instance",
    "message": "requires property \"org_month\"",
    "name": "required",
    "argument": "org_month",
    "stack": "instance requires property \"org_month\""
  }
]
