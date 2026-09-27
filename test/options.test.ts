import { test, expect, describe, afterEach } from 'vitest'
import { setDefaultOptions } from '../src/index.js'
import { DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../src/constants.js'

describe('Default Options', () => {
    const defaultOptions = { ...DEFAULT_OPTIONS }
    afterEach(() => {
        setDefaultOptions(defaultOptions)
    })

    describe(setDefaultOptions, () => {

        test('setDefaultOptions should update both DEFAULT_OPTIONS_TO_BE_DISPLAYED and DEFAULT_OPTIONS', () => {
            expect(DEFAULT_OPTIONS_TO_BE_DISPLAYED.wait).not.toBe(1234)
            expect(DEFAULT_OPTIONS.wait).not.toBe(1234)

            setDefaultOptions({ wait: 1234 })

            expect(DEFAULT_OPTIONS_TO_BE_DISPLAYED.wait).toBe(1234)
            expect(DEFAULT_OPTIONS.wait).toBe(1234)
        })
    })

})

