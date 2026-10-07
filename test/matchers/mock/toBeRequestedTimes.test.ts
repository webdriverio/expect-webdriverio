import { vi, test, describe, expect, beforeEach } from 'vitest'
// @ts-ignore TODO fix me
import type { Matches, Mock } from 'webdriverio'

import { toBeRequestedTimes } from '../../../src/matchers/mock/toBeRequestedTimes.js'
import stripAnsi from 'strip-ansi'
import { waitUntil } from '../../../src/util/waitUntil.js'
import { multiRemoteMockFactory, setWdioKind } from '../../__mocks__/@wdio/globals.js'

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
setWdioKind(TestMock.prototype, 'mock')

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
    let thisNotContext: { isNot: true; toBeRequestedTimes: typeof toBeRequestedTimes }
    let thisContext: { toBeRequestedTimes: typeof toBeRequestedTimes }

    beforeEach(() => {
        thisNotContext = { isNot: true, toBeRequestedTimes }
        thisContext = { toBeRequestedTimes }
    })

    test('wait for success', async () => {
        const mock: Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await thisContext.toBeRequestedTimes(mock, 1, { beforeAssertion, afterAssertion, wait: 500 })

        expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 500, interval: undefined })
        expect(result.pass).toBe(true)
        expect(beforeAssertion).toHaveBeenCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: 1,
            options: { beforeAssertion, afterAssertion, wait: 500 }
        })
        expect(afterAssertion).toHaveBeenCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: 1,
            options: { beforeAssertion, afterAssertion, wait: 500 },
            result
        })
    })

    test('throws on a legacy NumberOptions', async () => {
        const mock: Mock = new TestMock()

        // @ts-expect-error command options go in the options argument
        await expect(thisContext.toBeRequestedTimes(mock, { gte: 1, wait: 0 })).rejects.toThrow('Invalid NumberMatcher')
    })

    test('wait for success using number options', async () => {
        const mock: Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const result = await thisContext.toBeRequestedTimes(mock, { gte: 1 }, { wait: 500 })
        expect(result.pass).toBe(true)

        const result2 = await thisContext.toBeRequestedTimes(mock, { eq: 1 }, { wait: 500 })
        expect(result2.pass).toBe(true)
        expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 500, interval: undefined })
    })

    test('wait but failure', async () => {
        const mock: Mock = new TestMock()
        const result = await thisContext.toBeRequestedTimes(mock, 1)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 10)

        const result2 = await thisContext.toBeRequestedTimes(mock, 1)
        expect(result2.pass).toBe(false)

        const result3 = await thisContext.toBeRequestedTimes(mock, 2)
        expect(result3.pass).toBe(true)

        const result4 = await thisContext.toBeRequestedTimes(mock, { gte: 2 }, { wait: 1 })
        expect(result4.pass).toBe(true)

        const result5 = await thisContext.toBeRequestedTimes(mock, { lte: 2 }, { wait: 1 })
        expect(result5.pass).toBe(true)

        const result6 = await thisContext.toBeRequestedTimes(mock, { lte: 3 }, { wait: 1 })
        expect(result6.pass).toBe(true)
    })

    test('not to be called', async () => {
        const mock: Mock = new TestMock()

        // expect(mock).not.toBeRequestedTimes(0) should fail
        const result = await thisNotContext.toBeRequestedTimes(mock, 0)
        expect(result.pass).toBe(true) // failure, boolean inverted later because of .not
        expect(stripAnsi(result.message())).toEqual(`\
Expect mock not to be called 0 times

Expected [not]: 0
Received      : 0`
        )

        // expect(mock).not.toBeRequestedTimes(1) should pass
        const result2 = await thisNotContext.toBeRequestedTimes(mock, 1)
        expect(result2.pass).toBe(false) // success, boolean inverted later because of .not

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequestedTimes(0) should pass
        const result3 = await thisNotContext.toBeRequestedTimes(mock, 0)
        expect(result3.pass).toBe(false) // success, boolean inverted later because of .not

        // expect(mock).not.toBeRequestedTimes(1) should fail
        const result4 = await thisNotContext.toBeRequestedTimes(mock, 1)
        expect(result4.pass).toBe(true) // failure, boolean inverted later because of .not
        expect(stripAnsi(result4.message())).toEqual(`\
Expect mock not to be called 1 time

Expected [not]: 1
Received      : 1`
        )
    })

    test('message', async () => {
        const mock: Mock = new TestMock()

        const result = await thisContext.toBeRequestedTimes(mock, 0)
        expect(stripAnsi(result.message())).toContain('Expect mock to be called 0 times')

        const result2 = await thisContext.toBeRequestedTimes(mock, 1)
        expect(result2.message()).toContain('Expect mock to be called 1 time')

        const result3 = await thisContext.toBeRequestedTimes(mock, 2)
        expect(result3.message()).toContain('Expect mock to be called 2 times')

        const result4 = await thisContext.toBeRequestedTimes(mock, { gte: 3 })
        expect(result4.pass).toBe(false)
        expect(stripAnsi(result4.message())).toEqual(`\
Expect mock to be called times

Expected: >= 3
Received: 0`
        )
    })
})

describe('toBeRequestedTimes on multi-remote mocks', () => {
    const thisContext = { toBeRequestedTimes }
    const thisNotContext = { isNot: true, toBeRequestedTimes }

    const mockCalled = (count: number): Mock => {
        const mock = new TestMock()
        mock.calls.push(...Array(count).fill(mockMatch))
        return mock
    }

    /** Like `multiRemoteBrowser.mock()`: one mock per instance, each called the given number of times */
    const multiRemoteMockCalled = (counts: Record<string, number>) =>
        multiRemoteMockFactory(Object.fromEntries(Object.entries(counts).map(([name, count]) => [name, mockCalled(count)])))

    test('passes when every instance\'s mock is called the expected number of times', async () => {
        const result = await thisContext.toBeRequestedTimes(multiRemoteMockCalled({ chrome: 1, firefox: 1 }), 1, { wait: 0 })

        expect(result.pass).toBe(true)
    })

    test('passes with a promise of a MultiRemoteMock, like a not-awaited mock(), and a NumberMatcher', async () => {
        const result = await thisContext.toBeRequestedTimes(Promise.resolve(multiRemoteMockCalled({ chrome: 1, firefox: 2 })), { gte: 1 }, { wait: 0 })

        expect(result.pass).toBe(true)
    })

    test('fails with a per-instance message when an instance\'s mock is not called the expected number of times', async () => {
        const result = await thisContext.toBeRequestedTimes(multiRemoteMockCalled({ chrome: 1, firefox: 0 }), 1, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> mocks to be called 1 time

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": 1,
-   "firefox": 1,
+   "firefox": 0,
  }`)
    })

    test('names the mocks by the instances of the MultiRemoteMock, e.g. from select()', async () => {
        const result = await thisContext.toBeRequestedTimes(multiRemoteMockCalled({ firefox: 0 }), 1, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<firefox> mocks to be called 1 time

- Expected  - 1
+ Received  + 1

  Multi-remote values {
-   "firefox": 1,
+   "firefox": 0,
  }`)
    })

    test('fails with .not when only some instances\' mocks are called that number of times', async () => {
        const result = await thisNotContext.toBeRequestedTimes(multiRemoteMockCalled({ chrome: 1, firefox: 0 }), 1, { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
    })

    test('passes with .not when no instance\'s mock is called that number of times', async () => {
        const result = await thisNotContext.toBeRequestedTimes(multiRemoteMockCalled({ chrome: 0, firefox: 2 }), 1, { wait: 0 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('passes with a promise of a single mock, like a not-awaited mock()', async () => {
        const result = await thisContext.toBeRequestedTimes(Promise.resolve(mockCalled(1)) as unknown as Mock, 1, { wait: 0 })

        expect(result.pass).toBe(true)
    })

    test('rejects an array of mocks, also with .not: a multi-remote mock() is a MultiRemoteMock', async () => {
        const mocks = [mockCalled(1), mockCalled(1)] as unknown as Mock

        await expect(thisContext.toBeRequestedTimes(mocks, 1, { wait: 0 })).rejects.toThrow('Expected a mock or a multi-remote mock, received an array')
        await expect(thisNotContext.toBeRequestedTimes(mocks, 1, { wait: 0 })).rejects.toThrow('Expected a mock or a multi-remote mock, received an array')
    })
})
