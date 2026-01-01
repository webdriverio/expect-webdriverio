import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toArray, isArray, isMultiRemote, getInstancesWithExpected } from '../../src/util/multiRemoteUtil.js'

describe('multiRemoteUtil', () => {
    describe(toArray, () => {
        it('should return array if input is array', () => {
            expect(toArray([1, 2])).toEqual([1, 2])
        })

        it('should return array with single item if input is not array', () => {
            expect(toArray(1)).toEqual([1])
        })

        it('should handle edge cases', () => {
            expect(toArray(undefined)).toEqual([undefined])
            expect(toArray(null)).toEqual([null])
            expect(toArray(false)).toEqual([false])
            expect(toArray(0)).toEqual([0])
            expect(toArray('')).toEqual([''])
            expect(toArray({})).toEqual([{}])
        })
    })

    describe(isArray, () => {
        it('should return true if input is array', () => {
            expect(isArray([1, 2])).toBe(true)
        })

        it('should return false if input is not array', () => {
            expect(isArray(1)).toBe(false)
        })
    })

    describe(isMultiRemote, () => {
        it('should return true if browser is multi-remote', () => {
            const browser = { isMultiremote: true } satisfies Partial<WebdriverIO.MultiRemoteBrowser> as WebdriverIO.MultiRemoteBrowser
            expect(isMultiRemote(browser)).toBe(true)
        })

        it('should return false if browser is not multi-remote', () => {
            const browser = { isMultiremote: false } satisfies Partial<WebdriverIO.Browser> as WebdriverIO.Browser
            expect(isMultiRemote(browser)).toBe(false)
        })

        it('should return false if isMultiremote property is missing', () => {
            const browser = {} satisfies Partial<WebdriverIO.Browser> as WebdriverIO.Browser
            expect(isMultiRemote(browser)).toBe(false)
        })
    })

    describe(getInstancesWithExpected, () => {
        it('should return default instance for single browser', () => {
            const browser = { isMultiremote: false } satisfies Partial<WebdriverIO.Browser> as WebdriverIO.Browser
            const expected = 'expected'
            const result = getInstancesWithExpected(browser, expected)
            expect(result).toEqual({
                default: {
                    browser,
                    expectedValue: expected
                }
            })
        })

        describe('Multi-remote', () => {
            let browser: WebdriverIO.MultiRemoteBrowser
            let getInstance: ( name: string ) => WebdriverIO.Browser

            beforeEach(() => {
                getInstance = vi.fn((name) => ({
                    capabilities: { browserName: name }
                } satisfies Partial<WebdriverIO.Browser> as WebdriverIO.Browser))
                browser = {
                    isMultiremote: true,
                    instances: ['browserA', 'browserB'],
                    getInstance
                } satisfies Partial<WebdriverIO.MultiRemoteBrowser> as WebdriverIO.MultiRemoteBrowser
            })

            it('should return instances for multi-remote browser with single expected value', () => {
                const expected = 'expected'
                const result = getInstancesWithExpected(browser, expected)

                expect(result).toEqual({
                    browserA: {
                        browser: { capabilities: { browserName: 'browserA' } },
                        expectedValue: expected
                    },
                    browserB: {
                        browser: { capabilities: { browserName: 'browserB' } },
                        expectedValue: expected
                    }
                })
                expect(getInstance).toHaveBeenCalledWith('browserA')
                expect(getInstance).toHaveBeenCalledWith('browserB')
            })

            it('should return instances for multi-remote browser with array of expected values', () => {
                const expected = ['expectedA', 'expectedB']
                const result = getInstancesWithExpected(browser, expected)

                expect(result).toEqual({
                    browserA: {
                        browser: { capabilities: { browserName: 'browserA' } },
                        expectedValue: 'expectedA'
                    },
                    browserB: {
                        browser: { capabilities: { browserName: 'browserB' } },
                        expectedValue: 'expectedB'
                    }
                })
            })

            it('should throw error if expected values length does not match instances length', () => {
                const expected = ['expectedA']
                expect(() => getInstancesWithExpected(browser, expected)).toThrow('Expected values length (1) does not match number of browser instances (2) in multi-remote setup.')
            })
        })
    })
})
