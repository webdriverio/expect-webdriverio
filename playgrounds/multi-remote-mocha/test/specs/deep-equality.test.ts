import { multiRemoteBrowser } from '@wdio/globals'

// WebdriverIO v10 with BiDi: `execute()` gives real `Set` and `Map` values. `expect.multiRemote()` compares the value of
// each instance with the deep equality of expect-webdriverio, also with Jest's `toEqual`. Before v8, any 2 sets or
// maps were equal.
describe('Deep equality of sets and maps from each instance', () => {
    let values: Record<string, Record<string, unknown>>

    before(async function () {
        this.timeout(process.env.CI ? 60000 : 10000)
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
        // `multiRemoteBrowser.execute()` gives an array in the instance order: read each instance by its name
        values = Object.fromEntries(await Promise.all(multiRemoteBrowser.instances.map(async (name) => [
            name,
            await multiRemoteBrowser.getInstance(name)!.execute(() => {
                // the same content in another order for each browser
                const isFirefox = navigator.userAgent.includes('Firefox')
                return {
                    tags: new Set(isFirefox ? ['a', 'b'] : ['b', 'a']),
                    users: new Set(isFirefox ? [{ name: 'a' }, { name: 'b' }] : [{ name: 'b' }, { name: 'a' }]),
                    sizes: new Map(isFirefox ? [['width', 10], ['height', 20]] : [['height', 20], ['width', 10]]),
                }
            }),
        ])))
    })

    const each = (property: string) => Object.fromEntries(Object.entries(values).map(([name, value]) => [name, value[property]]))

    it('gets real sets and maps from each instance', () => {
        for (const value of Object.values(values)) {
            expect(value.tags).toBeInstanceOf(Set)
            expect(value.sizes).toBeInstanceOf(Map)
        }
    })

    it('compares a set in any order', () => {
        expect(each('tags')).toEqual(expect.multiRemote({ chrome: new Set(['a', 'b']), firefox: new Set(['b', 'a']) }))
    })

    it('compares a set of objects in any order', () => {
        expect(each('users')).toEqual(expect.multiRemote({ chrome: new Set([{ name: 'a' }, { name: 'b' }]), firefox: new Set([{ name: 'b' }, { name: 'a' }]) }))
    })

    it('compares a map in any order', () => {
        expect(each('sizes')).toEqual(expect.multiRemote({ chrome: new Map([['width', 10], ['height', 20]]), firefox: new Map([['height', 20], ['width', 10]]) }))
    })

    it('matches an asymmetric matcher in a set with any entry', () => {
        expect(each('tags')).toEqual(expect.multiRemote({ chrome: new Set([expect.any(String), 'b']), firefox: new Set(['a', expect.any(String)]) }))
    })

    it('fails for a set or a map with other content', () => {
        expect(each('tags')).not.toEqual(expect.multiRemote({ chrome: new Set(['a', 'c']), firefox: new Set(['a', 'b']) }))
        expect(each('users')).not.toEqual(expect.multiRemote({ chrome: new Set([{ name: 'a' }, { name: 'c' }]), firefox: new Set([{ name: 'a' }, { name: 'b' }]) }))
        expect(each('sizes')).not.toEqual(expect.multiRemote({ chrome: new Map([['width', 10], ['height', 99]]), firefox: new Map([['width', 10], ['height', 20]]) }))
    })
})
