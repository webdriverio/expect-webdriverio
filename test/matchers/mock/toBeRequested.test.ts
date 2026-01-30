import { vi, test, describe, expect } from 'vitest'
// @ts-ignore TODO fix me
import type { Matches, Mock } from 'webdriverio'

import { toBeRequested } from '../../../src/matchers/mock/toBeRequested.js'

import { getExpected, getExpectMessage, getReceived, removeColors } from '../../__fixtures__/utils.js'

vi.mock('@wdio/globals')

class TestMock implements Mock {
    _calls: any[]

    constructor () {
        this._calls = []
    }
    get calls () {
        return this._calls
    }
    on = vi.fn()
    abort () { return Promise.resolve() }
    abortOnce () { return Promise.resolve() }
    respond () { return Promise.resolve() }
    respondOnce () { return Promise.resolve() }
    clear () { return Promise.resolve() }
    restore () { return Promise.resolve() }
    waitForResponse () { return Promise.resolve(true) }
}

const mockMatch: Matches = {
    body: 'foo',
    url: '/foo/bar',
    method: 'POST',
    headers: {},
    responseHeaders: {},
    statusCode: 200,
    initialPriority: 'Low',
    referrerPolicy: 'origin'
}

describe('toBeRequested', () => {
    test('wait for success', async () => {
        const mock: Mock = new TestMock()
        const result = await toBeRequested(mock)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 10)

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result2 = await toBeRequested(mock, { beforeAssertion, afterAssertion })
        expect(result2.pass).toBe(true)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: { gte: 1 },
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: { gte: 1 },
            options: { beforeAssertion, afterAssertion },
            result: result2
        })
    })

    test('not to be called', async () => {
        const mock: Mock = new TestMock()

        // expect(mock).not.toBeRequested() should pass
        const result = await toBeRequested.call({ isNot: true }, mock)
        expect(result.pass).toBe(false)

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequested() should fail
        const result4 = await toBeRequested.call({ isNot: true }, mock)
        expect(result4.pass).toBe(true)
    })

    test('message', async () => {
        const mock: Mock = new TestMock()

        const message = removeColors((await toBeRequested(mock)).message())
        expect(getExpectMessage(message)).toBe('Expect mock to be called')
        expect(getReceived(message)).toBe('Received: 0')
        expect(getExpected(message)).toBe('Expected: ">= 1"')

        const result2 = await toBeRequested.call({ isNot: true }, mock)
        expect(result2.message()).toContain('Expect mock not to be called')
    })
})
