import {
  filterFields,
  extractList,
  setFields,
  setJsonMode,
  outputJson,
  outputError,
} from '../../src/lib/output'

describe('filterFields', () => {
  afterEach(() => setFields(null))

  it('returns original data when no fields are set', () => {
    const data = { a: 1, b: 2, c: 3 }
    expect(filterFields(data)).toEqual(data)
  })

  it('filters object to only specified fields', () => {
    setFields(['a', 'c'])
    expect(filterFields({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, c: 3 })
  })

  it('filters each item in an array', () => {
    setFields(['name'])
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    expect(filterFields(data)).toEqual([{ name: 'Alice' }, { name: 'Bob' }])
  })

  it('returns primitive values unchanged', () => {
    setFields(['a'])
    expect(filterFields('hello')).toBe('hello')
    expect(filterFields(42)).toBe(42)
    expect(filterFields(null)).toBe(null)
  })

  it('ignores fields that do not exist on the object', () => {
    setFields(['x', 'y'])
    expect(filterFields({ a: 1, b: 2 })).toEqual({})
  })
})

describe('extractList', () => {
  it('returns arrays directly', () => {
    expect(extractList([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('extracts .list wrapper', () => {
    expect(extractList({ list: [1, 2] })).toEqual([1, 2])
  })

  it('extracts .rows wrapper', () => {
    expect(extractList({ rows: [1, 2] })).toEqual([1, 2])
  })

  it('extracts .data wrapper', () => {
    expect(extractList({ data: [1, 2] })).toEqual([1, 2])
  })

  it('extracts .tokens wrapper', () => {
    expect(extractList({ tokens: [{ a: 1 }] })).toEqual([{ a: 1 }])
  })

  it('extracts .pools wrapper', () => {
    expect(extractList({ pools: [{ a: 1 }] })).toEqual([{ a: 1 }])
  })

  it('returns null for non-list objects', () => {
    expect(extractList({ foo: 'bar' })).toBeNull()
  })

  it('returns null for primitives', () => {
    expect(extractList('hello')).toBeNull()
    expect(extractList(42)).toBeNull()
  })
})

describe('outputJson compact format', () => {
  let stdoutData: string

  beforeEach(() => {
    stdoutData = ''
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
      stdoutData += chunk
      return true
    })
    setJsonMode(true)
    setFields(null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    setJsonMode(false)
  })

  it('outputs compact JSON without pretty-printing', () => {
    outputJson({ key: 'value', nested: { a: 1 } })
    expect(stdoutData).toBe('{"key":"value","nested":{"a":1}}\n')
    expect(stdoutData).not.toContain('  ')
  })

  it('serializes BigInt values as strings', () => {
    outputJson({ amount: BigInt('1000000'), nested: { fee: 500n } })
    const parsed = JSON.parse(stdoutData)
    expect(parsed.amount).toBe('1000000')
    expect(parsed.nested.fee).toBe('500')
  })

  it('handles mixed BigInt and regular values', () => {
    outputJson({ name: 'TRX', balance: 123456789n, active: true })
    const parsed = JSON.parse(stdoutData)
    expect(parsed.name).toBe('TRX')
    expect(parsed.balance).toBe('123456789')
    expect(parsed.active).toBe(true)
  })
})

describe('outputError structured codes', () => {
  let stdoutData: string

  beforeEach(() => {
    stdoutData = ''
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
      stdoutData += chunk
      return true
    })
    setJsonMode(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    setJsonMode(false)
    process.exitCode = undefined
  })

  it('includes error code in JSON output', () => {
    outputError('Wallet required', new Error('Set AGENT_WALLET_PRIVATE_KEY'))
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('WALLET_NOT_CONFIGURED')
    expect(parsed.error).toBe('Wallet required')
    expect(parsed.detail).toBe('Set AGENT_WALLET_PRIVATE_KEY')
  })

  it('uses error object code if available', () => {
    const err = new Error('Pool not found') as any
    err.code = 'POOL_NOT_FOUND'
    outputError('Operation failed', err)
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('POOL_NOT_FOUND')
  })

  it('classifies network errors', () => {
    outputError('Request failed', new Error('fetch failed: ECONNREFUSED'))
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('NETWORK_ERROR')
  })

  it('falls back to UNKNOWN_ERROR', () => {
    outputError('Something went wrong')
    const parsed = JSON.parse(stdoutData)
    expect(parsed.code).toBe('UNKNOWN_ERROR')
  })

  it('sets exit code to 1', () => {
    outputError('fail')
    expect(process.exitCode).toBe(1)
  })
})
