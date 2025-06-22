/// <reference types="../types/standalone.d.ts" />
import { expect as expectLib } from 'expect'
import type { RawMatcherFn } from './types.js'

import * as wdioMatchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'

export const matchers = new Map<string, RawMatcherFn>()
const filteredMatchers = {}
const extend = expectLib.extend

// filter out matchers that aren't a function
Object.keys(wdioMatchers).forEach(matcher => {
    if (typeof wdioMatchers[matcher as keyof typeof wdioMatchers] === 'function') {
        filteredMatchers[matcher as keyof typeof filteredMatchers] = wdioMatchers[matcher as keyof typeof filteredMatchers]
    }
})

expectLib.extend = (m) => {
    if (!m || typeof m !== 'object') {
        return
    }

    Object.entries(m).forEach(([name, matcher]) => matchers.set(name, matcher))
    return extend(m)
}

type MatchersObject = Parameters<typeof expectLib.extend>[0]

expectLib.extend(filteredMatchers as MatchersObject)

export const getConfig = (): ExpectWebdriverIO.DefaultOptions => DEFAULT_OPTIONS
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
 * export utils
 */
export * as utils from './utils.js'
