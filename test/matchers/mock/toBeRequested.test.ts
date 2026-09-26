import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
// @ts-ignore TODO fix me
import type { Matches, Mock } from 'webdriverio'

import { toBeRequested } from '../../../src/matchers/mock/toBeRequested.js'
import stripAnsi from 'strip-ansi'
import { multiRemoteBrowserFactory } from '../../__mocks__/@wdio/globals.js'

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

describe(toBeRequested, () => {
    let thisNotContext: { isNot: true, toBeRequested: typeof toBeRequested }

    beforeEach(() => {
        thisNotContext = { isNot: true, toBeRequested }
    })

    test('wait for success', async () => {
        const mock: Mock = new TestMock()
        const result = await toBeRequested(mock)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 5)

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result2 = await toBeRequested(mock, { beforeAssertion, afterAssertion, wait: 500 })
        expect(result2.pass).toBe(true)
        expect(beforeAssertion).toHaveBeenCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: { gte: 1 },
            options: { beforeAssertion, afterAssertion, wait: 500 }
        })
        expect(afterAssertion).toHaveBeenCalledWith({
            matcherName: 'toBeRequestedTimes',
            expectedValue: { gte: 1 },
            options: { beforeAssertion, afterAssertion, wait: 500 },
            result: result2
        })
    })

    test('not to be called', async () => {
        const mock: Mock = new TestMock()

        // expect(mock).not.toBeRequested() should pass=false
        const result = await thisNotContext.toBeRequested(mock)
        expect(result.pass).toBe(false) // success, boolean is inverted later becuase of `.not`

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequested() should fail
        const result4 = await thisNotContext.toBeRequested(mock)
        expect(result4.pass).toBe(true) // failure, boolean is inverted later because of `.not`
    })

    test('message', async () => {
        const mock: Mock = new TestMock()

        const result = await toBeRequested(mock)
        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect mock to be called

Expected: >= 1
Received: 0`
        )

        mock.calls.push(mockMatch)
        const result2 = await thisNotContext.toBeRequested(mock)
        expect(result2.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(stripAnsi(result2.message())).toEqual(`\
Expect mock not to be called

Expected [not]: >= 1
Received      : 1`
        )
    })
})

describe('toBeRequested on multi-remote mocks', () => {
    const thisContext = { toBeRequested }
    const thisNotContext = { isNot: true, toBeRequested }

    /** One mock per instance, like `multiRemoteBrowser.mock()`, each called the given number of times */
    const mocksCalled = (...counts: number[]): Mock[] => counts.map((count) => {
        const mock = new TestMock()
        mock.calls.push(...Array(count).fill(mockMatch))
        return mock
    })

    beforeEach(() => {
        vi.stubGlobal('multiRemoteBrowser', multiRemoteBrowserFactory())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('passes when every instance\'s mock is called', async () => {
        const result = await thisContext.toBeRequested(mocksCalled(1, 2), { wait: 0 })

        expect(result.pass).toBe(true)
    })

    test('fails with a per-instance message when an instance\'s mock is not called', async () => {
        const result = await thisContext.toBeRequested(mocksCalled(1, 0), { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> mocks to be called

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": >= 1,
-   "firefox": >= 1,
+   "firefox": 0,
  }`)
    })

    test('rejects an empty array of mocks, which has nothing to assert on', async () => {
        await expect(thisContext.toBeRequested([], { wait: 0 })).rejects.toThrow('Expected a mock or a non-empty array of mocks, received an empty array')
    })

    test('fails with .not when only some instances\' mocks are called', async () => {
        const result = await thisNotContext.toBeRequested(mocksCalled(1, 0), { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
    })
})
