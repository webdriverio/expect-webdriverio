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

export const isBrowser = (obj: unknown): obj is WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser => {
    return !!obj && typeof obj === 'object' && (obj.constructor.name === 'Browser' || obj.constructor.name.endsWith('MultiRemoteDriver'))
}
