import { multiRemoteBrowser } from '@wdio/globals'

describe('Network Matchers', () => {
    let mocks: WebdriverIO.MultiRemoteMock

    before(async function() {
        if(process.env.CI) {
            this.timeout(120000)
        }

        mocks = await multiRemoteBrowser.mock('https://guinea-pig.webdriver.io/api/foo', {
            method: 'POST'
        })
        mocks.getInstance('chrome').respond({ success: true }, {
            statusCode: 200,
            headers: { Authorization: 'bar' }
        })

        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')

        await multiRemoteBrowser.execute(async () => {
            await fetch('https://guinea-pig.webdriver.io/api/foo', {
                method: 'POST',
                headers: { Authorization: 'foo' },
                body: JSON.stringify({ title: 'foo', description: 'bar' })
            })
        })
    })

    it('should assert on network calls', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequestedWith({
            url: 'https://guinea-pig.webdriver.io/api/foo',
            method: 'POST'
        })
    })

    it('should work with asymmetric matchers', async () => {
        // Asymmetric matcher as argument
        await expect(mocks.getInstance('chrome')).toBeRequestedWith({
            method: 'POST',
            url: expect.stringContaining('/api/foo')
        })

    })

    it('should support inverted wdio expect asymmetric matchers', async () => {
        await expect(
             expect(mocks.getInstance('chrome')).toBeRequestedWith({
            method: 'POST',
            url: expect.not.stringContaining('/api/foo'),
        })).rejects.toThrow(
// TODO assert the message one day since the message does not contains the `not`.
//             { message: `\
// Expect mock to be called with

// - Expected  - 1
// + Received  + 1

//   Object {
//     "method": "POST",
// -   "url": "StringContaining \\\"/api/foo\\\"",
// +   "url": "https://guinea-pig.webdriver.io/api/foo",
//   }`
//                 }
            )
    })

    it('should assert times called', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequestedTimes(1)
    })

    it('should assert times called gte', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequestedTimes({ gte: 1 })
    })

    it('should assert times called lte', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequestedTimes({ lte: 2 })
    })

    it('should assert times called gte and lte', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequestedTimes({ gte: 1, lte: 2 })
    })

    it('should assert times called lte with options', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequestedTimes({ lte: 2 }, { wait: 0 })
    })


    it('should be requested', async () => {
        await expect(mocks.getInstance('chrome')).toBeRequested()
    })

    it('should throw an error when asserting not be requested', async () => {
        await expect(expect(mocks.getInstance('chrome')).not.toBeRequested()).rejects.toThrow()
    })

    it('should assert the call of each browser with its own value, with postData and response', async () => {
        // `mock.calls[n].body` is the upstream response, not the override of `respond()`
        await expect(mocks).toBeRequestedWith(expect.multiRemote({
            chrome: { method: 'POST', postData: { title: 'foo', description: 'bar' }, response: (response) => typeof response === 'string' && response.length > 0 },
            firefox: { method: 'POST', postData: expect.objectContaining({ title: 'foo' }) },
        }))
        await expect(mocks).not.toBeRequestedWith(expect.multiRemote({
            chrome: { postData: { title: 'bar' } },
            firefox: { method: 'GET' },
        }), { wait: 0 })
    })

    it('should fail with the call of each browser for its own value', async () => {
        await expect(expect(mocks).toBeRequestedWith(expect.multiRemote({
            chrome: { method: 'POST', postData: { title: 'foo', description: 'bar' } },
            firefox: { method: 'POST', postData: { title: 'bar' } },
        }), { wait: 0 })).rejects.toThrow(/Expect multi-remote<chrome, firefox> mocks to be called with/)
        // The values must name exactly the browsers
        await expect(expect(mocks).toBeRequestedWith(expect.multiRemote({ chrome: { method: 'POST' } })))
            .rejects.toThrow(/"firefox": Object {/)
    })
})

describe('Multi-remote Network Matchers', () => {
    // Not calling `respond()`, which hangs on Firefox, see https://github.com/webdriverio/expect-webdriverio/pull/2229
    let mocks: WebdriverIO.MultiRemoteMock

    before(async () => {
        mocks = await multiRemoteBrowser.mock('https://guinea-pig.webdriver.io/')
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    after(async () => {
        await Promise.all(mocks.instances.map((name) => mocks.getInstance(name).restore()))
    })

    it('should assert that every browser requested the page', async () => {
        await expect(mocks).toBeRequested()
        await expect(mocks).toBeRequestedTimes({ gte: 1 })
        await expect(mocks).toBeRequestedWith({ method: 'GET', url: 'https://guinea-pig.webdriver.io/' })
    })

    it('should fail with the value of each browser', async () => {
        await expect(expect(mocks).toBeRequestedTimes(0, { wait: 0 }))
            .rejects.toThrow(/Expect multi-remote<(?:chrome, firefox|firefox, chrome)> mocks to be called 0 times/)
        await expect(expect(mocks).not.toBeRequested({ wait: 0 }))
            .rejects.toThrow(/not to be called/)
    })
})

describe('Multi-remote Network Matchers with one expected value per browser', () => {
    let mocks: WebdriverIO.MultiRemoteMock

    before(async () => {
        mocks = await multiRemoteBrowser.mock('https://guinea-pig.webdriver.io/')
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
        // Only Chrome loads the page a second time
        await multiRemoteBrowser.getInstance('chrome').url('https://guinea-pig.webdriver.io/')
    })

    after(async () => {
        await Promise.all(mocks.instances.map((name) => mocks.getInstance(name).restore()))
    })

    it('should assert each browser with its own value', async () => {
        await expect(mocks).toBeRequestedTimes(expect.multiRemote({ chrome: 2, firefox: 1 }))
        await expect(mocks).toBeRequestedTimes(expect.multiRemote({ chrome: { gte: 2 }, firefox: { lte: 1 } }))
        await expect(mocks).toBeRequestedWith(expect.multiRemote({
            chrome: { method: 'GET', url: 'https://guinea-pig.webdriver.io/' },
            firefox: { method: 'GET', url: expect.stringContaining('guinea-pig') },
        }))
        await expect(mocks).not.toBeRequestedTimes(expect.multiRemote({ chrome: 1, firefox: 2 }), { wait: 0 })
    })

    it('should fail with the value of each browser', async () => {
        await expect(expect(mocks).toBeRequestedTimes(expect.multiRemote({ chrome: 1, firefox: 1 }), { wait: 0 }))
            .rejects.toThrow(/"chrome": 1,\n\+ {3}"chrome": 2,/)
        // The values must name exactly the browsers
        await expect(expect(mocks).toBeRequestedTimes(expect.multiRemote({ chrome: 2, safari: 1 })))
            .rejects.toThrow(/"safari": 1/)
    })
})
