import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'

import { toBeRequestedWith } from '../../../src/matchers/mock/toBeRequestedWith.js'
import type { local } from 'webdriver'

vi.mock('@wdio/globals')
vi.mock('../../../src/constants.js', async () => ({
    DEFAULT_OPTIONS: {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        ...(await vi.importActual<typeof import('../../../src/constants.js')>('../../../src/constants.js')).DEFAULT_OPTIONS,
        // speed up tests by lowering default wait timeout
        wait : 0
    }
}))

interface Scenario {
    name: string
    mocks: local.NetworkBaseParameters[]
    pass: boolean
    params: ExpectWebdriverIO.RequestedWith
}

class TestMock {
    _calls: local.NetworkBaseParameters[]

    constructor() {
        this._calls = []
    }
    get calls() {
        return this._calls
    }
}

function reduceHeaders(headers: local.NetworkHeader[]) {
    return Object.entries(headers).reduce((acc, [, value]: [string, local.NetworkHeader]) => {
        acc[value.name] = value.value.value
        return acc
    }, {} as Record<string, string>)
}

const authKey = 'Bearer ' + '2'.repeat(128)

const mockGet: local.NetworkAuthRequiredParameters = {
    request: {
        url: 'http://localhost:8080/api/search?pages=20',
        method: 'GET',
        request: '123',
        headersSize: 123,
        bodySize: 123,
        timings: {} as any,
        cookies: [],
        headers: [{
            name: 'Authorization',
            value: { type: 'string', value: authKey }
        }, {
            name: 'foo',
            value: { type: 'string', value: 'bar' }
        }]
    },
    response: {
        headers: {},
        status: 200,
    } as any,
    // body: JSON.stringify({
    //     total: 100,
    //     page: 1,
    //     data: {
    //         aLongValue1: {
    //             k1: { value1: 'bar1' },
    //             k2: { value2: 'bar2' },
    //         },
    //         foo: { id: 1 },
    //         bar: { id: 2 },
    //         longValue2: { value: 'foo2' },
    //         longValue3: { value: 'foo3' },
    //     },
    // }),
    // initialPriority: 'Low',
    // referrerPolicy: 'origin',
} as any

const mockPost: local.NetworkAuthRequiredParameters = {
    request: {
        url: 'https://my-app/api/add-tags',
        method: 'POST',
        request: '123',
        headersSize: 123,
        bodySize: 123,
        timings: {} as any,
        cookies: [],
        headers: [{
            name: 'Authorization',
            value: { type: 'string', value: authKey }
        }, {
            name: 'foo',
            value: { type: 'string', value: 'bar' }
        }, {
            name: 'Accept',
            value: { type: 'string', value: '*' }
        }],
    },
    response: {
        status: 201,
        headers: []
    } as any,
    // body: JSON.stringify([
    //     { id: 1, name: 'foo' },
    //     { id: 2, name: 'bar' },
    // ]),
    // postData: JSON.stringify([{ id: 1 }, { search: { name: 'bar' } }]),
    // initialPriority: 'Low',
    // referrerPolicy: 'origin',
} as any

describe(toBeRequestedWith, () => {
    let thisNotContext: { isNot: true,  toBeRequestedWith: typeof toBeRequestedWith }

    beforeEach(() => {
        thisNotContext = { isNot: true,  toBeRequestedWith }
    })
    test('wait for success, exact match', async () => {
        const mock: any = new TestMock()

        setTimeout(() => {
            mock.calls.push({ ...mockGet })
        }, 5)
        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 15)

        const params = {
            url: mockPost.request.url,
            method: mockPost.request.method,
            requestHeaders: {},
            statusCode: mockPost.response.status,
            responseHeaders: {},
            // postData: mockPost.postData,
            // response: JSON.parse(mockPost.body as string),
        }

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toBeRequestedWith(mock, params, { beforeAssertion, afterAssertion, wait: 500 })

        expect(result.pass).toBe(true)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toBeRequestedWith',
            expectedValue: params,
            options: { beforeAssertion, afterAssertion, wait: 500 },
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toBeRequestedWith',
            expectedValue: params,
            options: { beforeAssertion, afterAssertion, wait: 500 },
            result
        })
    })

    test('wait for failure', async () => {
        const mock: any = new TestMock()

        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 15)

        const params = {
            url: 'post.url',
            method: 'post.method',
            requestHeaders: {},
            responseHeaders: {}
            // postData: {},
            // response: 'post.body',
        }

        const result = await toBeRequestedWith(mock, params, { wait: 20 })
        expect(result.pass).toBe(false)
    })

    test('wait for NOT - failure with empty params and pass expected to be true', async () => {
        const mock: any = new TestMock()
        mock.calls.push({ ...mockGet }, { ...mockPost })
        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 10)

        const result = await thisNotContext.toBeRequestedWith(mock, {}, { wait: 20 })
        expect(result.pass).toBe(true) // failure, boolean inverted later because of .not
        expect(result.message()).toEqual(`\
Expect mock not to be called with

Expected [not]: {}
Received      : {}`
        )
    })

    test('wait for NOT - success with pass expected to be false', async () => {
        const mock: any = new TestMock()

        setTimeout(() => {
            mock.calls.push({ ...mockGet }, { ...mockPost })
        }, 10)

        const result = await thisNotContext.toBeRequestedWith(mock, { method: 'DELETE' }, { wait: 20 })
        expect(result.pass).toBe(false) // success, boolean inverted later because of .not
    })

    const scenarios: Scenario[] = [
        // success
        {
            name: 'success, url only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                url: mockPost.request.url,
            },
        },
        {
            name: 'success, method only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                method: ['DELETE', 'PUT', mockPost.request.method, 'GET'],
            },
        },
        {
            name: 'success, statusCode only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                statusCode: [203, 200, 201],
            },
        },
        {
            name: 'success, requestHeaders only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                requestHeaders: {
                    Authorization: authKey,
                    foo: 'bar',
                    Accept: '*'
                },
            },
        },
        {
            name: 'success, responseHeaders only',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                responseHeaders: {},
            },
        },
        // {
        //     name: 'success, postData only',
        //     mocks: [{ ...mockPost }],
        //     pass: true,
        //     params: {
        //         postData: JSON.parse(mockPost.postData as string),
        //     },
        // },
        // {
        //     name: 'success, response only',
        //     mocks: [{ ...mockPost }],
        //     pass: true,
        //     params: {
        //         response: mockPost.body,
        //     },
        // },
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
            name: 'failure, statusCode only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                statusCode: [400, 401],
            },
        },
        {
            name: 'failure, requestHeaders only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                requestHeaders: { Cache: 'false' },
            },
        },
        {
            name: 'failure, responseHeaders only',
            mocks: [{ ...mockPost }],
            pass: false,
            params: {
                responseHeaders: { Cache: 'false' },
            },
        },
        // {
        //     name: 'failure, postData only',
        //     mocks: [{ ...mockPost }],
        //     pass: false,
        //     params: {
        //         postData: 'foobar',
        //     },
        // },
        // {
        //     name: 'failure, response only',
        //     mocks: [{ ...mockGet }],
        //     pass: false,
        //     params: {
        //         response: { foobar: true },
        //     },
        // },
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
                requestHeaders: expect.objectContaining({
                    Authorization: expect.stringContaining('Bearer '),
                }),
            },
        },
        {
            name: 'special matcher, postData',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                postData: expect.stringMatching('"search"'),
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
                requestHeaders: (headers: Record<string, string>) => headers.foo === 'bar',
            },
        },
        {
            name: 'function, postData',
            mocks: [{ ...mockPost }],
            pass: true,
            params: {
                postData: (r: string) => (JSON.parse(r) as Array<Record<string, unknown>>).length === 2,
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
        // {
        //     name: 'no postData',
        //     mocks: [{ ...mockGet }],
        //     pass: false,
        //     params: {
        //         postData: 'something',
        //     },
        // },
        // body is not a JSON
        // {
        //     name: 'body as string',
        //     mocks: [{ ...mockGet, body: 'asd' }],
        //     pass: true,
        //     params: {
        //         response: 'asd',
        //     },
        // },
        // {
        //     name: 'body as Buffer',
        //     mocks: [{ ...mockGet, body: Buffer.from('asd') }],
        //     pass: true,
        //     params: {
        //         response: 'asd',
        //     },
        // },
        // {
        //     name: 'body as JSON',
        //     mocks: [{ ...mockGet, body: 'asd' }],
        //     pass: false,
        //     params: {
        //         response: { foo: 'bar' },
        //     },
        // },
    ]

    scenarios.forEach((scenario) => {
        test(scenario.name, async () => {
            const mock: any = new TestMock()
            mock.calls.push(...scenario.mocks)

            const result = await toBeRequestedWith(mock, scenario.params as any)
            expect(result.pass).toBe(scenario.pass)
        })
    })

    describe('error messages', () => {
        const consoleError = global.console.error
        beforeEach(() => {
            global.console.error = vi.fn()
        })

        test('unsupported method', async () => {
            const mock: any = new TestMock()
            mock.calls.push({ ...mockGet })

            const result = await toBeRequestedWith(mock, { method: 1234 } as any)
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
        const mock: any = new TestMock()

        const requested = await toBeRequestedWith(mock, {
            url: () => false,
            method: ['DELETE', 'PUT'],
            requestHeaders: reduceHeaders(mockPost.request.headers),
            responseHeaders: reduceHeaders(mockPost.response.headers),
            postData: expect.anything(),
            response: [...Array(50).keys()].map((_, id) => ({ id, name: `name_${id}` })),
        })
        expect(requested.pass).toBe(false)
        expect(requested.message()).toEqual(`\
Expect mock to be called with

Expected: {"method": ["DELETE", "PUT"], "postData": "Anything ", "requestHeaders": {"Accept": "*", "Authorization": "Bearer ..2222222", "foo": "bar"}, "response": [{"id": 0, "name": "name_0"}, "... 49 more items"], "responseHeaders": {}, "url": "() => false"}
Received: "was not called"`
        )

        mock.calls.push(mockPost)
        const notRequested = await thisNotContext.toBeRequestedWith(mock, {
            url: () => true,
            method: mockPost.request.method,
        })

        expect(notRequested.message()).toBe(
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
