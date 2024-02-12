/// <reference types="../types/standalone.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'

import wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'

export const matchers = new Map<string, RawMatcherFn>()

const extend = expectLib.extend
expectLib.extend = (m) => {
    if (!m || typeof m !== 'object') {
        return
    }

    Object.entries(m).forEach(([name, matcher]) => matchers.set(name, matcher))
    return extend(m)
}

expectLib.extend(wdioMatchers)
export const expect = expectLib as unknown as ExpectWebdriverIO.Expect
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

/**
 * export snapshot utilities
 */
export { SnapshotService } from './snapshot.js'

/**
 * export utils
 */
export * as utils from './utils.js'
