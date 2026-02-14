import { test, expect, describe, beforeEach, afterEach } from 'vitest'
import { setOptions } from '../src/index.js'
import { DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../src/constants.js'

describe('setDefaultOptions', () => {
    const defaultOptions = { ...DEFAULT_OPTIONS }
    beforeEach(() => {
        // Set global options to custom values before each test
        setOptions({ wait: 2000, interval: 100 })
    })
    afterEach(() => {
        // Reset global options to default values after each test
        setOptions(defaultOptions)
    })

    test('setDefaultOptions should update both DEFAULT_OPTIONS_TO_BE_DISPLAYED and DEFAULT_OPTIONS', () => {
        expect(DEFAULT_OPTIONS_TO_BE_DISPLAYED.wait).not.toBe(1234)
        expect(DEFAULT_OPTIONS.wait).not.toBe(1234)

        setOptions({ wait: 1234 })

        expect(DEFAULT_OPTIONS_TO_BE_DISPLAYED.wait).toBe(1234)
        expect(DEFAULT_OPTIONS.wait).toBe(1234)
    })
})

