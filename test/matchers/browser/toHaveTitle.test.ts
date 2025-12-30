import { vi, test, expect, describe, beforeEach } from 'vitest'
import { browser, multiremotebrowser } from '@wdio/globals'
import { toHaveTitle } from '../../../src/matchers/browser/toHaveTitle'

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

vi.mock('@wdio/globals', () => ({
    browser: {
        getTitle: vi.fn().mockResolvedValue(''),
    },
    multiremotebrowser: {
        isMultiremote: true,
        getTitle: vi.fn().mockResolvedValue(['']),
    }
}))

describe('toHaveTitle', async () => {
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
            multiremotebrowser.getTitle = vi.fn().mockResolvedValue([goodTitle])
        })

        describe('given default usage', async () => {
            test('when success', async () => {
                const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                expect(result.pass).toBe(true)
            })

            test('when failure', async () => {
                multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle])
                const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"`
                )
            })
        })

        describe('given multiple remote browsers', async () => {

            describe('given one expected value', async () => {
                const goodTitles = [goodTitle, goodTitle]
                beforeEach(async () => {
                    multiremotebrowser.getTitle = vi.fn().mockResolvedValue(goodTitles)
                })

                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                    expect(result.pass).toBe(true)
                })

                test('when failure for one browser', async () => {
                    multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle, goodTitle])
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"`
                    )
                })

                test('when failure for multiple browsers', async () => {
                    multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle, wrongTitle])
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, goodTitle)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"

Expect window to have title

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
                        multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle])
                        const result = await defaultContext.toHaveTitle(
                            multiremotebrowser,
                            goodTitle,
                            options,
                        )

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title

Expected: "some title text"
Received: "some wrong title text"`
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
                const goodTitles = [goodTitle, goodTitle2]
                const expectedValues = [goodTitle, goodTitle2]

                beforeEach(async () => {
                    multiremotebrowser.getTitle = vi.fn().mockResolvedValue(goodTitles)
                })

                test('when success', async () => {
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, expectedValues)

                    expect(result.pass).toBe(true)
                })

                test('when failure for one browser', async () => {
                    multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle, goodTitle2])
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, expectedValues)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"`
                    )
                })

                test('when failure for multiple browsers', async () => {
                    multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle, wrongTitle])
                    const result = await defaultContext.toHaveTitle(multiremotebrowser, expectedValues)

                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`Expect window to have title

Expected: "some Title text"
Received: "some Wrong Title text"

Expect window to have title

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
                        multiremotebrowser.getTitle = vi.fn().mockResolvedValue([wrongTitle, wrongTitle])
                        const result = await defaultContext.toHaveTitle(
                            multiremotebrowser,
                            expectedValues,
                            options,
                        )

                        expect(result.pass).toBe(false)
                        expect(result.message()).toEqual(`Expect window to have title

Expected: "some title text"
Received: "some wrong title text"

Expect window to have title

Expected: "some title text 2"
Received: "some wrong title text"`
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
