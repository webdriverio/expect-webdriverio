import { isAsymmetricMatcher } from '../utils.js'

export const isMultiRemoteValues = (value: unknown, existingInstanceNames?: string[]): value is MultiRemoteValues<unknown> =>  {
    if (value && typeof value === 'object' && !Array.isArray(value) && !isAsymmetricMatcher(value) && !(value instanceof RegExp) && Object.keys(value).length > 0) {
        if (existingInstanceNames) {
            return existingInstanceNames?.some(name => Object.keys(value).includes(name))
        }
        return true
    }
    return false
}

/** Strict multi-remote check: the per-instance expected values must name exactly the instances, no more, no less. */
export const hasSameInstanceNames = (expected: MultiRemoteValues<unknown>, instances: string[]): boolean => {
    const names = Object.keys(expected)
    return names.length === instances.length && instances.every((name) => names.includes(name))
}

export const isBrowser = (obj: unknown): obj is WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser => {
    return !!obj && !!obj.constructor && (obj.constructor.name === 'Browser' || obj.constructor.name.endsWith('MultiRemoteDriver'))
}
