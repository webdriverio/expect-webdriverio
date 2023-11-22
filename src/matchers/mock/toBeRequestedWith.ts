import type { Mock } from 'webdriverio'

import { waitUntil, enhanceError } from '../../utils.js'
import { equals } from '../../jasmineUtils.js'

const STR_LIMIT = 80
const KEY_LIMIT = 12

export async function toBeRequestedWith(
    received: Mock,
    expectedValue: ExpectWebdriverIO.RequestedWith = {},
    options: ExpectWebdriverIO.CommandOptions = {}
) {
    const isNot = this.isNot || false
    const { expectation = 'called with', verb = 'be' } = this

    await options.beforeAssertion?.({
        matcherName: 'toBeRequestedWith',
        expectedValue,
        options,
    })

    let actual: any | undefined
    const pass = await waitUntil(
        async () => {
            for (const call of received.calls) {
                actual = call
                if (
                    methodMatcher(call.method, expectedValue.method) &&
                    statusCodeMatcher(call.statusCode, expectedValue.statusCode) &&
                    urlMatcher(call.url, expectedValue.url) &&
                    headersMatcher(call.headers, expectedValue.requestHeaders) &&
                    headersMatcher(call.responseHeaders, expectedValue.responseHeaders) &&
                    bodyMatcher(call.postData, expectedValue.postData) &&
                    bodyMatcher(call.body, expectedValue.response)
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
        minifyRequestedWith(expectedValue),
        minifyRequestMock(actual, expectedValue) || 'was not called',
        this,
        verb,
        expectation,
        '',
        options
    )

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toBeRequestedWith',
        expectedValue,
        options,
        result
    })

    return result
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
 * is actual statusCode matching an expected statusCode or statusCodes
 */
const statusCodeMatcher = (statusCode: number, expected?: number | Array<number>) => {
    if (typeof expected === 'undefined') {
        return true
    }
    if (!Array.isArray(expected)) {
        expected = [expected]
    }
    return expected.includes(statusCode)
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
 * is postData/response matching an expected condition
 */
const bodyMatcher = (
    body: string | Buffer | ExpectWebdriverIO.JsonCompatible | undefined,
    expected?:
        | string
        | ExpectWebdriverIO.JsonCompatible
        | ExpectWebdriverIO.PartialMatcher
        | ((r: string | Buffer | ExpectWebdriverIO.JsonCompatible | undefined) => boolean)
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

    let parsedBody = body
    if (body instanceof Buffer) {
        parsedBody = body.toString()
    }

    // convert postData/body from string to JSON if expected value is JSON-like
    if (typeof(body) === 'string' && isExpectedJsonLike(expected)) {
        parsedBody = tryParseBody(body)

        // failed to parse string as JSON
        if (parsedBody === null) {
            return false
        }
    }

    return equals(parsedBody, expected)
}

const isExpectedJsonLike = (
    expected:
        | string
        | ExpectWebdriverIO.JsonCompatible
        | ExpectWebdriverIO.PartialMatcher
        | undefined
        | Function
) => {
    if (typeof expected === 'undefined') {
        return false
    }

    // get matcher sample if expected value is a special matcher like `expect.objectContaining({ foo: 'bar })`
    const actualSample = isMatcher(expected)
        ? (expected as ExpectWebdriverIO.PartialMatcher).sample
        : expected

    return (
        Array.isArray(actualSample) ||
        (typeof actualSample === 'object' &&
            actualSample !== null &&
            actualSample instanceof RegExp === false)
    )
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

const tryParseBody = (jsonString: string | undefined, fallback: any = null) => {
    try {
        return typeof jsonString === 'undefined' ? fallback : JSON.parse(jsonString)
    } catch {
        return fallback
    }
}

/**
 * shorten long url, headers, postData, body
 */
const minifyRequestMock = (
    requestMock: any | undefined,
    requestedWith: ExpectWebdriverIO.RequestedWith
) => {
    if (typeof requestMock === 'undefined') {
        return requestMock
    }

    const r: Record<string, any> = {
        url: requestMock.url,
        method: requestMock.method,
        requestHeaders: requestMock.headers,
        responseHeaders: requestMock.responseHeaders,
        postData: typeof requestMock.postData === 'string' && isExpectedJsonLike(requestedWith.postData)
            ? tryParseBody(requestMock.postData, requestMock.postData)
            : requestMock.postData,
        response: typeof requestMock.body === 'string' && isExpectedJsonLike(requestedWith.response)
            ? tryParseBody(requestMock.body, requestMock.body)
            : requestMock.body,
    }

    deleteUndefinedValues(r, requestedWith)

    return minifyRequestedWith(r)
}

/**
 * shorten long url, headers, postData, response
 * and transform Function/Matcher to string
 */
const minifyRequestedWith = (r: ExpectWebdriverIO.RequestedWith) => {
    const result = {
        url: requestedWithParamToString(r.url),
        method: r.method,
        requestHeaders: requestedWithParamToString(r.requestHeaders, shortenJson),
        responseHeaders: requestedWithParamToString(r.responseHeaders, shortenJson),
        postData: requestedWithParamToString(r.postData, shortenJson),
        response: requestedWithParamToString(r.response, shortenJson),
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
    } else if (transformFn && typeof param === 'object' && param !== null) {
        param = transformFn(param as ExpectWebdriverIO.JsonCompatible)
    }

    if (typeof param === 'string') {
        param = shortenString(param)
    }

    return param
}

/**
 * shorten object key/values and decrease array size
 * ex: `{ someVeryLongKey: 'someVeryLongValue' }` -> `{ som..Key: 'som..lue' }`
 */
const shortenJson = (
    obj: ExpectWebdriverIO.JsonCompatible,
    lengthLimit = STR_LIMIT * 2,
    keyLimit = KEY_LIMIT
) => {
    if (JSON.stringify(obj).length < lengthLimit) {
        return obj
    }

    if (Array.isArray(obj)) {
        const firstItem: any =
            typeof obj[0] === 'object' && obj[0] !== null
                ? shortenJson(obj[0], lengthLimit / 2, keyLimit / 4)
                : shortenString(JSON.stringify(obj[0]))
        return [firstItem, `... ${obj.length - 1} more items`]
    }

    const minifiedObject: Record<string, any> = {}
    const entries = Object.entries(obj)

    if (keyLimit >= 4) {
        entries.slice(0, keyLimit).forEach(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                v = shortenJson(v, lengthLimit / 2, keyLimit / 4)
            } else if (typeof v === 'string') {
                v = shortenString(v, 16)
            }
            minifiedObject[shortenString(k, 24)] = v
        })
    }
    if (entries.length > keyLimit) {
        minifiedObject['...'] = `${entries.length} items in total`
    }

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

export function toBeRequestedWithResponse(...args: any): any {
    return toBeRequestedWith.call(this, ...args)
}
