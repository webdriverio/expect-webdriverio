import { vi, test, describe, expect } from 'vitest'
// @ts-ignore TODO fix me
import type { Matches, Mock } from 'webdriverio'

import { toBeRequestedTimes } from '../../../src/matchers/mock/toBeRequestedTimes.js'
import { removeColors, getReceived, getExpected, getExpectMessage } from '../../__fixtures__/utils.js'

vi.mock('@wdio/globals')

//@ts-ignore TODO fix me
class TestMock implements WebdriverIO.Mock {
    _calls: local.NetworkResponseCompletedParameters[]

    constructor () {
        this._calls = []
    }
    get calls () {
        return this._calls
    }
    on = vi.fn()
    abort () { return this }
    abortOnce () { return this }
    respond () { return this }
    respondOnce () { return this }
    clear () { return this }
    restore () { return Promise.resolve(this) }
    waitForResponse () { return Promise.resolve(true) }
}

const mockMatch: local.NetworkResponseCompletedParameters = {
    //@ts-ignore TODO fix me
    body: 'foo',
    url: '/foo/bar',
    method: 'POST',
    headers: {},
    responseHeaders: {},
    statusCode: 200,
    initialPriority: 'Low',
    referrerPolicy: 'origin'
}

describe('toBeRequestedTimes', () => {
    test('wait for success', async () => {
        //@ts-ignore TODO fix me
        const mock: WebdriverIO.Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result = await toBeRequestedTimes.call({}, mock, 1, { beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: 1,
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: 1,
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait for success using number options', async () => {
        //@ts-ignore TODO fix me
        const mock: WebdriverIO.Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const result = await toBeRequestedTimes.call({}, mock, { gte: 1 })
        expect(result.pass).toBe(true)
        const result2 = await toBeRequestedTimes.call({}, mock, { eq: 1 })
        expect(result2.pass).toBe(true)
    })

    test('wait but failure', async () => {
        //@ts-ignore TODO fix me
        const mock: WebdriverIO.Mock = new TestMock()
        const result = await toBeRequestedTimes.call({}, mock, 1)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 10)

        const result2 = await toBeRequestedTimes.call({}, mock, 1)
        expect(result2.pass).toBe(false)
        const result3 = await toBeRequestedTimes.call({}, mock, 2)
        expect(result3.pass).toBe(true)
        const result4 = await toBeRequestedTimes.call({}, mock, { gte: 2 })
        expect(result4.pass).toBe(true)
        const result5 = await toBeRequestedTimes.call({}, mock, { lte: 2 })
        expect(result5.pass).toBe(true)
        const result6 = await toBeRequestedTimes.call({}, mock, { lte: 3 })
        expect(result6.pass).toBe(true)
    })

    test('not to be called', async () => {
        //@ts-ignore TODO fix me
        const mock: WebdriverIO.Mock = new TestMock()

        // expect(mock).not.toBeRequestedTimes(0) should fail
        const result = await toBeRequestedTimes.call({ isNot: true }, mock, 0)
        expect(result.pass).toBe(true)

        // expect(mock).not.toBeRequestedTimes(1) should pass
        const result2 = await toBeRequestedTimes.call({ isNot: true }, mock, 1)
        expect(result2.pass).toBe(false)

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequestedTimes(0) should pass
        const result3 = await toBeRequestedTimes.call({ isNot: true }, mock, 0)
        expect(result3.pass).toBe(false)

        // expect(mock).not.toBeRequestedTimes(1) should fail
        const result4 = await toBeRequestedTimes.call({ isNot: true }, mock, 1)
        expect(result4.pass).toBe(true)
    })

    test('message', async () => {
        //@ts-ignore TODO fix me
        const mock: WebdriverIO.Mock = new TestMock()

        const result = await toBeRequestedTimes.call({}, mock, 0)
        expect(result.message()).toContain('Expect mock to be called 0 times')

        const result2 = await toBeRequestedTimes.call({}, mock, 1)
        expect(result2.message()).toContain('Expect mock to be called 1 time')

        const result3 = await toBeRequestedTimes.call({}, mock, 2)
        expect(result3.message()).toContain('Expect mock to be called 2 times')

        const result4 = await toBeRequestedTimes.call({}, mock, { gte: 3 })
        const message4 = removeColors(result4.message())
        expect(getExpectMessage(message4)).toBe('Expect mock to be called times')
        expect(getExpected(message4)).toBe('Expected: ">= 3"')
        expect(getReceived(message4)).toBe('Received: 0')
    })
})
