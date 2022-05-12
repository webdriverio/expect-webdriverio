import expectLib from 'expect'

import matchers from './matchers.js'
import { DEFAULT_OPTIONS } from './constants.js'

export const getConfig = (): any => DEFAULT_OPTIONS

export const setDefaultOptions = (options = {}): void => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            // @ts-ignore
            DEFAULT_OPTIONS[key] = value
        }
    })
}

export const expect = async () => {
    return expectLib.extend({ ...matchers })
}

export const setOptions = setDefaultOptions
