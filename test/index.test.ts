import { test, expect } from 'vitest'
import { setOptions, expect as expectExport, matchers, utils, wdioCustomMatchers } from '../src/index.js'

test('index', () => {
    expect(setOptions.name).toBe('setDefaultOptions')
    expect(expectExport).toBeDefined()
    expect(utils.compareText).toBeDefined()

    expect(matchers.size).toEqual(41)
    expect(Object.keys(wdioCustomMatchers).length).toEqual(41)
})
