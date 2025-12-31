import type { Browser } from 'webdriverio'

export const toArray = <T>(value: T | T[] | MaybeArray<T>): T[] => (Array.isArray(value) ? value : [value])

export type MaybeArray<T> = T | T[]

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value)
}

export const isMultiremote = (browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser): browser is WebdriverIO.MultiRemoteBrowser => {
    return (browser as WebdriverIO.MultiRemoteBrowser).isMultiremote === true
}

export const getInstancesWithExpected = <T>(browsers: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser, expectedValues: T): Record<string, { browser: Browser; expectedValue: T; }>  => {
    if (isMultiremote(browsers)) {
        if (Array.isArray(expectedValues)) {
            if (expectedValues.length !== browsers.instances.length) {
                throw new Error(`Expected values length (${expectedValues.length}) does not match number of browser instances (${browsers.instances.length}) in multiremote setup.`)
            }
        }
        // TODO multi-remote support: add support for object like { default: 'title', browserA: 'titleA', browserB: 'titleB' } later

        const browsersWithExpected = browsers.instances.reduce((acc, instance, index) => {
            const browser = browsers.getInstance(instance)
            const expectedValue = Array.isArray(expectedValues) ? expectedValues[index] : expectedValues
            acc[instance] = { browser, expectedValue }
            return acc
        }, {} as Record<string,  { browser: WebdriverIO.Browser, expectedValue: T }>)
        return browsersWithExpected
    }

    // TODO multi-remote support: using default could clash if someone use name default, to review later
    return { default: { browser: browsers, expectedValue: expectedValues } }
}
