import { vi, test, expect, describe, beforeEach } from 'vitest'
import { browser, multiremotebrowser } from '@wdio/globals'
import { toHaveTitle } from '../../../src/matchers/browser/toHaveTitle'

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

const browserA = { getTitle: vi.fn().mockResolvedValue('browserA Title') } as unknown as WebdriverIO.Browser
const browserB = { getTitle: vi.fn().mockResolvedValue('browserB Title') } as unknown as WebdriverIO.Browser
const multiRemoteBrowserInstances: Record<string, WebdriverIO.Browser> = {
    'browserA':  browserA,
    'browserB':  browserB,
}

vi.mock('@wdio/globals', () => ({
    browser: {
        getTitle: vi.fn().mockResolvedValue(''),
    },
    multiremotebrowser: {
        isMultiremote: true,
        instances: ['browserA'],
        getInstance: (name: string) => {
            const instance = multiRemoteBrowserInstances[name]
            if (!instance) {
                throw new Error(`No such instance: ${name}`)
            }
            return instance
        }
    }
}))

describe('toHaveTitle', async () => {
    describe('given isNot false', async () => {
        const defaultContext = { isNot: false, toHaveTitle }
        const goodTitle = 'some Title text'
        const wrongTitle = 'some Wrong Title text'

        beforeEach(async () => {
            beforeAssertion.mockClear()
            afterAssertion.mockClear()
        })

        describe('Browser', async () => {
            beforeEach(async () => {
                browser.getTitle = vi.fn().mockResolvedValue(goodTitle)
            })

            describe('given default usage', async () => {
                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(browser, goodTitle)

                    expect(result.pass).toBe(true)
                })

                test('when failure', async () => {
                    browser.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                    const result = await defaultContext.toHaveTitle(browser, goodTitle)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"`
                    )
                })
            })

            describe('given before/after assertion hooks and options', async () => {
                const options = {
                    ignoreCase: true,
                    beforeAssertion,
                    afterAssertion,
                } satisfies ExpectWebdriverIO.StringOptions

                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(browser, goodTitle, options)

                    expect(result.pass).toBe(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: goodTitle,
                        options,
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: goodTitle,
                        options,
                        result,
                    })
                })

                test('when failure', async () => {
                    browser.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                    const result = await defaultContext.toHaveTitle(browser, goodTitle, options)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"`
                    )
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: goodTitle,
                        options: { ignoreCase: true, beforeAssertion, afterAssertion },
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: goodTitle,
                        options: { ignoreCase: true, beforeAssertion, afterAssertion },
                        result,
                    })
                })
            })
        })

        describe('Multi Remote Browsers', async () => {
            beforeEach(async () => {
                multiremotebrowser.instances = ['browserA']
                browserA.getTitle = vi.fn().mockResolvedValue(goodTitle)
                browserB.getTitle = vi.fn().mockResolvedValue(goodTitle)
            })

            describe('given default usage', async () => {
                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                    expect(result.pass).toBe(true)
                })

                test('when failure', async () => {
                    browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"`
                    )
                })
            })

            describe('given multiple remote browsers', async () => {
                beforeEach(async () => {
                    multiremotebrowser.instances = ['browserA', 'browserB']
                    browserA.getTitle = vi.fn().mockResolvedValue(goodTitle)
                    browserB.getTitle = vi.fn().mockResolvedValue(goodTitle)
                })

                describe('given one expected value', async () => {

                    test('when success', async () => {
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                        expect(result.pass).toBe(true)
                    })

                    test('when failure for browserA', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"`
                        )
                    })

                    test('when failure for browserB', async () => {
                        browserB.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title for remote "browserB"

Expected: "some Title text"
Received: "some Wrong Title text"`
                        )
                    })

                    test('when failure for multiple browsers', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"

Expect window to have title for remote "browserB"

Expected: "some Title text"
Received: "some Wrong Title text"`
                        )
                    })

                    describe('given before/after assertion hooks and options', async () => {
                        const options = {
                            ignoreCase: true,
                            beforeAssertion,
                            afterAssertion,
                        } satisfies ExpectWebdriverIO.StringOptions

                        test('when success', async () => {
                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                goodTitle,
                                options,
                            )
                            expect(result.pass).toBe(true)
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: goodTitle,
                                options,
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: goodTitle,
                                options,
                                result,
                            })
                        })

                        test('when failure', async () => {
                            browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                goodTitle,
                                options,
                            )

                            expect(result.pass).toBe(false)
                            expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"`
                            )
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: goodTitle,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: goodTitle,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                                result,
                            })
                        })
                    })
                })

                describe('given multiple expected values', async () => {
                    const goodTitle2 = `${goodTitle} 2`
                    const expectedValues = [goodTitle, goodTitle2]

                    beforeEach(async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(goodTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(goodTitle2)
                    })

                    test('when success', async () => {
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, expectedValues)

                        expect(result.pass).toBe(true)
                    })

                    test('when failure for one browser', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)

                        const result = await defaultContext.toHaveTitle(multiremotebrowser, expectedValues)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"`
                        )
                    })

                    test('when failure for multiple browsers', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(wrongTitle)

                        const result = await defaultContext.toHaveTitle(multiremotebrowser, expectedValues)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"

Expect window to have title for remote "browserB"

Expected: "some Title text 2"
Received: "some Wrong Title text"`
                        )
                    })

                    describe('given before/after assertion hooks and options', async () => {
                        const options = {
                            ignoreCase: true,
                            beforeAssertion,
                            afterAssertion,
                        } satisfies ExpectWebdriverIO.StringOptions

                        test('when success', async () => {
                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                expectedValues,
                                options,
                            )
                            expect(result.pass).toBe(true)
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: expectedValues,
                                options,
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: expectedValues,
                                options,
                                result,
                            })
                        })

                        test('when failure', async () => {
                            browserA.getTitle = vi.fn().mockResolvedValue(wrongTitle)
                            browserB.getTitle = vi.fn().mockResolvedValue(wrongTitle)

                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                expectedValues,
                                options,
                            )

                            expect(result.pass).toBe(false)
                            expect(result.message()).toEqual(`Expect window to have title for remote "browserA"

Expected: "some Title text"
Received: "some Wrong Title text"

Expect window to have title for remote "browserB"

Expected: "some Title text 2"
Received: "some Wrong Title text"`
                            )
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: expectedValues,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: expectedValues,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                                result,
                            })
                        })
                    })
                })
            })
        })
    })

    describe('given isNot true', async () => {
        const defaultContext = { isNot: true, toHaveTitle }
        const aTitle = 'some Title text'
        const negatedExpectedTitle = 'some Title text not expected to be'

        beforeEach(async () => {
            beforeAssertion.mockClear()
            afterAssertion.mockClear()
        })

        describe('Browser', async () => {
            beforeEach(async () => {
                browser.getTitle = vi.fn().mockResolvedValue(aTitle)
            })

            describe('given default usage', async () => {
                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(browser, negatedExpectedTitle)

                    expect(result.pass).toBe(true)
                })

                test('when failure', async () => {
                    browser.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)
                    const result = await defaultContext.toHaveTitle(browser, negatedExpectedTitle)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window not to have title

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                    )
                })
            })

            describe('given before/after assertion hooks and options', async () => {
                const options = {
                    ignoreCase: true,
                    beforeAssertion,
                    afterAssertion,
                } satisfies ExpectWebdriverIO.StringOptions

                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(browser, negatedExpectedTitle, options)

                    expect(result.pass).toBe(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: negatedExpectedTitle,
                        options,
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: negatedExpectedTitle,
                        options,
                        result,
                    })
                })

                test('when failure', async () => {
                    browser.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)
                    const result = await defaultContext.toHaveTitle(browser, negatedExpectedTitle, options)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window not to have title

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                    )
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: negatedExpectedTitle,
                        options: { ignoreCase: true, beforeAssertion, afterAssertion },
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toHaveTitle',
                        expectedValue: negatedExpectedTitle,
                        options: { ignoreCase: true, beforeAssertion, afterAssertion },
                        result,
                    })
                })
            })
        })

        describe('Multi Remote Browsers', async () => {
            beforeEach(async () => {
                browserA.getTitle = vi.fn().mockResolvedValue(aTitle)
                browserB.getTitle = vi.fn().mockResolvedValue(aTitle)
                multiremotebrowser.instances = ['browserA']
            })

            describe('given default usage', async () => {
                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(multiremotebrowser,  negatedExpectedTitle)

                    expect(result.pass).toBe(true)
                })

                test('when failure', async () => {
                    browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)

                    const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedTitle)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                    )
                })
            })

            describe('given multiple remote browsers', async () => {

                beforeEach(async () => {
                    multiremotebrowser.instances = ['browserA', 'browserB']
                })

                describe('given one expected value', async () => {

                    beforeEach(async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(aTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(aTitle)
                    })

                    test('when success', async () => {
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedTitle)

                        expect(result.pass).toBe(true)
                    })

                    test('when failure for one browser', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)

                        const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedTitle)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                        )
                    })

                    test('when failure for multiple browsers', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)

                        const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedTitle)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"

Expect window not to have title for remote "browserB"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                        )
                    })

                    describe('given before/after assertion hooks and options', async () => {
                        const options = {
                            ignoreCase: true,
                            beforeAssertion,
                            afterAssertion,
                        } satisfies ExpectWebdriverIO.StringOptions

                        test('when success', async () => {
                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                negatedExpectedTitle,
                                options,
                            )
                            expect(result.pass).toBe(true)
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedTitle,
                                options,
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedTitle,
                                options,
                                result,
                            })
                        })

                        test('when failure', async () => {
                            browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)

                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                negatedExpectedTitle,
                                options,
                            )

                            expect(result.pass).toBe(false)
                            expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                            )
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedTitle,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedTitle,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                                result,
                            })
                        })
                    })
                })

                describe('given multiple expected values', async () => {
                    const aTitle2 = `${aTitle} 2`
                    const negatedExpectedTitle2 = `${aTitle2} not expected to be`
                    const negatedExpectedValues = [negatedExpectedTitle, negatedExpectedTitle2]

                    beforeEach(async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(aTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(aTitle2)
                    })

                    test('when success', async () => {
                        const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedValues)

                        expect(result.pass).toBe(true)
                    })

                    test('when failure for one browser', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)

                        const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedValues)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                        )
                    })

                    test('when failure for multiple browsers', async () => {
                        browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)
                        browserB.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle2)

                        const result = await defaultContext.toHaveTitle(multiremotebrowser, negatedExpectedValues)

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"

Expect window not to have title for remote "browserB"

Expected [not]: "some Title text 2 not expected to be"
Received      : "some Title text 2 not expected to be"`
                        )
                    })

                    describe('given before/after assertion hooks and options', async () => {
                        const options = {
                            ignoreCase: true,
                            beforeAssertion,
                            afterAssertion,
                        } satisfies ExpectWebdriverIO.StringOptions

                        test('when success', async () => {
                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                negatedExpectedValues,
                                options,
                            )
                            expect(result.pass).toBe(true)
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedValues,
                                options,
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedValues,
                                options,
                                result,
                            })
                        })

                        test('when failure', async () => {
                            browserA.getTitle = vi.fn().mockResolvedValue(negatedExpectedTitle)

                            const result = await defaultContext.toHaveTitle(
                                multiremotebrowser,
                                negatedExpectedValues,
                                options,
                            )

                            expect(result.pass).toBe(false)
                            expect(result.message()).toEqual(`Expect window not to have title for remote "browserA"

Expected [not]: "some Title text not expected to be"
Received      : "some Title text not expected to be"`
                            )
                            expect(beforeAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedValues,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                            })
                            expect(afterAssertion).toBeCalledWith({
                                matcherName: 'toHaveTitle',
                                expectedValue: negatedExpectedValues,
                                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                                result,
                            })
                        })
                    })
                })
            })
        })
    })
})
