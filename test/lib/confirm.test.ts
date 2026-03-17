import { confirm, setAutoConfirm } from '../../src/lib/confirm'
import { setJsonMode } from '../../src/lib/output'

describe('confirm', () => {
  afterEach(() => {
    setAutoConfirm(false)
    setJsonMode(false)
  })

  it('returns true when --yes flag is set', async () => {
    setAutoConfirm(true)
    expect(await confirm('Do this?')).toBe(true)
  })

  it('returns true when --json mode is active', async () => {
    setJsonMode(true)
    expect(await confirm('Do this?')).toBe(true)
  })

  it('returns true when both --yes and --json are set', async () => {
    setAutoConfirm(true)
    setJsonMode(true)
    expect(await confirm('Do this?')).toBe(true)
  })
})
