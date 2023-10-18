import { test, testCases, expect } from './Testing'

export type SchemaType = 'String' | 'Int'

export interface Schema {
  url: string
  fields: {
    name: string
    type: SchemaType
  }[]
}

export interface ValidData {}

function validateType(type: SchemaType, value: any): boolean {
  switch (type) {
    case 'String':
      return typeof value == 'string'
    case 'Int':
      if (typeof value !== 'number') return false
      return value === Math.floor(value)
  }
}

function isValid(schema: Schema, data: any): boolean {
  for (let field of schema.fields) {
    if (!(field.name in data)) {
      return false
    }
    if (!validateType(field.type, data[field.name])) {
      return false
    }
  }
  return true
}

export function validateData(schema: Schema, data: any[]): data is ValidData[] {
  for (let elem of data) {
    if (!isValid(schema, elem)) {
      return false
    }
  }
  return true
}

testCases(validateType, [
  [['String', 'hello world'], true],
  [['String', ''], true],
  [['String', 123], false],

  [['Int', 123], true],
  [['Int', '456'], false],
  [['Int', 3.1415], false],
])

test('Schema.isValid', () => {
  let fooSchema: Schema = {
    url: 'foo',
    fields: [
      { name: 'foo', type: 'String' }
    ]
  }

  expect.eq(isValid(fooSchema, {foo: 'hey!'}), true)
  expect.eq(isValid(fooSchema, {foo: 42}), false)
  expect.eq(isValid(fooSchema, {bar: 'ey'}), false)

  // maybe this shouldn't be true... document that it is for now
  // todo: consider design implications of allowing extraneous fields
  expect.eq(isValid(fooSchema, {foo: 'hi', bar: 'ho'}), true)
})
