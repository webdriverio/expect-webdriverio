import { jestExpect as expectLib } from '@jest/expect'

import wdioMatchers from './matchers.js'
import * as expectUtils from './utils.js'
import { DEFAULT_OPTIONS } from './constants.js'

// Get suppressed errors form jest-matchers that weren't throw during
// test execution and add them to the test result, potentially failing
// a passing test.
expectLib.setState({ suppressedErrors: [] })
expectLib.extend({ ...wdioMatchers })

export const expect = expectLib
export const matchers = wdioMatchers
export const getConfig = (): any => DEFAULT_OPTIONS
export const setDefaultOptions = (options = {}): void => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            // @ts-ignore
            DEFAULT_OPTIONS[key] = value
        }
    })
}
export const setOptions = setDefaultOptions
export const utils = expectUtils
