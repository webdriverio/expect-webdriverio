import { vi, test, describe, expect } from 'vitest'
// @ts-ignore TODO fix me
import type { Matches, Mock } from 'webdriverio'

import { toBeRequestedTimes } from '../../../src/matchers/mock/toBeRequestedTimes.js'

vi.mock('@wdio/globals')

class TestMock implements Mock {
    _calls: Matches[]

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

describe('toBeRequestedTimes', () => {
    test('wait for success', async () => {
        const mock: Mock = new TestMock()

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
        const mock: Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const result = await toBeRequestedTimes.call({}, mock, { gte: 1, wait: 1 })
        expect(result.pass).toBe(true)
        const result2 = await toBeRequestedTimes.call({}, mock, { eq: 1, wait: 1 })
        expect(result2.pass).toBe(true)
    })

    test('wait but failure', async () => {
        const mock: Mock = new TestMock()
        const result = await toBeRequestedTimes.call({}, mock, 1, { wait: 1 })
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 10)

        const result2 = await toBeRequestedTimes.call({}, mock, 1, { wait: 1 })
        expect(result2.pass).toBe(false)

        const result3 = await toBeRequestedTimes.call({}, mock, 2, { wait: 1 })
        expect(result3.pass).toBe(true)

        const result4 = await toBeRequestedTimes.call({}, mock, { gte: 2, wait: 1 })
        expect(result4.pass).toBe(true)

        const result5 = await toBeRequestedTimes.call({}, mock, { lte: 2, wait: 1 })
        expect(result5.pass).toBe(true)

        const result6 = await toBeRequestedTimes.call({}, mock, { lte: 3, wait: 1 })
        expect(result6.pass).toBe(true)
    })

    test('not to be called', async () => {
        const mock: Mock = new TestMock()

        // expect(mock).not.toBeRequestedTimes(0) should fail
        const result = await toBeRequestedTimes.call({ isNot: true }, mock, 0)
        expect(result.pass).toBe(true) // failure, boolean inverted later because of .not
        expect(result.message()).toEqual(`\
Expect mock not to be called 0 times

Expected [not]: 0
Received      : 0`
        )

        // expect(mock).not.toBeRequestedTimes(1) should pass
        const result2 = await toBeRequestedTimes.call({ isNot: true }, mock, 1)
        expect(result2.pass).toBe(false) // success, boolean inverted later because of .not

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequestedTimes(0) should pass
        const result3 = await toBeRequestedTimes.call({ isNot: true }, mock, 0)
        expect(result3.pass).toBe(false) // success, boolean inverted later because of .not

        // expect(mock).not.toBeRequestedTimes(1) should fail
        const result4 = await toBeRequestedTimes.call({ isNot: true }, mock, 1)
        expect(result4.pass).toBe(true) // failure, boolean inverted later because of .not
        expect(result4.message()).toEqual(`\
Expect mock not to be called 1 time

Expected [not]: 1
Received      : 1`
        )
    })

    test('message', async () => {
        const mock: Mock = new TestMock()

        const result = await toBeRequestedTimes.call({}, mock, 0, { wait: 1 })
        expect(result.message()).toContain('Expect mock to be called 0 times')

        const result2 = await toBeRequestedTimes.call({}, mock, 1, { wait: 1 })
        expect(result2.message()).toContain('Expect mock to be called 1 time')

        const result3 = await toBeRequestedTimes.call({}, mock, 2, { wait: 1 })
        expect(result3.message()).toContain('Expect mock to be called 2 times')

        const result4 = await toBeRequestedTimes.call({}, mock, { gte: 3 }, { wait: 1 })
        expect(result4.pass).toBe(false)
        expect(result4.message()).toEqual(`\
Expect mock to be called times

Expected: ">= 3"
Received: 0`
        )
    })
})
