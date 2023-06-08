import { test, expect } from 'vitest'
import { setOptions, expect as expectExport, matchers, utils } from '../src/index.js'

test('index', () => {
    expect(setOptions.name).toBe('setDefaultOptions')
    expect(expectExport).toBeDefined()
    expect(matchers).toBeDefined()
    expect(utils.compareText).toBeDefined()
})
