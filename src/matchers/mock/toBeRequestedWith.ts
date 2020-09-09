import { waitUntil, enhanceError } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { equals } from '../../jasmineUtils'

const STR_LIMIT = 80

export function toBeRequestedWithFn(
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
                        methodMatcher(call.method, requestedWith.method) &&
                        urlMatcher(call.url, requestedWith.url) &&
                        headersMatcher(call.headers, requestedWith.headers) &&
                        bodyMatcher(call.postData, requestedWith.request) &&
                        bodyMatcher(call.body, requestedWith.response)
                    ) {
                        return true
                    }
                }

                return false
            },
            isNot,
            { ...options, wait: isNot ? 0 : options.wait }
        )

        const message = enhanceError(
            'mock',
            minifyRequestedWith(requestedWith),
            minifyRequestMock(actual, requestedWith) || 'was not called',
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

/**
 * is actual method matching an expected method or methods
 */
const methodMatcher = (method: string, expected?: string | Array<string>) => {
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

/**
 * is actual url matching an expected condition
 */
const urlMatcher = (
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

/**
 * is headers url matching an expected condition
 */
const headersMatcher = (
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

/**
 * is request/response matching an expected condition
 */
const bodyMatcher = (
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

/**
 * shorten long url, headers, postData, body
 */
const minifyRequestMock = (
    requestMock: WebdriverIO.Matches | undefined,
    requestedWith: Record<string, any | undefined>
) => {
    if (typeof requestMock === 'undefined') {
        return requestMock
    }

    const r: Record<string, any> = {
        url: requestMock.url,
        method: requestMock.method,
        headers: requestMock.headers,
        request: requestMock.postData,
        response: requestMock.body,
    }

    deleteUndefinedValues(r, requestedWith)

    return minifyRequestedWith(r)
}

/**
 * shorten long url, headers, request, response
 * and transform Function/Matcher to string
 */
const minifyRequestedWith = (r: ExpectWebdriverIO.RequestedWith) => {
    const result = {
        url: requestedWithParamToString(r.url),
        method: r.method,
        headers: requestedWithParamToString(r.headers, shortenHeaders),
        request: requestedWithParamToString(r.request),
        response: requestedWithParamToString(r.response),
    }

    deleteUndefinedValues(result)

    return result
}

/**
 * transform Function/Matcher/JSON to string if needed
 */
const requestedWithParamToString = (
    param:
        | string
        | ExpectWebdriverIO.JsonCompatible
        | ExpectWebdriverIO.PartialMatcher
        | Function
        | undefined,
    transformFn?: (param: ExpectWebdriverIO.JsonCompatible) => ExpectWebdriverIO.JsonCompatible | string
) => {
    if (typeof param === 'undefined') {
        return
    }

    if (typeof param === 'function') {
        param = param.toString()
    } else if (isMatcher(param)) {
        return (
            param.constructor.name +
            ' ' +
            (JSON.stringify((param as ExpectWebdriverIO.PartialMatcher).sample) || '')
        )
    } else if (transformFn) {
        param = transformFn(param as ExpectWebdriverIO.JsonCompatible)
    }

    if (typeof param === 'string') {
        param = shortenString(param)
    }

    return param
}

/**
 * shorten headers key/values
 * ex: `{ someVeryLongKey: 'someVeryLongValue' }` -> `{ som..Key: 'som..lue' }`
 */
const shortenHeaders = (obj: Record<string, string>) => {
    const minifiedObject: Record<string, string> = {}

    Object.entries(obj).forEach(([k, v]) => {
        minifiedObject[shortenString(k, 16)] = shortenString(v, 16)
    })

    return minifiedObject
}

/**
 * shorten string
 * ex: '1234567890' -> '12..90'
 */
const shortenString = (str: string, limit = STR_LIMIT) => {
    return str.length > limit ? str.substring(0, limit / 2 - 1) + '..' + str.substr(1 - limit / 2) : str
}

const deleteUndefinedValues = (obj: Record<string, any>, baseline = obj) => {
    Object.keys(obj).forEach((k) => {
        if (typeof baseline[k] === 'undefined') {
            delete obj[k]
        }
    })
}

export function toBeRequestedWith(...args: any): any {
    return runExpect.call(this, toBeRequestedWithFn, args)
}
