import { test, expect } from 'vitest'
import { expect as expectExport, utils, wdioCustomMatchers } from '../src/index.js'

test('index', () => {
    expect(expectExport).toBeDefined()
    expect(utils.compareText).toBeDefined()

    expect(Object.keys(wdioCustomMatchers).length).toEqual(39)
})
