import { toBeRequestedWith } from '../../../src/matchers/mock/toBeRequestedWith'
import type { Matches } from 'webdriverio'
import { removeColors, getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils'

class TestMock {
    _calls: Matches[]

    constructor() {
        this._calls = []
    }
    get calls() {
        return this._calls
    }
}

const mockGet: Matches = {
    url: 'http://localhost:8080/api/search?pages=20',
    method: 'GET',
    headers: { ...{ Authorization: 'Bearer ' + '1'.repeat(128), foo: 'bar' } },
    body: JSON.stringify({
        total: 100,
        page: 1,
        data: {
            result: {
                foo: { id: 1 },
                bar: { id: 2 },
            },
        },
    }),
    initialPriority: 'Low',
    referrerPolicy: 'origin',
}

const mockPost: Matches = {
    url: 'https://my-app/api/add-tags',
    method: 'POST',
    headers: { ...{ Authorization: 'Bearer ' + '2'.repeat(128), foo: 'bar', Accept: '*' } },
    body: JSON.stringify([
        { id: 1, name: 'foo' },
        { id: 2, name: 'bar' },
    ]),
    postData: JSON.stringify([{ id: 1 }, { search: { name: 'bar' } }]),
    initialPriority: 'Low',
    referrerPolicy: 'origin',
}

describe('toBeRequestedWith', () => {
    test('wait for success, exact match', async () => {
        const mock = new TestMock()

        setTimeout(() => {
            mock.calls.push({ ...mockGet })
        }, 5)
        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 15)

        const params = {
            url: mockPost.url,
            method: mockPost.method,
            headers: mockPost.headers,
            request: mockPost.postData,
            response: JSON.parse(mockPost.body),
        }

        const result = await toBeRequestedWith(mock, params)
        expect(result.pass).toBe(true)
    })

    test('wait for failure', async () => {
        const mock = new TestMock()

        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 15)

        const params = {
            url: 'post.url',
            method: 'post.method',
            headers: {},
            request: {},
            response: 'post.body',
        }

        const result = await toBeRequestedWith(mock, params)
        expect(result.pass).toBe(false)
    })

    test('wait for NOT failure, empty params', async () => {
        const mock = new TestMock()
        mock.calls.push({ ...mockGet }, { ...mockPost })
        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 10)

        const result = await toBeRequestedWith.call({ isNot: true }, mock, {})
        expect(result.pass).toBe(true)
    })

    test('wait for NOT success', async () => {
        const mock = new TestMock()

        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 10)

        const result = await toBeRequestedWith.call({ isNot: true }, mock, { method: 'DELETE' })
        expect(result.pass).toBe(false)
    })

    const scenarios = [
        // success
        {
            name: 'success, url only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                url: mockPost.url,
            },
        },
        {
            name: 'success, method only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                method: ['DELETE', 'PUT', mockPost.method, 'GET'],
            },
        },
        {
            name: 'success, headers only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                headers: mockPost.headers,
            },
        },
        {
            name: 'success, request only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                request: JSON.parse(mockPost.postData as string),
            },
        },
        {
            name: 'success, response only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                response: mockPost.body,
            },
        },
        // failure
        {
            name: 'failure, url only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                url: '/api/api',
            },
        },
        {
            name: 'failure, method only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                method: ['DELETE', 'PUT'],
            },
        },
        {
            name: 'failure, headers only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                headers: { Cache: false },
            },
        },
        {
            name: 'failure, request only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                request: 'foobar',
            },
        },
        {
            name: 'failure, response only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                response: { foobar: true },
            },
        },
        // special matcher
        {
            name: 'special matcher, url',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                url: expect.stringMatching(/.*\/API\/.*/i),
            },
        },
        {
            name: 'special matcher, headers',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                headers: expect.objectContaining({ Authorization: expect.stringContaining('Bearer ') }),
            },
        },
        {
            name: 'special matcher, request',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                request: expect.stringMatching('"search"'),
            },
        },
        {
            name: 'special matcher, response',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                response: expect.arrayContaining([expect.objectContaining({ id: 2 })]),
            },
        },
        // function
        {
            name: 'function, url',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                url: (url: string) => url.startsWith('https'),
            },
        },
        {
            name: 'function, headers',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                headers: (headers: Record<string, string>) => headers.foo === 'bar',
            },
        },
        {
            name: 'function, request',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                request: (r: string) => (JSON.parse(r) as Array<Record<string, unknown>>).length === 2,
            },
        },
        {
            name: 'function, response',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                response: (r: string) => r.includes('id') && r.includes('name'),
            },
        },
        // no postData
        {
            name: 'no postData',
            mocks: [{ ...mockGet }],
            pass: false,
            params: {
                request: 'something',
            },
        },
        // body is not a JSON
        {
            name: 'body as string',
            mocks: [{ ...mockGet, body: 'asd' }],
            pass: true,
            params: {
                response: 'asd',
            },
        },
        {
            name: 'body as JSON',
            mocks: [{ ...mockGet, body: 'asd' }],
            pass: false,
            params: {
                response: { foo: 'bar' },
            },
        },
    ]

    scenarios.forEach((scenario) => {
        test(scenario.name, async () => {
            const mock = new TestMock()
            mock.calls.push(...scenario.mocks)

            const result = await toBeRequestedWith(mock, scenario.params)
            expect(result.pass).toBe(scenario.pass)
        })
    })

    describe('error messages', () => {
        const consoleError = global.console.error
        beforeEach(() => {
            global.console.error = jest.fn()
        })

        test('unsupported method', async () => {
            const mock = new TestMock()
            mock.calls.push({ ...mockGet })

            const result = await toBeRequestedWith(mock, { method: 1234 })
            expect(result.pass).toBe(false)
            expect(global.console.error).toBeCalledWith(
                'expect.toBeRequestedWith: unsupported value passed to method 1234'
            )
        })

        afterEach(() => {
            global.console.error = consoleError
        })
    })

    test('message', async () => {
        const mock = new TestMock()

        const requested = await toBeRequestedWith(mock, {
            url: () => false,
            method: ['DELETE', 'PUT'],
            headers: mockPost.headers,
            request: expect.anything(),
            response: JSON.parse(mockPost.body),
        })
        const wasNotCalled = removeColors(requested.message())
        expect(getExpectMessage(wasNotCalled)).toBe('Expect mock to be called with')
        expect(getExpected(wasNotCalled)).toBe(
            'Expected: {' +
                '"headers": {"Accept": "*", "Authorization": "Bearer ..2222222", "foo": "bar"}, ' +
                '"method": ["DELETE", "PUT"], ' +
                '"request": "Anything ", ' +
                '"response": [{"id": 1, "name": "foo"}, {"id": 2, "name": "bar"}], ' +
                '"url": "() => false"}'
        )
        expect(getReceived(wasNotCalled)).toBe('Received: "was not called"')

        mock.calls.push(mockPost)

        const notRequested = await toBeRequestedWith.call({ isNot: true }, mock, {
            url: () => true,
            method: mockPost.method,
        })
        const wasCalled = removeColors(notRequested.message())
        expect(wasCalled).toBe(
            `Expect mock not to be called with

- Expected [not]  - 1
+ Received        + 1

  Object {
    "method": "POST",
-   "url": "() => true",
+   "url": "https://my-app/api/add-tags",
  }`
        )
    })
})
