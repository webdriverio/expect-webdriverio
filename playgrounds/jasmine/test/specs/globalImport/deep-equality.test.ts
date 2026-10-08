import { browser } from '@wdio/globals'

// WebdriverIO v10 with BiDi: `getProperty()` of an element in a frame or in another tab gives real `Set` and `Map`
// values (in the current context, classic WebDriver gives `{}`). The Jasmine asymmetric matchers compare them with
// the deep equality of expect-webdriverio. Before v8, any 2 sets or maps were equal.
describe('Deep equality of sets and maps from the browser', () => {
    let frame: WebdriverIO.BrowsingContext

    beforeAll(async () => {
        const page = await browser.url('https://guinea-pig.webdriver.io/')
        // Wait for the `load` event: before it, the frame shows its first document, `about:blank`
        await page.execute(() => new Promise<void>((resolve) => {
            const iframe = document.createElement('iframe')
            iframe.addEventListener('load', () => resolve(), { once: true })
            iframe.src = './two.html'
            document.body.appendChild(iframe)
        }))
        frame = await page.frame(page.$('iframe'))
        await frame.execute(() => {
            Object.assign(document.body, {
                tags: new Set(['b', 'a']),
                sizes: new Map([['width', 10], ['height', 20]]),
                state: {
                    tags: new Set(['b', 'a']),
                    users: new Set([{ name: 'b' }, { name: 'a' }]),
                    sizes: new Map([['width', 10], ['height', 20]]),
                },
            })
        })
    })

    it('gets real sets and maps from an element of a frame', async () => {
        const state = await frame.$('body').getProperty('state') as Record<string, unknown>

        expect(state.tags instanceof Set).toBe(true)
        expect(state.sizes instanceof Map).toBe(true)
    })

    it('compares a set in any order', async () => {
        await expect(frame.$('body')).toHaveElementProperty('state', jasmine.objectContaining({ tags: new Set(['a', 'b']) }))
    })

    it('compares a set of objects in any order', async () => {
        await expect(frame.$('body')).toHaveElementProperty('state', jasmine.objectContaining({ users: new Set([{ name: 'a' }, { name: 'b' }]) }))
    })

    it('compares a map in any order', async () => {
        await expect(frame.$('body')).toHaveElementProperty('state', jasmine.objectContaining({ sizes: new Map([['height', 20], ['width', 10]]) }))
    })

    it('matches an asymmetric matcher in a set with any entry', async () => {
        await expect(frame.$('body')).toHaveElementProperty('state', jasmine.objectContaining({ tags: new Set([jasmine.any(String), 'b']) }))
    })

    it('fails for a set or a map with other content', async () => {
        await expect(frame.$('body')).not.toHaveElementProperty('state', jasmine.objectContaining({ tags: new Set(['a', 'c']) }), { wait: 0 })
        await expect(frame.$('body')).not.toHaveElementProperty('state', jasmine.objectContaining({ users: new Set([{ name: 'a' }, { name: 'c' }]) }), { wait: 0 })
        await expect(frame.$('body')).not.toHaveElementProperty('state', jasmine.objectContaining({ sizes: new Map([['width', 10], ['height', 99]]) }), { wait: 0 })
    })

    it('works with jasmine.setContaining and jasmine.mapContaining', async () => {
        await expect(frame.$('body')).toHaveElementProperty('tags', jasmine.setContaining(new Set(['a'])))
        await expect(frame.$('body')).not.toHaveElementProperty('tags', jasmine.setContaining(new Set(['c'])), { wait: 0 })
        await expect(frame.$('body')).toHaveElementProperty('sizes', jasmine.mapContaining(new Map([['width', 10]])))
        await expect(frame.$('body')).not.toHaveElementProperty('sizes', jasmine.mapContaining(new Map([['width', 99]])), { wait: 0 })
    })
})
