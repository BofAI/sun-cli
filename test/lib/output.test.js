'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const output_1 = require('../../src/lib/output')
describe('filterFields', () => {
  afterEach(() => (0, output_1.setFields)(null))
  it('returns original data when no fields are set', () => {
    const data = { a: 1, b: 2, c: 3 }
    expect((0, output_1.filterFields)(data)).toEqual(data)
  })
  it('filters object to only specified fields', () => {
    ;(0, output_1.setFields)(['a', 'c'])
    expect((0, output_1.filterFields)({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, c: 3 })
  })
  it('filters each item in an array', () => {
    ;(0, output_1.setFields)(['name'])
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    expect((0, output_1.filterFields)(data)).toEqual([{ name: 'Alice' }, { name: 'Bob' }])
  })
  it('returns primitive values unchanged', () => {
    ;(0, output_1.setFields)(['a'])
    expect((0, output_1.filterFields)('hello')).toBe('hello')
    expect((0, output_1.filterFields)(42)).toBe(42)
    expect((0, output_1.filterFields)(null)).toBe(null)
  })
  it('ignores fields that do not exist on the object', () => {
    ;(0, output_1.setFields)(['x', 'y'])
    expect((0, output_1.filterFields)({ a: 1, b: 2 })).toEqual({})
  })
})
describe('extractList', () => {
  it('returns arrays directly', () => {
    expect((0, output_1.extractList)([1, 2, 3])).toEqual([1, 2, 3])
  })
  it('extracts .list wrapper', () => {
    expect((0, output_1.extractList)({ list: [1, 2] })).toEqual([1, 2])
  })
  it('extracts .rows wrapper', () => {
    expect((0, output_1.extractList)({ rows: [1, 2] })).toEqual([1, 2])
  })
  it('extracts .data wrapper', () => {
    expect((0, output_1.extractList)({ data: [1, 2] })).toEqual([1, 2])
  })
  it('extracts .tokens wrapper', () => {
    expect((0, output_1.extractList)({ tokens: [{ a: 1 }] })).toEqual([{ a: 1 }])
  })
  it('extracts .pools wrapper', () => {
    expect((0, output_1.extractList)({ pools: [{ a: 1 }] })).toEqual([{ a: 1 }])
  })
  it('returns null for non-list objects', () => {
    expect((0, output_1.extractList)({ foo: 'bar' })).toBeNull()
  })
  it('returns null for primitives', () => {
    expect((0, output_1.extractList)('hello')).toBeNull()
    expect((0, output_1.extractList)(42)).toBeNull()
  })
})
describe('outputJson compact format', () => {
  let stdoutData
  beforeEach(() => {
    stdoutData = ''
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdoutData += chunk
      return true
    })
    ;(0, output_1.setJsonMode)(true)
    ;(0, output_1.setFields)(null)
  })
  afterEach(() => {
    jest.restoreAllMocks()
    ;(0, output_1.setJsonMode)(false)
  })
  it('outputs compact JSON without pretty-printing', () => {
    ;(0, output_1.outputJson)({ key: 'value', nested: { a: 1 } })
    expect(stdoutData).toBe('{"key":"value","nested":{"a":1}}\n')
    // No spaces or newlines inside the JSON
    expect(stdoutData).not.toContain('  ')
  })
})
describe('outputError structured codes', () => {
  let stdoutData
  beforeEach(() => {
    stdoutData = ''
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdoutData += chunk
      return true
    })
    ;(0, output_1.setJsonMode)(true)
  })
  afterEach(() => {
    jest.restoreAllMocks()
    ;(0, output_1.setJsonMode)(false)
    process.exitCode = undefined
  })
  it('includes error code in JSON output', () => {
    ;(0, output_1.outputError)('Wallet required', new Error('Set AGENT_WALLET_PRIVATE_KEY'))
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('WALLET_NOT_CONFIGURED')
    expect(parsed.error).toBe('Wallet required')
    expect(parsed.detail).toBe('Set AGENT_WALLET_PRIVATE_KEY')
  })
  it('uses error object code if available', () => {
    const err = new Error('Pool not found')
    err.code = 'POOL_NOT_FOUND'
    ;(0, output_1.outputError)('Operation failed', err)
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('POOL_NOT_FOUND')
  })
  it('classifies network errors', () => {
    ;(0, output_1.outputError)('Request failed', new Error('fetch failed: ECONNREFUSED'))
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('NETWORK_ERROR')
  })
  it('falls back to UNKNOWN_ERROR', () => {
    ;(0, output_1.outputError)('Something went wrong')
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('UNKNOWN_ERROR')
  })
  it('sets exit code to 1', () => {
    ;(0, output_1.outputError)('fail')
    expect(process.exitCode).toBe(1)
  })
})
//# sourceMappingURL=output.test.js.map
