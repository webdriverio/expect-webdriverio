
import { expect as wdioExpect } from 'expect-webdriverio'
import { expectTypeOf } from 'vitest'

describe('Jasmine type agumentations', () => {
    const chainableElement = {} as unknown as ChainablePromiseElement
    const chainableArray = {} as ChainablePromiseArray

    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const elementArray: WebdriverIO.ElementArray = [] as unknown as WebdriverIO.ElementArray
    const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

    const networkMock: WebdriverIO.Mock = {} as unknown as WebdriverIO.Mock

    describe('Augment expectAsync properly', () => {

        describe('Browser', () => {
            const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

            describe('toHaveUrl', () => {
                it('should return Promise<void>', async () => {
                    expectTypeOf(expectAsync(browser).toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveUrl('https://example.com', { message: 'foo' })).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).not.toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).not.toHaveUrl('https://example.com', { message: 'foo' })).toEqualTypeOf<Promise<void>>()

                    // Asymmetric matchers
                    expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.not.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.any(String))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.anything())).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(browser).toHaveUrl(jasmine.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveUrl(jasmine.any(String))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveUrl(jasmine.anything())).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(browser).toHaveUrl).parameter(0).extract<number>().toBeNever()
                })

                it('should have ts errors when actual is not a Browser element', async () => {
                    expectTypeOf(expectAsync(element).toHaveUrl).toBeNever()
                    expectTypeOf(expectAsync(element).not.toHaveUrl).toBeNever()
                    expectTypeOf(expectAsync(true).toHaveUrl).toBeNever()
                    expectTypeOf(expectAsync(true).not.toHaveUrl).toBeNever()
                })
            })

            describe('toHaveTitle', () => {
                it('should return Promise<void>', async () => {
                    expectTypeOf(expectAsync(browser).toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).not.toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()

                    // Asymmetric matchers
                    expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.any(String))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.anything())).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(browser).toHaveTitle(jasmine.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveTitle(jasmine.any(String))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(browser).toHaveTitle(jasmine.anything())).toEqualTypeOf<Promise<void>>()
                })

                it('should have ts errors when actual is not a Browser element', async () => {
                    expectTypeOf(expectAsync(element).toHaveTitle).toBeNever()
                    expectTypeOf(expectAsync(element).not.toHaveTitle).toBeNever()
                    expectTypeOf(expectAsync(true).toHaveTitle).toBeNever()
                    expectTypeOf(expectAsync(true).not.toHaveTitle).toBeNever()
                })
            })
        })

        describe('element', () => {

            describe('toBeDisabled', () => {
                it('should return Promise<void>', async () => {
                // Element
                    expectTypeOf(expectAsync(element).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                    // Element array
                    expectTypeOf(expectAsync(elementArray).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                    // Chainable element
                    expectTypeOf(expectAsync(chainableElement).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                    // Chainable element array
                    expectTypeOf(expectAsync(chainableArray).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()
                })

                it('should have ts errors when actual is not an element', async () => {
                    expectTypeOf(expectAsync(browser).toBeDisabled).toBeNever()
                    expectTypeOf(expectAsync(browser).not.toBeDisabled).toBeNever()
                    expectTypeOf(expectAsync(true).toBeDisabled).toBeNever()
                    expectTypeOf(expectAsync(true).not.toBeDisabled).toBeNever()
                })
            })

            describe('toHaveText', () => {
                it('should return Promise<void>', async () => {
                    expectTypeOf(expectAsync(element).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText([jasmine.stringContaining('text1'), jasmine.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText(
                        'My-Ex-Am-Ple',
                        {
                            replace: [[/-/g, ' '], [/[A-Z]+/g, (match: string) => match.toLowerCase()]]
                        }
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(element).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveText).parameter(0).extract<number>().toBeNever()

                    expectTypeOf(expectAsync(chainableElement).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText([jasmine.stringContaining('text1'), jasmine.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(chainableElement).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toHaveText).parameter(0).extract<number>().toBeNever()

                    expectTypeOf(expectAsync(elementArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText([jasmine.stringContaining('text1'), jasmine.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(elementArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(elementArray).toHaveText).parameter(0).extract<number>().toBeNever()

                    expectTypeOf(expectAsync(chainableArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText([jasmine.stringContaining('text1'), jasmine.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(chainableArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableArray).toHaveText).parameter(0).extract<number>().toBeNever()

                    expectTypeOf(expectAsync(browser).toHaveText).toBeNever()
                })

                it('should have ts errors when actual is not an element', async () => {
                    expectTypeOf(expectAsync(browser).toHaveText).toBeNever()
                    expectTypeOf(expectAsync(browser).not.toHaveText).toBeNever()
                    expectTypeOf(expectAsync(true).toHaveText).toBeNever()
                    expectTypeOf(expectAsync(true).toHaveText).toBeNever()
                })

                it('should have ts errors when actual is string or Promise<string>', async () => {
                    expectTypeOf(expectAsync('text').toHaveText).toBeNever()
                    expectTypeOf(expectAsync('text').not.toHaveText).toBeNever()
                    expectTypeOf(expectAsync(Promise.resolve('text')).toHaveText).toBeNever()
                    expectTypeOf(expectAsync(Promise.resolve('text')).toHaveText).toBeNever()
                })
            })

            describe('toHaveHeight', () => {
                it('should return Promise<void>', async () => {
                    expectTypeOf(expectAsync(element).toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).not.toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).not.toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(element).toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).not.toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(browser).toHaveHeight).toBeNever()
                })

                it('should have ts errors when actual is string or Promise<string>', async () => {
                    expectTypeOf(expectAsync('text').toHaveText).toBeNever()
                    expectTypeOf(expectAsync('text').not.toHaveText).toBeNever()
                    expectTypeOf(expectAsync(Promise.resolve('text')).toHaveText).toBeNever()
                    expectTypeOf(expectAsync(Promise.resolve('text')).toHaveText).toBeNever()
                })
            })

            describe('toMatchSnapshot', () => {

                it('should return Promise<void>', async () => {
                    expectTypeOf(expectAsync(element).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(chainableElement).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                })
            })

            describe('toMatchInlineSnapshot', () => {

                it('should return Promise<void>', async () => {
                    expectTypeOf(expectAsync(element).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()
                })

                it('should return Promise<void> with getCSSProperty()', async () => {
                    expectTypeOf(expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()
                })
            })

            describe('toBeElementsArrayOfSize', async () => {

                it('should work correctly when actual is chainableArray', async () => {
                    expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize(5)).toEqualTypeOf<Promise<void> & Promise<WebdriverIO.ElementArray>>()
                    expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize({ lte: 10 })).toEqualTypeOf<Promise<void> & Promise<WebdriverIO.ElementArray>>()
                    expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize(5, { message: 'foo' })).toEqualTypeOf<Promise<void> & Promise<WebdriverIO.ElementArray>>()
                })

                it('should not work when actual is not chainableArray', async () => {
                    expectTypeOf(expectAsync(chainableElement).toBeElementsArrayOfSize).toBeNever()
                    expectTypeOf(expectAsync(true).toBeElementsArrayOfSize).toBeNever()
                })
            })
        })

        describe('Custom matchers', () => {
            describe('using `ExpectWebdriverIO` namespace augmentation', () => {
                it('should return Promise<void> for a non-promise custom matcher', async () => {
                    expectTypeOf(expectAsync('test').toBeCustomWdio()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync('test').not.toBeCustomWdio()).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expectAsync('test').toBeCustomJasmine()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expectAsync('test').not.toBeCustomJasmine()).toEqualTypeOf<Promise<void>>()
                })
            })
        })

        describe('Jasmine vs Jest pollution', () => {
            it('should not include Jest expect library matchers on expectAsync', () => {
            // toHaveProperty is a Jest matcher, not Jasmine
                expectTypeOf(expectAsync('foo')).not.toHaveProperty('toHaveProperty')
                expectTypeOf(expectAsync('foo')).not.toHaveProperty('toMatchObject')
                expectTypeOf(expectAsync('foo')).not.toHaveProperty('toStrictEqual')
                expectTypeOf(expectAsync('foo')).not.toHaveProperty('toHaveLength')
            })
        })

        describe('Promise type assertions', () => {
            const booleanPromise: Promise<boolean> = Promise.resolve(true)

            it('should not compile', async () => {
                expectTypeOf(expectAsync(booleanPromise)).not.toHaveProperty('resolves')
                expectTypeOf(expectAsync(booleanPromise)).not.toHaveProperty('rejects')
            })

        })

        describe('Network Matchers', () => {
            const promiseNetworkMock = Promise.resolve(networkMock)

            it('should return Promise<void>', async () => {
                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequested()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes(2)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes(2, { message: 'foo' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequested()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequestedTimes(2)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                    url: 'http://localhost:8080/api',
                    method: 'POST',
                    statusCode: 200,
                    requestHeaders: { Authorization: 'foo' },
                    responseHeaders: { Authorization: 'bar' },
                    postData: { title: 'foo', description: 'bar' },
                    response: { success: true },
                })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                    url: wdioExpect.stringContaining('test'),
                    method: 'POST',
                    statusCode: 200,
                    requestHeaders: wdioExpect.objectContaining({ Authorization: 'foo' }),
                    responseHeaders: wdioExpect.objectContaining({ Authorization: 'bar' }),
                    postData: wdioExpect.objectContaining({ title: 'foo', description: 'bar' }),
                    response: wdioExpect.objectContaining({ success: true }),
                })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                    url: jasmine.stringContaining('test'),
                    method: 'POST',
                    statusCode: 200,
                    requestHeaders: jasmine.objectContaining({ Authorization: 'foo' }),
                    responseHeaders: jasmine.objectContaining({ Authorization: 'bar' }),
                    postData: jasmine.objectContaining({ title: 'foo', description: 'bar' }),
                    response: jasmine.objectContaining({ success: true }),
                })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                    url: wdioExpect.stringMatching(/.*\/api\/.*/i),
                    method: ['POST', 'PUT'],
                    statusCode: [401, 403],
                    requestHeaders: headers => headers.Authorization.startsWith('Bearer '),
                    postData: wdioExpect.objectContaining({ released: true, title: wdioExpect.stringContaining('foobar') }),
                    response: (r: { data: { items: unknown[] } }) => Array.isArray(r) && r.data.items.length === 20
                })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith(jasmine.objectContaining({
                    method: 'POST'
                }))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith(wdioExpect.objectContaining({
                    method: 'POST'
                }))).toEqualTypeOf<Promise<void>>()
            })
        })
    })

    describe('Standard Synchronous Jasmine Matchers', () => {
        it('should return void', () => {
            expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect({ a: 1 }).toEqual({ a: 1 })).toEqualTypeOf<void>()
            expectTypeOf(expect(true).toBeTruthy()).toEqualTypeOf<void>()
        })
    })

    describe('withContext', () => {
        it('should be chainable and preserve return type', async () => {
            // Async WDIO matcher with context
            expectTypeOf(expectAsync(browser).withContext('foo').toHaveTitle('bar')).toEqualTypeOf<Promise<void>>()

            // Async Custom matcher with context
            expectTypeOf(expectAsync('test').withContext('foo').toBeCustomJasmine()).toEqualTypeOf<Promise<void>>()

            // Async Jasmine built-in matcher with context
            expectTypeOf(expectAsync(Promise.resolve(true)).withContext('foo').toBeResolved()).toEqualTypeOf<Promise<void>>()

            // Sync matcher with context
            expectTypeOf(expect(true).withContext('foo').toBe(true)).toEqualTypeOf<void>()
        })
    })

    describe('Wdio expect from direct import is still properly defined', () => {
        it('should support stringContaining, anything and more', async () => {
            wdioExpect.stringContaining('WebdriverIO')
            wdioExpect.stringMatching(/WebdriverIO/)
            wdioExpect.arrayContaining(['WebdriverIO', 'Test'])
            wdioExpect.objectContaining({ name: 'WebdriverIO' })
            // Was not there but works!
            wdioExpect.closeTo(5, 10)
            wdioExpect.arrayContaining(['WebdriverIO', 'Test'])
            // New from jest 30!!
            wdioExpect.arrayOf(wdioExpect.stringContaining('WebdriverIO'))

            wdioExpect.anything()
            wdioExpect.any(Function)
            wdioExpect.any(Number)
            wdioExpect.any(Boolean)
            wdioExpect.any(String)
            wdioExpect.any(Symbol)
            wdioExpect.any(Date)
            wdioExpect.any(Error)

            wdioExpect.not.stringContaining('WebdriverIO')
            wdioExpect.not.stringMatching(/WebdriverIO/)
            wdioExpect.not.arrayContaining(['WebdriverIO', 'Test'])
            wdioExpect.not.objectContaining({ name: 'WebdriverIO' })
            wdioExpect.not.closeTo(5, 10)
            wdioExpect.not.arrayContaining(['WebdriverIO', 'Test'])
            wdioExpect.not.arrayOf(wdioExpect.stringContaining('WebdriverIO'))
        })

        it('should support WDIO matchers', async () => {
            expectTypeOf(wdioExpect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(wdioExpect(element).toBeClickable()).toEqualTypeOf<Promise<void>>()

            expectTypeOf(wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
            expectTypeOf(wdioExpect(browser).toHaveTitle(jasmine.stringMatching('foo'))).toEqualTypeOf<Promise<void>>()
        })

        it('should support standard Jest expect Library Matchers', async () => {
            expectTypeOf(wdioExpect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
            expectTypeOf(wdioExpect([1, 2]).toHaveLength(2)).toEqualTypeOf<void>()
            expectTypeOf(wdioExpect({ a: 1 }).toMatchObject({ a: 1 })).toEqualTypeOf<void>()
        })

        it('should support custom matchers', async () => {
            expectTypeOf(wdioExpect('test').toBeCustomWdio()).toEqualTypeOf<Promise<void>>()
        })

        describe('Support soft Assertions on wdioExpect only (not supported on expect global since its Jasmine)', async () => {
            const actualString: string = 'Test Page'
            const actualPromiseString: Promise<string> = Promise.resolve('Test Page')

            describe('wdioExpect.soft', () => {
                it('should not need to be awaited/be a promise if actual is non-promise type', async () => {
                    expectTypeOf(wdioExpect.soft(actualString)).toEqualTypeOf<ExpectWebdriverIO.MatchersAndInverse<void, string>>()
                    expectTypeOf(wdioExpect.soft(actualString).toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(actualString).not.toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(actualString).not.toBe(wdioExpect.stringContaining('Test Page'))).toEqualTypeOf<void>()
                })

                it('should need to be awaited/be a promise if actual is promise type', async () => {
                    expectTypeOf(wdioExpect.soft(actualPromiseString)).toEqualTypeOf<ExpectWebdriverIO.MatchersAndInverse<Promise<void>, Promise<string>> & ExpectWebdriverIO.PromiseMatchers<Promise<string>>>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).not.toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).not.toBe(wdioExpect.stringContaining('Test Page'))).toEqualTypeOf<Promise<void>>()
                })

                it('should support chainable element', async () => {
                    expectTypeOf(wdioExpect.soft(element)).toEqualTypeOf<ExpectWebdriverIO.MatchersAndInverse<void, WebdriverIO.Element>>()
                    expectTypeOf(wdioExpect.soft(chainableElement)).toEqualTypeOf<ExpectWebdriverIO.MatchersAndInverse<void, typeof chainableElement>>()
                })

                it('should support chainable element with wdio Matchers', async () => {
                    expectTypeOf(wdioExpect.soft(element).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableArray).toBeDisplayed()).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(wdioExpect.soft(element).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableArray).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                })
            })
        })

    })
})
