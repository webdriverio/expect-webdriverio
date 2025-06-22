import { test, expect } from 'vitest'
import { setOptions, matchers, utils } from '../src/index.js'

test('index', () => {
    expect(setOptions.name).toBe('setDefaultOptions')
    expect(utils.compareText).toBeDefined()
    expect(matchers.size).toEqual(39)
})
