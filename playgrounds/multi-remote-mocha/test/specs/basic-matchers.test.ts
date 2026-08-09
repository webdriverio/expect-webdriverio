import { multiRemoteBrowser } from '@wdio/globals'

describe('Basic Expect Matchers', () => {
    beforeEach(async function() {
        // When running all project it timeout here!
        this.timeout(30000);
        await multiRemoteBrowser.url('https://webdriver.io')
    })

   describe('Expect matchers', () => {
        it('Basic matchers', async () => {
            // Equality
            expect(2 + 2).toBe(4);
            expect({a: 1}).toEqual({a: 1});
            expect([1, 2, 3]).toStrictEqual([1, 2, 3]);
            expect(2 + 2).not.toBe(5);

            // Truthiness
            expect(null).toBeNull();
            expect(undefined).toBeUndefined();
            expect(0).toBeFalsy();
            expect(1).toBeTruthy();
            expect(NaN).toBeNaN();

            // Numbers
            expect(4).toBeGreaterThan(3);
            expect(4).toBeGreaterThanOrEqual(4);
            expect(4).toBeLessThan(5);
            expect(4).toBeLessThanOrEqual(4);
            expect(0.2 + 0.1).toBeCloseTo(0.3, 5);

            // Strings
            expect('team').toMatch(/team/);
            expect('Christoph').toContain('stop');

            // Arrays and iterables
            expect([1, 2, 3]).toContain(2);
            expect([{a: 1}, {b: 2}]).toContainEqual({a: 1});
            expect([1, 2, 3]).toHaveLength(3);

            // Objects
            expect({a: 1, b: 2}).toHaveProperty('a');
            expect({a: {b: 2}}).toHaveProperty('a.b', 2);

            // Errors
            expect(() => { throw new Error('error!') }).toThrow('error!');
            expect(() => { throw new TypeError('wrong type') }).toThrow(TypeError);

            // Asymmetric matchers
            expect({foo: 'bar', baz: 1}).toEqual(expect.objectContaining({foo: expect.any(String)}));
            expect([1, 2, 3]).toEqual(expect.arrayContaining([2]));
            expect('abc').toEqual(expect.stringContaining('b'));
            expect('abc').toEqual(expect.stringMatching(/b/));
            expect(123).toEqual(expect.any(Number));
            expect({ foo: 'bar' }).toEqual({ foo: expect.anything() });
            expect({ num: 1.1 }).toEqual({ num: expect.closeTo(1.101, 2) });
            expect(() => { expect('title').toBe(expect.stringContaining('title')) }).toThrow();

            // Others
            expect(new Set([1, 2, 3])).toContain(2);

            // .resolves / .rejects (async)
            await expect(Promise.resolve(42)).resolves.toBe(42);
            await expect(Promise.reject(new Error('fail'))).rejects.toThrow('fail');
        });
    });

    describe('Boolean matchers', () => {
        it('should verify truthy values', async () => {
            const element = await multiRemoteBrowser.$('.navbar')
            const isDisplayed = await element.isDisplayed()

            expect(isDisplayed).toEqual([true, true])
        })

        it('should verify falsy values', async () => {
            const element = await multiRemoteBrowser.$('.non-existent-element')
            const exists = await element.isExisting()

            expect(exists).toEqual([false, false])
        })
    })

    describe('String matchers', () => {
        it('should match exact text', async () => {
            const title = await multiRemoteBrowser.getTitle()

            expect(title).toEqual([
                expect.stringContaining('WebdriverIO'),
                expect.stringContaining('WebdriverIO')
            ])
        })

        it('should match with regex', async () => {
            const url = await multiRemoteBrowser.getUrl()
            expect(url).toEqual([
                expect.stringMatching(/^https:\/\/webdriver\.io/),
                expect.stringMatching(/^https:\/\/webdriver\.io/)
            ])
        })
    })

    describe('Number matchers', () => {
        it('should compare numbers', async () => {
            const navLinks = await multiRemoteBrowser.$$('nav a')
            const count = navLinks.length

            expect(count).toBeGreaterThan(5)
            expect(count).toBeGreaterThanOrEqual(6)
            expect(count).toBeLessThan(100)
            expect(count).toBeLessThanOrEqual(50)
        })
    })

    // TODO: Fix me
    describe.skip('Array matchers', () => {
        it('should verify array contents', async () => {
            const navLinks = await multiRemoteBrowser.$$('nav a')
            const hrefs: string[][] = []
            for (const link of navLinks) {
                // Firefox crash and MultiRemoteElement for firefox is undefined, find why....
                const href = (await link.getAttribute('href')).filter((value): value is string => value !== null)
                if(href) hrefs.push(href)
            }

            expect(hrefs).toBeInstanceOf(Array)
            expect(hrefs.length).toBeGreaterThan(0)
            expect(hrefs).toEqual(expect.arrayContaining(['/docs/gettingstarted']))
        })
    })

    // TODO: fix me?
    describe.skip('Object matchers', () => {
        it('should match object properties', async () => {
            const capabilities = await multiRemoteBrowser.capabilities

            // TODO: why capabilities is undefined?
            expect(capabilities).toHaveProperty('browserName')
            expect(capabilities).toMatchObject({
                browserName: 'chrome'
            })
        })
    })

    describe('Negation', () => {
        it('should work with not', async () => {
            const title = await multiRemoteBrowser.getTitle()

            expect(title).not.toBeUndefined()
            expect(title).not.toBe('')
            expect(title).not.toContain('Firefox')
        })
    })

    describe('Async/Promise matchers', () => {
        it('should handle promises', async () => {
            const titlePromise = multiRemoteBrowser.getTitle()

            await expect(titlePromise).resolves.toEqual(expect.arrayContaining([expect.stringContaining('WebdriverIO')]))
        })

        it('should not reject', async () => {
            const urlPromise = multiRemoteBrowser.getUrl()

            await expect(urlPromise).resolves.toBeDefined()
        })
    })
})
