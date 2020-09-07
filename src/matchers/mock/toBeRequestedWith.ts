import { waitUntil, enhanceError } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { equals } from '../../jasmineUtils'

function toBeRequestedWithFn(
    received: WebdriverIO.Mock,
    requestedWith: ExpectWebdriverIO.RequestedWith = {},
    options: ExpectWebdriverIO.CommandOptions = {}
): any {
    const isNot = this.isNot || false
    const { expectation = 'called with', verb = 'be' } = this

    return browser.call(async () => {
        let actual: WebdriverIO.Matches | undefined
        const pass = await waitUntil(
            async () => {
                for (const call of received.calls) {
                    actual = call
                    if (
                        methodFilter(call.method, requestedWith.method) &&
                        urlFilter(call.url, requestedWith.url) &&
                        headersFilter(call.headers, requestedWith.headers) &&
                        bodyFilter(call.postData, requestedWith.request) &&
                        bodyFilter(call.body, requestedWith.response)
                    ) {
                        return !isNot
                    }
                }

                return isNot
            },
            isNot,
            { ...options, wait: isNot ? 0 : options.wait }
        )

        const message = enhanceError(
            'mock',
            minifyRequestedWith(requestedWith),
            minifyRequestMock(actual) || 'was not called',
            this,
            verb,
            expectation,
            '',
            options
        )
        return {
            pass,
            message: (): string => message,
        }
    })
}

const methodFilter = (method: string, expected?: string | Array<string>) => {
    if (typeof expected === 'undefined') {
        return true
    }
    if (!Array.isArray(expected)) {
        expected = [expected]
    }
    return expected
        .map((m) => {
            if (typeof m !== 'string') {
                return console.error('expect.toBeRequestedWith: unsupported value passed to method ' + m)
            }
            return m.toUpperCase()
        })
        .includes(method)
}

const urlFilter = (
    url: string,
    expected?: string | ExpectWebdriverIO.PartialMatcher | ((url: string) => boolean)
) => {
    if (typeof expected === 'undefined') {
        return true
    }
    if (typeof expected === 'function') {
        return expected(url)
    }
    return equals(url, expected)
}

const headersFilter = (
    headers: Record<string, string>,
    expected?:
        | Record<string, string>
        | ExpectWebdriverIO.PartialMatcher
        | ((headers: Record<string, string>) => boolean)
) => {
    if (typeof expected === 'undefined') {
        return true
    }
    if (typeof expected === 'function') {
        return expected(headers)
    }
    return equals(headers, expected)
}

const bodyFilter = (
    body: string | undefined,
    expected?:
        | string
        | ExpectWebdriverIO.JsonCompatible
        | ExpectWebdriverIO.PartialMatcher
        | ((r: string | undefined) => boolean)
) => {
    if (typeof expected === 'undefined') {
        return true
    }
    if (typeof expected === 'function') {
        return expected(body)
    }
    if (typeof body === 'undefined') {
        return false
    }

    // get matcher sample if expected value is a special matcher like `expect.objectContaining({ foo: 'bar })`
    const actualSample = isMatcher(expected)
        ? (expected as ExpectWebdriverIO.PartialMatcher).sample
        : expected

    let parsedBody = body

    // convert request body from string to JSON if expected value is JSON-like
    if (
        Array.isArray(actualSample) ||
        (typeof actualSample === 'object' &&
            actualSample !== null &&
            actualSample instanceof RegExp === false)
    ) {
        parsedBody = tryParseBody(body)

        // failed to parse string as JSON
        if (parsedBody === null) {
            return false
        }
    }

    return equals(parsedBody, expected)
}

/**
 * is jasmine/jest special matcher
 *
 * Jest and Jasmine support special matchers like `jasmine.objectContaining`, `expect.arrayContaining`, etc.
 *
 * All these kind of objects have `sample` and `asymmetricMatch` function in __proto__
 * `expect.objectContaining({ foo: 'bar })` -> `{ sample: { foo: 'bar' }, __proto__: asymmetricMatch() {} }`
 *
 * jasmine.any and jasmine.anything don't have `sample` property
 * @param filter
 */
const isMatcher = (filter: any) => {
    return typeof filter.__proto__?.asymmetricMatch === 'function'
}

const tryParseBody = (jsonString: string) => {
    try {
        return JSON.parse(jsonString)
    } catch {
        return null
    }
}

const minifyRequestMock = (requestMock: WebdriverIO.Matches | undefined) => {
    if (typeof requestMock === 'undefined') {
        return requestMock
    }

    const result = {
        url: requestMock.url.substr(-80),
        method: requestMock.method,
        headers: JSON.stringify(requestMock.headers).substring(0, 80),
        postData: requestMock.postData?.substring(0, 80),
        body: requestMock.body.substring(0, 80),
    }

    return result
}

const minifyRequestedWith = (requestedWith: ExpectWebdriverIO.RequestedWith) => {
    const result = {
        url: requestedWithParamToString(requestedWith.url),
        method: requestedWith.method,
        headers: requestedWithParamToString(requestedWith.headers),
        request: requestedWithParamToString(requestedWith.request),
        response: requestedWithParamToString(requestedWith.response),
    }

    return result
}

const requestedWithParamToString = (
    param: string | ExpectWebdriverIO.JsonCompatible | ExpectWebdriverIO.PartialMatcher | Function | undefined
) => {
    if (typeof param === 'undefined') {
        return
    }
    if (typeof param === 'function') {
        return 'fn()'
    }
    if (isMatcher(param)) {
        return param.constructor.name
    }
    if (Array.isArray(param) || typeof param === 'object') {
        param = JSON.stringify(param)
    }
    return param.substring(0, 80)
}

export function toBeRequestedWith(...args: any): any {
    return runExpect.call(this, toBeRequestedWithFn, args)
}
