import { test, expect } from 'vitest'
import { setOptions, expect as expectExport } from '../src'

test('index', () => {
    expect(setOptions.name).toBe('setDefaultOptions')
    expect(expectExport).toBeDefined()
})
