import { test, expect } from 'vitest'
import { setOptions, expect as expectExport, matchers, utils, wdioCustomMatchers } from '../src/index.js'

test('index', () => {
    expect(setOptions.name).toBe('setDefaultOptions')
    expect(expectExport).toBeDefined()
    expect(utils.compareText).toBeDefined()
    expect(wdioCustomMatchers.size).toEqual(41)
    expect(matchers.size).toEqual(41)
})
