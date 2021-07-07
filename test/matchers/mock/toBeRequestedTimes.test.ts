import { toBeRequestedTimes } from '../../../src/matchers/mock/toBeRequestedTimes'
import type { Matches, Mock } from 'webdriverio'
import { removeColors, getReceived, getExpected, getExpectMessage } from '../../__fixtures__/utils'

class TestMock {
    _calls: Matches[]

    constructor () {
        this._calls = []
    }
    get calls () {
        return this._calls
    }
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

        const result = await toBeRequestedTimes(mock, 1)
        expect(result.pass).toBe(true)
    })

    test('wait for success using number options', async () => {
        const mock: Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const result = await toBeRequestedTimes(mock, { gte: 1 })
        expect(result.pass).toBe(true)
        const result2 = await toBeRequestedTimes(mock, { eq: 1 })
        expect(result2.pass).toBe(true)
    })

    test('wait but failure', async () => {
        const mock: Mock = new TestMock()
        const result = await toBeRequestedTimes(mock, 1)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 10)

        const result2 = await toBeRequestedTimes(mock, 1)
        expect(result2.pass).toBe(false)
        const result3 = await toBeRequestedTimes(mock, 2)
        expect(result3.pass).toBe(true)
        const result4 = await toBeRequestedTimes(mock, { gte: 2 })
        expect(result4.pass).toBe(true)
        const result5 = await toBeRequestedTimes(mock, { lte: 2 })
        expect(result5.pass).toBe(true)
        const result6 = await toBeRequestedTimes(mock, { lte: 3 })
        expect(result6.pass).toBe(true)
    })

    test('not to be called', async () => {
        const mock: Mock = new TestMock()

        // expect(mock).not.toBeRequestedTimes(0) should fail
        const result = await toBeRequestedTimes.call({ isNot: true }, mock, 0)
        expect(result.pass).toBe(false)

        // expect(mock).not.toBeRequestedTimes(1) should pass
        const result2 = await toBeRequestedTimes.call({ isNot: true }, mock, 1)
        expect(result2.pass).toBe(true)

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequestedTimes(0) should pass
        const result3 = await toBeRequestedTimes.call({ isNot: true }, mock, 0)
        expect(result3.pass).toBe(true)

        // expect(mock).not.toBeRequestedTimes(1) should fail
        const result4 = await toBeRequestedTimes.call({ isNot: true }, mock, 1)
        expect(result4.pass).toBe(false)
    })

    test('message', async () => {
        const mock: Mock = new TestMock()

        const result = await toBeRequestedTimes(mock, 0)
        expect(result.message()).toContain('Expect mock to be called 0 times')

        const result2 = await toBeRequestedTimes(mock, 1)
        expect(result2.message()).toContain('Expect mock to be called 1 time')

        const result3 = await toBeRequestedTimes(mock, 2)
        expect(result3.message()).toContain('Expect mock to be called 2 times')

        const result4 = await toBeRequestedTimes(mock, { gte: 3 })
        const message4 = removeColors(result4.message())
        expect(getExpectMessage(message4)).toBe('Expect mock to be called times')
        expect(getExpected(message4)).toBe('Expected: ">= 3"')
        expect(getReceived(message4)).toBe('Received: 0')
    })
})
