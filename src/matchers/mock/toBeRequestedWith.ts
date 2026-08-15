import type { local } from 'webdriver'

import { waitUntil, enhanceError, isAsymmetricMatcher, getAsymmetricMatcherValue } from '../../utils.js'
import { equals } from '../../jasmineUtils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

const STR_LIMIT = 80
const KEY_LIMIT = 12

interface RequestMock {
    request: local.NetworkRequestData,
    response: local.NetworkResponseData
    /**
     * Populated asynchronously by WebDriverInterception via `network.getData`.
     * Flat properties on the call object (not nested under `request`/`response`),
     * mirroring `WebdriverIO.Mock`'s `Response` type.
     */
    postData?: string
    body?: string
}

function reduceHeaders(headers: local.NetworkHeader[]) {
    return Object.entries(headers).reduce((acc, [, value]: [string, local.NetworkHeader]) => {
        acc[value.name] = value.value.value
        return acc
    }, {} as Record<string, string>)
}

export async function toBeRequestedWith(
    received: WebdriverIO.Mock,
    expectedValue: ExpectWebdriverIO.RequestedWith = {},
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'called with', verb = 'be', isNot, matcherName = 'toBeRequestedWith' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    /**
     * `postData`/`body` are populated asynchronously (via a `network.getData` round-trip in
     * WebDriverInterception), so they may not be attached to a call yet at the very first check.
     * `.not` assertions normally check once, immediately (`wait: 0`), since a mock's call log only
     * grows and can't "become unmatched" - but that immediate check would race the payload
     * collection and could report a false pass. So when `postData`/`response` are part of the
     * expectation, give `.not` the same "wait for a match to appear" retry window a positive
     * assertion gets, instead of deciding on the first, possibly incomplete, snapshot of the call -
     * but ONLY while there's an actual pending candidate (a call that already matches everything
     * else and is just waiting on its body/postData to attach). If no call matches the non-payload
     * criteria at all, the outcome can't change by waiting, so the predicate below sets `abort` and
     * `waitUntil` resolves immediately - keeping the fast, single-check behavior for the common case
     * (wrong URL, no calls made, etc.) while still closing the race for the one case that needs it.
     * `pass` below always means "was a matching call found" either way - `.not` inversion is
     * handled downstream by the test framework, not by this function - so no extra inversion here,
     * only the retry direction passed into `waitUntil` changes.
     */
    const hasPayloadExpectation = expectedValue.postData !== undefined || expectedValue.response !== undefined
    const waitForPayloadOnNot = isNot && hasPayloadExpectation

    // shared across every `waitUntil` iteration and the later message-building step, so a given
    // postData/body string is JSON.parsed at most once per assertion instead of once per read
    const parseCache: Map<string, ParsedJson> = new Map()

    const { success: pass, actual } = await waitUntil(
        async () => {
            let lastCall: RequestMock | undefined
            let hasPendingPayloadCandidate = false
            for (const call of received.calls as RequestMock[]) {
                lastCall = call
                const matchesNonPayloadCriteria =
                    methodMatcher(call.request.method, expectedValue.method) &&
                    statusCodeMatcher(call.response.status, expectedValue.statusCode) &&
                    urlMatcher(call.request.url, expectedValue.url) &&
                    headersMatcher(reduceHeaders(call.request.headers), expectedValue.requestHeaders) &&
                    headersMatcher(reduceHeaders(call.response.headers), expectedValue.responseHeaders)

                if (!matchesNonPayloadCriteria) {
                    continue
                }

                if (
                    bodyMatcher(call.postData, expectedValue.postData, parseCache) &&
                    bodyMatcher(call.body, expectedValue.response, parseCache)
                ) {
                    return { success: true, subject: call, actual: call }
                }

                // this call matches everything else - if its body/postData hasn't attached yet,
                // it could still turn into a match once it does, so it's worth continuing to wait for
                if (
                    (expectedValue.postData !== undefined && call.postData === undefined) ||
                    (expectedValue.response !== undefined && call.body === undefined)
                ) {
                    hasPendingPayloadCandidate = true
                }
            }
            return {
                success: false,
                subject: lastCall,
                actual: lastCall,
                abort: waitForPayloadOnNot && !hasPendingPayloadCandidate,
            }
        },
        waitForPayloadOnNot ? false : isNot,
        { ...options, wait: (isNot && !waitForPayloadOnNot) ? 0 : options.wait }
    )

    const message = enhanceError(
        'mock',
        minifyRequestedWith(expectedValue),
        minifyRequestMock(actual, expectedValue, parseCache) || 'was not called',
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
        matcherName,
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
    if (expected === undefined) {
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
    if (expected === undefined) {
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
    expected?: string | ExpectWebdriverIO.PartialMatcher<string> | ((url: string) => boolean)
) => {
    if (expected === undefined) {
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
        | ExpectWebdriverIO.PartialMatcher<Record<string, string>>
        | ((headers: Record<string, string>) => boolean)
) => {
    /**
     * match with no headers were passed in as filter or
     * if header matcher is an empty object, match with no headers
     */
    if (
        expected === undefined ||
        typeof expected === 'object' && Object.keys(expected).length === 0
    ) {
        return true
    }
    /**
     * call function of provided
     */
    if (typeof expected === 'function') {
        return expected(headers)
    }
    return equals(headers, expected)
}

/**
 * a JSON-compatible expected value for `postData`/`response`, shared by every function that
 * needs to reason about "what shape of value is the user asserting against"
 */
type ExpectedBody =
    | string
    | boolean
    | number
    | null
    | ExpectWebdriverIO.JsonCompatible
    | ExpectWebdriverIO.PartialMatcher<string | ExpectWebdriverIO.JsonCompatible>

/**
 * is postData/response matching an expected condition
 *
 * Note: `body`/`postData` populate asynchronously and may still be `undefined` here on an early
 * `waitUntil` iteration - see the timing comment on `toBeRequestedWith` for how retries handle that.
 */
const bodyMatcher = (
    body: string | Buffer | ExpectWebdriverIO.JsonCompatible | undefined,
    expected: ExpectedBody | ((r: string | Buffer | ExpectWebdriverIO.JsonCompatible | undefined) => boolean) | undefined,
    parseCache: Map<string, ParsedJson>
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

    let parsedBody: unknown = body
    if (body instanceof Buffer) {
        parsedBody = body.toString()
    }

    // convert postData/body from string to JSON if expected value is JSON-like
    // (checked against the Buffer-normalized value, so JSON carried as a Buffer is parsed too)
    if (typeof parsedBody === 'string' && isExpectedJsonLike(expected)) {
        const parsed = parseJsonOnce(parsedBody, parseCache)

        // failed to parse string as JSON (a genuine parsed `null` must still be matchable)
        if (!parsed.ok) {
            return false
        }
        parsedBody = parsed.value
    }

    return equals(parsedBody, expected)
}

// `expect.any(Number)`/`expect.any(Boolean)`/`expect.any(Array)`/`expect.any(Object)` carry their
// constructor as the matcher's "sample" (not an instance of it), so `typeof actualSample` is
// 'function' - detect those specifically. `String` is deliberately excluded: a raw (unparsed)
// string already satisfies `expect.any(String)` without needing to go through JSON.parse first.
const JSON_LIKE_ANY_CONSTRUCTORS = new Set<unknown>([Number, Boolean, Array, Object])

const isExpectedJsonLike = (
    expected: ExpectedBody | Function | undefined
) => {
    if (typeof expected === 'undefined') {
        return false
    }

    // get matcher sample if expected value is a special matcher like `expect.objectContaining({ foo: 'bar })`
    const actualSample = isAsymmetricMatcher(expected)
        ? getAsymmetricMatcherValue(expected)
        : expected

    return (
        actualSample === null ||
        typeof actualSample === 'boolean' ||
        typeof actualSample === 'number' ||
        Array.isArray(actualSample) ||
        JSON_LIKE_ANY_CONSTRUCTORS.has(actualSample) ||
        (typeof actualSample === 'object' &&
            actualSample !== null &&
            actualSample instanceof RegExp === false)
    )
}

type ParsedJson = { ok: true, value: unknown } | { ok: false }

/**
 * `JSON.parse` a string at most once per assertion - `cache` is shared between the matching
 * step (`bodyMatcher`) and the message-building step (`minifyRequestMock`) so a failed/passing
 * assertion doesn't pay for parsing the same postData/body string twice.
 */
const parseJsonOnce = (jsonString: string, cache: Map<string, ParsedJson>): ParsedJson => {
    const cached = cache.get(jsonString)
    if (cached) {
        return cached
    }

    let result: ParsedJson
    try {
        result = { ok: true, value: JSON.parse(jsonString) }
    } catch {
        result = { ok: false }
    }
    cache.set(jsonString, result)
    return result
}

/**
 * resolve a raw postData/body string to its parsed JSON value for display, falling back to the
 * raw string when it isn't JSON-like or fails to parse
 */
const resolveBodyForDisplay = (
    raw: string | undefined,
    expectedForField: ExpectedBody | Function | undefined,
    parseCache: Map<string, ParsedJson>
): unknown => {
    if (typeof raw !== 'string' || !isExpectedJsonLike(expectedForField)) {
        return raw
    }
    const parsed = parseJsonOnce(raw, parseCache)
    return parsed.ok ? parsed.value : raw
}

/**
 * shorten long url, headers, postData, body
 */
const minifyRequestMock = (
    requestMock: RequestMock | undefined,
    requestedWith: ExpectWebdriverIO.RequestedWith = {},
    parseCache: Map<string, ParsedJson> = new Map()
) => {
    if (requestMock === undefined) {
        return requestMock
    }

    const r: Record<string, unknown> = {
        url: requestMock.request.url,
        method: requestMock.request.method,
        requestHeaders: requestMock.request.headers,
        responseHeaders: requestMock.response.headers,
        postData: resolveBodyForDisplay(requestMock.postData, requestedWith.postData, parseCache),
        response: resolveBodyForDisplay(requestMock.body, requestedWith.response, parseCache),
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
    param: ExpectedBody | ExpectWebdriverIO.PartialMatcher<string> | Function | undefined,
    transformFn?: (param: ExpectWebdriverIO.JsonCompatible) => ExpectWebdriverIO.JsonCompatible | string
) => {
    if (param === undefined) {
        return
    }

    if (typeof param === 'function') {
        param = param.toString()
    } else if (isAsymmetricMatcher(param)) {
        const sample = getAsymmetricMatcherValue(param)
        const sampleString = typeof sample === 'string' ? sample : sample instanceof RegExp ? sample.toString() : JSON.stringify(sample) || sample?.toString()
        return `${param.constructor.name} ${sampleString || ''}`
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
): ExpectWebdriverIO.JsonCompatible => {
    if (JSON.stringify(obj).length < lengthLimit) {
        return obj
    }

    if (Array.isArray(obj)) {
        const firstItem: object | string =
            typeof obj[0] === 'object' && obj[0] !== null
                ? shortenJson(obj[0], lengthLimit / 2, keyLimit / 4)
                : shortenString(JSON.stringify(obj[0]))
        return [firstItem, `... ${obj.length - 1} more items`] as string[]
    }

    const minifiedObject: Record<string, unknown> = {}
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

    return minifiedObject as ExpectWebdriverIO.JsonCompatible
}

/**
 * shorten string
 * ex: '1234567890' -> '12..90'
 */
const shortenString = (str: string, limit = STR_LIMIT) => {
    return str.length > limit ? str.substring(0, limit / 2 - 1) + '..' + str.substr(1 - limit / 2) : str
}

const deleteUndefinedValues = (obj: Record<string, unknown>, baseline = obj) => {
    Object.keys(obj).forEach((k) => {
        if (baseline[k] === undefined) {
            delete obj[k]
        }
    })
}

export function toBeRequestedWithResponse(...args: unknown[]) {
    return toBeRequestedWith.call(this, ...args)
}
